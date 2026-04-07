import fs from 'node:fs/promises'
import path from 'node:path'

const projectRoot = process.cwd()
const templatesRoot = path.join(projectRoot, 'src', 'module-templates')
const modulesRoot = path.join(projectRoot, 'src', 'modules')

const [templateName, targetModuleName = templateName] = process.argv.slice(2)

if (!templateName) {
  console.error('Usage: pnpm modules:instantiate <template-name> [target-module-name]')
  process.exit(1)
}

if (templateName === '_base-module') {
  console.error('The "_base-module" template is reserved. Copy from it manually or use another template.')
  process.exit(1)
}

function ensureSafeName(value, label) {
  if (!value || value.includes('..') || value.includes('/') || value.includes('\\')) {
    throw new Error(`Invalid ${label}: ${value}`)
  }
}

async function copyDirectory(sourceDir, targetDir) {
  await fs.mkdir(targetDir, { recursive: true })
  const entries = await fs.readdir(sourceDir, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name)
    const targetPath = path.join(targetDir, entry.name)

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath)
      continue
    }

    await fs.copyFile(sourcePath, targetPath)
  }
}

async function main() {
  ensureSafeName(templateName, 'template name')
  ensureSafeName(targetModuleName, 'target module name')

  const sourceDir = path.join(templatesRoot, templateName)
  const targetDir = path.join(modulesRoot, targetModuleName)

  await fs.access(sourceDir)

  try {
    await fs.access(targetDir)
    throw new Error(`Target module already exists: ${targetModuleName}`)
  }
  catch (error) {
    if (error.code !== 'ENOENT')
      throw error
  }

  await copyDirectory(sourceDir, targetDir)

  console.log(`Template "${templateName}" copied to src/modules/${targetModuleName}`)
}

main().catch(error => {
  console.error(error.message)
  process.exit(1)
})
