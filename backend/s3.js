
import dotenv from 'dotenv'
import aws from 'aws-sdk'
import crypto from 'crypto'
import { promisify } from "util"
const randomBytes = promisify(crypto.randomBytes)

dotenv.config()

const region = "us-east-2"
const bucketName = "closetcanvas-user-id"
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: 'v4'
})

export async function generateUploadURL(filename, filetype) {
  // Add random string to avoid overwriting same filenames
  const rawBytes = await randomBytes(8);
  const uniqueSuffix = rawBytes.toString('hex');

  // ✅ Combine suffix and original filename correctly
  const imageName = `${uniqueSuffix}-${filename}`;

  const params = {
    Bucket: bucketName,
    Key: imageName,      // this will be the S3 object name
    Expires: 60,
    ContentType: filetype,
  };

  const uploadURL = await s3.getSignedUrlPromise('putObject', params);
  return uploadURL;
}


