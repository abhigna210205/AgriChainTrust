import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProduceBatchSchema, insertSupplyChainRecordSchema } from "@shared/schema";
import QRCode from "qrcode";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/certificates/",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "application/pdf"];
    cb(null, allowedMimes.includes(file.mimetype));
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.put('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userData = req.body;
      
      const updatedUser = await storage.upsertUser({
        ...userData,
        id: userId,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Produce batch routes
  app.post('/api/produce-batches', isAuthenticated, upload.array('certificates', 5), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Handle both form data (multipart) and JSON requests
      const rawData = req.body;
      const quantity = typeof rawData.quantity === 'string' ? parseFloat(rawData.quantity) : rawData.quantity;
      const pricePerUnit = rawData.pricePerUnit ? 
        (typeof rawData.pricePerUnit === 'string' ? parseFloat(rawData.pricePerUnit) : rawData.pricePerUnit) : 
        null;
      const isOrganic = typeof rawData.isOrganic === 'string' ? rawData.isOrganic === 'true' : rawData.isOrganic;
      const harvestDate = new Date(rawData.harvestDate);
      
      const batchData = insertProduceBatchSchema.parse({
        ...rawData,
        farmerId: userId,
        quantity,
        pricePerUnit,
        isOrganic,
        harvestDate,
      });

      const batch = await storage.createProduceBatch(batchData);

      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(batch.qrCodeData!);

      res.json({ ...batch, qrCodeDataUrl });
    } catch (error) {
      console.error("Error creating produce batch:", error);
      if (error.name === 'ZodError') {
        console.error("Validation errors:", error.issues);
        res.status(400).json({ message: "Validation failed", errors: error.issues });
      } else {
        res.status(500).json({ message: "Failed to create produce batch" });
      }
    }
  });

  app.get('/api/produce-batches/user/:userId', isAuthenticated, async (req, res) => {
    try {
      const batches = await storage.getUserProduceBatches(req.params.userId);
      res.json(batches);
    } catch (error) {
      console.error("Error fetching user batches:", error);
      res.status(500).json({ message: "Failed to fetch batches" });
    }
  });

  app.get('/api/produce-batches/available', async (req, res) => {
    try {
      const batches = await storage.getAvailableProduce();
      res.json(batches);
    } catch (error) {
      console.error("Error fetching available produce:", error);
      res.status(500).json({ message: "Failed to fetch available produce" });
    }
  });

  app.get('/api/produce-batches/qr/:qrCode', async (req, res) => {
    try {
      const batch = await storage.getProduceBatchByQR(req.params.qrCode);
      if (!batch) {
        return res.status(404).json({ message: "Produce batch not found" });
      }
      res.json(batch);
    } catch (error) {
      console.error("Error fetching batch by QR:", error);
      res.status(500).json({ message: "Failed to fetch batch" });
    }
  });

  app.get('/api/produce-batches/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query required" });
      }
      
      const batches = await storage.searchProduce(query);
      res.json(batches);
    } catch (error) {
      console.error("Error searching produce:", error);
      res.status(500).json({ message: "Failed to search produce" });
    }
  });

  // Supply chain records
  app.post('/api/supply-chain-records', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recordData = insertSupplyChainRecordSchema.parse({
        ...req.body,
        userId,
        temperature: req.body.temperature ? parseFloat(req.body.temperature) : null,
        humidity: req.body.humidity ? parseFloat(req.body.humidity) : null,
        expectedDelivery: req.body.expectedDelivery ? new Date(req.body.expectedDelivery) : null,
        actualDelivery: req.body.actualDelivery ? new Date(req.body.actualDelivery) : null,
      });

      const record = await storage.addSupplyChainRecord(recordData);
      
      // Update batch status if this is a delivery record
      if (recordData.recordType === 'retail' || recordData.actualDelivery) {
        await storage.updateProduceBatchStatus(recordData.batchId, 'delivered');
      }

      res.json(record);
    } catch (error) {
      console.error("Error adding supply chain record:", error);
      res.status(500).json({ message: "Failed to add supply chain record" });
    }
  });

  app.get('/api/supply-chain-records/:batchId', async (req, res) => {
    try {
      const records = await storage.getSupplyChainRecords(req.params.batchId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching supply chain records:", error);
      res.status(500).json({ message: "Failed to fetch supply chain records" });
    }
  });

  // Certificate routes
  app.get('/api/certificates/:batchId', async (req, res) => {
    try {
      const certificates = await storage.getCertificatesByBatchId(req.params.batchId);
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  // Generate QR code endpoint
  app.get('/api/qr-code/:data', async (req, res) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(req.params.data);
      res.json({ qrCodeDataUrl });
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  // Serve uploaded files
  app.use('/api/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
