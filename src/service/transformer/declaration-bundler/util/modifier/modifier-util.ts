import { Modifier, ModifiersArray, Node, SyntaxKind } from 'typescript'

/**
 * Returns true if the given node has an Export keyword in front of it
 */
export function hasExportModifier(node: Node): boolean {
  return node.modifiers != null && node.modifiers.some(isExportModifier)
}

/**
 * Returns true if the given modifier has an Export keyword in front of it
 */
export function isExportModifier(node: Modifier): boolean {
  return node.kind === SyntaxKind.ExportKeyword
}

/**
 * Returns true if the given modifier has an Default keyword in front of it
 */
export function isDefaultModifier(node: Modifier): boolean {
  return node.kind === SyntaxKind.DefaultKeyword
}

/**
 * Removes an export modifier from the given ModifiersArray
 */
export function removeExportModifier(
  modifiers: ModifiersArray | undefined,
): Modifier[] | null | undefined {
  if (modifiers == null) {
    return null
  }
  return modifiers.filter(
    modifier => !isExportModifier(modifier) && !isDefaultModifier(modifier),
  )
}

/**
 * Returns true if the given modifiers contain the keywords 'export' and 'default'
 */
export function hasDefaultExportModifier(
  modifiers: ModifiersArray | undefined,
): boolean {
  if (modifiers == null) {
    return false
  }
  return (
    modifiers.some(modifier => isExportModifier(modifier)) &&
    modifiers.some(modifier => isDefaultModifier(modifier))
  )
}
