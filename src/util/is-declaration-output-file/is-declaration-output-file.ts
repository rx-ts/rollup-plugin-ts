import { OutputFile } from 'typescript'

import { DECLARATION_EXTENSION } from '../../constant/constant'
import { getExtension } from '../path/path-util'

/**
 * Returns true if the given OutputFile represents a declaration file
 */
export function isDeclarationOutputFile({ name }: OutputFile): boolean {
  return getExtension(name) === DECLARATION_EXTENSION
}
