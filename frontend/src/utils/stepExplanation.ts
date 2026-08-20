import { getChangedKeys } from './visualState'

export function explainStep(
  sourceLines: string[],
  line: number | null,
  prevVars: Record<string, string>,
  currVars: Record<string, string>,
  functionName?: string | null,
): string {
  if (line === null) return 'Finished running your code.'

  const sourceLine = sourceLines[line - 1]?.trim() ?? ''
  const changes = getChangedKeys(prevVars, currVars)

  if (changes.length > 0) {
    const parts = changes.slice(0, 3).map((name) => {
      const next = currVars[name]
      if (next === undefined) return `${name} was removed`
      if (prevVars[name] === undefined) return `${name} is now ${next}`
      return `${name} changed to ${next}`
    })
    if (parts.length === 1) return parts[0]
    return `${parts.join(' · ')}`
  }

  if (!sourceLine) return `Executing line ${line}`

  if (sourceLine.startsWith('class ')) return 'Define the Solution class.'
  if (sourceLine.startsWith('def ')) return `Enter ${functionName ?? 'function'}().`
  if (sourceLine.includes('if i >= len(nums)') || sourceLine.includes('if i >= len(')) {
    return 'Check if the current index reached the end of the array.'
  }
  if (sourceLine.includes('if ') && sourceLine.endsWith(':')) {
    return `Evaluate condition: ${sourceLine.slice(3, -1).trim()}`
  }
  if (sourceLine.includes('.append(')) {
    const target = sourceLine.split('.append(')[0].trim()
    return `Add an element to ${target}.`
  }
  if (sourceLine.includes('.pop()')) {
    return 'Backtrack by removing the last element.'
  }
  if (sourceLine.includes('.copy()')) {
    return 'Make a copy of the current list.'
  }
  if (sourceLine.includes('return ')) {
    return `Return ${sourceLine.replace('return', '').trim()}.`
  }
  if (sourceLine.includes('= []') || sourceLine.includes('= {}')) {
    return `Initialize ${sourceLine.split('=')[0].trim()}.`
  }
  if (sourceLine.includes('=')) {
    return `Update ${sourceLine.split('=')[0].trim()}.`
  }
  if (sourceLine.includes('for ') || sourceLine.includes('while ')) {
    return `Start loop: ${sourceLine}`
  }

  return `Run: ${sourceLine}`
}
