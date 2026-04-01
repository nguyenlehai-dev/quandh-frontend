/**
 * Module Validation Script
 *
 * Checks:
 * 1. Required folder structure
 * 2. index.js entry point
 * 3. Configs (API_BASE, PERMISSIONS)
 * 4. Service file existence
 * 5. Router files (routes.js, navigation.js)
 * 6. Documentation references
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const MODULES_DIR = path.join(ROOT, 'src', 'modules')
const DOCS_DIR = path.join(ROOT, 'src', 'docs')

const REQUIRED_FOLDERS = [
  'components',
  'composables',
  'configs',
  'models',
  'router',
  'services',
  'stores',
  'utils',
  'views',
]

const REQUIRED_FILES = [
  'index.js',
  'configs/index.js',
  'router/routes.js',
  'router/navigation.js',
]

const SKIP_MODULES = ['example']

const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const CYAN = '\x1b[36m'
const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'

function log(color, symbol, msg) {
  console.log(`  ${color}${symbol}${RESET} ${msg}`)
}

function collectModuleDirs(baseDir, relativeDir = '') {
  const currentDir = path.join(baseDir, relativeDir)
  const currentIndexPath = path.join(currentDir, 'index.js')

  if (relativeDir && fs.existsSync(currentIndexPath))
    return [relativeDir]

  const entries = fs.readdirSync(currentDir, { withFileTypes: true })

  return entries
    .filter(entry => entry.isDirectory() && !entry.name.startsWith('_'))
    .flatMap(entry => collectModuleDirs(baseDir, path.join(relativeDir, entry.name)))
}

function getModuleDirs() {
  return collectModuleDirs(MODULES_DIR)
}

function hasAnyFileRecursive(baseDir, predicate) {
  const entries = fs.readdirSync(baseDir, { withFileTypes: true })

  for (const entry of entries) {
    const nextPath = path.join(baseDir, entry.name)

    if (entry.isDirectory()) {
      if (hasAnyFileRecursive(nextPath, predicate))
        return true
      continue
    }

    if (predicate(entry.name, nextPath))
      return true
  }

  return false
}

function validateModule(modulePath) {
  const moduleDir = path.join(MODULES_DIR, modulePath)
  const errors = []
  const warnings = []

  for (const folder of REQUIRED_FOLDERS) {
    const folderPath = path.join(moduleDir, folder)
    if (!fs.existsSync(folderPath))
      errors.push(`Missing folder: ${folder}/`)
  }

  for (const file of REQUIRED_FILES) {
    const filePath = path.join(moduleDir, file)
    if (!fs.existsSync(filePath))
      errors.push(`Missing file: ${file}`)
  }

  const indexPath = path.join(moduleDir, 'index.js')
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf-8')
    if (!content.includes('routes'))
      errors.push('index.js: missing routes export')
    if (!content.includes('navigation'))
      errors.push('index.js: missing navigation export')
    if (!content.includes('navOrder'))
      warnings.push('index.js: should declare navOrder for sidebar ordering')
  }

  const configPath = path.join(moduleDir, 'configs', 'index.js')
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf-8')
    if (!content.includes('API_BASE') && !content.match(/API_[A-Z]/))
      errors.push('configs/index.js: missing API_BASE or API endpoint constant')
    if (!content.includes('PERMISSIONS'))
      warnings.push('configs/index.js: should declare PERMISSIONS')
  }

  const servicesDir = path.join(moduleDir, 'services')
  if (fs.existsSync(servicesDir)) {
    const serviceFiles = fs.readdirSync(servicesDir).filter(file => file.endsWith('Service.js'))
    if (serviceFiles.length === 0)
      errors.push('services/: missing *Service.js file')
  }

  const viewsDir = path.join(moduleDir, 'views')
  if (fs.existsSync(viewsDir)) {
    if (!hasAnyFileRecursive(viewsDir, fileName => fileName.endsWith('.vue')))
      warnings.push('views/: no .vue files found')
  }

  const metaPath = path.join(moduleDir, 'module.meta.js')
  if (!fs.existsSync(metaPath)) {
    warnings.push('module.meta.js: missing metadata for auto-generated docs')
  }
  else {
    const content = fs.readFileSync(metaPath, 'utf-8')
    if (!content.includes('displayName'))
      warnings.push('module.meta.js: should declare displayName')
    if (!content.includes('api:'))
      warnings.push('module.meta.js: should declare api array for docs generation')
  }

  return { errors, warnings }
}

function validateDocs() {
  const errors = []
  const warnings = []

  const apiDoc = path.join(DOCS_DIR, 'api', 'modules-api.md')
  const answerDoc = path.join(DOCS_DIR, 'answer', 'modules-analysis.md')
  const structureDoc = path.join(DOCS_DIR, 'project-structure.md')

  if (!fs.existsSync(apiDoc))
    errors.push('Missing docs/api/modules-api.md')

  if (!fs.existsSync(answerDoc))
    errors.push('Missing docs/answer/modules-analysis.md')

  if (!fs.existsSync(structureDoc))
    warnings.push('Missing docs/project-structure.md')

  const modules = getModuleDirs().filter(modulePath => !SKIP_MODULES.includes(path.basename(modulePath)))
  if (fs.existsSync(apiDoc)) {
    const apiContent = fs.readFileSync(apiDoc, 'utf-8').toLowerCase()

    for (const mod of modules) {
      const moduleName = path.basename(mod).toLowerCase()
      if (!apiContent.includes(moduleName))
        warnings.push(`Module "${path.basename(mod)}" is not documented in docs/api/modules-api.md`)
    }
  }

  return { errors, warnings }
}

console.log('')
console.log(`${BOLD}${CYAN}Validating Module Structure...${RESET}`)
console.log('')

let totalErrors = 0
let totalWarnings = 0

const modules = getModuleDirs()

for (const mod of modules) {
  const moduleName = path.basename(mod)

  if (SKIP_MODULES.includes(moduleName)) {
    console.log(`${YELLOW}- ${mod}${RESET} (skipped - template)`)
    continue
  }

  const { errors, warnings } = validateModule(mod)

  if (errors.length === 0 && warnings.length === 0) {
    console.log(`${GREEN}OK ${mod}${RESET}`)
  }
  else {
    console.log(`${errors.length > 0 ? RED : YELLOW}${errors.length > 0 ? 'ERR' : 'WARN'} ${mod}${RESET}`)
    errors.forEach(error => log(RED, 'x', error))
    warnings.forEach(warning => log(YELLOW, '!', warning))
  }

  totalErrors += errors.length
  totalWarnings += warnings.length
}

console.log('')
console.log(`${BOLD}${CYAN}Validating Documentation...${RESET}`)
console.log('')

const docsResult = validateDocs()

docsResult.errors.forEach(error => log(RED, 'x', error))
docsResult.warnings.forEach(warning => log(YELLOW, '!', warning))
if (docsResult.errors.length === 0 && docsResult.warnings.length === 0)
  log(GREEN, 'OK', 'All docs are present')

totalErrors += docsResult.errors.length
totalWarnings += docsResult.warnings.length

console.log('')
console.log(`${BOLD}------------------------------${RESET}`)

if (totalErrors > 0) {
  console.log(`${RED}${BOLD}FAILED${RESET} - ${totalErrors} errors, ${totalWarnings} warnings`)
  console.log('')
  process.exit(1)
}

if (totalWarnings > 0) {
  console.log(`${YELLOW}${BOLD}PASSED with warnings${RESET} - ${totalWarnings} warnings`)
  console.log('')
  process.exit(0)
}

console.log(`${GREEN}${BOLD}ALL PASSED${RESET}`)
console.log('')
process.exit(0)
