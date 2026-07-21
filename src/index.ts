import { statSync } from 'node:fs'
import { Elysia } from 'elysia'

interface TypeShareOptions {
    /**
     * Path file type definition yang akan di-expose
     * @default './dist/types/src/app.d.ts'
     */
    path?: string

    /**
     * Route endpoint untuk akses file
     * @default '/types/app.d.ts'
     */
    route?: string

    /**
     * Auto-generate types menggunakan tsc saat startup
     * @default true
     */
    autoGenerate?: boolean

    /**
     * Path ke tsconfig untuk type generation
     * @default './tsconfig.declarations.json'
     */
    tsconfigPath?: string

    /**
     * Show output dari tsc compilation
     * @default false
     */
    verbose?: boolean
}

/**
 * Elysia plugin that exposes generated TypeScript types via HTTP endpoint.
 *
 * Automatically generates `.d.ts` files using tsc on startup and serves them
 * for frontend consumption. Perfect for type-safe RPC and monorepo setups.
 *
 * **Important:** The `path` option must match your tsconfig's output location.
 * - Formula: `{outDir}/{include_path}.d.ts`
 * - Example: outDir=`./dist/types`, include=`["src/app.ts"]` → path=`./dist/types/src/app.d.ts`
 *
 * @param options Configuration options (all optional)
 * @param options.path Path to generated .d.ts file (@default './dist/types/src/app.d.ts')
 * @param options.route HTTP route to serve types (@default '/types/app.d.ts')
 * @param options.autoGenerate Auto-generate on startup (@default true)
 * @param options.tsconfigPath Path to tsconfig.declarations.json (@default './tsconfig.declarations.json')
 * @param options.verbose Show tsc output (@default false)
 *
 * @example
 * ```ts
 * // Default: assumes outDir="./dist/types" and include=["src/app.ts"]
 * app.use(typeShareEdenElysia())
 * ```
 *
 * @example
 * ```ts
 * // Custom paths
 * app.use(typeShareEdenElysia({
 *   path: './types/src/index.d.ts',
 *   route: '/types/index',
 *   tsconfigPath: './tsconfig.types.json'
 * }))
 * ```
 */
export const typeShareEdenElysia = (options?: TypeShareOptions) => {
    const path = options?.path ?? './dist/types/src/app.d.ts'
    const route = options?.route ?? '/types/app.d.ts'
    const autoGenerate = options?.autoGenerate ?? true
    const tsconfigPath = options?.tsconfigPath ?? 'tsconfig.declarations.json'
    const verbose = options?.verbose ?? false

    const plugin = new Elysia({ name: 'type-share-eden-elysia' })

    // Auto-generate types saat plugin diinisialisasi
    if (autoGenerate) {
        try {
            if (verbose) console.log('📝 Generating app types...')

            const mtimeBefore = (() => {
                try { return statSync(path).mtimeMs } catch { return null }
            })()

            const result = Bun.spawnSync(['tsc', '-p', tsconfigPath], {
                cwd: process.cwd(),
                stderr: 'inherit'
            })

            if (result.success) {
                if (verbose) console.log('✅ Types generated successfully')
            } else {
                const mtimeAfter = (() => {
                    try { return statSync(path).mtimeMs } catch { return null }
                })()
                if (mtimeBefore === mtimeAfter) {
                    console.error('❌ Failed to generate types')
                }
            }
        } catch (error) {
            console.error('❌ Error generating types:', error)
        }
    }

    return plugin.get(route, () => {
        return Bun.file(path)
    })
}