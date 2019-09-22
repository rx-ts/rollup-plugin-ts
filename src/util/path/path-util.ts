import { extname, isAbsolute, join, normalize, parse, relative } from 'path'
import slash from 'slash'

import {
  BABEL_RUNTIME_PREFIX_1,
  BABEL_RUNTIME_PREFIX_2,
  DECLARATION_EXTENSION,
  DECLARATION_MAP_EXTENSION,
  DEFAULT_LIB_NAMES,
  JSX_EXTENSION,
  JS_EXTENSION,
  MJS_EXTENSION,
  ROLLUP_PLUGIN_MULTI_ENTRY,
  TSLIB_NAME,
  TSX_EXTENSION,
  TS_EXTENSION,
} from '../../constant/constant'

/**
 * Ensures that the given path follows posix file names
 */
export function ensurePosix(path: string): string {
  return slash(path)
}

/**
 * Gets the extension of the given file
 */
export function getExtension(file: string): string {
  if (file.endsWith(DECLARATION_EXTENSION)) {
    return DECLARATION_EXTENSION
  } else if (file.endsWith(DECLARATION_MAP_EXTENSION)) {
    return DECLARATION_MAP_EXTENSION
  }
  return extname(file)
}

/**
 * Returns true if the given path represents an external library
 */
export function isExternalLibrary(path: string): boolean {
  return !path.startsWith('.') && !path.startsWith('/')
}

/**
 * Returns true if the given path represents an internal Typescript file
 */
export function isInternalFile(path: string): boolean {
  return DEFAULT_LIB_NAMES.has(path) || path.toLowerCase().endsWith(TSLIB_NAME)
}

/**
 * Returns true if the given id represents tslib
 */
export function isTslib(path: string): boolean {
  return (
    path === 'tslib' ||
    path.endsWith(`/tslib/${TSLIB_NAME}`) ||
    path.endsWith('/tslib/tslib.es6.js') ||
    path.endsWith('/tslib/tslib.js')
  )
}

/**
 * Returns true if the given path represents a Babel helper
 */
export function isBabelHelper(path: string): boolean {
  return isBabelEsmHelper(path) || isBabelCjsHelper(path)
}

/**
 * Returns true if the given path represents a Babel ESM helper
 */
export function isBabelEsmHelper(path: string): boolean {
  return (
    path.includes(`${BABEL_RUNTIME_PREFIX_1}helpers/esm`) ||
    path.includes(`${BABEL_RUNTIME_PREFIX_2}helpers/esm`)
  )
}

/**
 * Returns true if the given path represents a Babel CJS helper
 */
export function isBabelCjsHelper(path: string): boolean {
  return (
    !isBabelEsmHelper(path) &&
    (path.includes(`${BABEL_RUNTIME_PREFIX_1}helpers`) ||
      path.includes(`${BABEL_RUNTIME_PREFIX_2}helpers`))
  )
}

/**
 * Returns true if the given path represents @babel/preset-env
 */
export function isBabelPresetEnv(path: string): boolean {
  return path.includes('@babel/preset-env') || path.includes('babel-preset-env')
}

/**
 * Returns true if the given path represents the entry point for rollup-plugin-multi-entry
 */
export function isRollupPluginMultiEntry(path: string): boolean {
  return path === ROLLUP_PLUGIN_MULTI_ENTRY
}

/**
 * Returns true if the given path represents @babel/preset-es2015
 */
export function isBabelPresetEs2015(path: string): boolean {
  return (
    path.includes('@babel/preset-es2015') ||
    path.includes('babel-preset-es2015')
  )
}

/**
 * Returns true if the given path represents @babel/preset-es[2015|2016|2017]
 */
export function isYearlyBabelPreset(path: string): boolean {
  return path.includes('@babel/preset-es') || path.includes('babel-preset-es')
}

/**
 * Returns true if the given path represents @babel/plugin-transform-runtime
 */
export function isBabelPluginTransformRuntime(path: string): boolean {
  return (
    path.includes('@babel/plugin-transform-runtime') ||
    path.includes('babel-plugin-transform-runtime')
  )
}

/**
 * Strips the extension from a file
 */
export function stripExtension(file: string): string {
  if (extname(file) === '') {
    return file
  }
  // tslint:disable-next-line: prefer-const
  let { dir, name } = parse(file)

  if (name.endsWith('.d')) {
    name = name.slice(0, -1 * 2)
  }
  if (dir === '.') {
    return normalize(`./${name}`)
  }
  return join(dir, name)
}

/**
 * Sets the given extension for the given file
 */
export function setExtension(file: string, extension: string): string {
  return normalize(`${stripExtension(file)}${extension}`)
}

/**
 * Ensure that the given path has a leading "."
 */
export function ensureHasLeadingDotAndPosix(path: string): string {
  if (isExternalLibrary(path)) {
    return path
  }

  const posixPath = ensurePosix(path)
  if (posixPath.startsWith('.')) {
    return posixPath
  }
  if (posixPath.startsWith('/')) {
    return `.${posixPath}`
  }
  return `./${posixPath}`
}

/**
 * Ensures that the given path is relative
 */
export function ensureRelative(root: string, path: string): string {
  // If the path is already relative, simply return it
  if (!isAbsolute(path)) {
    return path
  }

  // Otherwise, construct a relative path from the root
  return relative(root, path)
}

/**
 * Ensures that the given path is absolute
 */
export function ensureAbsolute(root: string, path: string): string {
  // If the path is already absolute, simply return it
  if (isAbsolute(path)) {
    return path
  }

  // Otherwise, construct an absolute path from the root
  return join(root, path)
}

/**
 * Returns true if the given file is a Javascript file
 */
export function isJSFile(file: string): boolean {
  return (
    file.endsWith(JS_EXTENSION) ||
    file.endsWith(JSX_EXTENSION) ||
    file.endsWith(MJS_EXTENSION)
  )
}

/**
 * Returns true if the given file is a Typescript file
 */
export function isTSFile(file: string): boolean {
  return file.endsWith(TS_EXTENSION) || file.endsWith(TSX_EXTENSION)
}

/**
 * Returns true if the given file is a Typescript declaration (.d.ts) file
 */
export function isDTSFile(file: string): boolean {
  return file.endsWith(DECLARATION_EXTENSION)
}

/**
 * Returns true if the given file is a Typescript declaration map (.d.ts.map) file
 */
export function isDTSMapFile(file: string): boolean {
  return file.endsWith(DECLARATION_MAP_EXTENSION)
}

/**
 * Ensures that the given file ends with '.ts', no matter what it actually ends with
 * This is to support Typescript's language service with files that doesn't necessarily end with it.
 */
export function ensureTs(file: string): string {
  return setExtension(file, TS_EXTENSION)
}

/**
 * Ensures that the given file ends with '.js', no matter what it actually ends with
 * This is to support Typescript's language service with files that doesn't necessarily end with it.
 */
export function ensureJs(file: string): string {
  return setExtension(file, JS_EXTENSION)
}

/**
 * Replaces the extension of the given path with the extension of a declaration file
 */
export function ensureDTS(file: string): string {
  return setExtension(file, DECLARATION_EXTENSION)
}
