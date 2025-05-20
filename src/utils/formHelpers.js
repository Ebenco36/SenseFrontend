// utils/formHelpers.js

/**
 * Converts a plain object into FormData.
 * - Primitives (string/number/boolean) are appended directly.
 * - Objects/arrays are stringified.
 */
export function prepareFormData(obj) {
    const fd = new FormData()
    Object.entries(obj).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      if (typeof value === 'object') {
        fd.append(key, JSON.stringify(value))
      } else {
        fd.append(key, value)
      }
    })
    return fd
  }
  