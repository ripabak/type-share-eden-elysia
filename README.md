# Type Share Eden Elysia 🔗

Share Elysia backend type definitions to frontend via HTTP endpoint with auto-generation support.

## Features

✅ **Auto-generate types** - Automatically generate `.d.ts` files when plugin starts  
✅ **HTTP endpoint** - Serve types through configurable route  
✅ **CLI tools** - Sync or watch types from frontend  
✅ **Type-safe** - Full TypeScript support for RPC and monorepo setups  
✅ **Flexible paths** - Works with any project structure  

## Installation

```bash
npm install type-share-eden-elysia
```

## Quick Start

### Backend

1. **Add to Elysia app (e.g., `src/app.ts`):**

```typescript
import { Elysia } from 'elysia'
import { typeShareEdenElysia } from 'type-share-eden-elysia'

export const app = new Elysia()
  .use(typeShareEdenElysia({
    route: "/types/app.d.ts",
    path: "./dist/types/src/app.d.ts"
  .listen(3000)
}))

export type App = typeof app    // Don't forget to export your App type!
```

2. **Create `tsconfig.declarations.json`:**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "./dist/types",
    "declarationMap": false,
    "skipLibCheck": true,
    "removeComments": true
  },
  "include": ["src/app.ts"],
  "exclude": ["node_modules", "dist"]
}
```
- `outDir` : generated `d.ts` files directory target
- `include` : source files to generate types from (e.g., `["src/app.ts"]`) 

3. **Start the backend:**

```bash
bun run --watch src/app.ts
```

Types will be served at: `http://localhost:3000/types/app.d.ts`, 
- `route` is `/types/app.d.ts` by default,
- file type `path` is `./dist/types/src/app.d.ts` by default
- If you change `tsconfig.declarations.json` make sure to adjust the `path` based on your needs. 


### Frontend

**Sync types once:**
```bash
npx type-share-eden-elysia sync http://localhost:3000/types/app.d.ts
```

**Watch mode (recommended):**
```bash
npx type-share-eden-elysia watch http://localhost:3000/types/app.d.ts
```

Types are saved to `src/types/app.d.ts` and ready to use:

```typescript
import type { App } from './types/app'
import { treaty } from '@elysia/eden'

const api = treaty<App>('http://localhost:3000')
const result = await api.api.hello.get()
```

## Configuration

### Understanding Path Generation

The generated `.d.ts` file location is determined by:
- **`outDir`** in tsconfig + **`include`** paths = generated file location
- Example: `outDir: "./dist/types"` + `include: ["src/app.ts"]` = `./dist/types/src/app.d.ts`

### Plugin Options

```typescript
interface TypeShareOptions {
  path?: string           // Generated .d.ts file path (default: './dist/types/src/app.d.ts')
  route?: string          // HTTP route (default: '/types/app.d.ts')
  autoGenerate?: boolean  // Auto-generate on startup (default: true)
  tsconfigPath?: string   // tsconfig path (default: './tsconfig.declarations.json')
  verbose?: boolean       // Show output (default: false)
}

## CLI Commands

### Basic Usage

```bash
# Sync types once (default output: ./src/types/app.d.ts)
npx type-share-eden-elysia sync http://localhost:3000/types/app.d.ts

# Watch and auto-sync continuously (default output: ./src/types/app.d.ts)
npx type-share-eden-elysia watch http://localhost:3000/types/app.d.ts
```

### Custom Output Path

Use the `--output` or `-o` flag to specify where types should be saved:

```bash
# Sync with custom output location
npx type-share-eden-elysia sync http://localhost:3000/types/app.d.ts --output ./types/api.d.ts

# Watch with custom output (short form)
npx type-share-eden-elysia watch http://localhost:3000/types/app.d.ts -o ./shared/types.d.ts

# Different backend sources with custom paths
npx type-share-eden-elysia sync https://api.example.com/types/main.d.ts --output ./types/main.d.ts
npx type-share-eden-elysia watch https://api.production.com/types/v1.d.ts --output ./types/production.d.ts
```

### Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--output` | `-o` | Custom output file path | `./src/types/<filename from URL>` |

**Notes:**
- The URL must include the full path to the `.d.ts` file endpoint (not just the base URL)
- If `--output` is not specified, the filename is extracted from the URL path
- The output directory will be created automatically if it doesn't exist

## License

MIT

## Contributing

Feedback and PRs welcome! 🚀
