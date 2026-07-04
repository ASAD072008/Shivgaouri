import Razorpay from "razorpay";
import crypto from "crypto";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
}
