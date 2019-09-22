import { normalize } from 'path'
import {
  Node,
  SourceFile,
  TransformerFactory,
  createExportDeclaration,
  createNamedExports,
  updateSourceFileNode,
  visitEachChild,
} from 'typescript'

import { WeakMultiMap } from '../../../../lib/multi-map/weak-multi-map'
import { IDeclarationTreeShakerOptions } from '../i-declaration-tree-shaker-options'
import { ReferenceCache } from '../reference/cache/reference-cache'
import { isReferenced } from '../reference/is-referenced/is-referenced'
import { mergeExports } from '../util/merge-exports/merge-exports'
import { mergeImports } from '../util/merge-imports/merge-imports'

export function afterDeclarations({
  relativeOutFileName,
}: IDeclarationTreeShakerOptions): TransformerFactory<SourceFile> {
  return context => {
    return sourceFile => {
      // If the SourceFile is not part of the local module names, remove all statements from it and return immediately
      if (normalize(sourceFile.fileName) !== normalize(relativeOutFileName)) {
        return updateSourceFileNode(sourceFile, [], true)
      }

      // Prepare a cache
      const cache: ReferenceCache = {
        hasReferencesCache: new WeakMap(),
        identifiersForNodeCache: new WeakMultiMap(),
      }

      /**
       * Visits the given Node
       */
      function visitor(node: Node): Node | Node[] | undefined {
        if (isReferenced({ node, cache })) {
          return node
        } else {
          return undefined
        }
      }

      const updatedSourceFile = visitEachChild(sourceFile, visitor, context)
      const mergedStatements = mergeExports(
        mergeImports([...updatedSourceFile.statements]),
      )

      return updateSourceFileNode(
        updatedSourceFile,
        mergedStatements.length < 1
          ? // Create an 'export {}' declaration to mark the declaration file as module-based
            [
              createExportDeclaration(
                undefined,
                undefined,
                createNamedExports([]),
              ),
            ]
          : mergedStatements,
        updatedSourceFile.isDeclarationFile,
        updatedSourceFile.referencedFiles,
        updatedSourceFile.typeReferenceDirectives,
        updatedSourceFile.hasNoDefaultLib,
        updatedSourceFile.libReferenceDirectives,
      )
    }
  }
}
