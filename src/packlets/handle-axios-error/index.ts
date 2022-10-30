import { AxiosError } from 'axios'

export function isAxiosError(e: any, status?: number): e is AxiosError {
  return !!e.isAxiosError && (!status || e.response?.status === status)
}

export function handleAxiosError(message: `Unable to ${string}`) {
  return (error: any) => {
    if (isAxiosError(error)) {
      let suffix = ''
      if (error.response) {
        suffix = `: ${error.response.status} ${error.response.statusText}`
        if (error.response.data) {
          const stringified = JSON.stringify(error.response.data)
          if (stringified.length < 1024) {
            suffix += ` ${stringified}`
          } else {
            suffix += ` ${stringified.slice(0, 1024)}...`
          }
        }
      } else {
        suffix = `: ${error.message}`
      }
      throw new Error(`${message}${suffix}`)
    } else {
      throw error
    }
  }
}
