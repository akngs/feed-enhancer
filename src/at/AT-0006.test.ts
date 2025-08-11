import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { cleanupTestData, createTestDirectories, runFeedEnhancer } from "./test-helpers"

it('GIVEN a valid config file with a block-list whose terms match all items in the input feeds, WHEN the user runs "feed-enhancer --c path/to/conf.yaml --i path/to/input_dir --o path/to/output_dir", THEN the corresponding output feeds are valid but contain zero items', () => {
  // GIVEN a valid config file with a block-list whose terms match all items in the input feeds
  const testDir = join(__dirname, "test-data-AT-0006")
  const inputDir = join(testDir, "input")
  const outputDir = join(testDir, "output")
  const configPath = join(testDir, "conf.yaml")

  // Clean up any existing test data
  cleanupTestData(testDir)

  try {
    // Set up test data
    setupTestDataForZeroItems(inputDir, outputDir, configPath)

    // WHEN the user runs "feed-enhancer --c path/to/conf.yaml --i path/to/input_dir --o path/to/output_dir"
    runFeedEnhancer(configPath, inputDir, outputDir)

    // THEN the corresponding output feeds are valid but contain zero items
    verifyZeroItemsFeeds(outputDir)
  } finally {
    // Clean up test data
    cleanupTestData(testDir)
  }
})

// Helper function to set up test data for zero items
function setupTestDataForZeroItems(inputDir: string, outputDir: string, configPath: string) {
  // Create test directories
  createTestDirectories(inputDir, outputDir)

  // Create config file with "tech" block-list (matches all items in our sample feeds)
  writeFileSync(
    configPath,
    `blockList:
  - tech
`,
  )

  // Create sample RSS feeds where all items contain "tech"
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
      <title>More Tech News</title>
      <description>Even more technology updates</description>
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
      <title>Tech Gadgets</title>
      <description>Latest tech gadgets</description>
    </item>
  </channel>
</rss>`,
    },
  ]

  for (const feed of sampleFeeds) {
    writeFileSync(join(inputDir, feed.name), feed.content)
  }
}

// Helper function to verify zero items feeds
function verifyZeroItemsFeeds(outputDir: string) {
  // Check feed1.xml
  verifyFeed1HasZeroItems(outputDir)

  // Check feed2.xml
  verifyFeed2HasZeroItems(outputDir)
}

// Helper function to verify feed1 has zero items
function verifyFeed1HasZeroItems(outputDir: string) {
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

// Helper function to verify feed2 has zero items
function verifyFeed2HasZeroItems(outputDir: string) {
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
