export const OP_CODES = {
  ADD: '0001',
  AND: '0101',
  BR: '0000',
  JMP: '1100',
  JSR: '0100',
  LD: '0010',
  LDI: '1010',
  LDR: '0110',
  LEA: '1110',
  NOT: '1001',
  RTI: '1000',
  ST: '0011',
  STI: '1011',
  STR: '0111',
  TRAP: '1111',
  _Reserved: '1101',
} as const

export type OP_CODE = typeof OP_CODES[keyof typeof OP_CODES]

export const TRAP_CODES = {
  GETC: 0x20,
  OUT: 0x21,
  PUTS: 0x22,
  IN: 0x23,
  PUTSP: 0x24,
  HALT: 0x25,
} as const

export type TRAP_CODE = typeof TRAP_CODES[keyof typeof TRAP_CODES]
