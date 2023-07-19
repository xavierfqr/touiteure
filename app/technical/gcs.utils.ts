import { generateUniqueFilename } from "./stringGenerators";
import { storage } from "./gcs.init";

const GCS_API_ENDPOINT = "http://localhost:5050";

export function getFileUrl(fileName: string) {
  const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET_NAME;
  return `${GCS_API_ENDPOINT}/storage/v1/b/${bucketName}/o/${fileName}?alt=media`;
}

export const gcsUploadImageHandler = async ({
  name,
  data,
  contentType,
  filename,
}: {
  name: string;
  data: AsyncIterable<Uint8Array>;
  contentType: string;
  filename?: string;
}) => {
  const regexIsImage = /^image\//;
  const isImage = regexIsImage.test(contentType);
  if (!isImage) {
    return;
  }

  try {
    const uploadedFilename = generateUniqueFilename(filename || "random");
    const file = storage
      .bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET_NAME ?? "")
      .file(uploadedFilename);

    const writeStream = file.createWriteStream();

    for await (const chunk of data) {
      writeStream.write(chunk);
    }
    writeStream.end();

    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    console.log("File uploaded successfully.");

    return uploadedFilename;
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};
