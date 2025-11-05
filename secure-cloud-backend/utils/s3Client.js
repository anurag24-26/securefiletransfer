// utils/s3Client.js
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  endpoint: process.env.B2_ENDPOINT,  // ✅ no extra https://
  region: "us-east-005",
  signatureVersion: "v4",
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APP_KEY,
  },
});

module.exports = s3;
