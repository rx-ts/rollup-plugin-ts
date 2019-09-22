import {
  JSON_EXTENSION,
  JSX_EXTENSION,
  JS_EXTENSION,
  MJSX_EXTENSION,
  MJS_EXTENSION,
  TSX_EXTENSION,
  TS_EXTENSION,
} from '../../constant/constant'

/**
 * Gets the extensions that are supported by Typescript, depending on whether or not to allow JS and JSON
 */
export function getSupportedExtensions(
  allowJs: boolean,
  allowJson: boolean,
): string[] {
  return [
    TS_EXTENSION,
    TSX_EXTENSION,
    ...(allowJs
      ? [JS_EXTENSION, JSX_EXTENSION, MJS_EXTENSION, MJSX_EXTENSION]
      : []),
    ...(allowJson ? [JSON_EXTENSION] : []),
  ]
}
