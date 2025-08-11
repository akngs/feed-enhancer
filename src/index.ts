#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { argv } from "node:process"
import { load } from "js-yaml"

// Simple CLI argument parser
let inputDir: string | null = null
let outputDir: string | null = null
let configPath: string | null = null

for (let i = 2; i < argv.length; i += 2) {
  const key = argv[i]
  const value = argv[i + 1]

  if (key === "--i" && value !== undefined) {
    inputDir = value
  } else if (key === "--o" && value !== undefined) {
    outputDir = value
  } else if (key === "--c" && value !== undefined) {
    configPath = value
  } else {
    // Handle unexpected arguments
  }
}

if (!inputDir || !outputDir) {
  console.error("Usage: feed-enhancer --i <input_dir> --o <output_dir> [--c <config_path>]")
  process.exit(1)
} else {
  // Create output directory if it doesn't exist
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  // Read config file if provided
  let config: { allowList?: string[]; blockList?: string[] } | null = null
  if (configPath && existsSync(configPath)) {
    const configContent = readFileSync(configPath, "utf-8")
    const loadedConfig = load(configContent)
    // Type guard to ensure loadedConfig is an object with the expected structure
    if (loadedConfig && typeof loadedConfig === "object" && !Array.isArray(loadedConfig)) {
      config = loadedConfig as { allowList?: string[]; blockList?: string[] }
    }
  }

  // Helper function to extract title and description from content
  function extractTitleAndDescription(content: string): { title: string; description: string } {
    const titleMatch = content.match(/<title>(.*?)<\/title>/i)
    const descriptionMatch = content.match(/<description>(.*?)<\/description>/i)

    const title = titleMatch ? (titleMatch[1]?.toLowerCase() ?? "") : ""
    const description = descriptionMatch ? (descriptionMatch[1]?.toLowerCase() ?? "") : ""

    return { title, description }
  }

  // Function to check if an item matches the allow-list
  function matchesAllowList(content: string, allowList: string[] | undefined): boolean {
    // If no allow-list, everything is allowed
    if (!allowList || allowList.length === 0) {
      return true
    }

    // Extract title and description from the item
    const { title, description } = extractTitleAndDescription(content)

    return checkAllowListTerms(allowList, title, description)
  }

  // Helper function to check allow-list terms
  function checkAllowListTerms(allowList: string[], title: string, description: string): boolean {
    // Check each term in the allow-list
    for (const term of allowList) {
      if (matchesTerm(term, title, description)) {
        return true
      }
    }

    // No matching terms found
    return false
  }

  // Helper function to check if a term matches the title or description
  function matchesTerm(term: string, title: string, description: string): boolean {
    const lowerTerm = term.toLowerCase()

    // Skip if title contains "non-" + term
    const nonTermRegex = new RegExp(`non-${lowerTerm}`, "i")
    if (nonTermRegex.test(title)) {
      return false // If title contains "non-term", it's explicitly not about the term
    }

    // Create patterns that match the term as a separate word in title or description
    const titleRegex = new RegExp(`\\b${lowerTerm}\\b`, "i")
    const descriptionRegex = new RegExp(`\\b${lowerTerm}\\b`, "i")

    // Check if the term appears as a whole word in either title or description
    return titleRegex.test(title) || descriptionRegex.test(description)
  }

  // Function to check if an item matches the block-list
  function matchesBlockList(content: string, blockList: string[] | undefined): boolean {
    // If no block-list, nothing is blocked
    if (!blockList || blockList.length === 0) {
      return false
    }

    // Extract title and description from the item
    const { title, description } = extractTitleAndDescription(content)

    return checkBlockListTerms(blockList, title, description)
  }

  // Helper function to check block-list terms
  function checkBlockListTerms(blockList: string[], title: string, description: string): boolean {
    // Check each term in the block-list
    for (const term of blockList) {
      if (matchesTermSimple(term, title, description)) {
        return true
      }
    }

    // No matching terms found
    return false
  }

  // Helper function to check if a term matches the title or description (without the "non-" check)
  function matchesTermSimple(term: string, title: string, description: string): boolean {
    const lowerTerm = term.toLowerCase()

    // Create patterns that match the term as a separate word in title or description
    const titleRegex = new RegExp(`\\b${lowerTerm}\\b`, "i")
    const descriptionRegex = new RegExp(`\\b${lowerTerm}\\b`, "i")

    // Check if the term appears as a whole word in either title or description
    return titleRegex.test(title) || descriptionRegex.test(description)
  }

  // Helper function to determine if an item should be included
  function shouldIncludeItem(item: string, allowList: string[] | undefined, blockList: string[] | undefined): boolean {
    // Check if item matches allow-list
    const allowListMatch = matchesAllowList(item, allowList)

    // Check if item matches block-list
    const blockListMatch = matchesBlockList(item, blockList)

    // Item is included if it matches allow-list and doesn't match block-list
    return allowListMatch && !blockListMatch
  }

  // Helper function to remove items from content
  function removeItems(
    content: string,
    itemPositions: { item: string; start: number; end: number }[],
    itemsToKeep: { item: string; start: number; end: number }[],
  ): string {
    let result = content
    // Process items in reverse order to maintain correct indices
    for (let i = itemPositions.length - 1; i >= 0; i--) {
      const itemPos = itemPositions[i]
      if (itemPos && !shouldKeepItem(itemPos, itemsToKeep)) {
        // Remove the item from the content
        result = result.substring(0, itemPos.start) + result.substring(itemPos.end)
      }
    }

    return result
  }

  // Helper function to determine if an item should be kept
  function shouldKeepItem(
    itemPos: { item: string; start: number; end: number },
    itemsToKeep: { item: string; start: number; end: number }[],
  ): boolean {
    // Check if this item should be kept
    for (const keptItem of itemsToKeep) {
      if (keptItem.start === itemPos.start && keptItem.end === itemPos.end) {
        return true
      }
    }
    return false
  }

  // Function to filter RSS feed content based on allow-list and block-list
  function filterRSSFeed(content: string, allowList: string[] | undefined, blockList: string[] | undefined): string {
    // If no filtering is needed, return the original content
    if ((!allowList || allowList.length === 0) && (!blockList || blockList.length === 0)) {
      return content
    }

    // Parse the RSS feed
    // For simplicity, we'll use string manipulation instead of a full XML parser
    // This is a basic implementation and might not work for all RSS feeds

    // Find all item elements
    const itemRegex = /<item\b[^>]*>[\s\S]*?<\/item>/gi

    // Extract all items with their positions
    const itemPositions: { item: string; start: number; end: number }[] = []
    let lastIndex = 0

    let match: RegExpExecArray | null = itemRegex.exec(content)
    while (match !== null) {
      const start = content.indexOf(match[0], lastIndex)
      const end = start + match[0].length
      itemPositions.push({ item: match[0], start, end })
      lastIndex = end
      match = itemRegex.exec(content)
    }

    // Filter items based on allow-list and block-list
    const itemsToKeep: { item: string; start: number; end: number }[] = []

    for (const itemPos of itemPositions) {
      // Check if item matches allow-list and doesn't match block-list
      if (shouldIncludeItem(itemPos.item, allowList, blockList)) {
        itemsToKeep.push(itemPos)
      }
    }

    // Remove items that are not in the filtered set
    return removeItems(content, itemPositions, itemsToKeep)
  }

  // Helper function to process individual files
  function processFile(srcPath: string, destPath: string, fileName: string, config: { allowList?: string[]; blockList?: string[] } | null) {
    // Check if it's an XML file (likely an RSS feed)
    if (fileName.endsWith(".xml")) {
      // Read the file content
      const content = readFileSync(srcPath, "utf-8")

      // Filter the content if we have a config
      const filteredContent = config ? filterRSSFeed(content, config.allowList, config.blockList) : content

      // Write the filtered content to the destination
      writeFileSync(destPath, filteredContent)
    } else {
      // For non-XML files, just copy them as-is
      copyFileSync(srcPath, destPath)
    }
  }

  // Function to copy and filter files recursively
  function copyAndFilterFiles(src: string, dest: string, config: { allowList?: string[]; blockList?: string[] } | null) {
    const entries = readdirSync(src, { withFileTypes: true })

    for (const entry of entries) {
      const srcPath = join(src, entry.name)
      const destPath = join(dest, entry.name)

      if (entry.isDirectory()) {
        mkdirSync(destPath, { recursive: true })
        copyAndFilterFiles(srcPath, destPath, config)
      } else {
        processFile(srcPath, destPath, entry.name, config)
      }
    }
  }

  // Copy and filter files from input to output directory
  copyAndFilterFiles(inputDir, outputDir, config)
}
