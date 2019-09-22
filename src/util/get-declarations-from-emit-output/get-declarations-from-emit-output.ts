import { EmitOutput } from 'typescript'

import { isDeclarationMapOutputFile } from '../is-declaration-map-output-file/is-declaration-map-output-file'
import { isDeclarationOutputFile } from '../is-declaration-output-file/is-declaration-output-file'

import { IGetDeclarationsFromEmitOutputResult } from './i-get-declarations-from-emit-output-result'

/**
 * Gets all declarations from some EmitOutput
 */
export function getDeclarationsFromEmitOutput(
  output: EmitOutput,
): IGetDeclarationsFromEmitOutputResult {
  return {
    code: output.outputFiles.filter(isDeclarationOutputFile),
    maps: output.outputFiles.filter(isDeclarationMapOutputFile),
  }
}
