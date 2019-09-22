import { ImportDeclaration, isNamedImports } from 'typescript'

import { TraceIdentifiersVisitorOptions } from '../../trace-identifiers-visitor-options'

/**
 * Traces identifiers for the given InterfaceDeclaration.
 */
export function traceIdentifiersForImportDeclaration({
  node,
  addIdentifier,
  isIdentifierFree,
  updateIdentifierName,
  generateUniqueVariableName,
}: TraceIdentifiersVisitorOptions<ImportDeclaration>): void {
  if (node.importClause != null) {
    if (node.importClause.name != null) {
      addIdentifier(node.importClause.name.text)
    }

    if (node.importClause.namedBindings != null) {
      if (isNamedImports(node.importClause.namedBindings)) {
        for (const element of node.importClause.namedBindings.elements) {
          if (element.propertyName != null) {
            if (!isIdentifierFree(element.name.text)) {
              updateIdentifierName(
                element.name.text,
                generateUniqueVariableName(element.name.text),
              )
            } else {
              addIdentifier(element.name.text)
            }
          }
        }
      } else {
        if (!isIdentifierFree(node.importClause.namedBindings.name.text)) {
          updateIdentifierName(
            node.importClause.namedBindings.name.text,
            generateUniqueVariableName(
              node.importClause.namedBindings.name.text,
            ),
          )
        } else {
          addIdentifier(node.importClause.namedBindings.name.text)
        }
      }
    }
  }
}
