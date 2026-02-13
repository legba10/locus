#!/usr/bin/env node
/**
 * Generates PNG and ICO assets from SVG for public/.
 * Run: node scripts/generate-png-icons.mjs
 */
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

// Use small SVG to avoid sharp issues with huge embedded images
const svgPath = join(publicDir, 'logo-dark.svg')
const svgBuffer = readFileSync(svgPath)

const sizes = [
  { name: 'logo-locus-icon.png', size: 512 },
  { name: 'web-app-manifest-192x192.png', size: 192 },
  { name: 'web-app-manifest-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
]

for (const { name, size } of sizes) {
  const out = join(publicDir, name)
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(out)
  console.log('Written', name)
}

// favicon.ico (32x32 PNG; many browsers accept PNG for .ico)
const faviconIco = join(publicDir, 'favicon.ico')
await sharp(svgBuffer).resize(32, 32).png().toFile(faviconIco)
console.log('Written favicon.ico')
