import { Storage } from "@google-cloud/storage";

const GCS_API_ENDPOINT = "http://localhost:5050";

const storage = new Storage({
  projectId: process.env.GOOGLE_STORAGE_PROJECT_ID,
  apiEndpoint: GCS_API_ENDPOINT
});

async function createOrFindBucket() {
  const [buckets] = await storage.getBuckets();
  const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET_NAME;

  const foundBucket = buckets.find(({ name }) => name === bucketName);

  if (foundBucket) {
    console.log(`Bucket "${bucketName}" found!`);
    return foundBucket;
  } else if (bucketName) {
    await storage.createBucket(bucketName);
    console.log(`Bucket "${bucketName}" created!`);
  } else {
    console.log(`Failed to create bucket "${bucketName}"`);
  }
}
createOrFindBucket();

export { storage };
