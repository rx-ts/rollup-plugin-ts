import {
  CompilerOptions,
  CustomTransformers,
  ParsedCommandLine,
} from 'typescript'

import { FileSystem } from '../util/file-system/file-system'
import { CustomTransformersFunction } from '../util/merge-transformers/i-custom-transformer-options'

import { IBabelConfig } from './i-babel-options'

export type Transpiler = 'typescript' | 'babel'

export interface IBrowserslistPathConfig {
  path: string
}

export interface IBrowserslistQueryConfig {
  query: string[] | string
}

export type BrowserslistConfig =
  | IBrowserslistPathConfig
  | IBrowserslistQueryConfig

export interface TsConfigResolverWithFileName {
  fileName: string
  hook(resolvedOptions: CompilerOptions): CompilerOptions
}

// eslint-disable-next-line @typescript-eslint/no-type-alias
export type TsConfigResolver = TsConfigResolverWithFileName['hook']

export interface ITypescriptPluginBaseOptions {
  transpiler: Transpiler
  tsconfig?:
    | string
    | Partial<CompilerOptions>
    | Partial<Record<keyof CompilerOptions, string | number | boolean>>
    | ParsedCommandLine
    | TsConfigResolver
    | TsConfigResolverWithFileName
  browserslist?: false | string[] | string | BrowserslistConfig
  cwd: string
  transformers?:
    | Array<CustomTransformers | CustomTransformersFunction>
    | CustomTransformers
    | CustomTransformersFunction
  include: string[] | string
  exclude: string[] | string
  transpileOnly?: boolean
  fileSystem: FileSystem
}

export interface ITypescriptPluginTypescriptOptions
  extends ITypescriptPluginBaseOptions {
  transpiler: 'typescript'
}

export interface ITypescriptPluginBabelOptions
  extends ITypescriptPluginBaseOptions {
  transpiler: 'babel'
  babelConfig?: string | IBabelConfig
}

export type TypescriptPluginOptions =
  | ITypescriptPluginTypescriptOptions
  | ITypescriptPluginBabelOptions
