import { CustomTransformers } from 'typescript'

import { deconflict } from './deconflict/deconflict'
import { IDeclarationBundlerOptions } from './i-declaration-bundler-options'
import { updateExports } from './update-exports/update-exports'

/**
 * Will bundle declaration files
 */
export function declarationBundler(
  options: IDeclarationBundlerOptions,
): CustomTransformers {
  return {
    afterDeclarations: [deconflict(options), updateExports(options)],
  }
}
