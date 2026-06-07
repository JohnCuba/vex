declare module 'virtual:vex-routes' {
  export const routes: Record<string, () => Promise<{ default: unknown }>>;
}
