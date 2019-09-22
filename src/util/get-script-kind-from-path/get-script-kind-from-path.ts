import { ScriptKind } from 'typescript'

import {
  JSON_EXTENSION,
  JSX_EXTENSION,
  JS_EXTENSION,
  TSX_EXTENSION,
  TS_EXTENSION,
} from '../../constant/constant'

/**
 * Gets a ScriptKind from the given path
 */
export function getScriptKindFromPath(path: string): ScriptKind {
  if (path.endsWith(JS_EXTENSION)) {
    return ScriptKind.JS
  } else if (path.endsWith(TS_EXTENSION)) {
    return ScriptKind.TS
  } else if (path.endsWith(TSX_EXTENSION)) {
    return ScriptKind.TSX
  } else if (path.endsWith(JSX_EXTENSION)) {
    return ScriptKind.JSX
  } else if (path.endsWith(JSON_EXTENSION)) {
    return ScriptKind.JSON
  } else {
    return ScriptKind.Unknown
  }
}
