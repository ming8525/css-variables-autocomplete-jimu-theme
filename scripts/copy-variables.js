const fs = require('fs')
const path = require('path')

const distDir = path.join(__dirname, '..', 'dist')
const srcFile = path.join(__dirname, '..', 'src', 'variables-template.css')
const destFile = path.join(distDir, 'variables-template.css')

fs.mkdirSync(distDir, { recursive: true })
fs.copyFileSync(srcFile, destFile)
