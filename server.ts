import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config({ override: true });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/create-order", async (req, res) => {
    try {
      const { amount, currency = "INR", receipt } = req.body;
      
      if (!amount || amount < 100) {
        return res.status(400).json({ error: "Invalid amount. Minimum 100 paise." });
      }

      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        return res.status(400).json({ 
          error: "Razorpay API keys are missing on the server. Please define RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables via the Settings/Secrets panel." 
        });
      }

      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const options = {
        amount,
        currency,
        receipt,
      };

      const order = await razorpay.orders.create(options);
      res.json({ ...order, razorpay_key_id: keyId });
    } catch (error: any) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: error.error?.description || error.message || "Failed to create order" });
    }
  });

  app.post("/api/verify-payment", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        return res.status(400).json({ error: "Razorpay API key secret is missing on the server." });
      }
      
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature === razorpay_signature) {
        // Payment verified successfully
        res.json({ success: true, message: "Payment verified successfully" });
      } else {
        // Signature mismatched
        res.status(400).json({ success: false, error: "Invalid signature" });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
