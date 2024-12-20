export function assertNonNullish<T>(value: T | null | undefined, message: string): T {
  if (value == null) {
    throw new LC3Error(message)
  }
  return value
}

export class LC3Error extends Error {
  constructor(message: string) {
    super(message)
  }
}
