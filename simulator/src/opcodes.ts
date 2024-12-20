import type { OP_CODE, TRAP_CODE } from '../../shared/constants'
import { OP_CODES } from '../../shared/constants'
import { LC3Error } from '../../shared/utils'
import type { Decoder } from './decoder'
import type { State } from './state'
import { traps } from './traps'

export const opcodes: Record<OP_CODE, (decoder: Decoder, state: State) => void> = {
  [OP_CODES.ADD](decoder, state) {
    const rd = decoder.reg(3)
    const sr1 = decoder.reg(3)
    const i = decoder.bool()
    const sr2 = i ? decoder.signed(5) : state.reg[decoder.reg(3)]
    state.reg[rd] = state.reg[sr1] + sr2
    state.setCC(state.reg[rd])
  },
  [OP_CODES.AND](decoder, state) {
    const rd = decoder.reg(3)
    const sr1 = decoder.reg(3)
    const i = decoder.bool()
    const sr2 = i ? decoder.signed(5) : state.reg[decoder.reg(3)]
    state.reg[rd] = state.reg[sr1] & sr2
    state.setCC(state.reg[rd])
  },
  [OP_CODES.BR](decoder, state) {
    const n = decoder.bool()
    const z = decoder.bool()
    const p = decoder.bool()
    const jump = (n && state.cc[0]) || (z && state.cc[1]) || (p && state.cc[2])
    if (jump) {
      const pcOffset = decoder.signed(9)
      state.pc += pcOffset
    }
  },
  [OP_CODES.JMP](decoder, state) {
    decoder.eat(3)
    const baseR = decoder.reg(3)
    state.pc = state.reg[baseR]
  },
  [OP_CODES.JSR](decoder, state) {
    const temp = state.pc
    const long = decoder.bool()
    if (long) {
      const pcOffset = decoder.signed(11)
      state.pc += pcOffset
    }
    else {
      decoder.eat(2)
      const baseR = decoder.reg(3)
      state.pc = state.reg[baseR]
    }
    state.reg[7] = temp
  },
  [OP_CODES.LD](decoder, state) {
    const rd = decoder.reg(3)
    const pcOffset = decoder.signed(9)
    state.reg[rd] = state.mem[state.pc + pcOffset]
    state.setCC(state.reg[rd])
  },
  [OP_CODES.LDI](decoder, state) {
    const rd = decoder.reg(3)
    const pcOffset = decoder.signed(9)
    state.reg[rd] = state.mem[state.mem[state.pc + pcOffset]]
    state.setCC(state.reg[rd])
  },
  [OP_CODES.LDR](decoder, state) {
    const rd = decoder.reg(3)
    const baseR = decoder.reg(3)
    const offset = decoder.signed(6)
    state.reg[rd] = state.mem[state.reg[baseR] + offset]
    state.setCC(state.reg[rd])
  },
  [OP_CODES.LEA](decoder, state) {
    const rd = decoder.reg(3)
    const pcOffset = decoder.signed(9)
    state.reg[rd] = state.pc + pcOffset
  },
  [OP_CODES.NOT](decoder, state) {
    const rd = decoder.reg(3)
    const sr = decoder.reg(3)
    state.reg[rd] = ~state.reg[sr]
    state.setCC(state.reg[rd])
  },
  [OP_CODES.RTI](_decoder, _state) {
    throw new LC3Error('RTI is not implemented')
  },
  [OP_CODES.ST](decoder, state) {
    const sr = decoder.reg(3)
    const pcOffset = decoder.signed(9)
    state.mem[state.pc + pcOffset] = state.reg[sr]
  },
  [OP_CODES.STI](decoder, state) {
    const sr = decoder.reg(3)
    const pcOffset = decoder.signed(9)
    state.mem[state.mem[state.pc + pcOffset]] = state.reg[sr]
  },
  [OP_CODES.STR](decoder, state) {
    const sr = decoder.reg(3)
    const baseR = decoder.reg(3)
    const offset = decoder.signed(6)
    state.mem[state.reg[baseR] + offset] = state.reg[sr]
  },
  [OP_CODES.TRAP](decoder, state) {
    decoder.eat(4)
    const trapVector = decoder.unsigned(8) as TRAP_CODE
    const handler = traps[trapVector]
    if (!handler) {
      throw new LC3Error(`Invalid/unsupported trap vector: ${trapVector}`)
    }
    handler(state)
  },
  [OP_CODES._Reserved](_decoder, _state) {
    throw new LC3Error('Reserved opcode')
  },
}
