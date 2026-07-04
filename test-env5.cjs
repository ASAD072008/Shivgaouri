require('dotenv').config({ override: true });
console.log("ID first char:", process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID[0] : "missing");
console.log("Secret first char:", process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET[0] : "missing");
