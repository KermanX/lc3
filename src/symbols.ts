import { parseImmediate } from './parser'
import type { Line } from './tokenizer'
import { LC3Error, assertNonNullish } from './utils'

export type SymbolTable = Record<string, number>

export function buildSymbolTable(lines: Line[]): SymbolTable {
  const table: SymbolTable = {}
  let address: number | undefined
  for (let i = 0; i < lines.length; i++) {
    try {
      const line = lines[i]
      const { labels, instruction } = line

      if (labels.length > 0) {
        for (const label of labels) {
          if (table[label] !== undefined) {
            throw new LC3Error(`Duplicate label: ${label}`)
          }
          table[label] = assertNonNullish(address, 'No .ORIG directive found')
        }
      }

      if (instruction.length === 0)
        continue
      if (instruction[0].toUpperCase() === '.ORIG') {
        if (instruction.length !== 2) {
          throw new LC3Error('Invalid .ORIG directive')
        }
        address = parseImmediate(instruction[1])
      }
      else {
        address = assertNonNullish(address, 'No .ORIG directive found')
        line.address = address

        // Increment address based on instruction
        if (instruction[0].toUpperCase() === '.BLKW') {
          if (instruction.length !== 2) {
            throw new LC3Error('Invalid .BLKW directive')
          }
          const size = parseImmediate(instruction[1])
          address += size
        }
        else if (instruction[0].toUpperCase() === '.STRINGZ') {
          if (instruction.length !== 2) {
            throw new LC3Error('Invalid .STRINGZ directive')
          }
          try {
            const string = JSON.parse(instruction[1])
            address += string.length
          }
          catch {
            throw new LC3Error('Invalid .STRINGZ directive')
          }
        }
        else if (instruction.length > 0) {
          address += 1
        }
      }
    }
    catch (e) {
      if (e instanceof LC3Error) {
        throw new LC3Error(`Error at line ${i + 1}: ${e.message}`)
      }
      throw e
    }
  }
  return table
}
