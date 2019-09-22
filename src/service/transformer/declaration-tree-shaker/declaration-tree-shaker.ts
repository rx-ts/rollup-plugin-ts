import { CustomTransformers } from 'typescript'

import { afterDeclarations } from './after-declarations/after-declarations'
import { IDeclarationTreeShakerOptions } from './i-declaration-tree-shaker-options'

/**
 * Will tree-shake declaration files
 */
export function declarationTreeShaker(
  options: IDeclarationTreeShakerOptions,
): CustomTransformers {
  return {
    afterDeclarations: [afterDeclarations(options)],
  }
}
