import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const { matchesAllowList } = require('../dist/index.js');

// Test data
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