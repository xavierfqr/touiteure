export function generateRandomString(length: number) {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomString = Array.from({ length }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join("");
  return randomString;
}

export function generateUniqueFilename(fileName: string) {
  const timestamp = Date.now();
  const randomString = generateRandomString(6);
  const fileExtension = fileName.split(".").pop();
  const uniqueFilename = `${timestamp}_${randomString}.${fileExtension}`;
  return uniqueFilename;
}
