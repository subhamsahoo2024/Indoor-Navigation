import type { Node } from "@/types/navigation";

// Simple in-memory cache
// Key: mapId_startNodeId_endNodeId
// Value: The generated summary string
const summaryCache = new Map<string, string>();

interface GenerateSummaryParams {
  nodes: Node[];
  mapId: string;
  isLastMap: boolean;
}

export const summaryService = {
  async fetchSummary({
    nodes,
    mapId,
    isLastMap,
  }: GenerateSummaryParams): Promise<string | null> {
    if (nodes.length < 2) return null;

    const nodeIds = nodes.map((node) => node.id).join("-");
    const cacheKey = `${mapId}_${nodeIds}_${isLastMap ? "final" : "intermediate"}`;

    // Check cache
    if (summaryCache.has(cacheKey)) {
      console.log("Summary served from cache:", cacheKey);
      return summaryCache.get(cacheKey) || null;
    }

    try {
      console.log("Fetching summary from API...");
      const response = await fetch("/api/navigation/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, isLastMap }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.error("Summary API error:", response.status, errorText);
        return null;
      }

      const data = await response.json();

      if (
        data.success &&
        typeof data.summary === "string" &&
        data.summary.trim() !== ""
      ) {
        // Cache the successful result
        const normalizedSummary = data.summary.trim();
        summaryCache.set(cacheKey, normalizedSummary);
        return normalizedSummary;
      } else {
        console.error("Summary API error:", data.error);
        return null;
      }
    } catch (err) {
      console.error("Summary fetch error:", err);
      return null;
    }
  },

  clearCache() {
    summaryCache.clear();
  },
};
