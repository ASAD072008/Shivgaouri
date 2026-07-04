require('dotenv').config({ override: true });
console.log("ID length:", process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.length : "missing");
