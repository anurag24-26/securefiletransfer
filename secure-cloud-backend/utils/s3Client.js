const AWS = require("aws-sdk");

// Force AWS SDK v2 behavior
AWS.config.update({
  accessKeyId: process.env.B2_KEY_ID,
  secretAccessKey: process.env.B2_APP_KEY,
  region: "us-east-005",
});

const s3 = new AWS.S3({
  endpoint: process.env.B2_ENDPOINT,
  signatureVersion: "v4",
  s3ForcePathStyle: true, // ✅ REQUIRED for Backblaze B2
});

/**
 * Upload buffer to Backblaze B2
 */
const uploadToS3 = async (fileBuffer, key, contentType) => {
  const params = {
    Bucket: process.env.B2_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  };

  await s3.upload(params).promise();

  const endpointHost = new URL(process.env.B2_ENDPOINT).hostname;
  return `https://${endpointHost}/${process.env.B2_BUCKET_NAME}/${key}`;
};

module.exports = s3;
module.exports.uploadToS3 = uploadToS3;
