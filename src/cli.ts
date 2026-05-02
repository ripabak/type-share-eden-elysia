#!/usr/bin/env node

import fs from 'fs'

const [, , command, url = 'http://localhost:3000'] = process.argv

const OUTPUT = './src/types/app.d.ts'

async function sync() {
    try {
        console.log('🔄 Syncing types from:', url)

        const res = await fetch(`${url}/types/app.d.ts`)

        if (!res.ok) {
            console.error('❌ Failed to fetch types')
            process.exit(1)
            return
        }

        const text = await res.text()
        fs.mkdirSync('./src/types', { recursive: true })
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
    console.log('👀 Watching types from:', url)
    console.log('💡 Press Ctrl+C to stop\n')

    // initial sync
    await sync()

    let lastSyncTime = Date.now()

    // polling every 3 seconds
    setInterval(async () => {
        try {
            const res = await fetch(`${url}/types/app.d.ts`)
            if (res.ok) {
                const text = await res.text()
                fs.mkdirSync('./src/types', { recursive: true })
                const existing = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, 'utf-8') : ''

                if (text !== existing) {
                    fs.writeFileSync(OUTPUT, text)
                    const now = new Date().toLocaleTimeString()
                    console.log(`[${now}] ♻️  Types updated`)
                    lastSyncTime = Date.now()
                }
            }
        } catch (err) {
            // Silently fail during watch
        }
    }, 3000)
}

if (command === 'sync') {
    sync()
} else if (command === 'watch') {
    watch()
} else {
    console.log(`
📦 Type Share Eden Elysia CLI

Usage:
  type-share-eden-elysia sync [url]      Sync types once from backend
  type-share-eden-elysia watch [url]     Watch and sync types continuously

Arguments:
  [url]   Backend URL (default: http://localhost:3000)

Examples:
  type-share-eden-elysia sync
  type-share-eden-elysia sync http://localhost:8000
  type-share-eden-elysia watch
  type-share-eden-elysia watch http://api.example.com
`)
}