import { InputOptions } from 'rollup'
import { LanguageService, ParsedCommandLine } from 'typescript'

import { TypescriptPluginOptions } from '../../plugin/i-typescript-plugin-options'
import { FileSystem } from '../../util/file-system/file-system'
import { CustomTransformersFunction } from '../../util/merge-transformers/i-custom-transformer-options'
import { IEmitCache } from '../cache/emit-cache/i-emit-cache'

export interface ILanguageServiceOptions {
  parsedCommandLine: ParsedCommandLine
  cwd: TypescriptPluginOptions['cwd']
  transformers?: CustomTransformersFunction
  emitCache: IEmitCache
  rollupInputOptions: InputOptions
  supportedExtensions: string[]
  fileSystem: FileSystem
  languageService(): LanguageService
}
