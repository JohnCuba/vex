declare module 'virtual:webra-routes' {
  export const routes: Record<string, () => Promise<{ default: unknown }>>
}
