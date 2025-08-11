import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { cleanupTestData, createTestDirectories, runFeedEnhancer } from "./test-helpers"

it('GIVEN a valid config file with an allow-list whose terms do not match any items in the input feeds, WHEN the user runs "feed-enhancer --c path/to/conf.yaml --i path/to/input_dir --o path/to/output_dir", THEN the corresponding output feeds are valid but contain zero items', () => {
  // GIVEN a valid config file with an allow-list whose terms do not match any items in the input feeds
  const testDir = join(__dirname, "test-data-AT-0004")
  const inputDir = join(testDir, "input")
  const outputDir = join(testDir, "output")
  const configPath = join(testDir, "conf.yaml")

  // Clean up any existing test data
  cleanupTestData(testDir)

  try {
    // Set up test data
    setupTestDataForEmptyResult(inputDir, outputDir, configPath)

    // WHEN the user runs "feed-enhancer --c path/to/conf.yaml --i path/to/input_dir --o path/to/output_dir"
    runFeedEnhancer(configPath, inputDir, outputDir)

    // THEN the corresponding output feeds are valid but contain zero items
    verifyEmptyFeeds(outputDir)
  } finally {
    // Clean up test data
    cleanupTestData(testDir)
  }
})

// Helper function to set up test data for empty result
function setupTestDataForEmptyResult(inputDir: string, outputDir: string, configPath: string) {
  // Create test directories
  createTestDirectories(inputDir, outputDir)

  // Create config file with "politics" allow-list
  writeFileSync(
    configPath,
    `allowList:
  - politics
`,
  )

  // Create sample RSS feeds without any "politics" items
  const sampleFeeds = [
    {
      name: "feed1.xml",
      content: `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Test Feed 1</title>
    <item>
      <title>Tech News</title>
      <description>Latest technology updates</description>
    </item>
    <item>
      <title>Sports News</title>
      <description>Latest sports updates</description>
    </item>
  </channel>
</rss>`,
    },
    {
      name: "feed2.xml",
      content: `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Test Feed 2</title>
    <item>
      <title>New Technology</title>
      <description>Information about new tech</description>
    </item>
    <item>
      <title>Weather Forecast</title>
      <description>Today's weather forecast</description>
    </item>
  </channel>
</rss>`,
    },
  ]

  for (const feed of sampleFeeds) {
    writeFileSync(join(inputDir, feed.name), feed.content)
  }
}

// Helper function to verify empty feeds
function verifyEmptyFeeds(outputDir: string) {
  // Check feed1.xml
  verifyFeed1IsEmpty(outputDir)

  // Check feed2.xml
  verifyFeed2IsEmpty(outputDir)
}

// Helper function to verify feed1 is empty
function verifyFeed1IsEmpty(outputDir: string) {
  const outputFeed1Path = join(outputDir, "feed1.xml")
  if (!existsSync(outputFeed1Path)) {
    throw new Error("Feed1 was not created in the output directory")
  }

  const outputFeed1Content = readFileSync(outputFeed1Path, "utf-8")
  // Check that it doesn't contain any items
  const itemMatches = outputFeed1Content.match(/<item\b/g)
  if (itemMatches && itemMatches.length > 0) {
    throw new Error("Feed1 should not contain any items")
  }
}

// Helper function to verify feed2 is empty
function verifyFeed2IsEmpty(outputDir: string) {
  const outputFeed2Path = join(outputDir, "feed2.xml")
  if (!existsSync(outputFeed2Path)) {
    throw new Error("Feed2 was not created in the output directory")
  }

  const outputFeed2Content = readFileSync(outputFeed2Path, "utf-8")
  // Check that it doesn't contain any items
  const itemMatches2 = outputFeed2Content.match(/<item\b/g)
  if (itemMatches2 && itemMatches2.length > 0) {
    throw new Error("Feed2 should not contain any items")
  }
}
