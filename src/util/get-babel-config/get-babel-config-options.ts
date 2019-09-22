import { InputOptions } from 'rollup'

import { IBabelConfig } from '../../plugin/i-babel-options'
import { IGetForcedBabelOptionsResult } from '../get-forced-babel-options/i-get-forced-babel-options-result'

import { FindBabelConfigOptions } from './find-babel-config-options'

export interface GetBabelConfigOptions extends FindBabelConfigOptions {
  browserslist: string[] | undefined
  rollupInputOptions: InputOptions
  forcedOptions?: IGetForcedBabelOptionsResult
  defaultOptions?: IBabelConfig
}
