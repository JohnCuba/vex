import type { RouteHandler } from '@webra/core'

export const GET: RouteHandler = (req, rep) => {
 rep.send('Hi from Get')
}
