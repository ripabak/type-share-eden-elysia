#!/usr/bin/env node

import fs from 'fs'

const [, , command, url = 'http://localhost:3000'] = process.argv

async function sync() {
    console.log('🔄 Syncing types from:', url)

    const res = await fetch(`${url}/types/app.d.ts`)

    if (!res.ok) {
        console.error('❌ Failed to fetch types')
        process.exit(1)
    }

    const text = await res.text()

    fs.mkdirSync('./src/types', { recursive: true })
    fs.writeFileSync('./src/types/app.d.ts', text)

    console.log('✅ Types synced')
}

if (command === 'sync') {
    sync()
} else {
    console.log(`
Usage:
  type-share-eden-elysia sync http://localhost:3000
`)
}