import { opcodes } from './opcodes'
import { LC3Error } from './utils'

export interface Line {
  source: string
  labels: string[]
  instruction: string[]
  comment: string
  address?: number
}

function isOpcodeOrPseudoCode(str: string | undefined): boolean {
  return str !== undefined && (str.toUpperCase() in opcodes || str[0] === '.')
}

function tokenizeLine(line: string): Line {
  // 1. Strip comment and/or string
  let comment: string | undefined
  let string: string | undefined
  let buildingString: string | undefined
  let escaping = false
  let labelsAndInstruction = ''
  for (const char of line) {
    if (comment !== undefined) {
      comment += char
    }
    else if (buildingString !== undefined) {
      if (escaping) {
        escaping = false
        buildingString += char
      }
      else if (char === '\\') {
        escaping = true
      }
      else if (char === '"') {
        string = buildingString
        buildingString = undefined
      }
    }
    else if (char === ';') {
      comment = ''
    }
    else if (char === '"') {
      buildingString = ''
    }
    else {
      labelsAndInstruction += char
    }
  }

  if (buildingString) {
    throw new LC3Error('String not closed')
  }
  if (escaping) {
    throw new LC3Error('Escape character at end of line')
  }

  // 2. Get labels & instruction
  const [labelsAndOp, ...operands] = labelsAndInstruction.split(',').map(part => part.trim())
  const labelsAndOpArr = labelsAndOp.split(/\s+/).map(part => part.trim())

  let labels: string[]
  let instruction: string[]
  if (operands.length > 0 || isOpcodeOrPseudoCode(labelsAndOpArr.at(-2))) {
    labels = labelsAndOpArr.slice(0, -2)
    instruction = [...labelsAndOpArr.slice(-2), ...operands]
  } else if (isOpcodeOrPseudoCode(labelsAndOpArr.at(-1))){
    labels = labelsAndOpArr.slice(0, -1)
    instruction = [...labelsAndOpArr.slice(-1), ...operands]
  } else {
    labels = labelsAndOpArr
    instruction = operands
  }

  if (string) {
    instruction.push(JSON.stringify(string))
  }

  return {
    source: line,
    labels: labels.filter(Boolean),
    instruction: instruction.filter(Boolean),
    comment: comment || '',
  }
}

export function tokenize(source: string): Line[] {
  return source.split('\n').map((line, i) => {
    try {
      return tokenizeLine(line)
    }
    catch (e: unknown) {
      if (e instanceof LC3Error) {
        throw new LC3Error(`Error at line ${i + 1}: ${e.message}`)
      }
      throw e
    }
  })
}
