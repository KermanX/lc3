import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { assemble } from '../src'
import { tokenize } from '../src/tokenizer'

describe('fixtures', () => {
  const fixtureDir = fileURLToPath(new URL('./fixtures', import.meta.url))
  const snapshotDir = fileURLToPath(new URL('./__snapshots__', import.meta.url))
  fs.readdirSync(fixtureDir).forEach((file) => {
    it(file, () => {
      const name = file.split('.')[0]
      const fixture = fs.readFileSync(`${fixtureDir}/${file}`, 'utf-8')
      const tokens = tokenize(fixture)
      expect(JSON.stringify(tokens, null, 2)).toMatchFileSnapshot(`${snapshotDir}/tokens/${name}.json`)
      const result = assemble(fixture)
      if (result.result)
        expect(result.result).toMatchFileSnapshot(`${snapshotDir}/result/${name}.out`)
      else
        expect(result.error).toMatchFileSnapshot(`${snapshotDir}/result/${name}.err`)
    })
  })
})
