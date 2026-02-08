import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ChatRequest {
  text: string;
}

interface ChatResponse {
  intent: string;
  score?: number;
}

const DEFAULT_MODEL = "gemini-3-flash-preview";
const getModelName = () =>
  process.env.GEMINI_CHAT_MODEL || process.env.GEMINI_MODEL || DEFAULT_MODEL;

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ChatResponse>> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { intent: "unknown", score: 0 },
        { status: 500 },
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const body: ChatRequest = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json(
        { intent: "unknown", score: 0 },
        { status: 400 },
      );
    }

    // Valid categories for intent classification
    const validCategories = {
      canteen: "Food, cafeteria, eating, snacks, meals, hungry",
      restroom_men:
        "Men's toilet, boys washroom, gents restroom, male bathroom, urinals",
      restroom_women:
        "Women's toilet, ladies washroom, girls restroom, female bathroom, powder room",
      restroom_general:
        "General restroom, toilet, washroom, bathroom, WC, lavatory",
      library:
        "Books, study, reading, quiet place, library resources, borrowing books",
      medical:
        "Doctor, clinic, sick, injury, first aid, health center, pharmacy, medical help",
      office_principal: "Principal office, dean, director, head of college",
      office_chairman: "Chairman office, chairperson, founder, trustee",
      office_hod: "Head of department, HOD office, department head",
      staff_room: "Teacher, faculty, professor, staff meeting, instructors",
      office: "Administration, registrar, admission office, general office",
      accounts:
        "Fees, payment, finance, billing, accounts department, fee payment",
      ground:
        "Sports, playground, cricket, football, outdoor games, sports field",
      gym: "Gymnasium, exercise, workout, fitness center, weight training",
      auditorium: "Event hall, function, gathering, auditorium",
      auditorium_kaveri: "Kaveri auditorium, Kaveri hall",
      auditorium_parthasarathy: "Parthasarathy auditorium, Parthasarathy hall",
      drinking_water:
        "Water, drinking water, thirsty, water cooler, water dispenser",
      parking: "Parking area, vehicle parking, car/bike parking, parking lot",
      office_hod_cse: "Computer Science HOD, CSE department head",
      office_hod_ece: "Electronics HOD, ECE department head",
      office_hod_mech: "Mechanical HOD, Mechanical department head",
      office_hod_civil: "Civil Engineering HOD, Civil department head",
      office_hod_it: "Information Technology HOD, IT department head",
      office_hod_aiml:
        "AI/ML HOD, Artificial Intelligence Machine Learning department head",
      office_hod_aids:
        "AI/DS HOD, Artificial Intelligence Data Science department head",
      computer_lab: "Computer laboratory, computer room, lab",
      gate: "Main gate, entrance, exit, college gate, main door",
    };

    // Create prompt for Gemini
    const categoryList = Object.keys(validCategories).join(", ");
    const categoryDescriptions = Object.entries(validCategories)
      .map(([key, desc]) => `- ${key}: ${desc}`)
      .join("\n");

    const prompt = `You are a Campus Navigation Intent Classifier for an indoor navigation system.

Your task: Analyze the user's input and determine which campus location category they are looking for.

Valid Categories and their meanings:
${categoryDescriptions}

User Input: "${text}"

Instructions:
1. Carefully analyze the user's intent
2. Match it to the MOST RELEVANT category from the list above
3. Return ONLY the category name (e.g., "canteen", "library", "restroom_men")
4. If the intent is unclear or doesn't match any category, return "unknown"
5. Do NOT include explanations, markdown, or any other text - ONLY the category name

Response:`;

    // Initialize Gemini model with system instruction
    const model = genAI.getGenerativeModel({
      model: getModelName(),
      systemInstruction: `You are a precise intent classifier for a campus navigation system. 
You must return ONLY one of these category names: ${categoryList}, or "unknown".
Never include explanations, formatting, or additional text.
Match user requests to the most appropriate category based on their intent.`,
    });

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let intent = response.text().trim().toLowerCase();
    if (!intent) {
      return NextResponse.json(
        { intent: "unknown", score: 0 },
        { status: 502 },
      );
    }

    // Clean up response - remove markdown backticks or quotes if present
    intent = intent.replace(/```/g, "").replace(/['"]/g, "").trim();

    // Validate that the intent is in our list of valid categories
    if (!Object.keys(validCategories).includes(intent)) {
      intent = "unknown";
    }

    // Return with confidence score of 1 (Gemini is confident in its classification)
    return NextResponse.json({
      intent: intent,
      score: intent === "unknown" ? 0 : 0.95,
    });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json({ intent: "unknown", score: 0 }, { status: 500 });
  }
}
