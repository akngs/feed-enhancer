import { createAllowListConfigFile, runFeedEnhancerTest } from "./common-test-helpers"
import { verifyFeed1ForAllowList, verifyFeed2ForAllowList } from "./shared-test-helpers"

// Helper function to verify filtered feeds for allow-list
function verifyFilteredFeeds(outputDir: string) {
  // Check feed1.xml
  verifyFeed1ForAllowList(outputDir)

  // Check feed2.xml
  verifyFeed2ForAllowList(outputDir)
}

it('GIVEN a valid config file with an allow-list containing "tech" and input feeds that include both matching and non-matching items, WHEN the user runs "feed-enhancer --c path/to/conf.yaml --i path/to/input_dir --o path/to/output_dir", THEN each output feed contains only the items that match the allow-list; non-matching items are excluded', () => {
  runFeedEnhancerTest("test-data-AT-0003", createAllowListConfigFile, verifyFilteredFeeds)
})
