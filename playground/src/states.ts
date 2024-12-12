import { compressToBase64, decompressFromBase64 } from 'lz-string'
import { assemble } from 'lc3-assembler'
import { computed, ref, watch, watchEffect } from 'vue'
import { DEMO } from './examples'

export const onInputUpdate: (() => void)[] = []
export const input = ref('')
export const showAddress = ref(true)

export const debouncedInput = ref('')
let debounceTimeout: any
watch(input, (input) => {
  clearInterval(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    debouncedInput.value = input
  }, 50)
})

export function load(reset = false): void {
  let parsed
  if (!reset && window.location.hash) {
    try {
      parsed = JSON.parse(decompressFromBase64(window.location.hash.slice(1)) || '{}')
    }
    catch (e) { console.error(e) }
  }
  parsed ||= {}
  debouncedInput.value = input.value = parsed.input ?? DEMO
  showAddress.value = parsed.showAddress ?? true
  onInputUpdate.forEach(fn => fn())
  save()
}

function save(): void {
  window.location.hash = compressToBase64(JSON.stringify({
    input: input.value,
    showAddress: showAddress.value,
  }))
}

load()
watchEffect(save)

export const output = computed(() => {
  let { result, error } = assemble(debouncedInput.value)
  if (!showAddress.value && result) {
    result = result.replaceAll(/^\(\w+\) /gm, '')
  }
  return { result, error }
})
