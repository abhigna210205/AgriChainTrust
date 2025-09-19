import {
  users,
  produceBatches,
  certificates,
  supplyChainRecords,
  type User,
  type UpsertUser,
  type ProduceBatch,
  type InsertProduceBatch,
  type Certificate,
  type InsertCertificate,
  type SupplyChainRecord,
  type InsertSupplyChainRecord,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, or } from "drizzle-orm";
import { randomUUID } from "crypto";
import { createHash } from "crypto";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Produce batch operations
  createProduceBatch(batch: InsertProduceBatch & { certificates?: File[] }): Promise<ProduceBatch>;
  getProduceBatch(id: string): Promise<ProduceBatch | undefined>;
  getProduceBatchByQR(qrCode: string): Promise<ProduceBatch | undefined>;
  getUserProduceBatches(userId: string): Promise<ProduceBatch[]>;
  getAvailableProduce(): Promise<ProduceBatch[]>;
  updateProduceBatchStatus(id: string, status: string): Promise<void>;
  
  // Certificate operations
  getCertificatesByBatchId(batchId: string): Promise<Certificate[]>;
  verifyCertificate(id: string, verifiedBy: string): Promise<void>;
  
  // Supply chain operations
  addSupplyChainRecord(record: InsertSupplyChainRecord): Promise<SupplyChainRecord>;
  getSupplyChainRecords(batchId: string): Promise<SupplyChainRecord[]>;
  
  // Search operations
  searchProduce(query: string): Promise<ProduceBatch[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Produce batch operations
  async createProduceBatch(batch: InsertProduceBatch): Promise<ProduceBatch> {
    const batchId = randomUUID();
    const qrCodeData = `FARMCHAIN_${batchId}_${Date.now()}`;
    
    const [newBatch] = await db
      .insert(produceBatches)
      .values({
        ...batch,
        id: batchId,
        qrCodeData,
      })
      .returning();

    // Create initial supply chain record
    await this.addSupplyChainRecord({
      batchId,
      userId: batch.farmerId,
      recordType: "harvest",
      location: "Farm",
      qualityNotes: `Harvested ${batch.quantity}${batch.unit} of ${batch.cropType}`,
      timestamp: new Date(),
    });

    return newBatch;
  }

  async getProduceBatch(id: string): Promise<ProduceBatch | undefined> {
    const [batch] = await db
      .select()
      .from(produceBatches)
      .where(eq(produceBatches.id, id));
    return batch;
  }

  async getProduceBatchByQR(qrCode: string): Promise<ProduceBatch | undefined> {
    const [batch] = await db
      .select()
      .from(produceBatches)
      .where(eq(produceBatches.qrCodeData, qrCode));
    return batch;
  }

  async getUserProduceBatches(userId: string): Promise<ProduceBatch[]> {
    return await db
      .select()
      .from(produceBatches)
      .where(eq(produceBatches.farmerId, userId))
      .orderBy(desc(produceBatches.createdAt));
  }

  async getAvailableProduce(): Promise<ProduceBatch[]> {
    return await db
      .select()
      .from(produceBatches)
      .where(or(
        eq(produceBatches.status, "registered"),
        eq(produceBatches.status, "delivered")
      ))
      .orderBy(desc(produceBatches.createdAt));
  }

  async updateProduceBatchStatus(id: string, status: "registered" | "in_transit" | "delivered" | "sold"): Promise<void> {
    await db
      .update(produceBatches)
      .set({ status, updatedAt: new Date() })
      .where(eq(produceBatches.id, id));
  }

  async searchProduce(query: string): Promise<ProduceBatch[]> {
    return await db
      .select()
      .from(produceBatches)
      .where(or(
        like(produceBatches.cropType, `%${query}%`),
        like(produceBatches.varietyName, `%${query}%`)
      ))
      .orderBy(desc(produceBatches.createdAt));
  }

  // Certificate operations
  async getCertificatesByBatchId(batchId: string): Promise<Certificate[]> {
    return await db
      .select()
      .from(certificates)
      .where(eq(certificates.batchId, batchId))
      .orderBy(desc(certificates.createdAt));
  }

  async verifyCertificate(id: string, verifiedBy: string): Promise<void> {
    await db
      .update(certificates)
      .set({
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy,
      })
      .where(eq(certificates.id, id));
  }

  // Supply chain operations
  async addSupplyChainRecord(record: InsertSupplyChainRecord): Promise<SupplyChainRecord> {
    // Get the last record for this batch to create hash chain
    const [lastRecord] = await db
      .select()
      .from(supplyChainRecords)
      .where(eq(supplyChainRecords.batchId, record.batchId))
      .orderBy(desc(supplyChainRecords.timestamp))
      .limit(1);

    // Create record hash for integrity
    const recordData = JSON.stringify({
      ...record,
      timestamp: record.timestamp || new Date(),
    });
    const recordHash = createHash('sha256').update(recordData).digest('hex');
    const previousRecordHash = lastRecord?.recordHash || null;

    const [newRecord] = await db
      .insert(supplyChainRecords)
      .values({
        ...record,
        id: randomUUID(),
        previousRecordHash,
        recordHash,
        timestamp: record.timestamp || new Date(),
      })
      .returning();

    return newRecord;
  }

  async getSupplyChainRecords(batchId: string): Promise<SupplyChainRecord[]> {
    return await db
      .select()
      .from(supplyChainRecords)
      .where(eq(supplyChainRecords.batchId, batchId))
      .orderBy(supplyChainRecords.timestamp);
  }
}

export const storage = new DatabaseStorage();
