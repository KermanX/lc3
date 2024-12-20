import { OP_CODES } from '../../shared/constants'
import type { OpcodeHandler } from './codegen'

function createAddOrAnd(opcode: string): OpcodeHandler {
  return function (ctx) {
    const [rd, rn, operand2] = ctx.getOperands(3)
    let op2 = ctx.tryRegister(operand2)
    op2 = op2 ? `000${op2}` : `1${ctx.immediate(operand2, 5)}`
    return `${opcode}${ctx.register(rd)}${ctx.register(rn)}${op2}`
  }
}

function createBr(cond: string): OpcodeHandler {
  return function (ctx) {
    const [label] = ctx.getOperands(1)
    const offset = ctx.immediate(label, 9)
    return `${OP_CODES.BR}${cond}${offset}`
  }
}

function createLDSTI(opcode: string): OpcodeHandler {
  return function (ctx) {
    const [r, pcOffset] = ctx.getOperands(2)
    return `${opcode}${ctx.register(r)}${ctx.immediate(pcOffset, 9)}`
  }
}

function createLDSTR(opcode: string): OpcodeHandler {
  return function (ctx) {
    const [r, br, pcOffset] = ctx.getOperands(3)
    return `${opcode}${ctx.register(r)}${ctx.register(br)}${ctx.immediate(pcOffset, 6)}`
  }
}

function createConstant(code: string): OpcodeHandler {
  return function (ctx) {
    ctx.getOperands(0)
    return code
  }
}

export const opcodes: Record<string, OpcodeHandler> = {
  ADD: createAddOrAnd(OP_CODES.ADD),
  AND: createAddOrAnd(OP_CODES.AND),

  BR: createBr('111'),
  BRn: createBr('100'),
  BRz: createBr('010'),
  BRp: createBr('001'),
  BRnz: createBr('110'),
  BRzn: createBr('110'),
  BRnp: createBr('101'),
  BRpn: createBr('101'),
  BRzp: createBr('011'),
  BRpz: createBr('011'),
  BRnzp: createBr('111'),
  BRnpz: createBr('111'),
  BRznp: createBr('111'),
  BRzpn: createBr('111'),
  BRpnz: createBr('111'),
  BRpzn: createBr('111'),

  JMP(ctx) {
    const [baseR] = ctx.getOperands(1)
    return `${OP_CODES.JMP}000${ctx.register(baseR)}000000`
  },

  JSR(ctx) {
    const [pcOffset] = ctx.getOperands(1)
    return `${OP_CODES.JSR}1${ctx.immediate(pcOffset, 11)}`
  },

  JSRR(ctx) {
    const [baseR] = ctx.getOperands(1)
    return `${OP_CODES.JSR}000${ctx.register(baseR)}000000`
  },

  LD: createLDSTI(OP_CODES.LD),
  LDI: createLDSTI(OP_CODES.LDI),
  LDR: createLDSTR(OP_CODES.LDR),
  ST: createLDSTI(OP_CODES.ST),
  STI: createLDSTI(OP_CODES.STI),
  STR: createLDSTR(OP_CODES.STR),

  LEA(ctx) {
    const [dr, offset] = ctx.getOperands(2)
    return `${OP_CODES.LEA}${ctx.register(dr)}${ctx.immediate(offset, 9)}`
  },

  NOT(ctx) {
    const [dr, sr] = ctx.getOperands(2)
    return `${OP_CODES.NOT}${ctx.register(dr)}${ctx.register(sr)}111111`
  },

  RET: createConstant('1100000111000000'),

  RTI: createConstant('1000000000000000'),

  TRAP(ctx) {
    const [vector] = ctx.getOperands(1)
    return `${OP_CODES.TRAP}0000${ctx.immediate(vector, 8, true)}`
  },

  HALT: createConstant('1111000000100101'),
  PUTS: createConstant('1111000000100010'),
  GETC: createConstant('1111000000100000'),
  OUT: createConstant('1111000000100001'),
  IN: createConstant('1111000000100011'),
  PUTSP: createConstant('1111000000100100'),
}

// Add lowercase opcodes
for (const name in opcodes) {
  opcodes[name.toLowerCase()] = opcodes[name]
}
