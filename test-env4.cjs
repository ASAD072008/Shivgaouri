require('dotenv').config({ override: true });
console.log("VITE_RAZORPAY_KEY_ID:", process.env.VITE_RAZORPAY_KEY_ID ? "present" : "missing");
