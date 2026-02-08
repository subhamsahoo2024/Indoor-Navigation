import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import sharp from "sharp";

/**
 * Compression settings for different image quality levels
 */
const COMPRESSION_CONFIG = {
  // WebP format provides best compression with good quality
  format: "webp" as const,
  // Quality setting (0-100), 80 is a good balance
  quality: 80,
  // Maximum dimensions (maintains aspect ratio)
  maxWidth: 2048,
  maxHeight: 2048,
};

/**
 * Compress and convert image to WebP format
 * @param buffer - Original image buffer
 * @returns Compressed image buffer and metadata
 */
async function compressImage(buffer: Buffer): Promise<{
  data: Buffer;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}> {
  const originalSize = buffer.length;

  // Get original image metadata
  const metadata = await sharp(buffer).metadata();

  // Calculate new dimensions while maintaining aspect ratio
  let width = metadata.width || COMPRESSION_CONFIG.maxWidth;
  let height = metadata.height || COMPRESSION_CONFIG.maxHeight;

  if (
    width > COMPRESSION_CONFIG.maxWidth ||
    height > COMPRESSION_CONFIG.maxHeight
  ) {
    const aspectRatio = width / height;
    if (width > height) {
      width = COMPRESSION_CONFIG.maxWidth;
      height = Math.round(width / aspectRatio);
    } else {
      height = COMPRESSION_CONFIG.maxHeight;
      width = Math.round(height * aspectRatio);
    }
  }

  // Compress the image
  const compressedBuffer = await sharp(buffer)
    .resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: COMPRESSION_CONFIG.quality,
      effort: 6, // Higher effort = better compression (0-6)
    })
    .toBuffer();

  return {
    data: compressedBuffer,
    width,
    height,
    originalSize,
    compressedSize: compressedBuffer.length,
  };
}

/**
 * POST /api/upload
 * Handle file uploads for map images
 * Compresses images and stores them in Firebase Firestore
 *
 * Query params:
 * - storage: "database" (default) | "local" - Where to store the image
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    // Check storage preference from query params (default to database)
    const storageType =
      request.nextUrl.searchParams.get("storage") || "database";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    // Validate file type
    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/gif",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Only images are allowed.",
        },
        { status: 400 },
      );
    }

    // Validate file size (max 10MB for original)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 10MB." },
        { status: 400 },
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique ID for the image
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const imageId = `map-${timestamp}-${randomStr}`;

    // Compress the image
    const compressed = await compressImage(buffer);

    // Store in database
    const imagesCollection = db.collection("map_images");

    await imagesCollection.doc(imageId).set({
      id: imageId,
      originalName: file.name,
      originalSize: compressed.originalSize,
      compressedSize: compressed.compressedSize,
      width: compressed.width,
      height: compressed.height,
      mimeType: "image/webp",
      imageData: compressed.data.toString("base64"),
      createdAt: new Date(),
    });

    // Return the API URL for the image
    const imageUrl = `/api/images/${imageId}`;

    // Calculate compression ratio
    const compressionRatio = (
      (1 - compressed.compressedSize / compressed.originalSize) *
      100
    ).toFixed(1);

    return NextResponse.json({
      success: true,
      data: {
        url: imageUrl,
        id: imageId,
        originalName: file.name,
        originalSize: compressed.originalSize,
        compressedSize: compressed.compressedSize,
        compressionRatio: `${compressionRatio}%`,
        width: compressed.width,
        height: compressed.height,
        type: "image/webp",
        storageType: "database",
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
