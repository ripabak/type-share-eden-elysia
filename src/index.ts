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
 * Creates a route to expose TypeScript declaration files (.d.ts)
 * from the backend through an HTTP endpoint.
 *
 * This is useful for sharing type definitions between backend and frontend
 * in a type-safe RPC or monorepo setup.
 *
 * Auto-generates types menggunakan tsc ketika plugin dijalankan.
 *
 * @param options - Optional configuration object
 * @param options.path - Path to the generated .d.ts file
 * @default './dist/types/src/app.d.ts'
 *
 * @param options.route - HTTP route where the file will be served
 * @default '/types/app.d.ts'
 *
 * @param options.autoGenerate - Auto-generate types on startup
 * @default true
 *
 * @param options.tsconfigPath - Path to tsconfig for type generation
 * @default './tsconfig.declarations.json'
 *
 * @param options.verbose - Show tsc compilation output
 * @default false
 *
 * @returns An Elysia plugin instance exposing the type file
 *
 * @example
 * ```ts
 * typeShareEdenElysia()
 * ```
 *
 * @example
 * ```ts
 * typeShareEdenElysia({
 *   path: './dist/types/src/app.d.ts',
 *   route: '/api/types',
 *   autoGenerate: true,
 *   verbose: true
 * })
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

            const result = Bun.spawnSync(['tsc', '-p', tsconfigPath], {
                cwd: process.cwd(),
                stderr: 'inherit'
            })

            if (result.success) {
                if (verbose) console.log('✅ Types generated successfully')
            } else {
                console.error('❌ Failed to generate types')
            }
        } catch (error) {
            console.error('❌ Error generating types:', error)
        }
    }

    return plugin.get(route, () => {
        return Bun.file(path)
    })
}