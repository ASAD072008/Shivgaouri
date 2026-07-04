require('dotenv').config({ override: true });
console.log("ID starts with:", process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 9) : "missing");
console.log("Secret length:", process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.length : "missing");
