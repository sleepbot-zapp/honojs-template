export interface ApiResponse<T = any> {
  success: boolean
  status_code: number
  message: string
  data?: T
  error?: string
}

export const successResponse = <T>(
  status_code: number,
  message: string,
  data: T
): ApiResponse<T> => {
  return {
    success: true,
    status_code,
    message,
    data,
  }
}

export const errorResponse = (
  status_code: number,
  errorMessage: string,
  message: string = 'Something went wrong'
): ApiResponse => {
  return {
    success: false,
    status_code,
    message,
    error: errorMessage,
  }
}
