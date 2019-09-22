import { VariableDeclaration } from 'typescript'

import { TraceIdentifiersVisitorOptions } from '../../trace-identifiers-visitor-options'

/**
 * Deconflicts the given VariableDeclaration.
 */
export function traceIdentifiersForVariableDeclaration({
  node,
  continuation,
}: TraceIdentifiersVisitorOptions<VariableDeclaration>): void {
  continuation(node.name)
}
