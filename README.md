# NavX - Indoor Navigation System

A comprehensive indoor navigation system for college campuses featuring multi-map navigation, AI-powered chatbot assistance, and QR code integration for seamless wayfinding.

## 🚀 Tech Stack

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript 5+ (Strict mode)
- **Styling**: Tailwind CSS 4
- **UI Components**: Lucide React for icons
- **Animations**: Framer Motion 12+
- **State Management**: Zustand 5+
- **Database**: MongoDB with Mongoose 9+
- **Authentication**: NextAuth.js 4+
- **Graphics**: HTML5 Canvas for map rendering
- **NLP**: Node-NLP for natural language processing
- **QR Codes**: QRCode.react for QR generation
- **Image Processing**: Browser Image Compression

## ✨ Latest Features (v0.1.0)

- 🔐 **Authentication System** - Secure admin authentication with NextAuth.js
- 🖼️ **Advanced Image Processing** - Optimized map image handling with browser compression
- 🎨 **Modern UI Components** - Beautiful icons with Lucide React
- ⚡ **Performance Optimized** - Latest Next.js 16+ with improved App Router
- 📱 **Enhanced Mobile Experience** - Responsive design with Tailwind CSS 4
- 🔄 **Real-time State Management** - Efficient state updates with Zustand 5+

## Key Features

### Navigation

- 🗺️ **Multi-Map Navigation** - Navigate across Campus, Building, and Floor levels
- 🚪 **Gateway Nodes** - Seamless transitions between different map levels
- 🎯 **Pathfinding** - Advanced graph-based algorithms (Dijkstra) with cross-map routing
- 📍 **QR Code Integration** - Scan QR codes to instantly set your starting location
- 🔍 **Smart Search** - Global search across all locations without needing to select buildings first

### AI Chatbot

- 🤖 **Natural Language Understanding** - Ask in plain language like "Where is the canteen?" or "Take me to library"
- 🧠 **Intent Recognition** - Understands 30+ location categories and destinations using Node-NLP
- 📍 **Location-Aware** - Finds nearest destination based on your current location
- 💬 **Conversational Interface** - Friendly, animated chat experience with Framer Motion

### Admin Dashboard

- 🔐 **Secure Authentication** - Protected admin access with NextAuth.js
- 🔒 **PIN Verification** - 4-digit PIN security for critical operations (save/delete maps)
- 🎨 **Visual Map Editor** - Upload and edit maps with an intuitive canvas interface
- ➕ **Node Management** - Add, edit, and delete nodes with drag-and-drop
- 🔗 **Edge Creation** - Connect nodes with weighted edges for pathfinding
- 🏷️ **Category Tagging** - Tag locations for chatbot recognition (canteen, library, etc.)
- 📤 **Map Upload** - Support for PNG/JPG map images with compression

### User Experience

- 📱 **Mobile Responsive** - Fully optimized for mobile devices
- ✨ **Smooth Animations** - Polished UI with Framer Motion
- 🎯 **Real-time Routing** - Dynamic path visualization on canvas
- 🔄 **Path Highlighting** - Clear visual guidance with animated paths

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://navx-indoor-navigation.vercel.app/
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Edit `.env`:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/navx-indoor-navigation
# or for MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/navx-indoor-navigation

# NextAuth Configuration
NEXTAUTH_URL=app url or http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Enable database mode (set to "true" to use MongoDB, "false" for mock data)
NEXT_PUBLIC_USE_DATABASE=true

# Admin Credentials

# Admin 1 Credentials
ADMIN1_USER=admin1
ADMIN1_PASS=password1

# Admin 2 Credentials
ADMIN2_USER=admin2
ADMIN2_PASS=password2

#pin for map update
MAP_UPDATE_PIN=pin
```

4. Seed the database (optional):

```bash
# Access http://localhost:3000/api/seed after starting dev server
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## 📁 Repository Structure

```
NavX-indoor-nav/
├── public/
│   └── maps/                 # Map image assets
├── src/
│   ├── app/
│   │   ├── page.tsx          # Landing page
│   │   ├── navigate/         # User navigation interface
│   │   ├── login/            # Authentication pages
│   │   ├── admin/            # Admin dashboard
│   │   │   └── map/[id]/     # Map editor
│   │   └── api/
│   │       ├── auth/         # NextAuth.js configuration
│   │       ├── chat/         # NLP chatbot API
│   │       ├── maps/         # Map CRUD operations
│   │       ├── seed/         # Database seeding
│   │       └── upload/       # Image upload handling
│   ├── components/
│   │   ├── IndoorNavigation.tsx   # Main navigation canvas
│   │   ├── LocationSelector.tsx   # Location search & selection
│   │   ├── AIChatbot.tsx          # AI chat interface
│   │   ├── PinVerificationModal.tsx # Location verification
│   │   ├── SessionProvider.tsx    # Auth session provider
│   │   └── admin/
│   │       └── MapEditor.tsx      # Visual map editor
│   ├── hooks/
│   │   ├── useImageDimensions.ts  # Image dimension utilities
│   │   └── useMapDimensions.ts    # Map dimension calculations
│   ├── lib/
│   │   ├── auth.ts              # NextAuth configuration
│   │   ├── db.ts                # MongoDB connection
│   │   ├── imageUtils.ts        # Image processing utilities
│   │   ├── mapService.ts        # Map data services
│   │   └── pathfinder.ts        # Pathfinding algorithms
│   ├── models/
│   │   └── Map.ts               # MongoDB schema
│   ├── types/
│   │   ├── navigation.ts        # Navigation type definitions
│   │   └── next-auth.d.ts       # NextAuth type extensions
│   └── data/
│       └── mockGraph.ts         # Sample data structure
├── eslint.config.mjs            # ESLint configuration
├── next.config.ts               # Next.js configuration
├── postcss.config.mjs           # PostCSS configuration
├── tailwind.config.ts           # Tailwind CSS configuration
└── tsconfig.json                # TypeScript configuration
```

## Architecture

### Multi-Map Navigation

The system uses a hierarchical map structure with three levels:

1. **Campus Map** - Overview of the entire campus with buildings
2. **Building Maps** - Individual building layouts with floors
3. **Floor Maps** - Detailed floor plans with rooms and corridors

### Gateway Nodes

Gateway Nodes are special connection points that:

- Link different map levels together
- Enable cross-map pathfinding
- Represent entrances, staircases, elevators, and building connections
- Allow seamless navigation from campus level to specific rooms

Example: Campus Gate → Building A Entrance → Floor 2 Staircase → Room 201

### Pathfinding Algorithm

- Uses **Dijkstra's algorithm** for optimal path calculation
- Supports **cross-map routing** through gateway nodes
- Handles **weighted edges** for distance calculation
- Provides **step-by-step directions** with map transitions

### AI Chatbot System

The chatbot uses a trained neural network (Node-NLP) to:

1. Process user input in natural language
2. Recognize intent from 30+ categories (canteen, library, restrooms, offices, etc.)
3. Find the nearest matching location based on current position
4. Provide conversational navigation guidance with smooth animations

Supported categories include:

- Facilities: Canteen, Library, Medical Room, Auditorium, Gym
- Restrooms: General, Men's, Women's
- Offices: Principal, Chairman, HOD (various departments)
- Utilities: Drinking Water, Parking
- Academic: Computer Labs, Classrooms

## API Routes

### Maps

- `GET /api/maps` - List all maps
- `GET /api/maps/[id]` - Get specific map details
- `POST /api/maps` - Create new map
- `PUT /api/maps/[id]` - Update map
- `DELETE /api/maps/[id]` - Delete map

### Chat

- `POST /api/chat` - Process natural language query

### Upload

- `POST /api/upload` - Upload map image

### Seed

- `GET /api/seed` - Initialize database with sample data

## Usage Guide

### For Users

1. **Start Navigation**:
   - Visit `/navigate`
   - Scan a QR code OR manually select your starting location
   - Search for your destination
   - Click "Start Navigation"

2. **Use AI Chatbot**:
   - Click the chat button
   - Select your starting location from the dropdown
   - Type your destination (e.g., "canteen", "library")
   - Follow the generated route

### For Admins

1. **Access Admin Dashboard**:
   - Go to `/login` for authentication (if NextAuth is configured)
   - Navigate to `/admin` to access the dashboard
   - All admin operations require proper authentication

2. **Create a Map**:
   - Click "Add New Map" in the admin dashboard
   - Upload a map image (PNG/JPG supported with compression)
   - Enter map details (name, type, parent)
   - Save the map

3. **Edit Maps with PIN Security**:
   - Click on any existing map to open the editor
   - Add/edit nodes by clicking on the map canvas
   - Connect nodes by dragging between them
   - Set node properties (name, type, category for chatbot)
   - Assign edge weights for accurate pathfinding
   - **Save changes**: Requires 4-digit PIN
   - **Delete map**: Also requires PIN verification for security

4. **Configure Categories for Chatbot**:
   - Select a node in the map editor
   - Choose appropriate category (canteen, library, restroom, etc.)
   - Save to make locations discoverable via AI chatbot

## Database Schema

### Map Collection

```typescript
{
  id: string;              // Unique identifier
  name: string;            // Map name
  type: 'CAMPUS' | 'BUILDING' | 'FLOOR';
  parentId?: string;       // Parent map reference
  imageUrl: string;        // Path to map image
  width: number;           // Canvas width
  height: number;          // Canvas height
  nodes: Node[];           // Navigation points
  edges: Edge[];           // Connections between nodes
}
```

### Node Structure

```typescript
{
  id: string;
  x: number;               // Canvas position
  y: number;
  name: string;
  type: 'GATEWAY' | 'ROOM' | 'POINT';
  category?: string;       // For chatbot recognition
  connectedMapId?: string; // For gateway nodes
  connectedNodeId?: string;
}
```

## 🤝 Contributing

We welcome contributions to NavX!
