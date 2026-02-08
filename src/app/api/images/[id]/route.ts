import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/images/[id]
 * Serves a map image stored in the database
 * Handles compressed images stored as Base64 in Firestore
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const imagesCollection = db.collection("map_images");
    const doc = await imagesCollection.doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 },
      );
    }

    const data = doc.data();
    if (!data || !data.imageData) {
      return NextResponse.json(
        { success: false, error: "Image data is missing" },
        { status: 500 },
      );
    }

    // Decode Base64 image data
    const imageBuffer = Buffer.from(data.imageData, "base64");

    // Return the image with appropriate content type
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": data.mimeType || "image/webp",
        "Content-Length": imageBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("GET /api/images/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch image",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/images/[id]
 * Delete a map image from the database
 * This is used when maps are deleted or images need to be cleaned up
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const imagesCollection = db.collection("map_images");
    const doc = await imagesCollection.doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 },
      );
    }

    // Delete the image document
    await imagesCollection.doc(id).delete();

    return NextResponse.json({
      success: true,
      message: `Image '${id}' deleted successfully`,
    });
  } catch (error) {
    console.error("DELETE /api/images/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete image",
      },
      { status: 500 },
    );
  }
}
