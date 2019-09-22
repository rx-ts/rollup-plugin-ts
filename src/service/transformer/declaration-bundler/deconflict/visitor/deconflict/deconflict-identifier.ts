import { Identifier, VisitResult } from 'typescript'

import { DeconflictVisitorOptions } from '../../deconflict-visitor-options'

/**
 * Deconflicts the given Identifier.
 */
export function deconflictIdentifier({
  node,
  updateIdentifierIfNeeded,
}: DeconflictVisitorOptions<Identifier>): VisitResult<Identifier> {
  return updateIdentifierIfNeeded(node)
}
