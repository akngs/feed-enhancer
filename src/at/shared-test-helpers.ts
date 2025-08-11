import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

/**
 * Creates sample RSS feeds for testing.
 * @param inputDir - The path to the input directory where the feeds will be created.
 */
export function createSampleFeeds(inputDir: string) {
  // Create an RSS feed with items that match both allow-list and block-list
  const rssFeedWithMatches = `<?xml version="1.0"?>
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
    <item>
      <title>Sponsored Content</title>
      <description>Advertisement</description>
    </item>
  </channel>
</rss>`

  writeFileSync(join(inputDir, "feed1.xml"), rssFeedWithMatches)

  // Create another RSS feed with items that match both allow-list and block-list
  const rssFeedWithMoreMatches = `<?xml version="1.0"?>
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
</rss>`

  writeFileSync(join(inputDir, "feed2.xml"), rssFeedWithMoreMatches)
}

/**
 * Checks if a feed contains all expected items.
 * @param feedContent - The content of the feed.
 * @param feedName - The name of the feed file.
 * @param expectedItems - An array of items that should be present in the feed.
 */
function checkExpectedItems(feedContent: string, feedName: string, expectedItems: string[]) {
  for (const item of expectedItems) {
    if (!feedContent.includes(item)) {
      throw new Error(`${feedName} does not contain the expected '${item}' item`)
    }
  }
}

/**
 * Checks if a feed contains any unexpected items.
 * @param feedContent - The content of the feed.
 * @param feedName - The name of the feed file.
 * @param unexpectedItems - An array of items that should not be present in the feed.
 */
function checkUnexpectedItems(feedContent: string, feedName: string, unexpectedItems: string[]) {
  for (const item of unexpectedItems) {
    if (feedContent.includes(item)) {
      throw new Error(`${feedName} should not contain the '${item}' item`)
    }
  }
}

/**
 * Verifies a feed item by checking expected and unexpected items.
 * @param outputDir - The path to the output directory.
 * @param feedName - The name of the feed file to verify.
 * @param expectedItems - An array of items that should be present in the feed.
 * @param unexpectedItems - An array of items that should not be present in the feed.
 */
function verifyFeedItem(outputDir: string, feedName: string, expectedItems: string[], unexpectedItems: string[]) {
  const outputFeedPath = join(outputDir, feedName)
  if (!existsSync(outputFeedPath)) {
    throw new Error(`${feedName} was not created in the output directory`)
  }

  const outputFeedContent = readFileSync(outputFeedPath, "utf-8")

  // Check that it contains the expected items
  checkExpectedItems(outputFeedContent, feedName, expectedItems)

  // Check that it doesn't contain the unexpected items
  checkUnexpectedItems(outputFeedContent, feedName, unexpectedItems)
}

/**
 * Verifies feed1 for allow-list filtering.
 * @param outputDir - The path to the output directory.
 */
export function verifyFeed1ForAllowList(outputDir: string) {
  verifyFeedItem(outputDir, "feed1.xml", ["Tech News"], ["Sports News"])
}

/**
 * Verifies feed2 for allow-list filtering.
 * @param outputDir - The path to the output directory.
 */
export function verifyFeed2ForAllowList(outputDir: string) {
  verifyFeedItem(outputDir, "feed2.xml", ["New Technology"], ["Weather Forecast"])
}

/**
 * Verifies feed1 for block-list filtering.
 * @param outputDir - The path to the output directory.
 */
export function verifyFeed1ForBlockList(outputDir: string) {
  verifyFeedItem(outputDir, "feed1.xml", ["Tech News", "Sports News"], ["Sponsored Content"])
}

/**
 * Verifies feed2 for block-list filtering.
 * @param outputDir - The path to the output directory.
 */
export function verifyFeed2ForBlockList(outputDir: string) {
  verifyFeedItem(outputDir, "feed2.xml", ["New Technology", "Weather Forecast"], [])
}
