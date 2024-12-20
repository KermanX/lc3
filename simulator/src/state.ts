export function createState() {
  return {
    mem: new Uint16Array(65536),
    reg: new Uint16Array(8),
    pc: 0,
    cc: [false, false, false] as [boolean, boolean, boolean],
    setCC(value: number) {
      const sign = (value & 0x8000) !== 0
      this.cc = [
        sign,
        value === 0,
        !sign,
      ]
    },

    inputBuffer: '',
    outputBuffer: '',
    halted: false,
  }
}

export type State = ReturnType<typeof createState>
