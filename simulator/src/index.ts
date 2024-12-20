import { createDecoder } from './decoder'
import { opcodes } from './opcodes'
import { createState } from './state'

export function createSimulator() {
  const state = createState()

  function step() {
    const inst = state.mem[state.pc].toString(2).padStart(16, '0')
    if (inst.length !== 16) {
      throw new Error(`Invalid instruction: ${inst}`)
    }
    state.pc++
    const decoder = createDecoder(inst)
    const handler = opcodes[decoder.opcode as keyof typeof opcodes]
    handler(decoder, state)
  }

  function load(start: number, mem: number[] | string) {
    state.pc = start
    if (typeof mem === 'string') {
      mem = mem.trim().split(/\r?\n/).filter(Boolean).map(line => Number.parseInt(line.trim(), 2))
    }
    state.mem.set(mem, start)
  }

  function run() {
    while (!state.halted) {
      step()
    }
  }

  return {
    state,
    step,
    load,
    run,
  }
}
