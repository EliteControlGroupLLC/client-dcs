// Architectural floor plan illustrations for ADU service pages
// SVG-based components with clean, professional line drawings.
// All-dark site: the drawings keep their light drafting-paper sheet (dark ink
// linework + tinted rooms read best that way); the page frames each sheet in a
// `data-paper-panel` wrapper inside a dark card. The legend is styled for dark
// sections (it sits on bg-secondary).

// Room fills are tints of the brand tokens so the plans (and the legend
// below them) read clearly without leaving the palette:
//   living = Antique Gold tint, bedroom = pale emerald, bath = deeper emerald.
const FP = {
  ink: "#1A2B2B", // secondary — walls & labels
  sub: "#5C6B6B", // muted-foreground — dimensions, existing structures
  paper: "#F5F7F7", // muted — sheet background
  grid: "#E2E8E8", // border — grid lines, existing-structure fill
  door: "#B99A5A", // accent
  window: "#6FA3A3", // primary-light
  living: "#EDE4D1", // accent @ ~27% on white
  bedroom: "#D9E8E8", // primary-light @ ~25%
  bath: "#B0CCCC", // primary-light @ ~55%
  utility: "#FFFFFF", // closet / laundry — plain
  counter: "#C9D1D1", // secondary-light @ ~20%
  fixture: "#FFFFFF",
} as const;

interface FloorPlanProps {
  className?: string;
}

export function DetachedADUFloorPlan({ className = "" }: FloorPlanProps) {
  return (
    <svg viewBox="0 0 400 300" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid-d" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke={FP.grid} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="400" height="300" fill={FP.paper} />
      <rect width="400" height="300" fill="url(#grid-d)" />

      {/* Main structure outline */}
      <rect x="40" y="40" width="320" height="220" fill="white" stroke={FP.ink} strokeWidth="2" />

      {/* Living/Kitchen area */}
      <rect x="40" y="40" width="200" height="140" fill={FP.living} stroke={FP.ink} strokeWidth="1.5" />
      <text x="140" y="100" textAnchor="middle" fontSize="11" fontWeight="600" fill={FP.ink}>Living / Kitchen</text>
      <text x="140" y="116" textAnchor="middle" fontSize="9" fill={FP.sub}>16&apos; x 12&apos;</text>

      {/* Kitchen counter */}
      <rect x="180" y="50" width="50" height="12" fill={FP.counter} stroke={FP.ink} strokeWidth="1" rx="1" />
      <rect x="180" y="50" width="12" height="60" fill={FP.counter} stroke={FP.ink} strokeWidth="1" rx="1" />

      {/* Bedroom */}
      <rect x="240" y="40" width="120" height="130" fill={FP.bedroom} stroke={FP.ink} strokeWidth="1.5" />
      <text x="300" y="100" textAnchor="middle" fontSize="11" fontWeight="600" fill={FP.ink}>Bedroom</text>
      <text x="300" y="116" textAnchor="middle" fontSize="9" fill={FP.sub}>12&apos; x 11&apos;</text>

      {/* Bathroom */}
      <rect x="240" y="170" width="120" height="90" fill={FP.bath} stroke={FP.ink} strokeWidth="1.5" />
      <text x="300" y="210" textAnchor="middle" fontSize="11" fontWeight="600" fill={FP.ink}>Bathroom</text>
      <text x="300" y="226" textAnchor="middle" fontSize="9" fill={FP.sub}>10&apos; x 7&apos;</text>

      {/* Bathroom fixtures */}
      <rect x="320" y="180" width="30" height="18" fill={FP.fixture} stroke={FP.ink} strokeWidth="0.8" rx="2" />
      <ellipse cx="268" cy="240" rx="14" ry="10" fill={FP.fixture} stroke={FP.ink} strokeWidth="0.8" />

      {/* Closet */}
      <rect x="40" y="180" width="80" height="80" fill={FP.utility} stroke={FP.ink} strokeWidth="1.5" />
      <text x="80" y="218" textAnchor="middle" fontSize="9" fontWeight="600" fill={FP.ink}>Closet</text>

      {/* Laundry */}
      <rect x="120" y="180" width="120" height="80" fill={FP.utility} stroke={FP.ink} strokeWidth="1.5" />
      <text x="180" y="215" textAnchor="middle" fontSize="9" fontWeight="600" fill={FP.ink}>Laundry / Entry</text>

      {/* Door */}
      <line x1="160" y1="260" x2="200" y2="260" stroke={FP.door} strokeWidth="3" />
      <path d="M 160 260 A 40 40 0 0 1 200 260" fill="none" stroke={FP.door} strokeWidth="1" strokeDasharray="3,3" />

      {/* Windows */}
      <line x1="80" y1="40" x2="120" y2="40" stroke={FP.window} strokeWidth="3" />
      <line x1="280" y1="40" x2="320" y2="40" stroke={FP.window} strokeWidth="3" />

      {/* Labels */}
      <text x="200" y="288" textAnchor="middle" fontSize="10" fontWeight="700" fill={FP.ink}>Detached ADU  |  ~600 sq ft</text>
    </svg>
  );
}

export function AttachedADUFloorPlan({ className = "" }: FloorPlanProps) {
  return (
    <svg viewBox="0 0 400 300" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid-a" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke={FP.grid} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="400" height="300" fill={FP.paper} />
      <rect width="400" height="300" fill="url(#grid-a)" />

      {/* Main house (grayed out) */}
      <rect x="20" y="30" width="160" height="240" fill={FP.grid} stroke={FP.sub} strokeWidth="1.5" strokeDasharray="6,3" />
      <text x="100" y="150" textAnchor="middle" fontSize="12" fill={FP.sub} fontWeight="600">Main House</text>

      {/* Shared wall indicator */}
      <line x1="180" y1="30" x2="180" y2="270" stroke={FP.ink} strokeWidth="3" />

      {/* ADU structure */}
      <rect x="180" y="30" width="200" height="240" fill="white" stroke={FP.ink} strokeWidth="2" />

      {/* Living area */}
      <rect x="180" y="30" width="200" height="120" fill={FP.living} stroke={FP.ink} strokeWidth="1.5" />
      <text x="280" y="85" textAnchor="middle" fontSize="11" fontWeight="600" fill={FP.ink}>Living / Kitchen</text>
      <text x="280" y="101" textAnchor="middle" fontSize="9" fill={FP.sub}>14&apos; x 10&apos;</text>

      {/* Kitchen counter */}
      <rect x="330" y="40" width="40" height="10" fill={FP.counter} stroke={FP.ink} strokeWidth="1" rx="1" />
      <rect x="360" y="40" width="10" height="50" fill={FP.counter} stroke={FP.ink} strokeWidth="1" rx="1" />

      {/* Bedroom */}
      <rect x="180" y="150" width="130" height="120" fill={FP.bedroom} stroke={FP.ink} strokeWidth="1.5" />
      <text x="245" y="205" textAnchor="middle" fontSize="11" fontWeight="600" fill={FP.ink}>Bedroom</text>
      <text x="245" y="221" textAnchor="middle" fontSize="9" fill={FP.sub}>11&apos; x 10&apos;</text>

      {/* Bathroom */}
      <rect x="310" y="150" width="70" height="120" fill={FP.bath} stroke={FP.ink} strokeWidth="1.5" />
      <text x="345" y="205" textAnchor="middle" fontSize="10" fontWeight="600" fill={FP.ink}>Bath</text>
      <text x="345" y="220" textAnchor="middle" fontSize="8" fill={FP.sub}>6&apos; x 10&apos;</text>

      {/* Bathroom fixtures */}
      <rect x="340" y="160" width="25" height="15" fill={FP.fixture} stroke={FP.ink} strokeWidth="0.8" rx="2" />
      <ellipse cx="330" cy="250" rx="12" ry="8" fill={FP.fixture} stroke={FP.ink} strokeWidth="0.8" />

      {/* Door - entrance */}
      <line x1="260" y1="270" x2="300" y2="270" stroke={FP.door} strokeWidth="3" />
      <path d="M 260 270 A 40 40 0 0 1 300 270" fill="none" stroke={FP.door} strokeWidth="1" strokeDasharray="3,3" />

      {/* Interior door to main house */}
      <line x1="180" y1="60" x2="180" y2="90" stroke={FP.door} strokeWidth="3" />

      {/* Windows */}
      <line x1="220" y1="30" x2="260" y2="30" stroke={FP.window} strokeWidth="3" />
      <line x1="380" y1="80" x2="380" y2="120" stroke={FP.window} strokeWidth="3" />

      {/* Labels */}
      <text x="280" y="290" textAnchor="middle" fontSize="10" fontWeight="700" fill={FP.ink}>Attached ADU  |  ~500 sq ft</text>
    </svg>
  );
}

export function GarageConversionFloorPlan({ className = "" }: FloorPlanProps) {
  return (
    <svg viewBox="0 0 400 300" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid-g" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke={FP.grid} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="400" height="300" fill={FP.paper} />
      <rect width="400" height="300" fill="url(#grid-g)" />

      {/* Before label */}
      <text x="110" y="20" textAnchor="middle" fontSize="10" fontWeight="700" fill={FP.sub} letterSpacing="1">BEFORE</text>

      {/* Garage (before) */}
      <rect x="20" y="30" width="180" height="130" fill={FP.grid} stroke={FP.sub} strokeWidth="1.5" strokeDasharray="6,3" />
      <text x="110" y="95" textAnchor="middle" fontSize="14" fill={FP.sub} fontWeight="600">Garage</text>
      <text x="110" y="112" textAnchor="middle" fontSize="9" fill={FP.sub}>20&apos; x 20&apos;</text>
      {/* Garage door */}
      <line x1="50" y1="160" x2="170" y2="160" stroke={FP.sub} strokeWidth="2" strokeDasharray="8,4" />

      {/* Arrow */}
      <text x="200" y="100" textAnchor="middle" fontSize="24" fill={FP.door}>&#x2192;</text>

      {/* After label */}
      <text x="310" y="20" textAnchor="middle" fontSize="10" fontWeight="700" fill={FP.ink} letterSpacing="1">AFTER</text>

      {/* Converted ADU */}
      <rect x="220" y="30" width="170" height="230" fill="white" stroke={FP.ink} strokeWidth="2" />

      {/* Studio/Living */}
      <rect x="220" y="30" width="170" height="110" fill={FP.living} stroke={FP.ink} strokeWidth="1.5" />
      <text x="305" y="75" textAnchor="middle" fontSize="11" fontWeight="600" fill={FP.ink}>Studio / Living</text>
      <text x="305" y="91" textAnchor="middle" fontSize="9" fill={FP.sub}>14&apos; x 9&apos;</text>

      {/* Kitchenette */}
      <rect x="345" y="38" width="38" height="10" fill={FP.counter} stroke={FP.ink} strokeWidth="1" rx="1" />
      <rect x="375" y="38" width="8" height="40" fill={FP.counter} stroke={FP.ink} strokeWidth="1" rx="1" />

      {/* Bathroom */}
      <rect x="220" y="140" width="70" height="60" fill={FP.bath} stroke={FP.ink} strokeWidth="1.5" />
      <text x="255" y="170" textAnchor="middle" fontSize="9" fontWeight="600" fill={FP.ink}>Bath</text>
      <rect x="230" y="148" width="20" height="12" fill={FP.fixture} stroke={FP.ink} strokeWidth="0.8" rx="1" />
      <ellipse cx="272" cy="186" rx="10" ry="7" fill={FP.fixture} stroke={FP.ink} strokeWidth="0.8" />

      {/* Sleeping area */}
      <rect x="290" y="140" width="100" height="120" fill={FP.bedroom} stroke={FP.ink} strokeWidth="1.5" />
      <text x="340" y="195" textAnchor="middle" fontSize="11" fontWeight="600" fill={FP.ink}>Bedroom</text>
      <text x="340" y="211" textAnchor="middle" fontSize="9" fill={FP.sub}>8&apos; x 10&apos;</text>

      {/* Closet */}
      <rect x="220" y="200" width="70" height="60" fill={FP.utility} stroke={FP.ink} strokeWidth="1.5" />
      <text x="255" y="233" textAnchor="middle" fontSize="8" fontWeight="600" fill={FP.ink}>Closet</text>

      {/* Door */}
      <line x1="320" y1="260" x2="355" y2="260" stroke={FP.door} strokeWidth="3" />
      <path d="M 320 260 A 35 35 0 0 1 355 260" fill="none" stroke={FP.door} strokeWidth="1" strokeDasharray="3,3" />

      {/* Windows */}
      <line x1="250" y1="30" x2="290" y2="30" stroke={FP.window} strokeWidth="3" />
      <line x1="390" y1="80" x2="390" y2="110" stroke={FP.window} strokeWidth="3" />

      {/* Labels */}
      <text x="305" y="288" textAnchor="middle" fontSize="10" fontWeight="700" fill={FP.ink}>Garage Conversion  |  ~450 sq ft</text>
    </svg>
  );
}

export function JADUFloorPlan({ className = "" }: FloorPlanProps) {
  return (
    <svg viewBox="0 0 400 300" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid-j" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke={FP.grid} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="400" height="300" fill={FP.paper} />
      <rect width="400" height="300" fill="url(#grid-j)" />

      {/* Main house outline */}
      <rect x="20" y="20" width="360" height="260" fill={FP.grid} stroke={FP.sub} strokeWidth="1.5" strokeDasharray="6,3" />
      <text x="100" y="150" textAnchor="middle" fontSize="12" fill={FP.sub} fontWeight="600">Main House</text>

      {/* JADU area (highlighted) */}
      <rect x="220" y="20" width="160" height="260" fill="white" stroke={FP.ink} strokeWidth="2.5" />

      {/* Dividing wall */}
      <line x1="220" y1="20" x2="220" y2="280" stroke={FP.ink} strokeWidth="3" />

      {/* Living/Sleeping */}
      <rect x="220" y="20" width="160" height="160" fill={FP.living} stroke={FP.ink} strokeWidth="1.5" />
      <text x="300" y="90" textAnchor="middle" fontSize="11" fontWeight="600" fill={FP.ink}>Living / Sleeping</text>
      <text x="300" y="106" textAnchor="middle" fontSize="9" fill={FP.sub}>13&apos; x 13&apos;</text>

      {/* Bed illustration */}
      <rect x="330" y="40" width="40" height="55" fill={FP.fixture} stroke={FP.ink} strokeWidth="0.8" rx="2" />
      <rect x="332" y="42" width="36" height="12" fill={FP.living} stroke={FP.ink} strokeWidth="0.5" rx="1" />

      {/* Kitchenette */}
      <rect x="220" y="180" width="90" height="100" fill={FP.living} stroke={FP.ink} strokeWidth="1.5" />
      <text x="265" y="225" textAnchor="middle" fontSize="10" fontWeight="600" fill={FP.ink}>Kitchenette</text>
      <text x="265" y="240" textAnchor="middle" fontSize="8" fill={FP.sub}>7&apos; x 8&apos;</text>
      {/* Counter */}
      <rect x="228" y="188" width="45" height="8" fill={FP.counter} stroke={FP.ink} strokeWidth="0.8" rx="1" />

      {/* Bathroom */}
      <rect x="310" y="180" width="70" height="100" fill={FP.bath} stroke={FP.ink} strokeWidth="1.5" />
      <text x="345" y="225" textAnchor="middle" fontSize="10" fontWeight="600" fill={FP.ink}>Bath</text>
      <text x="345" y="240" textAnchor="middle" fontSize="8" fill={FP.sub}>5&apos; x 8&apos;</text>
      {/* Fixtures */}
      <rect x="340" y="188" width="22" height="14" fill={FP.fixture} stroke={FP.ink} strokeWidth="0.8" rx="1" />
      <ellipse cx="330" cy="264" rx="10" ry="7" fill={FP.fixture} stroke={FP.ink} strokeWidth="0.8" />

      {/* Exterior door */}
      <line x1="250" y1="280" x2="285" y2="280" stroke={FP.door} strokeWidth="3" />
      <path d="M 250 280 A 35 35 0 0 1 285 280" fill="none" stroke={FP.door} strokeWidth="1" strokeDasharray="3,3" />

      {/* Interior door to main house */}
      <line x1="220" y1="60" x2="220" y2="90" stroke={FP.door} strokeWidth="3" />

      {/* Windows */}
      <line x1="260" y1="20" x2="300" y2="20" stroke={FP.window} strokeWidth="3" />
      <line x1="380" y1="60" x2="380" y2="100" stroke={FP.window} strokeWidth="3" />

      {/* Legend */}
      <text x="300" y="295" textAnchor="middle" fontSize="10" fontWeight="700" fill={FP.ink}>Junior ADU (JADU)  |  ~350 sq ft</text>
    </svg>
  );
}

// Legend component — swatches use the exact plan colors.
const legendItems = [
  { label: "Door", color: FP.door, line: true },
  { label: "Window", color: FP.window, line: true },
  { label: "Living", color: FP.living },
  { label: "Bedroom", color: FP.bedroom },
  { label: "Bathroom", color: FP.bath },
] as const;

export function FloorPlanLegend({ className = "" }: FloorPlanProps) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/80 ${className}`}>
      {legendItems.map((item) => (
        <span key={item.label} className="flex items-center gap-2">
          {"line" in item ? (
            <span className="w-5 h-1 rounded-full inline-block" style={{ backgroundColor: item.color }} />
          ) : (
            <span
              className="w-4 h-4 rounded-sm inline-block border border-white/30"
              style={{ backgroundColor: item.color }}
            />
          )}
          {item.label}
        </span>
      ))}
    </div>
  );
}
