# **NavX: Intelligent Indoor Navigation with Gemini 3**

## **🚀 Overview**

NavX is a next-generation indoor navigation platform that transforms static building layouts into interactive, intelligent maps. By combining the precision of **Dijkstra’s Pathfinding Algorithm** with the multimodal reasoning of **Gemini 3**, NavX automates map digitization and provides human-centric, voice-guided instructions across multi-floor environments.

## **✨ Key Features**

- **AI-Automated Map Digitization:** Leverages **Gemini 3 Vision** to detect room labels and infrastructure on architectural floor plans, automatically generating node coordinates with 1000x1000 pixel precision.
- **Dynamic Shortest-Path Navigation:** Implements Dijkstra’s algorithm to calculate the most efficient route between any two points in a complex graph.
- **Contextual AI Summaries:** Gemini 3 analyzes the calculated path to generate natural language instructions (e.g., _"Pass the library on your left and continue toward the main hall"_).
- **Multi-Floor Awareness:** Seamlessly handles transitions between maps with AI-driven prompts to guide users across elevators and stairwells.
- **Voice-Guided Assistance:** Integrated **Text-to-Speech (TTS)** with optimized pacing (0.8x rate) for clear, eyes-free navigation in busy hallways.
- **Responsive SVG Overlay:** A high-performance, non-scaling SVG layer that renders sharp navigation paths regardless of device resolution.

---

## **🧠 Gemini 3 Integration**

NavX is built specifically to showcase the **multimodal** and **reasoning** strengths of the Gemini 3 model family:

1. **Spatial Reasoning (Gemini 3 Vision):** Instead of manual data entry, the Admin Dashboard uses Gemini 3 to "see" and "map" floor plans. It uses a normalized 1000-point grid to output structured JSON data for room locations.
2. **Instruction Synthesis (Gemini 3 Reasoning):** The "Walking Guide" isn't a pre-written script. Gemini 3 takes raw path coordinates, identifies nearby landmarks, and synthesizes a unique narrative for every route.
3. **Cross-Map Context Management:** Gemini 3 manages the logic of multi-map journeys, recognizing when a path hits a "gateway" and prompting the user to transition floors with specific verbal cues.

---

## **🛠️ Tech Stack**

- **Frontend:** Next.js 14+ (App Router), Tailwind CSS, Framer Motion.
- **AI Engine:** Google Gemini 3 (Pro & Flash) via Google GenAI SDK.
- **Database:** Firebase.
- **Algorithm:** Custom Dijkstra’s Algorithm implementation.
- **Utilities:** Web Speech API (TTS), SWR (API Caching), Lucide React (Icons).

---

## **🏗️ Architecture & Flow**

1. **Digitization:** Image Upload → Gemini 3 (OCR/Spatial) → JSON Nodes → Firebase.
2. **Pathfinding:** User Selects Start/End → Dijkstra (Shortest Path) → SVG Path Array.
3. **Assistant:** Path Array → Gemini 3 (Summarization) → TTS Voice Playback.

---

## **⚙️ Installation & Setup**

### **Prerequisites**

- Node.js 18.x or higher
- Firebase account
- Google AI Studio API Key (Gemini 3 access)

### **Setup**

1. **Clone the Repo:**

```bash
git clone https://github.com/yourusername/navx-navigation.git
cd navx-navigation

```

2. **Install Dependencies:**

```bash
npm install

```

3. **Environment Variables:**
   Create a `.env.local` file:

```env
# Firebase Client SDK (Browser-side) - Public variables
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your-project.firebasedatabase.app
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----\n"

# OR use service account file (recommended)
FIREBASE_SERVICE_ACCOUNT="content of service-account.json"

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# App Settings
NEXT_PUBLIC_USE_DATABASE=true

GEMINI_MODEL= gemini-3-flash-preview
```

4. **Run Development Server:**

```bash
npm run dev

```

---

## **🌍 Potential Impact**

- **Social Good:** Enhances accessibility by providing "stairs-free" routes for users with mobility impairments.
- **Productivity:** Drastically reduces the time required for facility managers to digitize and maintain building maps.
- **Wayfinding Anxiety:** Reduces stress for new students, visitors, and patients in large, high-pressure environments like hospitals and universities.

---

## **📄 License**

This project is licensed under the [MIT License](https://www.google.com/search?q=LICENSE).

---

### **Would you like me to generate the 3-minute video script to match this README?**
