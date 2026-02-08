/**
 * Image Utility Functions
 * Helpers for working with map images from different storage sources
 */

/**
 * Determine if an image URL points to database storage
 * @param imageUrl - The image URL to check
 * @returns true if the image is stored in the database
 */
export function isDatabaseImage(imageUrl: string): boolean {
  return imageUrl.startsWith("/api/images/");
}

/**
 * Determine if an image URL points to local storage
 * @param imageUrl - The image URL to check
 * @returns true if the image is stored locally
 */
export function isLocalImage(imageUrl: string): boolean {
  return imageUrl.startsWith("/maps/");
}

/**
 * Get the image ID from a database image URL
 * @param imageUrl - The database image URL
 * @returns The image ID or null if not a database image
 */
export function getImageIdFromUrl(imageUrl: string): string | null {
  if (!isDatabaseImage(imageUrl)) return null;
  return imageUrl.replace("/api/images/", "");
}

/**
 * Get the storage type for an image URL
 * @param imageUrl - The image URL
 * @returns "database", "local", or "external"
 */
export function getImageStorageType(
  imageUrl: string,
): "database" | "local" | "external" {
  if (isDatabaseImage(imageUrl)) return "database";
  if (isLocalImage(imageUrl)) return "local";
  return "external";
}

/**
 * Format bytes to human-readable size
 * @param bytes - Size in bytes
 * @returns Formatted string like "1.5 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
