import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const { matchesAllowList } = require('./dist/index.js');

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