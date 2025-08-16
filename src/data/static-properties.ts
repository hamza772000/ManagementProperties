import { Property } from "../types/Property";

// This file will be generated at build time by scripts/fetch-properties.js
// If the file doesn't exist, an empty array will be used as fallback

let staticProperties: Property[] = [];

try {
  staticProperties = require('./static-properties.json');
} catch (e) {
  console.warn('Static properties file not found, using empty fallback');
  staticProperties = [];
}

export default staticProperties;
