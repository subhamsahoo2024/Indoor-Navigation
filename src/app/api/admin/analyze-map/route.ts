
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
    try {
        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: "GEMINI_API_KEY is not set" },
                { status: 500 }
            );
        }

        const { image } = await req.json();

        if (!image) {
            return NextResponse.json(
                { success: false, error: "No image data provided" },
                { status: 400 }
            );
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        // Using Gemini 3 Flash for high precision and speed
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        // Prepare the prompt with precise 1000x1000 bounding box instructions
        const prompt = `
      **ACT AS:** Senior AI Vision Engineer.
      **TASK:** Detect every room number, office name, or label in the floor plan.
      
      **INSTRUCTIONS:**
      1. Analyze the floor plan image.
      2. Identify every readable text label for rooms, offices, or points of interest.
      3. For each label, return a bounding box defined as [ymin, xmin, ymax, xmax].
      4. **COORDINATE SYSTEM:** Normalize all coordinates to a 1000x1000 grid.
         - Top-left is [0, 0].
         - Bottom-right is [1000, 1000].
         - ymin, xmin, ymax, xmax should be integers between 0 and 1000.
      
      **CRITICAL OUTPUT FORMAT:**
      Return ONLY a valid JSON array. Do not use markdown code blocks.
      Structure:
      [
        { "label": "Room 101", "box_2d": [ymin, xmin, ymax, xmax] },
        { "label": "Conference Room", "box_2d": [150, 400, 180, 450] }
      ]
    `;

        // Remove data:image/png;base64, prefix if present
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

        // Helper for exponential backoff retry on 429 errors
        const generateWithRetry = async (retries = 3) => {
            for (let i = 0; i < retries; i++) {
                try {
                    return await model.generateContent([
                        prompt,
                        {
                            inlineData: {
                                data: base64Data,
                                mimeType: "image/png",
                            },
                        },
                    ]);
                } catch (error: any) {
                    if (error.status === 429 || error.message?.includes("429")) {
                        if (i === retries - 1) throw error; // Re-throw on last attempt
                        // Wait: 2s, 4s, 8s
                        const waitTime = Math.pow(2, i + 1) * 1000;
                        console.log(
                            `Gemini Rate Limit (429). Retrying in ${waitTime}ms...`
                        );
                        await new Promise((resolve) => setTimeout(resolve, waitTime));
                        continue;
                    }
                    throw error; // Re-throw other errors
                }
            }
            throw new Error("Failed after retries");
        };

        const result = await generateWithRetry();
        const response = await result.response;
        const text = response.text();

        // Clean up markdown if Gemini adds it despite instructions
        const cleanedText = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        let rawNodes;
        try {
            rawNodes = JSON.parse(cleanedText);
        } catch (e) {
            console.error("Failed to parse Gemini response:", text);
            return NextResponse.json(
                { success: false, error: "Failed to parse AI response" },
                { status: 500 }
            );
        }

        // Transform 1000x1000 bounding boxes to 0-100 percentage center points
        const processedNodes = rawNodes.map((item: any) => {
            let x = 50;
            let y = 50;

            if (
                item.box_2d &&
                Array.isArray(item.box_2d) &&
                item.box_2d.length === 4
            ) {
                const [ymin, xmin, ymax, xmax] = item.box_2d;

                // Calculate center in 0-1000 space
                const centerX_1000 = (xmin + xmax) / 2;
                const centerY_1000 = (ymin + ymax) / 2;

                // Convert to 0-100 percentage
                x = centerX_1000 / 10;
                y = centerY_1000 / 10;
            }

            return {
                label: item.label,
                x: parseFloat(x.toFixed(2)),
                y: parseFloat(y.toFixed(2)),
            };
        });

        return NextResponse.json({ success: true, data: processedNodes });
    } catch (error: any) {
        console.error("Map analysis error:", error);

        // Friendly error message for rate limits
        const errorMessage =
            error.status === 429 || error.message?.includes("429")
                ? "AI Rate Limit Exceeded. Please try again in 1 minute."
                : "Failed to analyze map";

        return NextResponse.json(
            { success: false, error: errorMessage, details: error.message },
            { status: error.status || 500 }
        );
    }
}
