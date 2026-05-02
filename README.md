# Type Share Eden Elysia 🔗

Share Elysia backend type definitions to frontend via HTTP endpoint with auto-generation support.

> **Version 0.1.0** - Now with auto-generate on startup! ✨

## Features

✅ **Auto-generate types** - Automatically generate `.d.ts` files when plugin starts  
✅ **HTTP endpoint** - Serve types through `/types/app.d.ts` route  
✅ **CLI tools** - Sync or watch types from frontend  
✅ **Type-safe** - Full TypeScript support for RPC and monorepo setups  
✅ **Zero config** - Works out of the box with sensible defaults  

## Installation

```bash
npm install type-share-eden-elysia
```

Requires `elysia` ^1.4.28 and Bun runtime.

## Backend Setup

### 1. Configure tsconfig.declarations.json

Create `tsconfig.declarations.json` in your project root:

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

### 2. Add to Elysia App

```typescript
import { typeShareEdenElysia } from 'type-share-eden-elysia'

export const app = new Elysia()
  // ... other middleware
  .use(typeShareEdenElysia({
    autoGenerate: true,           // Auto-generate on startup
    verbose: true,                // Show build progress
    tsconfigPath: './tsconfig.declarations.json'
  }))
```

### 3. Start Backend

```bash
npm run dev
# or
bun run --watch src/main.ts
```

The plugin will:
1. Generate types from `src/app.ts` → `dist/types/src/app.d.ts`
2. Serve at `/types/app.d.ts` endpoint

Verify it works:
```bash
curl http://localhost:3000/types/app.d.ts
```

## Frontend Setup

### 1. Install CLI

```bash
npm install -D type-share-eden-elysia
```

### 2. Sync Types

**One-time sync:**
```bash
npx type-share-eden-elysia sync
# or custom URL
npx type-share-eden-elysia sync http://localhost:8000
```

**Watch mode (recommended for development):**
```bash
npx type-share-eden-elysia watch
```

This creates `src/types/app.d.ts` with all backend types.

### 3. Use Types

```typescript
import type { App } from './types/app.d.ts'

// Type-safe API calls
const response = await fetch('/api/endpoint')
const data: ReturnType<App['GET']['/api/endpoint']> = await response.json()
```

## Options

### Plugin Options

```typescript
interface TypeShareOptions {
  /**
   * Path to .d.ts file to serve
   * @default './dist/types/src/app.d.ts'
   */
  path?: string

  /**
   * HTTP endpoint route
   * @default '/types/app.d.ts'
   */
  route?: string

  /**
   * Auto-generate types on startup
   * @default true
   */
  autoGenerate?: boolean

  /**
   * Path to tsconfig for generation
   * @default './tsconfig.declarations.json'
   */
  tsconfigPath?: string

  /**
   * Show compilation output
   * @default false
   */
  verbose?: boolean
}
```

### CLI Commands

```bash
# Sync types once
type-share-eden-elysia sync [url]

# Watch and auto-sync
type-share-eden-elysia watch [url]

# URL defaults to http://localhost:3000
```

## Examples

### Full Stack Type Safety

**Backend (app.ts):**
```typescript
const app = new Elysia()
  .get('/api/users/:id', ({ params }) => {
    return { id: params.id, name: 'John' }
  })
  .use(typeShareEdenElysia())
```

**Frontend:**
```typescript
import type { App } from './types/app.d.ts'

async function getUser(id: string) {
  const res = await fetch(`/api/users/${id}`)
  const user: ReturnType<App['GET']['/api/users/:id']> = await res.json()
  console.log(user.name) // typed!
}
```

### With Environment Config

```typescript
// Backend
const isDev = process.env.NODE_ENV === 'development'

app.use(typeShareEdenElysia({
  autoGenerate: isDev,
  verbose: isDev,
  route: process.env.TYPES_ROUTE || '/types/app.d.ts'
}))
```

### Multiple Type Endpoints

If you need types for different modules:

```typescript
app
  .use(typeShareEdenElysia({
    path: './dist/types/api.d.ts',
    route: '/types/api.d.ts'
  }))
  .use(typeShareEdenElysia({
    path: './dist/types/admin.d.ts',
    route: '/types/admin.d.ts'
  }))
```

## Development Workflow

### Quick Start

```bash
# Terminal 1: Backend (generates types on startup)
cd backend
npm run dev

# Terminal 2: Frontend (sync types)
cd frontend
npm run types:watch

# Terminal 3: Frontend app
cd frontend
npm start
```

### With npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "types:generate": "tsc -p tsconfig.declarations.json",
    "types:check": "curl -s http://localhost:3000/types/app.d.ts | head -5"
  }
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Cannot find module tsc` | `npm install typescript` |
| `Failed to generate types` | Ensure `tsconfig.declarations.json` exists and `src/app.ts` is valid |
| `Failed to fetch types` | Verify backend is running: `curl http://localhost:3000/health-check` |
| `Connection refused` | Check CORS: backend must allow `/types/app.d.ts` endpoint |
| Types not updating | Run `npm run types:watch` in frontend, check backend logs |

## Migration from v0.0.1

If upgrading from v0.0.1:

```bash
npm update type-share-eden-elysia
```

Changes:
- ✨ Auto-generation now enabled by default
- 🎯 Better error messages and verbose output
- 📦 Improved CLI with file size info
- 🐛 Fixed watch mode polling

No code changes needed if using default options!

## Best Practices

1. **Commit `src/types/app.d.ts`** to git for CI/CD consistency
2. **Use watch mode** during development for real-time type updates
3. **Generate before build** - add `types:generate` to build script
4. **Keep app.ts clean** - plugin only exports types from main app definition
5. **Pin version** - avoid auto-update to prevent type divergence

## Performance Notes

- Type generation is fast (~100ms for typical apps)
- HTTP serving uses Bun's native file serving
- CLI watch mode polls every 3 seconds (configurable)
- No additional memory overhead in production

## License

MIT

## Contributing

Feedback and PRs welcome! 🚀

---

**Full setup guide**: See [SETUP_GUIDE.md](../SETUP_GUIDE.md) for detailed step-by-step instructions.