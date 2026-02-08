import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { campusMainMap, blockALobbyMap, floor1Map } from "@/data/mockGraph";

/**
 * GET /api/seed
 * Seeds the database with initial mock data
 * WARNING: This will delete all existing maps and replace with mock data
 */
export async function GET() {
  try {
    const mapsCollection = db.collection("maps");

    // Clear existing data
    const existingDocs = await mapsCollection.get();
    const batch = db.batch();
    existingDocs.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Prepare maps for insertion
    const mapsToInsert = [campusMainMap, blockALobbyMap, floor1Map];

    // Insert all maps using batch write
    const insertBatch = db.batch();
    const timestamp = new Date();

    mapsToInsert.forEach((map) => {
      const docRef = mapsCollection.doc(map.id);
      insertBatch.set(docRef, {
        id: map.id,
        name: map.name,
        imageUrl: map.imageUrl,
        nodes: map.nodes,
        adjacencyList: map.adjacencyList,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    });

    await insertBatch.commit();

    // Fetch inserted maps to return
    const insertedSnapshot = await mapsCollection.get();
    const insertedMaps = insertedSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        nodeCount: data.nodes?.length || 0,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      data: {
        mapsInserted: insertedMaps.length,
        maps: insertedMaps,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to seed database",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/seed
 * Alternative endpoint that accepts custom seed data
 * Input: { maps: MapData[], clearExisting?: boolean }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { maps, clearExisting = false } = body;

    if (!maps || !Array.isArray(maps)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input: 'maps' array is required",
        },
        { status: 400 }
      );
    }

    const mapsCollection = db.collection("maps");

    // Optionally clear existing data
    if (clearExisting) {
      const existingDocs = await mapsCollection.get();
      const deleteBatch = db.batch();
      existingDocs.docs.forEach((doc) => {
        deleteBatch.delete(doc.ref);
      });
      await deleteBatch.commit();
    }

    // Insert maps using batch write
    const insertBatch = db.batch();
    const timestamp = new Date();

    maps.forEach(
      (map: {
        id: string;
        name: string;
        imageUrl: string;
        nodes: Array<{
          id: string;
          x: number;
          y: number;
          type: string;
          name: string;
          description?: string;
          gatewayConfig?: {
            targetMapId: string;
            targetNodeId: string;
          };
        }>;
        adjacencyList: Record<
          string,
          Array<{ targetNodeId: string; weight: number }>
        >;
      }) => {
        const docRef = mapsCollection.doc(map.id);
        insertBatch.set(docRef, {
          id: map.id,
          name: map.name,
          imageUrl: map.imageUrl,
          nodes: map.nodes,
          adjacencyList: map.adjacencyList,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }
    );

    await insertBatch.commit();

    return NextResponse.json({
      success: true,
      message: "Custom seed completed",
      data: {
        mapsInserted: maps.length,
      },
    });
  } catch (error) {
    console.error("Custom seed error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to seed database",
      },
      { status: 500 }
    );
  }
}
