import { LC3Error, assertNonNullish } from '../../shared/utils'
import { opcodes } from './opcodes'
import { tryParseImmediate, tryParseRegister } from './parser'
import type { SymbolTable } from './linker'
import type { Line } from './tokenizer'

export interface CodegenCtx {
  getOperands: (count: number) => string[]
  binary: (value: number, bits: number, unsigned?: boolean) => string
  tryRegister: (register: string) => string | null
  register: (register: string) => string
  immediate: (immediate: string, bits: number, unsigned?: boolean) => string
}

export type OpcodeHandler = (ctx: CodegenCtx) => string

export function codegen(lines: Line[], symbols: SymbolTable): string {
  const result: string[] = []

  for (let i = 0; i < lines.length; i++) {
    try {
      const { instruction, address } = lines[i]
      if (instruction.length === 0)
        continue
      const op = instruction[0]
      const context: CodegenCtx = {
        getOperands(count) {
          if (instruction.length - 1 !== count) {
            throw new LC3Error(`Invalid instruction: Expect ${count} operands. Actual: ${instruction.length - 1}`)
          }
          return instruction.slice(1)
        },
        binary(value, bits, unsigned = false) {
          const min = unsigned ? -(2 ** bits - 1) : -(2 ** (bits - 1))
          const max = unsigned ? 2 ** bits - 1 : 2 ** (bits - 1) - 1
          if (value < min || value > max) {
            throw new LC3Error(`Value out of range: ${value} (min: ${min}, max: ${max})`)
          }
          if (value < 0) {
            value = unsigned ? -value : 2 ** bits + value
          }
          return value.toString(2).padStart(bits, '0')
        },
        tryRegister(register) {
          const no = tryParseRegister(register)
          if (no === null) {
            return null
          }
          return context.binary(no, 3, true)
        },
        register(register) {
          return assertNonNullish(
            context.tryRegister(register),
            `Expect register. Actual: ${register}`,
          )
        },
        immediate(immediate, bits, unsigned) {
          const value = tryParseImmediate(immediate)
          if (value !== null) {
            return context.binary(value, bits, unsigned)
          }
          const labeled = symbols[immediate]
          if (!labeled) {
            throw new LC3Error(`Symbol not found: ${immediate}`)
          }
          return context.binary(labeled - address! - 1, bits, unsigned)
        },
      }
      if (op in opcodes) {
        const handler = opcodes[op as unknown as keyof typeof opcodes]
        result.push(`(${address!.toString(16).toUpperCase()}) ${handler(context)}`)
      }
      else if (op.startsWith('.')) {
        const directive = op.slice(1).toUpperCase()
        if (directive === 'ORIG') {
          // Skip ORIG directive
        }
        else if (directive === 'END') {
          break
        }
        else if (directive === 'FILL') {
          const [value] = instruction.slice(1)
          const binary = tryParseImmediate(value)
          if (binary === null) {
            throw new LC3Error(`Invalid immediate value: ${value}`)
          }
          result.push(`(${address!.toString(16).toUpperCase()}) ${context.binary(binary, 16, true)}`)
        }
        else if (directive === 'BLKW') {
          const [value] = instruction.slice(1)
          const size = Number(value)
          for (let j = 0; j < size; j++) {
            result.push(`(${(address! + j).toString(16).toUpperCase()}) 0000000000000000`)
          }
        }
        else if (directive === 'STRINGZ') {
          const [strJson] = instruction.slice(1)
          const str = JSON.parse(strJson)
          let j = 0
          for (; j < str.length; j++) {
            result.push(`(${(address! + j).toString(16).toUpperCase()}) ${context.binary(str.charCodeAt(j), 16, true)}`)
          }
          result.push(`(${(address! + j).toString(16).toUpperCase()}) ${context.binary(0, 16, true)}`)
        }
        else {
          throw new LC3Error(`Unknown directive: ${directive}`)
        }
      }
      else {
        throw new LC3Error(`Invalid instruction`)
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
