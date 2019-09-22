import { normalize } from 'path'
import { ExportAssignment, VariableStatement, isIdentifier } from 'typescript'

import { getAliasedDeclaration } from '../../util/symbol/get-aliased-declaration'
import { UpdateExportsVisitorOptions } from '../update-exports-visitor-options'

/**
 * Visits the given ExportAssignment.
 */
export function visitExportAssignment({
  node,
  sourceFile,
  isEntry,
  typeChecker,
  identifiersForDefaultExportsForModules,
}: UpdateExportsVisitorOptions<ExportAssignment>):
  | ExportAssignment
  | VariableStatement
  | undefined {
  // Only preserve the node if it is part of the entry file for the chunk
  if (isEntry) {
    return node
  } else if (isIdentifier(node.expression)) {
    const declaration = getAliasedDeclaration(node.expression, typeChecker)
    if (declaration != null) {
      identifiersForDefaultExportsForModules.set(
        normalize(sourceFile.fileName),
        [node.expression.text, declaration],
      )
    }
  }

  return undefined
}
