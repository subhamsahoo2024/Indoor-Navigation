import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import type { MapData } from "@/types/navigation";

/**
 * GET /api/maps
 * Returns metadata for all maps (id, name, imageUrl, nodes count)
 */
export async function GET() {
  try {
    const mapsCollection = db.collection("maps");
    const snapshot = await mapsCollection.get();

    const maps = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.id || doc.id, // Use custom id field, fallback to Firestore document ID
        name: data.name,
        imageUrl: data.imageUrl,
        nodes: data.nodes || [],
      };
    });

    return NextResponse.json({
      success: true,
      data: maps,
    });
  } catch (error) {
    console.error("GET /api/maps error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch maps",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/maps
 * Create a new map
 * Input: { id, name, imageUrl, nodes?, adjacencyList? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, imageUrl, nodes = [], adjacencyList = {} } = body;

    // Validation
    if (!id || !name || !imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: id, name, imageUrl",
        },
        { status: 400 }
      );
    }

    const mapsCollection = db.collection("maps");

    // Check if map with this id already exists
    const existingDoc = await mapsCollection.doc(id).get();
    if (existingDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: `Map with id '${id}' already exists`,
        },
        { status: 409 }
      );
    }

    // Create new map document
    const newMapData: Partial<MapData> = {
      id,
      name,
      imageUrl,
      nodes,
      adjacencyList,
    };

    // Add timestamps
    const timestamp = new Date();
    const mapWithTimestamps = {
      ...newMapData,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Use the provided id as the Firestore document ID
    await mapsCollection.doc(id).set(mapWithTimestamps);

    return NextResponse.json(
      {
        success: true,
        data: { ...mapWithTimestamps, id },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/maps error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create map",
      },
      { status: 500 }
    );
  }
}
