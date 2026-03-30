import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const MODULES_DIR = path.join(ROOT, 'src', 'modules')
const DOCS_API_PATH = path.join(ROOT, 'src', 'docs', 'api', 'modules-api.md')
const DOCS_ANALYSIS_PATH = path.join(ROOT, 'src', 'docs', 'answer', 'modules-analysis.md')

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

async function loadModuleMetas() {
  const moduleDirs = collectModuleDirs(MODULES_DIR)
  const modules = []

  for (const moduleDir of moduleDirs) {
    const metaPath = path.join(MODULES_DIR, moduleDir, 'module.meta.js')
    if (!fs.existsSync(metaPath))
      continue

    const mod = await import(pathToFileURL(metaPath).href)
    const meta = mod.default || mod

    modules.push({
      moduleDir,
      ...meta,
    })
  }

  return modules.sort((left, right) => {
    const leftOrder = left.navOrder ?? 999
    const rightOrder = right.navOrder ?? 999

    if (leftOrder !== rightOrder)
      return leftOrder - rightOrder

    return (left.displayName || left.name).localeCompare(right.displayName || right.name)
  })
}

function renderApiDoc(modules) {
  const lines = [
    '# Frontend Modules API',
    '',
    'Tai lieu nay duoc tu dong sinh tu `module.meta.js` trong tung module frontend.',
    '',
    'Base URL:',
    '',
    '- `VITE_API_BASE_URL`',
    '- mac dinh: `/api`',
    '',
  ]

  for (const module of modules) {
    lines.push(`## ${module.displayName}`)
    lines.push('')

    if (module.path)
      lines.push(`Path: \`${module.path}\``)

    if (module.servicePaths?.length) {
      lines.push('')
      lines.push('Services:')
      lines.push('')
      module.servicePaths.forEach(servicePath => {
        lines.push(`- [${servicePath}](/e:/Danatec/Projects/quandh-frontend/${servicePath})`)
      })
    }

    if (module.api?.length) {
      lines.push('')
      lines.push('| Method | Endpoint | Service function | Mo ta |')
      lines.push('|---|---|---|---|')
      module.api.forEach(item => {
        lines.push(`| ${item.method} | \`${item.endpoint}\` | \`${item.service}\` | ${item.description} |`)
      })
    }

    lines.push('')
  }

  return `${lines.join('\n').trim()}\n`
}

function renderAnalysisDoc(modules) {
  const lines = [
    '# Frontend Modules Analysis',
    '',
    'Tai lieu nay duoc tu dong sinh tu `module.meta.js` trong tung module frontend.',
    '',
  ]

  const groups = new Map()
  modules.forEach(module => {
    const group = module.group || 'root'
    if (!groups.has(group))
      groups.set(group, [])
    groups.get(group).push(module)
  })

  for (const [group, groupModules] of groups.entries()) {
    lines.push(`## Nhom ${group}`)
    lines.push('')

    for (const module of groupModules) {
      lines.push(`### ${module.displayName}`)
      lines.push('')

      if (module.path) {
        lines.push('Path:')
        lines.push('')
        lines.push(`- [${module.path}](/e:/Danatec/Projects/quandh-frontend/${module.path})`)
        lines.push('')
      }

      if (module.purpose) {
        lines.push('Muc dich:')
        lines.push('')
        lines.push(`- ${module.purpose}`)
        lines.push('')
      }

      if (module.features?.length) {
        lines.push('Chuc nang chinh:')
        lines.push('')
        module.features.forEach(feature => {
          lines.push(`- ${feature}`)
        })
        lines.push('')
      }
    }
  }

  return `${lines.join('\n').trim()}\n`
}

async function main() {
  const modules = await loadModuleMetas()

  fs.writeFileSync(DOCS_API_PATH, renderApiDoc(modules), 'utf8')
  fs.writeFileSync(DOCS_ANALYSIS_PATH, renderAnalysisDoc(modules), 'utf8')

  console.log(`Generated docs for ${modules.length} modules`)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
