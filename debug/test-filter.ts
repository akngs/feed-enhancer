// Test the updated function
function matchesAllowList(content: string, allowList: string[] | undefined): boolean {
  if (!allowList || allowList.length === 0) {
    return true; // If no allow-list, everything is allowed
  }
  
  // Extract title and description from the item
  const titleMatch = content.match(/<title>(.*?)<\/title>/i);
  const descriptionMatch = content.match(/<description>(.*?)<\/description>/i);
  
  const title = titleMatch ? (titleMatch[1] ? titleMatch[1].toLowerCase() : "") : "";
  const description = descriptionMatch ? (descriptionMatch[1] ? descriptionMatch[1].toLowerCase() : "") : "";
  
  // Check if any term in the allow-list appears in either the title or description (as a whole word)
  return allowList.some(term => {
    const lowerTerm = term.toLowerCase();
    // Create patterns that match the term as a separate word in title or description
    const titleRegex = new RegExp(`\\b${lowerTerm}\\b`, 'i');
    const descriptionRegex = new RegExp(`\\b${lowerTerm}\\b`, 'i');
    
    // Check if the term appears as a whole word in either title or description
    return titleRegex.test(title) || descriptionRegex.test(description);
  });
}

// Test data from the actual test case
const itemContent = `<item>
  <title>Non-Tech News Item</title>
  <description>This is not a tech news item</description>
</item>`;

const allowList = ['tech'];

// Test the function
const result = matchesAllowList(itemContent, allowList);
console.log('Item content:', itemContent);
console.log('Allow list:', allowList);
console.log('Matches allow list:', result);

// Test with a matching item (title matches)
const matchingItemContent = `<item>
  <title>Tech News Item 1</title>
  <description>This is a tech news item</description>
</item>`;

const matchingResult = matchesAllowList(matchingItemContent, allowList);
console.log('\nMatching item content (title matches):', matchingItemContent);
console.log('Matches allow list:', matchingResult);

// Test with another non-matching item
const nonMatchingItemContent2 = `<item>
  <title>Entertainment News Item</title>
  <description>This is an entertainment news item</description>
</item>`;

const nonMatchingResult2 = matchesAllowList(nonMatchingItemContent2, allowList);
console.log('\nNon-matching item content 2:', nonMatchingItemContent2);
console.log('Matches allow list:', nonMatchingResult2);

// Test with exact match in title
const exactMatchItemContent = `<item>
  <title>tech</title>
  <description></description>
</item>`;

const exactMatchResult = matchesAllowList(exactMatchItemContent, allowList);
console.log('\nExact match item content:', exactMatchItemContent);
console.log('Matches allow list:', exactMatchResult);

// Test with match in description only
const descriptionMatchItemContent = `<item>
  <title>News Item</title>
  <description>This is a tech news item</description>
</item>`;

const descriptionMatchResult = matchesAllowList(descriptionMatchItemContent, allowList);
console.log('\nDescription match item content:', descriptionMatchItemContent);
console.log('Matches allow list:', descriptionMatchResult);