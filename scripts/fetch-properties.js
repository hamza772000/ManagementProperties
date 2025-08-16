#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function fetchProperties() {
  // Try different URL patterns based on environment
  const possibleUrls = [
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/properties` : null,
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api/properties` : null,
    'http://localhost:3000/api/properties',
  ].filter(Boolean);
  
  console.log(`Attempting to fetch properties from available URLs...`);
  
  for (const url of possibleUrls) {
    try {
      console.log(`Trying: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const properties = await response.json();
      
      const outputPath = path.join(__dirname, '../src/data/static-properties.json');
      fs.writeFileSync(outputPath, JSON.stringify(properties, null, 2));
      
      console.log(`✓ Successfully fetched ${properties.length} properties and saved to static-properties.json`);
      return properties;
    } catch (error) {
      console.warn(`✗ Failed to fetch from ${url}:`, error.message);
      continue;
    }
  }
  
  // If all URLs failed, create empty file
  console.warn('⚠️ All fetch attempts failed, creating empty static properties file');
  const outputPath = path.join(__dirname, '../src/data/static-properties.json');
  fs.writeFileSync(outputPath, JSON.stringify([], null, 2));
  return [];
}

// Run if called directly
if (require.main === module) {
  fetchProperties().catch(console.error);
}

module.exports = fetchProperties;
