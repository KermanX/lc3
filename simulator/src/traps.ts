import type { TRAP_CODE } from '../../shared/constants'
import { TRAP_CODES } from '../../shared/constants'
import { LC3Error } from '../../shared/utils'
import type { State } from './state'

export const traps: Record<TRAP_CODE, (state: State) => void> = {
  [TRAP_CODES.GETC](state) {
    if (state.inputBuffer.length === 0) {
      throw new LC3Error('Input buffer is empty')
    }
    state.reg[0] = state.inputBuffer.charCodeAt(0)
    state.inputBuffer = state.inputBuffer.slice(1)
  },
  [TRAP_CODES.OUT](state) {
    const char = String.fromCharCode(state.reg[0])
    state.outputBuffer += char
  },
  [TRAP_CODES.PUTS](state) {
    let address = state.reg[0]
    let char = state.mem[address]
    while (char) {
      state.outputBuffer += String.fromCharCode(char)
      char = state.mem[++address]
    }
  },
  [TRAP_CODES.IN](state) {
    if (state.inputBuffer.length === 0) {
      throw new LC3Error('Input buffer is empty')
    }
    state.reg[0] = state.inputBuffer.charCodeAt(0)
    state.inputBuffer = state.inputBuffer.slice(1)
  },
  [TRAP_CODES.PUTSP](state) {
    let address = state.reg[0]
    let char = state.mem[address]
    while (char) {
      const char1 = char & 0xFF
      const char2 = char >> 8
      if (char1) {
        state.outputBuffer += String.fromCharCode(char1)
      }
      if (char2) {
        state.outputBuffer += String.fromCharCode(char2)
      }
      char = state.mem[++address]
    }
  },
  [TRAP_CODES.HALT](state) {
    state.halted = true
  },
}
