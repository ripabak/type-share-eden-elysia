#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

const [, , command, typeUrl, ...args] = process.argv

function parseArgs(args: string[]): { output?: string } {
    const options: { output?: string } = {}
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--output' || args[i] === '-o') {
            options.output = args[i + 1]
            i++
        }
    }
    return options
}

function getOutputPath(url: string, customOutput?: string): string {
    try {
        if (customOutput) {
            return customOutput
        }
        const parsed = new URL(url)
        const pathname = parsed.pathname
        const filename = path.basename(pathname)
        return `./src/types/${filename}`
    } catch {
        console.error('❌ Invalid URL format')
        process.exit(1)
    }
}

async function sync() {
    if (!typeUrl) {
        console.error('❌ URL is required')
        console.error('\nUsage:')
        console.error('  npx type-share-eden-elysia sync <url> [--output <path>]')
        console.error('  npx type-share-eden-elysia sync http://localhost:3000/types/app.d.ts')
        console.error('  npx type-share-eden-elysia sync http://localhost:3000/types/app.d.ts --output ./types/api.d.ts')
        process.exit(1)
    }

    const { output: customOutput } = parseArgs(args)
    const OUTPUT = getOutputPath(typeUrl, customOutput)

    try {
        console.log('🔄 Syncing types from:', typeUrl)

        const res = await fetch(typeUrl)

        if (!res.ok) {
            console.error(`❌ Failed to fetch types (HTTP ${res.status})`)
            process.exit(1)
            return
        }

        const text = await res.text()
        const dir = path.dirname(OUTPUT)
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(OUTPUT, text)

        const fileSize = (text.length / 1024).toFixed(2)
        console.log(`✅ Types synced (${fileSize}KB)`)
        console.log(`📍 Location: ${OUTPUT}`)
    } catch (err) {
        console.error('❌ Error:', err instanceof Error ? err.message : err)
        process.exit(1)
    }
}

async function watch() {
    if (!typeUrl) {
        console.error('❌ URL is required')
        console.error('\nUsage:')
        console.error('  npx type-share-eden-elysia watch <url> [--output <path>]')
        console.error('  npx type-share-eden-elysia watch http://localhost:3000/types/app.d.ts')
        console.error('  npx type-share-eden-elysia watch http://localhost:3000/types/app.d.ts --output ./types/api.d.ts')
        process.exit(1)
    }

    const { output: customOutput } = parseArgs(args)
    const OUTPUT = getOutputPath(typeUrl, customOutput)

    console.log('👀 Watching types from:', typeUrl)
    console.log('💡 Press Ctrl+C to stop\n')

    // initial sync
    await sync()

    // polling every 3 seconds
    setInterval(async () => {
        try {
            const res = await fetch(typeUrl)
            if (res.ok) {
                const text = await res.text()
                const dir = path.dirname(OUTPUT)
                fs.mkdirSync(dir, { recursive: true })
                const existing = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, 'utf-8') : ''

                if (text !== existing) {
                    fs.writeFileSync(OUTPUT, text)
                    const now = new Date().toLocaleTimeString()
                    console.log(`[${now}] ♻️  Types updated`)
                }
            }
        } catch (err) {
            // Silently fail during watch
        }
    }, 3000)
}

function showHelp() {
    console.log(`
📦 Type Share Eden Elysia CLI

Usage:
  npx type-share-eden-elysia sync <url> [--output <path>]      Sync types once from backend
  npx type-share-eden-elysia watch <url> [--output <path>]     Watch and sync types continuously

Arguments:
  <url>              Full endpoint URL including path to .d.ts file (REQUIRED)

Options:
  --output, -o       Custom output file path (default: ./src/types/<filename>)

Examples:
  # Default output location (./src/types/app.d.ts)
  npx type-share-eden-elysia sync http://localhost:3000/types/app.d.ts

  # Custom output location
  npx type-share-eden-elysia sync http://localhost:3000/types/app.d.ts --output ./types/api.d.ts
  npx type-share-eden-elysia watch http://localhost:3000/types/app.d.ts -o ./shared/types.d.ts

  # Different sources
  npx type-share-eden-elysia sync https://api.example.com/types/main.d.ts
  npx type-share-eden-elysia watch https://api.example.com/types/main.d.ts --output ./types/main.d.ts

Note:
  The URL must include the complete path to the .d.ts endpoint.
  If --output is not specified, filename is extracted from the URL path.
  `)
}

if (!command) {
    showHelp()
} else if (command === 'sync') {
    sync()
} else if (command === 'watch') {
    watch()
} else if (command === '--help' || command === '-h') {
    showHelp()
} else {
    console.error(`❌ Unknown command: ${command}`)
    showHelp()
    process.exit(1)
}