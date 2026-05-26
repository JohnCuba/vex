import path from 'node:path'

type EntryPointPathBuilder = (rootPath: string, url: string) => string

export const indexFileRouteBuilder: EntryPointPathBuilder = (rootPath, url) => path.join(rootPath, url, 'index.ts')

export const nameFileRouteBuilder: EntryPointPathBuilder = (rootPath, url) => path.join(rootPath, url) + '.ts'
