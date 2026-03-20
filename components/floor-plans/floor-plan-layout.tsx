"use client";

import { useMemo } from "react";

interface FloorPlanLayoutProps {
  planId: string;
  sqFt: number;
  bedrooms: number;
  bathrooms: number;
  className?: string;
  showLabels?: boolean;
  showDimensions?: boolean;
}

// Room colors for the floor plan
const ROOM_COLORS = {
  living: "#E8F4F8",
  kitchen: "#FEF3E2", 
  bedroom: "#E8F0FE",
  bathroom: "#F0E8FE",
  closet: "#F5F5F5",
  laundry: "#E8FEF0",
  entry: "#FEFCE8",
};

// Plan layouts based on square footage and bedrooms
const PLAN_LAYOUTS: Record<string, {
  width: number;
  depth: number;
  rooms: Array<{
    name: string;
    type: keyof typeof ROOM_COLORS;
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
}> = {
  // 400 sqft Studio - 20' x 20'
  "garage-conversion": {
    width: 20,
    depth: 20,
    rooms: [
      { name: "Living/Bedroom", type: "living", x: 0, y: 0, w: 14, h: 14 },
      { name: "Kitchen", type: "kitchen", x: 14, y: 0, w: 6, h: 10 },
      { name: "Bath", type: "bathroom", x: 14, y: 10, w: 6, h: 6 },
      { name: "W/D", type: "laundry", x: 14, y: 16, w: 3, h: 4 },
      { name: "Closet", type: "closet", x: 17, y: 16, w: 3, h: 4 },
      { name: "Entry", type: "entry", x: 0, y: 14, w: 6, h: 6 },
    ],
  },
  // 400 sqft Studio Detached - 20' x 20'
  "compact-detached": {
    width: 20,
    depth: 20,
    rooms: [
      { name: "Living Area", type: "living", x: 0, y: 0, w: 12, h: 12 },
      { name: "Kitchen", type: "kitchen", x: 12, y: 0, w: 8, h: 8 },
      { name: "Bedroom", type: "bedroom", x: 0, y: 12, w: 10, h: 8 },
      { name: "Bath", type: "bathroom", x: 10, y: 12, w: 6, h: 6 },
      { name: "W/D", type: "laundry", x: 12, y: 8, w: 4, h: 4 },
      { name: "Closet", type: "closet", x: 16, y: 8, w: 4, h: 4 },
      { name: "Entry", type: "entry", x: 16, y: 12, w: 4, h: 8 },
    ],
  },
  // 500 sqft 1BR - 20' x 25'
  "efficient-one": {
    width: 20,
    depth: 25,
    rooms: [
      { name: "Living Room", type: "living", x: 0, y: 0, w: 12, h: 13 },
      { name: "Kitchen", type: "kitchen", x: 12, y: 0, w: 8, h: 10 },
      { name: "Dining", type: "entry", x: 12, y: 10, w: 8, h: 5 },
      { name: "Bedroom", type: "bedroom", x: 0, y: 13, w: 12, h: 12 },
      { name: "Bath", type: "bathroom", x: 12, y: 15, w: 6, h: 6 },
      { name: "W/D", type: "laundry", x: 12, y: 21, w: 4, h: 4 },
      { name: "Closet", type: "closet", x: 16, y: 21, w: 4, h: 4 },
    ],
  },
  // 600 sqft 1BR - 20' x 30'
  "cozy-cottage": {
    width: 20,
    depth: 30,
    rooms: [
      { name: "Living Room", type: "living", x: 0, y: 0, w: 14, h: 14 },
      { name: "Kitchen", type: "kitchen", x: 14, y: 0, w: 6, h: 12 },
      { name: "Dining", type: "entry", x: 14, y: 12, w: 6, h: 6 },
      { name: "Bedroom", type: "bedroom", x: 0, y: 14, w: 12, h: 12 },
      { name: "Walk-in Closet", type: "closet", x: 0, y: 26, w: 6, h: 4 },
      { name: "Bath", type: "bathroom", x: 12, y: 18, w: 8, h: 8 },
      { name: "W/D", type: "laundry", x: 12, y: 26, w: 4, h: 4 },
      { name: "Patio", type: "entry", x: 6, y: 26, w: 6, h: 4 },
    ],
  },
  // 650 sqft 1-2BR - 22' x 30'
  "urban-loft": {
    width: 22,
    depth: 30,
    rooms: [
      { name: "Living Area", type: "living", x: 0, y: 0, w: 14, h: 15 },
      { name: "Kitchen", type: "kitchen", x: 14, y: 0, w: 8, h: 12 },
      { name: "Dining", type: "entry", x: 14, y: 12, w: 8, h: 6 },
      { name: "Bedroom 1", type: "bedroom", x: 0, y: 15, w: 11, h: 11 },
      { name: "Flex/BR 2", type: "bedroom", x: 11, y: 18, w: 8, h: 8 },
      { name: "Bath", type: "bathroom", x: 0, y: 26, w: 8, h: 4 },
      { name: "W/D", type: "laundry", x: 8, y: 26, w: 3, h: 4 },
      { name: "Closet", type: "closet", x: 19, y: 18, w: 3, h: 8 },
      { name: "Entry", type: "entry", x: 19, y: 26, w: 3, h: 4 },
    ],
  },
  // 750 sqft 2BR - 25' x 30'
  "family-suite": {
    width: 25,
    depth: 30,
    rooms: [
      { name: "Living Room", type: "living", x: 0, y: 0, w: 15, h: 14 },
      { name: "Kitchen", type: "kitchen", x: 15, y: 0, w: 10, h: 10 },
      { name: "Dining", type: "entry", x: 15, y: 10, w: 10, h: 6 },
      { name: "Bedroom 1", type: "bedroom", x: 0, y: 14, w: 12, h: 12 },
      { name: "Bedroom 2", type: "bedroom", x: 12, y: 16, w: 10, h: 10 },
      { name: "Bath", type: "bathroom", x: 0, y: 26, w: 8, h: 4 },
      { name: "W/D", type: "laundry", x: 8, y: 26, w: 4, h: 4 },
      { name: "Closet 1", type: "closet", x: 22, y: 16, w: 3, h: 5 },
      { name: "Closet 2", type: "closet", x: 22, y: 21, w: 3, h: 5 },
      { name: "Entry", type: "entry", x: 15, y: 26, w: 10, h: 4 },
    ],
  },
  // 850 sqft 2BR/2BA - 28' x 30'
  "deluxe-two": {
    width: 28,
    depth: 30,
    rooms: [
      { name: "Living Room", type: "living", x: 0, y: 0, w: 16, h: 14 },
      { name: "Kitchen", type: "kitchen", x: 16, y: 0, w: 12, h: 10 },
      { name: "Dining", type: "entry", x: 16, y: 10, w: 12, h: 6 },
      { name: "Primary BR", type: "bedroom", x: 0, y: 14, w: 14, h: 12 },
      { name: "Primary Bath", type: "bathroom", x: 0, y: 26, w: 8, h: 4 },
      { name: "Closet", type: "closet", x: 8, y: 26, w: 6, h: 4 },
      { name: "Bedroom 2", type: "bedroom", x: 14, y: 16, w: 10, h: 10 },
      { name: "Bath 2", type: "bathroom", x: 24, y: 16, w: 4, h: 6 },
      { name: "W/D", type: "laundry", x: 24, y: 22, w: 4, h: 4 },
      { name: "Entry", type: "entry", x: 14, y: 26, w: 14, h: 4 },
    ],
  },
  // 900 sqft 3BR/2BA - 30' x 30'
  "compact-three": {
    width: 30,
    depth: 30,
    rooms: [
      { name: "Living Room", type: "living", x: 0, y: 0, w: 14, h: 14 },
      { name: "Kitchen", type: "kitchen", x: 14, y: 0, w: 10, h: 10 },
      { name: "Dining", type: "entry", x: 24, y: 0, w: 6, h: 10 },
      { name: "Bedroom 1", type: "bedroom", x: 0, y: 14, w: 10, h: 10 },
      { name: "Bedroom 2", type: "bedroom", x: 10, y: 14, w: 10, h: 10 },
      { name: "Bedroom 3", type: "bedroom", x: 20, y: 10, w: 10, h: 10 },
      { name: "Bath 1", type: "bathroom", x: 0, y: 24, w: 6, h: 6 },
      { name: "Bath 2", type: "bathroom", x: 20, y: 20, w: 6, h: 6 },
      { name: "W/D", type: "laundry", x: 6, y: 24, w: 4, h: 4 },
      { name: "Hall", type: "entry", x: 10, y: 24, w: 10, h: 6 },
      { name: "Entry", type: "entry", x: 26, y: 20, w: 4, h: 10 },
    ],
  },
  // 1000 sqft 2-3BR - 32' x 32'
  "grand-retreat": {
    width: 32,
    depth: 32,
    rooms: [
      { name: "Great Room", type: "living", x: 0, y: 0, w: 18, h: 16 },
      { name: "Kitchen", type: "kitchen", x: 18, y: 0, w: 14, h: 12 },
      { name: "Dining", type: "entry", x: 18, y: 12, w: 14, h: 8 },
      { name: "Primary Suite", type: "bedroom", x: 0, y: 16, w: 14, h: 12 },
      { name: "Primary Bath", type: "bathroom", x: 0, y: 28, w: 8, h: 4 },
      { name: "Walk-in", type: "closet", x: 8, y: 28, w: 6, h: 4 },
      { name: "Bedroom 2", type: "bedroom", x: 14, y: 20, w: 10, h: 10 },
      { name: "Flex/BR 3", type: "bedroom", x: 24, y: 20, w: 8, h: 10 },
      { name: "Bath 2", type: "bathroom", x: 14, y: 30, w: 6, h: 2 },
      { name: "W/D", type: "laundry", x: 20, y: 30, w: 4, h: 2 },
      { name: "Entry", type: "entry", x: 24, y: 30, w: 8, h: 2 },
    ],
  },
  // 1200 sqft 3BR - 30' x 40'
  "luxury-suite": {
    width: 30,
    depth: 40,
    rooms: [
      { name: "Great Room", type: "living", x: 0, y: 0, w: 18, h: 18 },
      { name: "Kitchen", type: "kitchen", x: 18, y: 0, w: 12, h: 12 },
      { name: "Dining", type: "entry", x: 18, y: 12, w: 12, h: 8 },
      { name: "Primary Suite", type: "bedroom", x: 0, y: 18, w: 14, h: 14 },
      { name: "Primary Bath", type: "bathroom", x: 0, y: 32, w: 8, h: 8 },
      { name: "Walk-in", type: "closet", x: 8, y: 32, w: 6, h: 8 },
      { name: "Bedroom 2", type: "bedroom", x: 14, y: 20, w: 10, h: 12 },
      { name: "Bedroom 3", type: "bedroom", x: 24, y: 20, w: 6, h: 12 },
      { name: "Bath 2", type: "bathroom", x: 14, y: 32, w: 8, h: 8 },
      { name: "W/D", type: "laundry", x: 22, y: 32, w: 4, h: 4 },
      { name: "Entry", type: "entry", x: 22, y: 36, w: 8, h: 4 },
    ],
  },
  // 1200 sqft 4BR Two-Story (showing first floor)
  "modern-four": {
    width: 25,
    depth: 24,
    rooms: [
      { name: "Living Room", type: "living", x: 0, y: 0, w: 14, h: 12 },
      { name: "Kitchen", type: "kitchen", x: 14, y: 0, w: 11, h: 10 },
      { name: "Dining", type: "entry", x: 14, y: 10, w: 11, h: 6 },
      { name: "Bedroom 1", type: "bedroom", x: 0, y: 12, w: 10, h: 8 },
      { name: "Bedroom 2", type: "bedroom", x: 0, y: 20, w: 10, h: 4 },
      { name: "Bath", type: "bathroom", x: 10, y: 12, w: 6, h: 6 },
      { name: "W/D", type: "laundry", x: 10, y: 18, w: 4, h: 3 },
      { name: "Stairs Up", type: "entry", x: 16, y: 16, w: 6, h: 8 },
      { name: "Entry", type: "entry", x: 22, y: 16, w: 3, h: 8 },
    ],
  },
};

export function FloorPlanLayout({
  planId,
  sqFt,
  bedrooms,
  bathrooms,
  className = "",
  showLabels = true,
  showDimensions = true,
}: FloorPlanLayoutProps) {
  const layout = useMemo(() => {
    return PLAN_LAYOUTS[planId] || generateDefaultLayout(sqFt, bedrooms, bathrooms);
  }, [planId, sqFt, bedrooms, bathrooms]);

  const scale = 10; // pixels per foot
  const padding = 20;
  const svgWidth = layout.width * scale + padding * 2;
  const svgHeight = layout.depth * scale + padding * 2;

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto"
        style={{ maxHeight: "400px" }}
      >
        {/* Background */}
        <rect
          x={padding}
          y={padding}
          width={layout.width * scale}
          height={layout.depth * scale}
          fill="#FAFAFA"
          stroke="#333"
          strokeWidth="2"
        />

        {/* Rooms */}
        {layout.rooms.map((room, index) => (
          <g key={index}>
            <rect
              x={padding + room.x * scale}
              y={padding + room.y * scale}
              width={room.w * scale}
              height={room.h * scale}
              fill={ROOM_COLORS[room.type]}
              stroke="#666"
              strokeWidth="1"
            />
            {showLabels && (
              <text
                x={padding + room.x * scale + (room.w * scale) / 2}
                y={padding + room.y * scale + (room.h * scale) / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.min(room.w, room.h) * scale * 0.15}
                fill="#333"
                fontFamily="system-ui, sans-serif"
                fontWeight="500"
              >
                {room.name}
              </text>
            )}
          </g>
        ))}

        {/* Dimensions */}
        {showDimensions && (
          <>
            {/* Width dimension */}
            <line
              x1={padding}
              y1={svgHeight - 8}
              x2={padding + layout.width * scale}
              y2={svgHeight - 8}
              stroke="#666"
              strokeWidth="1"
            />
            <text
              x={padding + (layout.width * scale) / 2}
              y={svgHeight - 2}
              textAnchor="middle"
              fontSize="10"
              fill="#666"
              fontFamily="system-ui, sans-serif"
            >
              {layout.width}&apos;
            </text>

            {/* Depth dimension */}
            <line
              x1={svgWidth - 8}
              y1={padding}
              x2={svgWidth - 8}
              y2={padding + layout.depth * scale}
              stroke="#666"
              strokeWidth="1"
            />
            <text
              x={svgWidth - 2}
              y={padding + (layout.depth * scale) / 2}
              textAnchor="middle"
              transform={`rotate(90, ${svgWidth - 2}, ${padding + (layout.depth * scale) / 2})`}
              fontSize="10"
              fill="#666"
              fontFamily="system-ui, sans-serif"
            >
              {layout.depth}&apos;
            </text>
          </>
        )}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 p-3 border-t bg-muted/30">
        <div className="flex items-center gap-1 text-xs">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: ROOM_COLORS.living }} />
          <span>Living</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: ROOM_COLORS.kitchen }} />
          <span>Kitchen</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: ROOM_COLORS.bedroom }} />
          <span>Bedroom</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: ROOM_COLORS.bathroom }} />
          <span>Bath</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: ROOM_COLORS.laundry }} />
          <span>W/D</span>
        </div>
      </div>
    </div>
  );
}

// Generate a default layout for plans not explicitly defined
function generateDefaultLayout(sqFt: number, bedrooms: number, bathrooms: number) {
  const aspectRatio = 1.2;
  const depth = Math.round(Math.sqrt(sqFt / aspectRatio));
  const width = Math.round(sqFt / depth);

  const rooms = [];

  // Add living area (40% of space)
  rooms.push({
    name: "Living",
    type: "living" as const,
    x: 0,
    y: 0,
    w: Math.round(width * 0.6),
    h: Math.round(depth * 0.5),
  });

  // Add kitchen
  rooms.push({
    name: "Kitchen",
    type: "kitchen" as const,
    x: Math.round(width * 0.6),
    y: 0,
    w: Math.round(width * 0.4),
    h: Math.round(depth * 0.4),
  });

  // Add bedrooms
  const bedroomWidth = Math.round(width / Math.max(bedrooms, 1));
  for (let i = 0; i < bedrooms; i++) {
    rooms.push({
      name: bedrooms === 0 ? "Studio" : `BR ${i + 1}`,
      type: "bedroom" as const,
      x: i * bedroomWidth,
      y: Math.round(depth * 0.5),
      w: bedroomWidth,
      h: Math.round(depth * 0.35),
    });
  }

  // Add bathrooms
  for (let i = 0; i < bathrooms; i++) {
    rooms.push({
      name: `Bath ${i + 1}`,
      type: "bathroom" as const,
      x: width - 6 - i * 6,
      y: Math.round(depth * 0.85),
      w: 6,
      h: Math.round(depth * 0.15),
    });
  }

  // Add W/D
  rooms.push({
    name: "W/D",
    type: "laundry" as const,
    x: 0,
    y: Math.round(depth * 0.85),
    w: 4,
    h: Math.round(depth * 0.15),
  });

  return { width, depth, rooms };
}

export default FloorPlanLayout;
