import { isBuiltInModule } from '../module/module-util'

import { IResolveModuleOptions } from './i-resolve-module-options'

/**
 * Resolves an id from the given parent
 */
export function resolveId({
  id,
  parent,
  options,
  cwd,
  moduleResolutionHost,
  resolveCache,
}: IResolveModuleOptions): string | null {
  // Don't proceed if there is no parent (in which case this is an entry module)
  if (parent == null) {
    return null
  }

  // Don't attempt to load built-in modules
  if (isBuiltInModule(id)) {
    return null
  }

  return resolveCache.get({ id, parent, cwd, options, moduleResolutionHost })
}
