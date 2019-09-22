import { Node } from 'typescript'

/**
 * Returns true if the given Node contains the given Child Node
 */
export function nodeContainsChild(parent: Node, potentialChild: Node): boolean {
  if (parent === potentialChild) {
    return false
  }

  let candidate = potentialChild
  while (candidate != null) {
    candidate = candidate.parent
    if (candidate === parent) {
      return true
    }
  }

  return false
}
