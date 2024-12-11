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
    return `0000${cond}${offset}`
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
  ADD: createAddOrAnd('0001'),
  AND: createAddOrAnd('0101'),

  BR: createBr('111'),
  BRN: createBr('100'),
  BRZ: createBr('010'),
  BRP: createBr('001'),
  BRNZ: createBr('110'),
  BRZN: createBr('110'),
  BRNP: createBr('101'),
  BRPN: createBr('101'),
  BRZP: createBr('011'),
  BRPZ: createBr('011'),
  BRNZP: createBr('111'),
  BRNPZ: createBr('111'),
  BRZNP: createBr('111'),
  BRZPN: createBr('111'),
  BRPNZ: createBr('111'),
  BRPZN: createBr('111'),

  JMP(ctx) {
    const [baseR] = ctx.getOperands(1)
    return `1100000${ctx.register(baseR)}000000`
  },

  JSR(ctx) {
    const [pcOffset] = ctx.getOperands(1)
    return `01001${ctx.immediate(pcOffset, 11)}`
  },

  JSRR(ctx) {
    const [baseR] = ctx.getOperands(1)
    return `0100000${ctx.register(baseR)}000000`
  },

  LD: createLDSTI('0010'),
  LDI: createLDSTI('1010'),
  LDR: createLDSTR('0110'),
  ST: createLDSTI('0011'),
  STI: createLDSTI('1011'),
  STR: createLDSTR('0111'),

  LEA(ctx) {
    const [dr, offset] = ctx.getOperands(2)
    return `1110${ctx.register(dr)}${ctx.immediate(offset, 9)}`
  },

  NOT(ctx) {
    const [dr, sr] = ctx.getOperands(2)
    return `1001${ctx.register(dr)}${ctx.register(sr)}111111`
  },

  RET: createConstant('1100000111000000'),

  RTI: createConstant('1000000000000000'),

  TRAP(ctx) {
    const [vector] = ctx.getOperands(1)
    return `11110000${ctx.immediate(vector, 8, true)}`
  },

  HALT: createConstant('1111000000100101'),
  PUTS: createConstant('1111000000100010'),
  GETC: createConstant('1111000000100000'),
  OUT: createConstant('1111000000100001'),
  IN: createConstant('1111000000100011'),
  PUTSP: createConstant('1111000000100100'),
}
