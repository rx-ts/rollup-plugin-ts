import { normalize } from 'path'
import {
  CustomTransformers,
  ExportDeclaration,
  ImportDeclaration,
  Node,
  SourceFile,
  Statement,
  SyntaxKind,
  TransformationContext,
  Transformer,
  createExpressionStatement,
  createIdentifier,
  createImportDeclaration,
  createLiteral,
  createPropertyAccess,
  isExportDeclaration,
  isImportDeclaration,
  isStringLiteralLike,
  updateSourceFileNode,
  visitEachChild,
} from 'typescript'

import {
  PRESERVING_PROPERTY_ACCESS_EXPRESSION_EXPRESSION,
  PRESERVING_PROPERTY_ACCESS_EXPRESSION_NAME,
} from '../../../constant/constant'
import { isExternalLibrary } from '../../../util/path/path-util'

/**
 * Adds a module specifier to the given map
 */
function addPreTranspileImportedOrExportedModuleSpecifier(
  parent: string,
  id: string,
  map: Map<string, Set<string>>,
): void {
  let existingSet = map.get(parent)
  if (existingSet == null) {
    existingSet = new Set()
    map.set(parent, existingSet)
  }
  existingSet.add(id)
}

/**
 * Gets transformers that will track which imports are being stripped when .js transpilation is finished and then re-add them
 * to make Rollup track those files as well
 */
export function getTypeOnlyImportTransformers(): CustomTransformers {
  const preTranspileImportedModuleSpecifiers: Map<
    string,
    Set<string>
  > = new Map()
  const preTranspileStatementCounts: Map<string, number> = new Map()

  /**
   * Visits the given node before transpilation
   */
  function visitNodeBefore(node: Node): Node {
    if (isImportDeclaration(node)) {
      return visitImportDeclarationBefore(node)
    } else if (isExportDeclaration(node)) {
      return visitExportDeclarationBefore(node)
    }
    return node
  }

  /**
   * Visits the given ImportDeclaration before transpilation
   */
  function visitImportDeclarationBefore(
    importDeclaration: ImportDeclaration,
  ): ImportDeclaration {
    if (
      !isStringLiteralLike(importDeclaration.moduleSpecifier) ||
      importDeclaration.getSourceFile() == null
    ) {
      return importDeclaration
    }

    addPreTranspileImportedOrExportedModuleSpecifier(
      normalize(importDeclaration.getSourceFile().fileName),
      importDeclaration.moduleSpecifier.text,
      preTranspileImportedModuleSpecifiers,
    )
    return importDeclaration
  }

  /**
   * Visits the given ExportDeclaration before transpilation
   */
  function visitExportDeclarationBefore(
    exportDeclaration: ExportDeclaration,
  ): ExportDeclaration {
    if (
      exportDeclaration.moduleSpecifier == null ||
      !isStringLiteralLike(exportDeclaration.moduleSpecifier) ||
      exportDeclaration.getSourceFile() == null
    ) {
      return exportDeclaration
    }

    addPreTranspileImportedOrExportedModuleSpecifier(
      normalize(exportDeclaration.getSourceFile().fileName),
      exportDeclaration.moduleSpecifier.text,
      preTranspileImportedModuleSpecifiers,
    )
    return exportDeclaration
  }

  return {
    before: [
      (
        context: TransformationContext,
      ): Transformer<SourceFile> => sourceFile => {
        preTranspileStatementCounts.set(
          normalize(sourceFile.fileName),
          sourceFile.statements.length,
        )
        return visitEachChild(sourceFile, visitNodeBefore, context)
      },
    ],
    after: [
      (
        context: TransformationContext,
      ): Transformer<SourceFile> => sourceFile => {
        const postTranspileImportedOrExportedModuleSpecifiers: Set<
          string
        > = new Set()

        /**
         * Visits the given node after transpilation
         */
        function visitNodeAfter(node: Node): Node {
          if (isImportDeclaration(node)) {
            return visitImportDeclarationAfter(node)
          } else if (isExportDeclaration(node)) {
            return visitExportDeclarationAfter(node)
          }
          return node
        }

        /**
         * Visits the given ImportDeclaration after transpilation
         */
        function visitImportDeclarationAfter(
          importDeclaration: ImportDeclaration,
        ): ImportDeclaration {
          if (!isStringLiteralLike(importDeclaration.moduleSpecifier)) {
            return importDeclaration
          }
          postTranspileImportedOrExportedModuleSpecifiers.add(
            importDeclaration.moduleSpecifier.text,
          )
          return importDeclaration
        }

        /**
         * Visits the given ExportDeclaration after transpilation
         */
        function visitExportDeclarationAfter(
          exportDeclaration: ExportDeclaration,
        ): ExportDeclaration {
          if (
            exportDeclaration.moduleSpecifier == null ||
            !isStringLiteralLike(exportDeclaration.moduleSpecifier)
          ) {
            return exportDeclaration
          }
          postTranspileImportedOrExportedModuleSpecifiers.add(
            exportDeclaration.moduleSpecifier.text,
          )
          return exportDeclaration
        }

        const newSourceFile = visitEachChild(
          sourceFile,
          visitNodeAfter,
          context,
        )
        const preTranspileSet = preTranspileImportedModuleSpecifiers.get(
          normalize(sourceFile.fileName),
        )
        const typeOnlyImports = [
          ...(preTranspileSet == null ? [] : preTranspileSet),
        ].filter(
          preTranspileFileName =>
            !postTranspileImportedOrExportedModuleSpecifiers.has(
              preTranspileFileName,
            ) && !isExternalLibrary(preTranspileFileName),
        )

        const extraStatements: Statement[] = []

        const preTranspileStatementCount = preTranspileStatementCounts.get(
          normalize(sourceFile.fileName),
        )
        const postTranspileStatementCount = sourceFile.statements
          // Don't include statements that represent content that isn't emitted
          .filter(
            statement => statement.kind !== SyntaxKind.NotEmittedStatement,
          ).length

        // If there *was* statements before transpilation, but isn't anymore, it is because all type-related information has been removed.
        // Add some code back in such that Rollup will include the file in transpilation
        const shouldAddPreservingStatement =
          preTranspileStatementCount != null &&
          preTranspileStatementCount >= 1 &&
          postTranspileStatementCount < 1
        if (shouldAddPreservingStatement) {
          extraStatements.push(
            createExpressionStatement(
              createPropertyAccess(
                createIdentifier(
                  PRESERVING_PROPERTY_ACCESS_EXPRESSION_EXPRESSION,
                ),
                createIdentifier(PRESERVING_PROPERTY_ACCESS_EXPRESSION_NAME),
              ),
            ),
          )
        }

        if (typeOnlyImports.length < 1 && !shouldAddPreservingStatement) {
          return newSourceFile
        } else {
          return updateSourceFileNode(sourceFile, [
            ...typeOnlyImports.map(typeOnlyImport =>
              createImportDeclaration(
                undefined,
                undefined,
                undefined,
                createLiteral(typeOnlyImport),
              ),
            ),
            ...sourceFile.statements,
            ...extraStatements,
          ])
        }
      },
    ],
  }
}
