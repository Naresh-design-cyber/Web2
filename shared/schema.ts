import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  paymentCustomerId: varchar("payment_customer_id"),
  subscriptionId: varchar("subscription_id"),
  subscriptionStatus: varchar("subscription_status"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// URLs table
export const urls = pgTable("urls", {
  id: serial("id").primaryKey(),
  originalUrl: text("original_url").notNull(),
  shortCode: varchar("short_code", { length: 10 }).notNull().unique(),
  customAlias: varchar("custom_alias", { length: 50 }),
  userId: varchar("user_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Analytics table for click tracking
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  urlId: integer("url_id").references(() => urls.id).notNull(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  referer: text("referer"),
  country: varchar("country"),
  city: varchar("city"),
  device: varchar("device"),
  browser: varchar("browser"),
  os: varchar("os"),
  clickedAt: timestamp("clicked_at").defaultNow(),
});

// QR codes table
export const qrCodes = pgTable("qr_codes", {
  id: serial("id").primaryKey(),
  urlId: integer("url_id").references(() => urls.id).notNull(),
  qrCodeData: text("qr_code_data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  urls: many(urls),
}));

export const urlsRelations = relations(urls, ({ one, many }) => ({
  user: one(users, {
    fields: [urls.userId],
    references: [users.id],
  }),
  analytics: many(analytics),
  qrCodes: many(qrCodes),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
  url: one(urls, {
    fields: [analytics.urlId],
    references: [urls.id],
  }),
}));

export const qrCodesRelations = relations(qrCodes, ({ one }) => ({
  url: one(urls, {
    fields: [qrCodes.urlId],
    references: [urls.id],
  }),
}));

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertUrlSchema = createInsertSchema(urls).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  clickedAt: true,
});

export type InsertUrl = z.infer<typeof insertUrlSchema>;
export type Url = typeof urls.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type QrCode = typeof qrCodes.$inferSelect;
