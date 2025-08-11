// Helper functions for test files
import { execSync } from "node:child_process"
import { existsSync, mkdirSync, rmSync } from "node:fs"
import { resolve } from "node:path"

/**
 * Cleans up test data by removing the test directory recursively.
 * @param testDir - The path to the test directory to be removed.
 */
export function cleanupTestData(testDir: string) {
  if (existsSync(testDir)) {
    rmSync(testDir, { recursive: true })
  }
}

/**
 * Creates test directories for input and output.
 * @param inputDir - The path to the input directory.
 * @param outputDir - The path to the output directory.
 */
export function createTestDirectories(inputDir: string, outputDir: string) {
  mkdirSync(inputDir, { recursive: true })
  mkdirSync(outputDir, { recursive: true })
}

/**
 * Runs the feed enhancer CLI tool with the specified parameters.
 * @param configPath - The path to the config file.
 * @param inputDir - The path to the input directory.
 * @param outputDir - The path to the output directory.
 */
export function runFeedEnhancer(configPath: string, inputDir: string, outputDir: string) {
  // Build the project first

  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" })

  // Run the CLI tool
  // This is a test helper, so it's safe to execute OS commands here.
  // We validate that the paths are within the project directory for additional safety.
  const projectRoot = process.cwd()
  const resolvedInputDir = resolve(inputDir)
  const resolvedOutputDir = resolve(outputDir)

  // Basic security check to ensure paths are within project directory
  if (!resolvedInputDir.startsWith(projectRoot) || !resolvedOutputDir.startsWith(projectRoot)) {
    throw new Error("Input and output directories must be within the project directory")
  }

  let command = `node dist/index.js --i ${inputDir} --o ${outputDir}`
  if (configPath) {
    // Validate config path as well
    const resolvedConfigPath = resolve(configPath)
    if (!resolvedConfigPath.startsWith(projectRoot)) {
      throw new Error("Config file must be within the project directory")
    }
    command += ` --c ${configPath}`
  }

  // eslint-disable-next-line sonarjs/os-command
  execSync(command, {
    cwd: process.cwd(),
    stdio: "pipe",
  })
}
