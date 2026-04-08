import fs from 'node:fs/promises'
import path from 'node:path'

const projectRoot = process.cwd()
const pagesRoot = path.join(projectRoot, 'src', 'pages')
const modulesRoot = path.join(projectRoot, 'src', 'modules')

const MODULE_CONTRACT_DIRS = [
  'components',
  'composables',
  'configs',
  'models',
  'router',
  'services',
  'utils',
  'views',
]

const extraModules = ['app-shell']

function toPosix(value) {
  return value.split(path.sep).join('/')
}

function fromPosix(value) {
  return value.split('/').join(path.sep)
}

function ensureNoTraversal(value) {
  if (value.includes('..'))
    throw new Error(`Unsafe path detected: ${value}`)
}

function mapPageToModule(relativePagePath) {
  const page = toPosix(relativePagePath)

  const exactRoutes = new Map([
    ['login.vue', { moduleName: 'auth', viewPath: 'views/login.vue' }],
    ['register.vue', { moduleName: 'auth', viewPath: 'views/register.vue' }],
    ['forgot-password.vue', { moduleName: 'auth', viewPath: 'views/forgot-password.vue' }],
    ['access-control.vue', { moduleName: 'access-control', viewPath: 'views/index.vue' }],
    ['not-authorized.vue', { moduleName: 'system-pages', viewPath: 'views/not-authorized.vue' }],
    ['[...error].vue', { moduleName: 'system-pages', viewPath: 'views/error.vue' }],
    ['pages/faq.vue', { moduleName: 'content-pages', viewPath: 'views/pages/faq.vue' }],
    ['pages/pricing.vue', { moduleName: 'content-pages', viewPath: 'views/pages/pricing.vue' }],
    ['pages/account-settings/[tab].vue', { moduleName: 'profile-settings', viewPath: 'views/account-settings/[tab].vue' }],
    ['pages/user-profile/[tab].vue', { moduleName: 'profile-settings', viewPath: 'views/user-profile/[tab].vue' }],
  ])

  if (exactRoutes.has(page))
    return exactRoutes.get(page)

  const prefixRoutes = [
    ['apps/academy/', 'academy', 'views/'],
    ['apps/ecommerce/', 'ecommerce', 'views/'],
    ['apps/invoice/', 'invoice', 'views/'],
    ['apps/logistics/', 'logistics', 'views/'],
    ['apps/user/', 'user-management', 'views/'],
    ['dashboards/', 'dashboard', 'views/'],
    ['charts/', 'charts-reference', 'views/'],
    ['extensions/', 'extensions-reference', 'views/'],
    ['forms/', 'forms-reference', 'views/'],
    ['front-pages/', 'content-pages', 'views/front-pages/'],
    ['pages/authentication/', 'auth', 'views/authentication/'],
    ['pages/cards/', 'ui-reference', 'views/cards/'],
    ['pages/dialog-examples/', 'ui-reference', 'views/dialog-examples/'],
    ['pages/misc/', 'system-pages', 'views/misc/'],
    ['tables/', 'tables-reference', 'views/'],
    ['wizard-examples/', 'forms-reference', 'views/wizard-examples/'],
  ]

  for (const [prefix, moduleName, targetPrefix] of prefixRoutes) {
    if (page.startsWith(prefix))
      return { moduleName, viewPath: `${targetPrefix}${page.slice(prefix.length)}` }
  }

  if (page === 'apps/calendar.vue')
    return { moduleName: 'calendar', viewPath: 'views/index.vue' }

  if (page === 'apps/chat.vue')
    return { moduleName: 'chat', viewPath: 'views/index.vue' }

  if (page.startsWith('apps/email/'))
    return { moduleName: 'email', viewPath: `views/${page.slice('apps/email/'.length)}` }

  if (page.startsWith('apps/kanban/'))
    return { moduleName: 'kanban', viewPath: `views/${page.slice('apps/kanban/'.length)}` }

  if (page.startsWith('apps/permissions/'))
    return { moduleName: 'role-permission', viewPath: `views/permissions/${page.slice('apps/permissions/'.length)}` }

  if (page.startsWith('apps/roles/'))
    return { moduleName: 'role-permission', viewPath: `views/roles/${page.slice('apps/roles/'.length)}` }

  if (page.startsWith('components/'))
    return { moduleName: 'ui-reference', viewPath: `views/components/${page.slice('components/'.length)}` }

  if (page === 'pages/icons.vue')
    return { moduleName: 'ui-reference', viewPath: 'views/icons.vue' }

  if (page === 'pages/typography.vue')
    return { moduleName: 'ui-reference', viewPath: 'views/typography.vue' }

  throw new Error(`No module mapping found for page: ${page}`)
}

function extractDefinePage(content) {
  const marker = 'definePage('
  const start = content.indexOf(marker)

  if (start === -1)
    return { definePageBlock: '', moduleContent: content }

  let index = start + marker.length
  let depth = 1
  let quote = ''
  let inLineComment = false
  let inBlockComment = false
  let escaped = false

  while (index < content.length) {
    const current = content[index]
    const next = content[index + 1]

    if (inLineComment) {
      if (current === '\n')
        inLineComment = false

      index++
      continue
    }

    if (inBlockComment) {
      if (current === '*' && next === '/') {
        inBlockComment = false
        index += 2
        continue
      }

      index++
      continue
    }

    if (quote) {
      if (escaped) {
        escaped = false
      }
      else if (current === '\\') {
        escaped = true
      }
      else if (current === quote) {
        quote = ''
      }

      index++
      continue
    }

    if (current === '/' && next === '/') {
      inLineComment = true
      index += 2
      continue
    }

    if (current === '/' && next === '*') {
      inBlockComment = true
      index += 2
      continue
    }

    if (current === '\'' || current === '"' || current === '`') {
      quote = current
      index++
      continue
    }

    if (current === '(')
      depth++

    if (current === ')') {
      depth--

      if (depth === 0) {
        index++
        break
      }
    }

    index++
  }

  let end = index

  while (end < content.length && /[;\s]/.test(content[end]))
    end++

  const definePageBlock = content.slice(start, end).trim()
  const moduleContent = `${content.slice(0, start)}${content.slice(end)}`.replace(/\n{3,}/g, '\n\n').trimStart()

  return { definePageBlock, moduleContent }
}

function buildWrapperContent(importPath, definePageBlock) {
  const definePageSection = definePageBlock ? `${definePageBlock}\n\n` : ''

  return `<script setup>\nimport PageView from '${importPath}'\n\n${definePageSection}</script>\n\n<template>\n  <PageView />\n</template>\n`
}

async function ensureModuleSkeleton(moduleName) {
  const moduleRoot = path.join(modulesRoot, moduleName)
  await fs.mkdir(moduleRoot, { recursive: true })

  for (const dirName of MODULE_CONTRACT_DIRS) {
    const directory = path.join(moduleRoot, dirName)
    await fs.mkdir(directory, { recursive: true })

    if (dirName !== 'views') {
      const keepFile = path.join(directory, '.gitkeep')
      await fs.writeFile(keepFile, '', 'utf8')
    }
  }

  const readmePath = path.join(moduleRoot, 'README.md')
  const readmeContent = `# ${moduleName}\n\nThis module follows the shared contract documented in \`docs/module-structure-analysis.md\`.\n`

  await fs.writeFile(readmePath, readmeContent, 'utf8')
}

async function collectPageFiles(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true })
  const results = []

  for (const entry of entries) {
    const absolutePath = path.join(rootDir, entry.name)

    if (entry.isDirectory()) {
      results.push(...await collectPageFiles(absolutePath))
      continue
    }

    if (entry.isFile() && entry.name.endsWith('.vue'))
      results.push(absolutePath)
  }

  return results
}

async function main() {
  const pageFiles = await collectPageFiles(pagesRoot)
  const createdModules = new Set(extraModules)
  let migratedCount = 0
  let skippedCount = 0

  for (const moduleName of extraModules)
    await ensureModuleSkeleton(moduleName)

  for (const pageFile of pageFiles) {
    const routeRelativePath = toPosix(path.relative(pagesRoot, pageFile))
    const currentContent = await fs.readFile(pageFile, 'utf8')

    if (currentContent.includes("import PageView from '@modules/")) {
      skippedCount++
      continue
    }

    const { moduleName, viewPath } = mapPageToModule(routeRelativePath)
    createdModules.add(moduleName)
    await ensureModuleSkeleton(moduleName)

    ensureNoTraversal(viewPath)

    const destinationPath = path.join(modulesRoot, moduleName, fromPosix(viewPath))
    await fs.mkdir(path.dirname(destinationPath), { recursive: true })

    const { definePageBlock, moduleContent } = extractDefinePage(currentContent)
    await fs.writeFile(destinationPath, moduleContent, 'utf8')

    const wrapperContent = buildWrapperContent(`@modules/${moduleName}/${viewPath}`, definePageBlock)
    await fs.writeFile(pageFile, wrapperContent, 'utf8')
    migratedCount++
  }

  const moduleNames = [...createdModules].sort()

  const reportLines = [
    '# Module Migration Map',
    '',
    `Migrated pages: ${migratedCount}`,
    `Skipped pages: ${skippedCount}`,
    `Generated modules: ${moduleNames.length}`,
    '',
    '## Modules',
    '',
    ...moduleNames.map(name => `- ${name}`),
    '',
  ]

  const reportPath = path.join(projectRoot, 'docs', 'module-migration-map.md')
  await fs.mkdir(path.dirname(reportPath), { recursive: true })
  await fs.writeFile(reportPath, `${reportLines.join('\n')}\n`, 'utf8')

  console.log(`Migrated ${migratedCount} pages into ${moduleNames.length} modules.`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
