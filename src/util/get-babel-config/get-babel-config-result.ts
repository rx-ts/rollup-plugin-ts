import { IBabelConfig } from '../../plugin/i-babel-options'

export interface GetBabelConfigResult {
  minifyConfig: ((filename: string) => IBabelConfig) | undefined
  hasMinifyOptions: boolean
  config(filename: string): IBabelConfig
}
