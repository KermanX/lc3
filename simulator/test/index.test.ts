import { describe, expect, it } from 'vitest'
import { createSimulator } from '../src'

describe('simulator', () => {
  it('should execute basic program', () => {
    const src = `
      0010110000010100
      0101000000100000
      0001001000100001
      1001010001111111
      0000011000000011
      0111000110000000
      0111001110000001
      0111010110000010
      1110011000001100
      0111011110000011
      0100100000000111
      0111011110000100
      1110000000000010
      1100000000000000
      1101000000000000
      1010000000000101
      0111000110000101
      1111000000100101
      0101011011100000
      0001011011101010
      1100000111000000
      0100000000000000
    `

    const simulator = createSimulator()
    simulator.load(0x3000, src)
    simulator.run()

    expect(simulator.state.mem[0x4000]).toBe(0x0)
    expect(simulator.state.mem[0x4001]).toBe(0x1)
    expect(simulator.state.mem[0x4002]).toBe(0xFFFE)
    expect(simulator.state.mem[0x4003]).toBe(0x3015)
    expect(simulator.state.mem[0x4004]).toBe(0xA)
    expect(simulator.state.mem[0x4005]).toBe(0x0)
  })
})
