type UnauthorizedHandler = () => void

let handler: UnauthorizedHandler | null = null

/** Registrado pelo AuthContext para reagir a um 401 vindo de qualquer lugar (REST ou SignalR). */
export function setUnauthorizedHandler(fn: UnauthorizedHandler | null): void {
  handler = fn
}

export function notifyUnauthorized(): void {
  handler?.()
}
