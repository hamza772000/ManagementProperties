import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Get database URL from environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create the connection with better error handling
const client = postgres(connectionString, { 
  max: 1,
  onnotice: () => {} // Suppress notices in development
});

// Create and export the database instance
export const db = drizzle(client, { schema });

// Export types for better TypeScript support
export type Database = typeof db;