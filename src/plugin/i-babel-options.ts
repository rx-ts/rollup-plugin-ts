import { TransformOptions } from '@babel/core'

export interface IBabelConfig extends TransformOptions {
  sourceMap?: boolean
}
