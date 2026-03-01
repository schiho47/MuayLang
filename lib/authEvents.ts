type UnauthorizedHandler = (error?: unknown) => void

const unauthorizedHandlers = new Set<UnauthorizedHandler>()

export const onAuthUnauthorized = (handler: UnauthorizedHandler) => {
  unauthorizedHandlers.add(handler)
  return () => unauthorizedHandlers.delete(handler)
}

export const emitAuthUnauthorized = (error?: unknown) => {
  unauthorizedHandlers.forEach((handler) => {
    try {
      handler(error)
    } catch {
      // ignore handler errors
    }
  })
}

