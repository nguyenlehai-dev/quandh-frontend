/**
 * Module Validation Script
 *
 * Kiểm tra tất cả modules tuân thủ cấu trúc chuẩn trước khi build.
 * Chạy: node scripts/validate-modules.js
 *
 * Checks:
 * 1. Cấu trúc thư mục bắt buộc
 * 2. File index.js entry point
 * 3. Configs (API_BASE, PERMISSIONS)
 * 4. Service file tồn tại
 * 5. Router files (routes.js, navigation.js)
 * 6. Documentation (docs/api, docs/answer)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const MODULES_DIR = path.join(ROOT, 'src', 'modules')
const DOCS_DIR = path.join(ROOT, 'src', 'docs')

// Folders bắt buộc trong mỗi module
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

// Files bắt buộc
const REQUIRED_FILES = [
  'index.js',
  'configs/index.js',
  'router/routes.js',
  'router/navigation.js',
]

// Modules bỏ qua validation
const SKIP_MODULES = ['example']

// Colors
const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const CYAN = '\x1b[36m'
const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'

function log(color, symbol, msg) {
  console.log(`  ${color}${symbol}${RESET} ${msg}`)
}

function getModuleDirs() {
  return fs.readdirSync(MODULES_DIR)
    .filter(name => {
      const fullPath = path.join(MODULES_DIR, name)

      return fs.statSync(fullPath).isDirectory() && !name.startsWith('_')
    })
}

function validateModule(moduleName) {
  const moduleDir = path.join(MODULES_DIR, moduleName)
  const errors = []
  const warnings = []

  // 1. Check required folders
  for (const folder of REQUIRED_FOLDERS) {
    const folderPath = path.join(moduleDir, folder)
    if (!fs.existsSync(folderPath)) {
      errors.push(`Thiếu thư mục: ${folder}/`)
    }
  }

  // 2. Check required files
  for (const file of REQUIRED_FILES) {
    const filePath = path.join(moduleDir, file)
    if (!fs.existsSync(filePath)) {
      errors.push(`Thiếu file: ${file}`)
    }
  }

  // 3. Check index.js exports routes + navigation
  const indexPath = path.join(moduleDir, 'index.js')
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf-8')
    if (!content.includes('routes')) {
      errors.push('index.js: thiếu export routes')
    }
    if (!content.includes('navigation')) {
      errors.push('index.js: thiếu export navigation')
    }
    if (!content.includes('navOrder')) {
      warnings.push('index.js: nên khai báo navOrder để sắp xếp sidebar')
    }
  }

  // 4. Check configs has API_BASE and PERMISSIONS
  const configPath = path.join(moduleDir, 'configs', 'index.js')
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf-8')
    if (!content.includes('API_BASE') && !content.match(/API_[A-Z]/)) {
      errors.push('configs/index.js: thiếu API_BASE hoặc API endpoint constant')
    }
    if (!content.includes('PERMISSIONS')) {
      warnings.push('configs/index.js: nên khai báo PERMISSIONS')
    }
  }

  // 5. Check service file exists (at least one *Service.js)
  const servicesDir = path.join(moduleDir, 'services')
  if (fs.existsSync(servicesDir)) {
    const serviceFiles = fs.readdirSync(servicesDir).filter(f => f.endsWith('Service.js'))
    if (serviceFiles.length === 0) {
      errors.push('services/: thiếu file *Service.js')
    }
  }

  // 6. Check views exist
  const viewsDir = path.join(moduleDir, 'views')
  if (fs.existsSync(viewsDir)) {
    const viewFiles = fs.readdirSync(viewsDir).filter(f => f.endsWith('.vue'))
    if (viewFiles.length === 0) {
      warnings.push('views/: chưa có file .vue nào')
    }
  }

  return { errors, warnings }
}

function validateDocs() {
  const errors = []
  const warnings = []

  // Check docs/api/modules-api.md
  const apiDoc = path.join(DOCS_DIR, 'api', 'modules-api.md')
  if (!fs.existsSync(apiDoc)) {
    errors.push('Thiếu docs/api/modules-api.md')
  }

  // Check docs/answer/modules-analysis.md
  const answerDoc = path.join(DOCS_DIR, 'answer', 'modules-analysis.md')
  if (!fs.existsSync(answerDoc)) {
    errors.push('Thiếu docs/answer/modules-analysis.md')
  }

  // Check docs/project-structure.md
  const structureDoc = path.join(DOCS_DIR, 'project-structure.md')
  if (!fs.existsSync(structureDoc)) {
    warnings.push('Thiếu docs/project-structure.md')
  }

  // Check each module is documented
  const modules = getModuleDirs().filter(m => !SKIP_MODULES.includes(m))
  if (fs.existsSync(apiDoc)) {
    const apiContent = fs.readFileSync(apiDoc, 'utf-8')
    for (const mod of modules) {
      // Search case-insensitive in API doc
      if (!apiContent.toLowerCase().includes(mod.toLowerCase())) {
        warnings.push(`Module "${mod}" chưa được document trong docs/api/modules-api.md`)
      }
    }
  }

  return { errors, warnings }
}

// ===== MAIN =====
console.log('')
console.log(`${BOLD}${CYAN}🔍 Validating Module Structure...${RESET}`)
console.log('')

let totalErrors = 0
let totalWarnings = 0

const modules = getModuleDirs()

for (const mod of modules) {
  if (SKIP_MODULES.includes(mod)) {
    console.log(`${YELLOW}⊘ ${mod}${RESET} (skipped - template)`)
    continue
  }

  const { errors, warnings } = validateModule(mod)

  if (errors.length === 0 && warnings.length === 0) {
    console.log(`${GREEN}✓ ${mod}${RESET}`)
  }
  else {
    console.log(`${errors.length > 0 ? RED : YELLOW}${errors.length > 0 ? '✗' : '⚠'} ${mod}${RESET}`)
    errors.forEach(e => log(RED, '✗', e))
    warnings.forEach(w => log(YELLOW, '⚠', w))
  }

  totalErrors += errors.length
  totalWarnings += warnings.length
}

// Docs validation
console.log('')
console.log(`${BOLD}${CYAN}📖 Validating Documentation...${RESET}`)
console.log('')

const docsResult = validateDocs()

docsResult.errors.forEach(e => log(RED, '✗', e))
docsResult.warnings.forEach(w => log(YELLOW, '⚠', w))
if (docsResult.errors.length === 0 && docsResult.warnings.length === 0) {
  log(GREEN, '✓', 'Tất cả docs đầy đủ')
}

totalErrors += docsResult.errors.length
totalWarnings += docsResult.warnings.length

// Summary
console.log('')
console.log(`${BOLD}──────────────────────────────${RESET}`)

if (totalErrors > 0) {
  console.log(`${RED}${BOLD}✗ FAILED${RESET} — ${totalErrors} errors, ${totalWarnings} warnings`)
  console.log(`${YELLOW}  Hãy sửa tất cả errors trước khi build.${RESET}`)
  console.log('')
  process.exit(1)
}
else if (totalWarnings > 0) {
  console.log(`${YELLOW}${BOLD}⚠ PASSED with warnings${RESET} — ${totalWarnings} warnings`)
  console.log('')
  process.exit(0)
}
else {
  console.log(`${GREEN}${BOLD}✓ ALL PASSED${RESET}`)
  console.log('')
  process.exit(0)
}
