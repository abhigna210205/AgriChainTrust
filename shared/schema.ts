import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  uuid
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  userType: varchar("user_type", { enum: ["farmer", "distributor", "consumer"] }).notNull().default("consumer"),
  location: varchar("location"),
  organizationName: varchar("organization_name"),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Produce batches table
export const produceBatches = pgTable("produce_batches", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  farmerId: varchar("farmer_id").notNull().references(() => users.id),
  cropType: varchar("crop_type").notNull(),
  varietyName: varchar("variety_name"),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit").notNull().default("kg"),
  harvestDate: timestamp("harvest_date").notNull(),
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }),
  isOrganic: boolean("is_organic").notNull().default(false),
  qrCodeData: text("qr_code_data").unique(),
  status: varchar("status", { enum: ["registered", "in_transit", "delivered", "sold"] }).notNull().default("registered"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Certificates table
export const certificates = pgTable("certificates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: uuid("batch_id").notNull().references(() => produceBatches.id, { onDelete: "cascade" }),
  certificateType: varchar("certificate_type").notNull(), // organic, fair_trade, etc.
  issuerName: varchar("issuer_name").notNull(),
  certificateNumber: varchar("certificate_number"),
  filePath: varchar("file_path").notNull(),
  fileName: varchar("file_name").notNull(),
  fileSize: integer("file_size"),
  isVerified: boolean("is_verified").notNull().default(false),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: varchar("verified_by"),
  expiryDate: timestamp("expiry_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Supply chain records table (immutable blockchain-like records)
export const supplyChainRecords = pgTable("supply_chain_records", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: uuid("batch_id").notNull().references(() => produceBatches.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  recordType: varchar("record_type", { 
    enum: ["harvest", "storage", "transport", "processing", "retail", "quality_check"] 
  }).notNull(),
  location: varchar("location"),
  temperature: decimal("temperature", { precision: 5, scale: 2 }),
  humidity: decimal("humidity", { precision: 5, scale: 2 }),
  storageConditions: varchar("storage_conditions"),
  transportMethod: varchar("transport_method"),
  expectedDelivery: timestamp("expected_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  qualityNotes: text("quality_notes"),
  additionalData: jsonb("additional_data"),
  previousRecordHash: varchar("previous_record_hash"), // For blockchain-like integrity
  recordHash: varchar("record_hash").notNull().unique(), // SHA256 of record data
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  produceBatches: many(produceBatches),
  supplyChainRecords: many(supplyChainRecords),
}));

export const produceBatchesRelations = relations(produceBatches, ({ one, many }) => ({
  farmer: one(users, {
    fields: [produceBatches.farmerId],
    references: [users.id],
  }),
  certificates: many(certificates),
  supplyChainRecords: many(supplyChainRecords),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  batch: one(produceBatches, {
    fields: [certificates.batchId],
    references: [produceBatches.id],
  }),
}));

export const supplyChainRecordsRelations = relations(supplyChainRecords, ({ one }) => ({
  batch: one(produceBatches, {
    fields: [supplyChainRecords.batchId],
    references: [produceBatches.id],
  }),
  user: one(users, {
    fields: [supplyChainRecords.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProduceBatchSchema = createInsertSchema(produceBatches).omit({
  id: true,
  qrCodeData: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  createdAt: true,
});

export const insertSupplyChainRecordSchema = createInsertSchema(supplyChainRecords).omit({
  id: true,
  previousRecordHash: true,
  recordHash: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ProduceBatch = typeof produceBatches.$inferSelect;
export type InsertProduceBatch = z.infer<typeof insertProduceBatchSchema>;
export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type SupplyChainRecord = typeof supplyChainRecords.$inferSelect;
export type InsertSupplyChainRecord = z.infer<typeof insertSupplyChainRecordSchema>;
