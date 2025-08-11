import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { createSampleFeeds } from "./shared-test-helpers"
import { cleanupTestData, createTestDirectories, runFeedEnhancer } from "./test-helpers"

/**
 * Creates a config file with an allow-list containing "tech".
 * @param configPath - The path to the config file to be created.
 */
export function createAllowListConfigFile(configPath: string) {
  const configContent = `
allowList:
  - "tech"
`
  writeFileSync(configPath, configContent)
}

/**
 * Creates a config file with a block-list containing "sponsored".
 * @param configPath - The path to the config file to be created.
 */
export function createBlockListConfigFile(configPath: string) {
  const configContent = `
blockList:
  - "sponsored"
`
  writeFileSync(configPath, configContent)
}

/**
 * Runs a feed enhancer test with the given parameters.
 * @param testDirName - The name of the test directory.
 * @param configFileCreator - A function that creates the config file.
 * @param feedVerifier - A function that verifies the output feeds.
 */
export function runFeedEnhancerTest(testDirName: string, configFileCreator: (configPath: string) => void, feedVerifier: (outputDir: string) => void) {
  // GIVEN a valid config file with the specified list and input feeds that include both matching and non-matching items
  const testDir = join(__dirname, testDirName)
  const inputDir = join(testDir, "input")
  const outputDir = join(testDir, "output")
  const configPath = join(testDir, "conf.yaml")

  // Clean up any existing test data
  cleanupTestData(testDir)

  try {
    // Set up test data
    setupTestData(inputDir, outputDir, configPath, configFileCreator)

    // WHEN the user runs "feed-enhancer --c path/to/conf.yaml --i path/to/input_dir --o path/to/output_dir"
    runFeedEnhancer(configPath, inputDir, outputDir)

    // THEN each output feed contains only the items according to the filtering rules
    feedVerifier(outputDir)
  } finally {
    // Clean up test data
    cleanupTestData(testDir)
  }
}

/**
 * Sets up test data for a feed enhancer test.
 * @param inputDir - The path to the input directory.
 * @param outputDir - The path to the output directory.
 * @param configPath - The path to the config file.
 * @param configFileCreator - A function that creates the config file.
 */
function setupTestData(inputDir: string, outputDir: string, configPath: string, configFileCreator: (configPath: string) => void) {
  // Create test directories
  createTestDirectories(inputDir, outputDir)

  // Create config file
  configFileCreator(configPath)

  // Create sample RSS feeds
  createSampleFeeds(inputDir)
}
