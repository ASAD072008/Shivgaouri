import 'dotenv/config';
import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const app = express();
app.use(express.json());

// Check if Razorpay keys exist
let razorpay: Razorpay | null = null;
const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

if (key_id && key_secret) {
  razorpay = new Razorpay({
    key_id: key_id,
    key_secret: key_secret,
  });
}

// API Routes
app.post('/api/create-order', async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ error: 'Razorpay keys not configured' });
    }
    const { amount, currency, receipt } = req.body;
    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Invalid amount (minimum 100 paise required)' });
    }

    const options = {
      amount,
      currency: currency || 'INR',
      receipt: receipt || 'receipt_' + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json({
      order_id: order.id,
      key_id: key_id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (!key_secret) {
      return res.status(500).json({ error: 'Razorpay keys not configured' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default app;
