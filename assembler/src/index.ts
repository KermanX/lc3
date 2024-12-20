import { LC3Error } from '../../shared/utils'
import { codegen } from './codegen'
import { link } from './linker'
import { tokenize } from './tokenizer'

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
    const symbols = link(lines)
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
