import { createBlockListConfigFile, runFeedEnhancerTest } from "./common-test-helpers"
import { verifyFeed1ForBlockList, verifyFeed2ForBlockList } from "./shared-test-helpers"

// Helper function to verify filtered feeds for block-list
function verifyFilteredFeeds(outputDir: string) {
  // Check feed1.xml
  verifyFeed1ForBlockList(outputDir)

  // Check feed2.xml
  verifyFeed2ForBlockList(outputDir)
}

it('GIVEN a valid config file with a block-list containing "sponsored" and input feeds that include both matching and non-matching items, WHEN the user runs "feed-enhancer --c path/to/conf.yaml --i path/to/input_dir --o path/to/output_dir", THEN each output feed excludes the items that match the block-list; non-matching items are retained', () => {
  runFeedEnhancerTest("test-data-AT-0005", createBlockListConfigFile, verifyFilteredFeeds)
})
