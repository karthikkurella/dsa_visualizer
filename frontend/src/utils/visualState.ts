export type ParsedValue = string | number | boolean | null | ParsedValue[] | Record<string, ParsedValue>

export function parsePythonValue(raw: string): ParsedValue | null {
  const value = raw.trim()
  if (!value) return null

  if (value === 'None') return null
  if (value === 'True') return true
  if (value === 'False') return false
  if (/^-?\d+$/.test(value)) return Number(value)
  if (/^-?\d+\.\d+$/.test(value)) return Number(value)

  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }

  if (value.startsWith('[') || value.startsWith('{')) {
    try {
      const jsonish = value
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false')
        .replace(/\bNone\b/g, 'null')
        .replace(/'/g, '"')
      return JSON.parse(jsonish) as ParsedValue
    } catch {
      return null
    }
  }

  return value
}

export function isArrayValue(value: ParsedValue | null): value is ParsedValue[] {
  return Array.isArray(value)
}

export function formatCellValue(value: ParsedValue): string {
  if (value === null) return 'None'
  if (typeof value === 'boolean') return value ? 'True' : 'False'
  if (Array.isArray(value)) return `[${value.map(formatCellValue).join(', ')}]`
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function getChangedKeys(
  prev: Record<string, string>,
  curr: Record<string, string>,
): string[] {
  const keys = new Set([...Object.keys(prev), ...Object.keys(curr)])
  const changed: string[] = []
  for (const key of keys) {
    if (prev[key] !== curr[key]) changed.push(key)
  }
  return changed
}

export function getCurrentVariables(stack: { variables: Record<string, string> }[]): Record<string, string> {
  const merged: Record<string, string> = {}
  for (let i = stack.length - 1; i >= 0; i -= 1) {
    Object.assign(merged, stack[i].variables)
  }
  return merged
}
