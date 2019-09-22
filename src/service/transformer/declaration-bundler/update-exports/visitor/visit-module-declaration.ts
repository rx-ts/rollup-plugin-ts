import { normalize } from 'path'
import { ModuleDeclaration, updateModuleDeclaration } from 'typescript'

import {
  hasDefaultExportModifier,
  hasExportModifier,
  removeExportModifier,
} from '../../util/modifier/modifier-util'
import { UpdateExportsVisitorOptions } from '../update-exports-visitor-options'

/**
 * Visits the given ModuleDeclaration.
 */
export function visitModuleDeclaration({
  node,
  continuation,
  sourceFile,
  isEntry,
  exportedSpecifiersFromModule,
  parsedExportedSymbols,
  identifiersForDefaultExportsForModules,
}: UpdateExportsVisitorOptions<ModuleDeclaration>):
  | ModuleDeclaration
  | undefined {
  // If the node has no export modifier, leave it as it is
  if (!hasExportModifier(node)) {
    return continuation(node)
  }

  // If the node is located in the entry file, leave it as it is - completely
  if (isEntry) {
    if (!hasDefaultExportModifier(node.modifiers)) {
      exportedSpecifiersFromModule.add(node.name.text)
    }
    return continuation(node)
  }

  // If the node has a default export, mark it as the identifier for the default export of that module
  if (hasDefaultExportModifier(node.modifiers)) {
    identifiersForDefaultExportsForModules.set(normalize(sourceFile.fileName), [
      node.name.text,
      node,
    ])
  } else {
    // Add the node name to the exported symbols
    parsedExportedSymbols.set(node.name.text, node)
  }

  // Update the node and remove the export modifiers from it
  return continuation(
    updateModuleDeclaration(
      node,
      node.decorators,
      removeExportModifier(node.modifiers),
      node.name,
      node.body,
    ),
  )
}
