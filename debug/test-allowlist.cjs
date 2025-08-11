// Simple test for matchesAllowList function
function matchesAllowList(content, allowList) {
  if (!allowList || allowList.length === 0) {
    return true; // If no allow-list, everything is allowed
  }

  // Extract title and description from the item
  const titleMatch = content.match(/<title>(.*?)<\/title>/i);
  const descriptionMatch = content.match(/<description>(.*?)<\/description>/i);

  const title = titleMatch ? titleMatch[1].toLowerCase() : "";
  const description = descriptionMatch ? descriptionMatch[1].toLowerCase() : "";

  // Combine title and description for checking
  const combinedContent = `${title} ${description}`;

  // Check if any term in the allow-list appears as a standalone word in the content
  return allowList.some(term => {
    const lowerTerm = term.toLowerCase();
    // Split the combined content into words and check if any word matches the term exactly
    const words = combinedContent.split(/\s+/);
    return words.some(word => {
      // Remove punctuation from the word
      const cleanWord = word.replace(/[.!?,:;\-]/g, '');
      return cleanWord === lowerTerm;
    });
  });
}

// Test case from the failing test
const testItem = `<item>
      <title>Non-Tech News Item</title>
      <description>This is not a tech news item</description>
    </item>`;

const allowList = ["tech"];

const result = matchesAllowList(testItem, allowList);
console.log("Result:", result); // Should be false

// Additional test cases
const testItem2 = `<item>
      <title>Tech News Item 1</title>
      <description>This is a tech news item</description>
    </item>`;

const result2 = matchesAllowList(testItem2, allowList);
console.log("Result2:", result2); // Should be true

// Test with partial match that should not match
const testItem3 = `<item>
      <title>Technology News Item</title>
      <description>This is about technology</description>
    </item>`;

const result3 = matchesAllowList(testItem3, allowList);
console.log("Result3:", result3); // Should be false