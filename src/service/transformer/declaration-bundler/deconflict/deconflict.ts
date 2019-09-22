import { normalize } from 'path'
import {
  Identifier,
  Node,
  SourceFile,
  TransformerFactory,
  VisitResult,
  createIdentifier,
  isArrayBindingPattern,
  isBindingElement,
  isClassDeclaration,
  isEnumDeclaration,
  isFunctionDeclaration,
  isIdentifier,
  isImportDeclaration,
  isInterfaceDeclaration,
  isObjectBindingPattern,
  isOmittedExpression,
  isTypeAliasDeclaration,
  isVariableDeclaration,
  isVariableDeclarationList,
  isVariableStatement,
  updateSourceFileNode,
  visitEachChild,
} from 'typescript'

import { IDeclarationBundlerOptions } from '../i-declaration-bundler-options'
import { getChunkFilename } from '../util/get-chunk-filename/get-chunk-filename'

import { DeconflictVisitorOptions } from './deconflict-visitor-options'
import { TraceIdentifiersVisitorOptions } from './trace-identifiers-visitor-options'
import { deconflictIdentifier } from './visitor/deconflict/deconflict-identifier'
import { traceIdentifiersForBindingElement } from './visitor/trace-identifiers/trace-identifiers-for-binding-element'
import { traceIdentifiersForBindingPattern } from './visitor/trace-identifiers/trace-identifiers-for-binding-pattern'
import { traceIdentifiersForClassDeclaration } from './visitor/trace-identifiers/trace-identifiers-for-class-declaration'
import { traceIdentifiersForEnumDeclaration } from './visitor/trace-identifiers/trace-identifiers-for-enum-declaration'
import { traceIdentifiersForFunctionDeclaration } from './visitor/trace-identifiers/trace-identifiers-for-function-declaration'
import { traceIdentifiersForIdentifier } from './visitor/trace-identifiers/trace-identifiers-for-identifier'
import { traceIdentifiersForImportDeclaration } from './visitor/trace-identifiers/trace-identifiers-for-import-declaration'
import { traceIdentifiersForInterfaceDeclaration } from './visitor/trace-identifiers/trace-identifiers-for-interface-declaration'
import { traceIdentifiersForOmittedExpression } from './visitor/trace-identifiers/trace-identifiers-for-omitted-expression'
import { traceIdentifiersForTypeAliasDeclaration } from './visitor/trace-identifiers/trace-identifiers-for-type-alias-declaration'
import { traceIdentifiersForVariableDeclaration } from './visitor/trace-identifiers/trace-identifiers-for-variable-declaration'
import { traceIdentifiersForVariableDeclarationList } from './visitor/trace-identifiers/trace-identifiers-for-variable-declaration-list'
import { traceIdentifiersForVariableStatement } from './visitor/trace-identifiers/trace-identifiers-for-variable-statement'

/**
 * Traces identifiers for the given Node, potentially generating new unique variable names for them
 */
function traceIdentifiers({
  node,
  ...rest
}: TraceIdentifiersVisitorOptions): void {
  if (isBindingElement(node)) {
    return traceIdentifiersForBindingElement({ ...rest, node })
  } else if (isArrayBindingPattern(node) || isObjectBindingPattern(node)) {
    return traceIdentifiersForBindingPattern({ ...rest, node })
  } else if (isClassDeclaration(node)) {
    return traceIdentifiersForClassDeclaration({ ...rest, node })
  } else if (isEnumDeclaration(node)) {
    return traceIdentifiersForEnumDeclaration({ ...rest, node })
  } else if (isFunctionDeclaration(node)) {
    return traceIdentifiersForFunctionDeclaration({ ...rest, node })
  } else if (isImportDeclaration(node)) {
    return traceIdentifiersForImportDeclaration({ ...rest, node })
  } else if (isIdentifier(node)) {
    return traceIdentifiersForIdentifier({ ...rest, node })
  } else if (isInterfaceDeclaration(node)) {
    return traceIdentifiersForInterfaceDeclaration({ ...rest, node })
  } else if (isOmittedExpression(node)) {
    return traceIdentifiersForOmittedExpression({ ...rest, node })
  } else if (isTypeAliasDeclaration(node)) {
    return traceIdentifiersForTypeAliasDeclaration({ ...rest, node })
  } else if (isVariableDeclaration(node)) {
    return traceIdentifiersForVariableDeclaration({ ...rest, node })
  } else if (isVariableDeclarationList(node)) {
    return traceIdentifiersForVariableDeclarationList({ ...rest, node })
  } else if (isVariableStatement(node)) {
    return traceIdentifiersForVariableStatement({ ...rest, node })
  }
}

/**
 * Deconflicts the given Node
 */
function deconflictNode({
  node,
  continuation,
  ...rest
}: DeconflictVisitorOptions): VisitResult<Node> {
  if (isIdentifier(node)) {
    return deconflictIdentifier({ ...rest, continuation, node })
  } else {
    return continuation(node)
  }
}

/**
 * Deconflicts local identifiers such that they won't interfere with identifiers across modules
 * for the same chunk
 */
export function deconflict(
  options: IDeclarationBundlerOptions,
): TransformerFactory<SourceFile> {
  const updatedIdentifierNamesForModuleMap: Map<
    string,
    Map<string, string>
  > = new Map()
  const rootLevelIdentifiersForModuleMap: Map<string, Set<string>> = new Map()
  const generatedVariableNamesForChunkMap: Map<string, Set<string>> = new Map()

  return context => {
    return sourceFile => {
      // If the SourceFile is not part of the local module names, remove all statements from it and return immediately
      if (!options.localModuleNames.includes(normalize(sourceFile.fileName))) {
        return updateSourceFileNode(sourceFile, [], true)
      }

      const chunkFilename = getChunkFilename(
        normalize(sourceFile.fileName),
        options.supportedExtensions,
        options.chunkToOriginalFileMap,
      )

      let rootLevelIdentifiersForModule = rootLevelIdentifiersForModuleMap.get(
        normalize(sourceFile.fileName),
      )
      let updatedIdentifierNamesForModule = updatedIdentifierNamesForModuleMap.get(
        normalize(sourceFile.fileName),
      )
      let generatedVariableNamesForChunk = generatedVariableNamesForChunkMap.get(
        chunkFilename,
      )

      if (rootLevelIdentifiersForModule == null) {
        rootLevelIdentifiersForModule = new Set()
        rootLevelIdentifiersForModuleMap.set(
          normalize(sourceFile.fileName),
          rootLevelIdentifiersForModule,
        )
      }

      if (updatedIdentifierNamesForModule == null) {
        updatedIdentifierNamesForModule = new Map()
        updatedIdentifierNamesForModuleMap.set(
          normalize(sourceFile.fileName),
          updatedIdentifierNamesForModule,
        )
      }

      if (generatedVariableNamesForChunk == null) {
        generatedVariableNamesForChunk = new Set()
        generatedVariableNamesForChunkMap.set(
          chunkFilename,
          generatedVariableNamesForChunk,
        )
      }

      // Prepare some VisitorOptions
      const sharedVisitorOptions = {
        ...options,
      }

      // Prepare some VisitorOptions
      const traceIdentifiersVisitorOptions = {
        ...sharedVisitorOptions,

        continuation: <U extends Node>(node: U): void =>
          traceIdentifiers({ ...traceIdentifiersVisitorOptions, node }),

        isIdentifierFree(identifier: string): boolean {
          for (const module of options.localModuleNames) {
            // Skip the current module
            if (module === normalize(sourceFile.fileName)) {
              continue
            }

            const identifiersForModule = rootLevelIdentifiersForModuleMap.get(
              module,
            )
            if (
              identifiersForModule != null &&
              identifiersForModule.has(identifier)
            ) {
              return false
            }
          }
          return true
        },

        updateIdentifierName(oldName: string, newName: string): void {
          updatedIdentifierNamesForModule.set(oldName, newName)
        },

        addIdentifier(name: string): void {
          rootLevelIdentifiersForModule.add(name)
        },

        generateUniqueVariableName(candidate: string): string {
          const suffix = '_$'
          let counter = 0

          while (true) {
            const currentCandidate = candidate + suffix + String(counter)
            if (generatedVariableNamesForChunk.has(currentCandidate)) {
              counter++
            } else {
              generatedVariableNamesForChunk.add(currentCandidate)
              return currentCandidate
            }
          }
        },
      }

      // Prepare some VisitorOptions
      const deconflictVisitorOptions = {
        ...sharedVisitorOptions,
        continuation: <U extends Node>(node: U): U =>
          visitEachChild(
            node,
            nextNode =>
              deconflictNode({ ...deconflictVisitorOptions, node: nextNode }),
            context,
          ),

        updateIdentifierIfNeeded<T extends Identifier>(
          identifier?: T,
        ): T | null | undefined {
          if (identifier == null) {
            return null
          }
          const newName = updatedIdentifierNamesForModule.get(identifier.text)
          return (newName == null ? identifier : createIdentifier(newName)) as T
        },
      }

      // Walk through all Statements of the SourceFile and trace identifiers for them
      for (const node of sourceFile.statements) {
        traceIdentifiersVisitorOptions.continuation(node)
      }

      // Now, deconflict the SourceFile
      return deconflictVisitorOptions.continuation(sourceFile)
    }
  }
}
