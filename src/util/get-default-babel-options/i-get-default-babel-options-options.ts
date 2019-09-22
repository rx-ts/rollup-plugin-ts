import { InputOptions, OutputOptions } from 'rollup'

import { ITypescriptPluginBabelOptions } from '../../plugin/i-typescript-plugin-options'

export interface IGetDefaultBabelOptionsOptions {
  pluginOptions: ITypescriptPluginBabelOptions
  browserslist?: string[]
  rollupInputOptions: InputOptions
  rollupOutputOptions?: OutputOptions
}
