require('dotenv').config({ override: true });
const id = process.env.RAZORPAY_KEY_ID;
const secret = process.env.RAZORPAY_KEY_SECRET;
console.log("ID has whitespace?", /\s/.test(id));
console.log("Secret has whitespace?", /\s/.test(secret));
