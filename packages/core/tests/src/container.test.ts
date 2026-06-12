describe('Container', () => {
  let Container: typeof import('@src/container');

  beforeEach(async () => {
    vi.resetModules();
    Container = await import('@src/container');
  });

  it('should provide value', () => {
    const envConfig = { mode: 'development', command: 'serve' } as const;
    Container.provide('env', envConfig);

    expect(Container.inject('env')).toEqual(envConfig);
  });

  it('should throw error on getting unprovided value', () => {
    expect(() => Container.inject('env')).toThrow();
  });

  it('should throw error on rewriting value', () => {
    const envConfig = { mode: 'development', command: 'serve' } as const;
    Container.provide('env', envConfig);

    expect(() => Container.provide('env', envConfig)).toThrow();
  });
});
