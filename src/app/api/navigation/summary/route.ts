import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const DEFAULT_MODEL = "gemini-3-flash-preview";
const getModelName = () =>
  process.env.GEMINI_SUMMARY_MODEL || process.env.GEMINI_MODEL || DEFAULT_MODEL;

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY is not set" },
        { status: 500 },
      );
    }

    const { nodes, isLastMap } = await req.json();

    if (!nodes || !Array.isArray(nodes) || nodes.length < 2) {
      return NextResponse.json(
        { success: false, error: "Invalid path nodes provided" },
        { status: 400 },
      );
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: getModelName() });

    // Prepare node list for the prompt
    const nodesList = nodes
      .map((node, index) => {
        let typeInfo =
          node.type === "GATEWAY" ? "(Transition/Connection Point)" : "";
        if (node.type === "ROOM") typeInfo = "(Room/Label)";
        return `${index + 1}. ${node.name} ${typeInfo}`;
      })
      .join("\n");

    const prompt = `
      You are a concise navigation assistant. Summarize ONLY the path provided for the current map.

      Path Nodes on this Map:
      ${nodesList}

      Instructions:
      1. Landmark focus: Mention 1-2 key rooms or landmarks along the path.
      2. Map Transitions:
         ${
           !isLastMap
             ? "- This is NOT the final destination. End the summary with: 'After reaching the end of this path, please click the Continue button to load the map.' (Never use the word 'gateway')."
             : "- This IS the final destination. End with: 'Your destination will be reached at the end of the route on this map.'"
         }
      3. Tone: Professional, reassuring, and brief (max 2 sentences).
      4. Do NOT mention specific node IDs.
      
      Output:
      Just the text summary. No formatting.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text().trim();
    if (!summary) {
      return NextResponse.json(
        { success: false, error: "Empty summary response from model" },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    console.error("Navigation summary generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate summary" },
      { status: 500 },
    );
  }
}
