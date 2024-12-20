import { LC3Error, assertNonNullish } from '../../shared/utils'
import { parseImmediate } from './parser'
import type { Line } from './tokenizer'

export type SymbolTable = Record<string, number>

export function link(lines: Line[]): SymbolTable {
  const table: SymbolTable = {}
  let address: number | undefined
  let needNextAddress = false
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
        needNextAddress = true
      }

      if (instruction.length === 0)
        continue
      if (instruction[0].toUpperCase() === '.ORIG') {
        if (address !== undefined) {
          throw new LC3Error('Duplicate .ORIG directive')
        }
        if (instruction.length !== 2) {
          throw new LC3Error('Invalid .ORIG directive')
        }
        address = parseImmediate(instruction[1])
      }
      else {
        address = assertNonNullish(address, 'No .ORIG directive found')
        line.address = address

        // Increment address based on instruction
        if (instruction[0].toUpperCase() === '.END') {
          break
        }
        else if (instruction[0].toUpperCase() === '.BLKW') {
          if (instruction.length !== 2) {
            throw new LC3Error('Invalid .BLKW directive')
          }
          const size = Number(instruction[1])
          if (!Number.isFinite(size) || size < 0) {
            throw new LC3Error(`Invalid .BLKW size: ${instruction[1]}`)
          }
          address += size
        }
        else if (instruction[0].toUpperCase() === '.STRINGZ') {
          if (instruction.length !== 2) {
            throw new LC3Error('Invalid .STRINGZ directive')
          }
          try {
            const string = JSON.parse(instruction[1])
            address += string.length + 1
          }
          catch {
            throw new LC3Error('Invalid .STRINGZ directive')
          }
        }
        else if (instruction.length > 0) {
          address += 1
        }
        needNextAddress = false
      }
    }
    catch (e) {
      if (e instanceof LC3Error) {
        throw new LC3Error(`Error at line ${i + 1}: ${e.message}`)
      }
      throw e
    }
  }
  if (needNextAddress) {
    throw new LC3Error('Expected next instruction after label')
  }
  return table
}
