import { IBabelConfig } from '../../plugin/i-babel-options'

export interface IGetForcedBabelOptionsResult extends IBabelConfig {
  include?: Array<string | RegExp>
  exclude?: Array<string | RegExp>
}
