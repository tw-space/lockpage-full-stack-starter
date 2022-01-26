/* eslint no-console: 'off' */
//
// fix_lockpage_export.node.js
// replace scripts with basenames
//
const fs = require('fs')
const path = require('path')

const outDir = process.env.LOCKPAGE_DIR
const outIndex = `${outDir}/index.html`
// const loginPath = process.env.LOGIN_PATH

// |0| Verify pwd is project root; else exit

const expectedCwd = process.env.ROOT_PWD

if (process.cwd() !== expectedCwd) {
  console.error('Error: Script must be run from project root')
  console.error('process.cwd: ', process.cwd())
  console.error('expectedCwd: ', expectedCwd)
  process.exit(1)
}

// |1| Move all files in out/ directory to its base level

const files = []

const getFilesRecursively = (directory) => {
  const filesInDirectory = fs.readdirSync(directory)
  // eslint-disable-next-line no-restricted-syntax
  for (const file of filesInDirectory) {
    const absolute = path.join(directory, file)
    if (fs.statSync(absolute).isDirectory()) {
      getFilesRecursively(absolute)
    } else {
      files.push(absolute)
    }
  }
}

getFilesRecursively(outDir)

// eslint-disable-next-line no-restricted-syntax
for (const file of files) {
  const destName = `${outDir}/${path.basename(file)}`
  if (file === destName) {
    continue // eslint-disable-line no-continue
  }

  fs.rename(file, destName, (err) => {
    if (err) throw err
  })
}

// |2| Refer to script paths in index.html by their basename

// eslint-disable-next-line no-unused-vars
function replacePathWithBasename(match, p1, p2, p3, offset, string) {
  return p1 + path.basename(p2) + p3
}

fs.readFile(outIndex, 'utf8', (err, data) => {
  if (err) { console.error(err) } // eslint-disable-line no-console

  let result = data.replace(
    /(<script src=")([_0-9a-zA-Z/.-]+)(")/g,
    replacePathWithBasename,
  )

  result = result.replace(
    /(<script defer="" nomodule="" src=")([_0-9a-zA-Z/.-]+)(")/g,
    replacePathWithBasename,
  )

  // result = result.replace(
  //   /(\/)([_0-9a-zA-Z.-]+)(\.woff2)/g,
  //   `${loginPath}$2$3`,
  // )

  fs.writeFile(outIndex, result, 'utf8', (error) => {
    if (error) { console.error(error) } // eslint-disable-line no-console
  })
})

// |3| Delete mockServiceWorker.js from out/

const mswOutPath = path.resolve(outDir, 'mockServiceWorker.js')

fs.access(mswOutPath, fs.F_OK, (err) => {
  if (err) { return }

  // file exists
  fs.unlink(mswOutPath, (error) => {
    if (error) { console.error(error) } // eslint-disable-line no-console
  })
})

// |4| Delete empty _next subdirectory from export directory

const nextDirOutPath = path.resolve(outDir, '_next')

fs.access(nextDirOutPath, fs.F_OK, (err) => {
  if (err) { return }

  // something exists
  fs.rm(nextDirOutPath, { recursive: true }, (error) => {
    if (error) { console.error(error) } // eslint-disable-line no-console
  })
})

// |5| Done

console.log(`${outDir} directory fixed`) // eslint-disable-line no-console
