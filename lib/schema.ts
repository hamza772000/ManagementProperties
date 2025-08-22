import { pgTable, serial, varchar, integer, boolean, decimal, timestamp, json } from 'drizzle-orm/pg-core';

export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  address: varchar('address', { length: 500 }),
  area: varchar('area', { length: 100 }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  priceUnit: varchar('price_unit', { length: 10 }).notNull(), // 'pcm' | 'pa'
  salePriceUnit: varchar('sale_price_unit', { length: 20 }), // 'Guide Price' | 'Fixed Price' etc.
  status: varchar('status', { length: 10 }).notNull(), // 'rent' | 'sale' | 'commercial'
  availability: varchar('availability', { length: 20 }), // 'LET' | 'SOLD' | 'SALE AGREED'
  beds: integer('beds').default(0),
  baths: integer('baths').default(0),
  featured: boolean('featured').default(false),
  lat: decimal('lat', { precision: 10, scale: 7 }).default('0'),
  lng: decimal('lng', { precision: 10, scale: 7 }).default('0'),
  images: json('images').$type<string[]>().default([]),
  description: varchar('description', { length: 2000 }),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});