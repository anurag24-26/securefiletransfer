const AWS = require("aws-sdk");

// Initialize S3 (Backblaze B2)
const s3 = new AWS.S3({
  endpoint: process.env.B2_ENDPOINT, // Uses your https://s3.us-east-005... (fine for AWS SDK)
  region: "us-east-005",
  signatureVersion: "v4",
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APP_KEY,
  },
});

/**
 * Upload a file buffer to S3/B2
 * @param {Buffer} fileBuffer - file data
 * @param {string} key - file key/path
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} public URL of uploaded file
 */
const uploadToS3 = async (fileBuffer, key, contentType) => {
  const params = {
    Bucket: process.env.B2_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  };

  await s3.putObject(params).promise();

  // ✅ FIXED: Extract hostname from endpoint for public URL
  const bucketName = process.env.B2_BUCKET_NAME;
  const endpointUrl = new URL(process.env.B2_ENDPOINT);
  const endpointHost = endpointUrl.hostname; // s3.us-east-005.backblazeb2.com
  
  // Correct public URL format for Backblaze B2
  const fileUrl = `https://${endpointHost}/${bucketName}/${key}`;
  
  // 🔍 DEBUG LOG (remove after testing)
  console.log("✅ S3 Upload complete:");
  console.log("- Bucket:", bucketName);
  console.log("- Endpoint host:", endpointHost);
  console.log("- Full URL:", fileUrl);
  
  return fileUrl;
};

module.exports = { s3, uploadToS3 };
