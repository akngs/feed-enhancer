import { execSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { cleanupTestData, createTestDirectories } from "./test-helpers"

// Helper function to create sample files
function createSampleFiles(inputDir: string) {
  const sampleFiles = [
    { name: "file1.txt", content: "This is file 1" },
    { name: "file2.txt", content: "This is file 2" },
    {
      name: "rss-feed.xml",
      content: '<?xml version="1.0"?><rss><channel><title>Test Feed</title></channel></rss>',
    },
  ]

  for (const file of sampleFiles) {
    writeFileSync(join(inputDir, file.name), file.content)
  }

  return sampleFiles
}

// Helper function to check if a file exists in the output directory
function checkFileExists(outputDir: string, fileName: string) {
  const outputFilePath = join(outputDir, fileName)
  if (!existsSync(outputFilePath)) {
    throw new Error(`File ${fileName} was not copied to the output directory`)
  }
}

// Helper function to check if file content matches
function checkFileContentMatches(inputDir: string, outputDir: string, fileName: string) {
  const inputFilePath = join(inputDir, fileName)
  const outputFilePath = join(outputDir, fileName)

  const inputContent = readFileSync(inputFilePath, "utf-8")
  const outputContent = readFileSync(outputFilePath, "utf-8")

  if (inputContent !== outputContent) {
    throw new Error(`File ${fileName} content does not match between input and output directories`)
  }
}

// Helper function to verify copied files
function verifyCopiedFiles(sampleFiles: Array<{ name: string; content: string }>, inputDir: string, outputDir: string) {
  for (const file of sampleFiles) {
    checkFileExists(outputDir, file.name)
    checkFileContentMatches(inputDir, outputDir, file.name)
  }
}

// Helper function to run the CLI tool without config
function runCLIToolWithoutConfig(inputDir: string, outputDir: string) {
  // Build the project first

  // Run the CLI tool
  // eslint-disable-next-line sonarjs/os-command
  execSync(`node dist/index.js --i ${inputDir} --o ${outputDir}`, {
    cwd: process.cwd(),
    stdio: "inherit",
  })
}

it('GIVEN no config file, WHEN the user runs "feed-enhancer", THEN the files in the output directory should be the exact same as the files in the input directory', () => {
  // GIVEN no config file
  const testDir = join(__dirname, "test-data-AT-0002")
  const inputDir = join(testDir, "input")
  const outputDir = join(testDir, "output")

  // Clean up any existing test data
  cleanupTestData(testDir)

  try {
    // Create test directories
    createTestDirectories(inputDir, outputDir)

    // Create some sample files in the input directory
    const sampleFiles = createSampleFiles(inputDir)

    // WHEN the user runs "feed-enhancer"
    runCLIToolWithoutConfig(inputDir, outputDir)

    // THEN the files in the output directory should be the exact same as the files in the input directory
    verifyCopiedFiles(sampleFiles, inputDir, outputDir)
  } finally {
    // Clean up test data
    cleanupTestData(testDir)
  }
})
