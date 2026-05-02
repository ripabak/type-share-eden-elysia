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
            return
        }

        const text = await res.text()

        fs.mkdirSync('./src/types', { recursive: true })
        fs.writeFileSync(OUTPUT, text)

        console.log('✅ Types synced')
    } catch (err) {
        console.error('❌ Error:', err)
    }
}

async function watch() {
    console.log('👀 Watching types from:', url)

    // initial sync
    await sync()

    // polling every 3 seconds (simple version)
    setInterval(async () => {
        await sync()
    }, 3000)
}

if (command === 'sync') {
    sync()
} else if (command === 'watch') {
    watch()
} else {
    console.log(`
Usage:
  type-share-eden-elysia sync <url>
  type-share-eden-elysia watch <url>
`)
}