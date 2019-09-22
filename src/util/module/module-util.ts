import Module from 'module'

import { stripExtension } from '../path/path-util'

/**
 * The Set of all Built-in modules
 */
export const BUILT_IN_MODULES: Set<string> = new Set(Module.builtinModules)

/**
 * Returns true if the given module represents a built-in module
 */
export function isBuiltInModule(moduleName: string): boolean {
  return (
    BUILT_IN_MODULES.has(moduleName) ||
    BUILT_IN_MODULES.has(stripExtension(moduleName))
  )
}
