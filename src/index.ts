import { Elysia } from 'elysia'

export const typeShareEdenElysia = (options?: {
    path?: string
    route?: string
}) => {
    const path = options?.path ?? './dist/types/src/app.d.ts'
    const route = options?.route ?? '/types/app.d.ts'

    return new Elysia({ name: 'type-share-eden-elysia' }).get(route, () => {
        return Bun.file(path)
    })
}