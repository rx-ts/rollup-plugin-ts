import { MAIN_FIELDS } from '../../constant/constant'

/**
 * Takes the best submodule from the given package.json
 */
export function takeBestSubModuleFromPackage(pkg: {
  main?: string
}): string | undefined {
  for (const field of MAIN_FIELDS) {
    const value = pkg[field as keyof typeof pkg]
    if (value != null) {
      return value
    }
  }

  return undefined
}
