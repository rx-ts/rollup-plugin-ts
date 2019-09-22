import { ModuleResolutionHost as TSModuleResolutionHost } from 'typescript'

import { getExtension } from '../../util/path/path-util'

import { IModuleResolutionHostOptions } from './i-module-resolution-host-options'

/**
 * A ModuleResolutionHost can resolve files
 */
export class ModuleResolutionHost implements TSModuleResolutionHost {
  constructor(private readonly _options: IModuleResolutionHostOptions) {}

  /**
   * Returns true if the given file exists
   */
  fileExists(fileName: string): boolean {
    return (
      this._options.extensions.includes(getExtension(fileName)) &&
      this._options.languageServiceHost.fileExists(fileName)
    )
  }

  /**
   * Reads the given file
   */
  readFile(fileName: string, encoding?: string): string | undefined {
    return this._options.languageServiceHost.readFile(fileName, encoding)
  }
}
