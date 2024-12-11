import type { SymbolTable } from './symbols'
import type { Line } from './tokenizer'
import { parseRegister, tryParseImmediate, tryParseRegister } from './parser'
import { LC3Error, assertNonNullish } from './utils'
import { opcodes } from './opcodes'

export interface CodegenCtx {
  getOperands: (count: number) => string[]
  binary: (value: number, bits: number) => string
  tryRegister: (register: string) => string | null
  register: (register: string) => string
  immediate: (immediate: string, bits: number) => string
}

export type OpcodeHandler = (ctx: CodegenCtx) => string

export function codegen(lines: Line[], symbols: SymbolTable): string {
  const result: string[] = []

  for (let i = 0; i < lines.length; i++) {
    try {
      const { instruction, address } = lines[i]
      if (instruction.length === 0)
        continue
      const op = instruction[0].toUpperCase()
      if (op in opcodes) {
        const handler = opcodes[op as unknown as keyof typeof opcodes]
        const context: CodegenCtx = {
          getOperands(count) {
            if (instruction.length - 1 !== count) {
              throw new LC3Error(`Invalid instruction: Expect ${count} operands. Actual: ${instruction.length - 1}`)
            }
            return instruction.slice(1)
          },
          binary(value, bits) {
            if (value < 0) {
              value = 2 ** bits + value
            }
            return value.toString(2).padStart(bits, '0')
          },
          tryRegister(register) {
            const no = tryParseRegister(register)
            if (no === null) {
              return null
            }
            return context.binary(no, 3)
          },
          register(register) {
            return assertNonNullish(
              context.tryRegister(register),
              `Expect register. Actual: ${register}`,
            )
          },
          immediate(immediate, bits) {
            const value = tryParseImmediate(immediate)
            if (value !== null) {
              return context.binary(value, bits)
            }
            const labeled = symbols[immediate]
            if (!labeled) {
              throw new LC3Error(`Symbol not found: ${immediate}`)
            }
            return context.binary(labeled - address!, bits)
          },
        }
        result.push(handler(context))
      }
      else if (op.startsWith('.')) {
        // Ignore
      }
      else {
        throw new LC3Error(`Invalid instruction: ${instruction.join(', ')}`)
      }
    }
    catch (e: unknown) {
      if (e instanceof LC3Error) {
        throw new LC3Error(`Error at line ${i + 1}: ${e.message}`)
      }
      throw e
    }
  }

  return result.join('\n')
}
