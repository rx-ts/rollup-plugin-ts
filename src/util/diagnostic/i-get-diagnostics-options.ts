import { PluginContext } from 'rollup'
import { LanguageService } from 'typescript'

import { IncrementalLanguageService } from '../../service/language-service/incremental-language-service'

export interface IGetDiagnosticsOptions {
  languageService: LanguageService
  languageServiceHost: IncrementalLanguageService
  context: PluginContext
}
