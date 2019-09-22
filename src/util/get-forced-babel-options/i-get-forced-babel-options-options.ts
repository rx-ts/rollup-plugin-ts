import { InputOptions, OutputOptions } from 'rollup'

import { ITypescriptPluginBabelOptions } from '../../plugin/i-typescript-plugin-options'

export interface IGetForcedBabelOptionsOptions {
  cwd: string
  pluginOptions: ITypescriptPluginBabelOptions
  browserslist?: string[]
  rollupInputOptions: InputOptions
  rollupOutputOptions?: OutputOptions
}
