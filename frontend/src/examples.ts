import type { Example } from './types'

export const EXAMPLES: Example[] = [
  {
    name: 'Two Sum',
    code: `nums = [2, 7, 11, 15]
target = 9
seen = {}

for i, num in enumerate(nums):
    complement = target - num
    if complement in seen:
        print(seen[complement], i)
        break
    seen[num] = i
`,
    input: '',
  },
  {
    name: 'Binary Search',
    code: `arr = [1, 3, 5, 7, 9, 11]
target = 7
left, right = 0, len(arr) - 1
result = -1

while left <= right:
    mid = (left + right) // 2
    if arr[mid] == target:
        result = mid
        break
    elif arr[mid] < target:
        left = mid + 1
    else:
        right = mid - 1

print(result)
`,
    input: '',
  },
  {
    name: 'BFS (Graph)',
    code: `graph = {
    'A': ['B', 'C'],
    'B': ['D', 'E'],
    'C': ['F'],
    'D': [], 'E': [], 'F': []
}
start = 'A'
visited = set()
queue = [start]
order = []

while queue:
    node = queue.pop(0)
    if node in visited:
        continue
    visited.add(node)
    order.append(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            queue.append(neighbor)

print(order)
`,
    input: '',
  },
  {
    name: 'Stdin Input',
    code: `n = int(input())
arr = list(map(int, input().split()))
total = 0

for x in arr:
    total += x

print(total)
`,
    input: '5\n1 2 3 4 5',
  },
]
