import { VariableStatement } from 'typescript'

import { TraceIdentifiersVisitorOptions } from '../../trace-identifiers-visitor-options'

/**
 * Deconflicts the given VariableStatement.
 */
export function traceIdentifiersForVariableStatement({
  node,
  continuation,
}: TraceIdentifiersVisitorOptions<VariableStatement>): void {
  continuation(node.declarationList)
}
