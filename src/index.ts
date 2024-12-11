import { codegen } from './codegen'
import { buildSymbolTable } from './symbols'
import { tokenize } from './tokenizer'
import { LC3Error } from './utils'

export type Result = {
  result: string
  error: null
} | {
  result: null
  error: string
}

export function assemble(source: string): Result {
  try {
    const lines = tokenize(source)
    const symbols = buildSymbolTable(lines)
    const result = codegen(lines, symbols)
    return { result, error: null }
  }
  catch (e) {
    if (e instanceof LC3Error) {
      return { result: null, error: e.message }
    }
    throw e
  }
}
