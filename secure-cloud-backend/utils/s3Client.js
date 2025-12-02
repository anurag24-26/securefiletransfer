const AWS = require("aws-sdk");

// Initialize S3 (Backblaze B2)
const s3 = new AWS.S3({
  endpoint: process.env.B2_ENDPOINT, // no https://
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

  // Generate public URL
  const fileUrl = `https://${process.env.B2_BUCKET_NAME}.${process.env.B2_ENDPOINT}/${key}`;
  return fileUrl;
};

module.exports = { s3, uploadToS3 };
