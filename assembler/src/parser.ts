import { LC3Error } from '../../shared/utils'

export function tryParseRegister(operand: string): number | null {
  if (!/^R\d+$/i.test(operand)) {
    return null
  }
  const register = Number(operand.slice(1))
  if (!Number.isFinite(register) || register < 0 || register > 7) {
    throw new LC3Error(`Invalid register: ${operand}`)
  }
  return register
}

export function parseRegister(operand: string): number {
  const register = tryParseRegister(operand)
  if (register === null) {
    throw new LC3Error(`Invalid operand: ${operand}. Expected register`)
  }
  return register
}

export function tryParseImmediate(operand: string): number | null {
  let immediate: number
  if (operand[0] === '#') {
    immediate = Number(operand.slice(1))
  }
  else if (operand[0] === 'x' || operand[0] === 'X') {
    if (!/^-?[0-9a-f]+$/i.test(operand.slice(1))) {
      throw new LC3Error(`Invalid hex immediate: ${operand}`)
    }
    immediate = Number.parseInt(operand.slice(1), 16)
  }
  else {
    return null
  }
  if (!Number.isFinite(immediate)) {
    throw new TypeError(`Invalid immediate: ${operand}`)
  }
  return immediate
}

export function parseImmediate(operand: string): number {
  const immediate = tryParseImmediate(operand)
  if (immediate === null) {
    throw new LC3Error(`Invalid operand: ${operand}. Expected immediate`)
  }
  return immediate
}
