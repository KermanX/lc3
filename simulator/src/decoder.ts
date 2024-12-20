export function createDecoder(inst: string) {
  let index = 0
  function eat(bits: number): string {
    const raw = inst.slice(index, index + bits)
    index += bits
    return raw
  }

  const decoder = {
    opcode: eat(4),
    eat,
    unsigned(bits: number) {
      return Number.parseInt(decoder.eat(bits), 2)
    },
    signed(bits: number) {
      const num = decoder.unsigned(bits)
      const sign = num & (1 << (bits - 1))
      return sign ? num - (1 << bits) : num
    },
    reg(bits: number) {
      return decoder.unsigned(bits)
    },
    bool() {
      return decoder.eat(1) === '1'
    },
  }

  return decoder
}

export type Decoder = ReturnType<typeof createDecoder>
