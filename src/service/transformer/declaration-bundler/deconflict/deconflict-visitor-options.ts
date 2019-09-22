import { Identifier, Node, VisitResult } from 'typescript'

export interface DeconflictVisitorOptions<T extends Node = Node> {
  node: T
  updateIdentifierIfNeeded<U extends Identifier>(
    identifier?: U,
  ): U | null | undefined
  continuation<U extends Node>(node: U): VisitResult<U>
}
