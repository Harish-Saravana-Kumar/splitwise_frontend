interface SplitLike {
  owedAmount: number
}

export function required(value: unknown): string | null {
  if (value === null || value === undefined) {
    return 'This field is required.'
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return 'This field is required.'
  }

  if (Array.isArray(value) && value.length === 0) {
    return 'This field is required.'
  }

  return null
}

export function positiveNumber(value: unknown): string | null {
  const numberValue = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return 'Must be a positive number.'
  }

  return null
}

export function sumEquals(splits: SplitLike[], total: number): string | null {
  const sum = splits.reduce((acc, split) => acc + Number(split.owedAmount || 0), 0)
  if (Math.abs(sum - Number(total)) > 0.0001) {
    return 'Sum of splits must equal total.'
  }

  return null
}

export function notSame(a: unknown, b: unknown, label: string): string | null {
  if (String(a) === String(b)) {
    return `${label} cannot be the same.`
  }

  return null
}
