"use client";

interface SiteDiagramProps {
  lotWidth?: number;
  lotDepth?: number;
  mainHomeWidth?: number;
  mainHomeDepth?: number;
}

export function SiteDiagram({
  lotWidth = 60,
  lotDepth = 120,
  mainHomeWidth = 35,
  mainHomeDepth = 45,
}: SiteDiagramProps) {
  // Scale everything to fit in a viewBox
  const padding = 20;
  const svgWidth = 400;
  const svgHeight = 320;

  // Scale factors
  const scaleX = (svgWidth - padding * 2) / lotWidth;
  const scaleY = (svgHeight - padding * 2) / lotDepth;
  const scale = Math.min(scaleX, scaleY);

  const lotW = lotWidth * scale;
  const lotH = lotDepth * scale;
  const lotX = (svgWidth - lotW) / 2;
  const lotY = (svgHeight - lotH) / 2;

  // Setbacks (3ft from property lines)
  const setback = 3 * scale;

  // Main home (centered horizontally, near front)
  const homeW = mainHomeWidth * scale;
  const homeH = mainHomeDepth * scale;
  const homeX = lotX + (lotW - homeW) / 2;
  const homeY = lotY + 8 * scale; // 8ft from front

  // 6ft separation zone from main home
  const separation = 6 * scale;

  // ADU build zone
  const aduZoneX = lotX + setback;
  const aduZoneY = homeY + homeH + separation;
  const aduZoneW = lotW - setback * 2;
  const aduZoneH = lotY + lotH - setback - aduZoneY;

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <h4 className="text-sm font-semibold text-secondary mb-1">Site Layout Diagram</h4>
      <p className="text-xs text-muted-foreground mb-4">
        Estimated property layout with setbacks and ADU build zone
      </p>

      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full" style={{ maxHeight: 320 }}>
        {/* Property boundary */}
        <rect
          x={lotX}
          y={lotY}
          width={lotW}
          height={lotH}
          fill="none"
          stroke="#0F2A4A"
          strokeWidth="2"
          strokeDasharray="6 3"
          rx="2"
        />

        {/* Setback zone (3ft from property lines) */}
        <rect
          x={lotX + setback}
          y={lotY + setback}
          width={lotW - setback * 2}
          height={lotH - setback * 2}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.6"
          rx="1"
        />

        {/* Main house footprint */}
        <rect
          x={homeX}
          y={homeY}
          width={homeW}
          height={homeH}
          fill="#0F2A4A"
          opacity="0.15"
          stroke="#0F2A4A"
          strokeWidth="1.5"
          rx="3"
        />
        <text
          x={homeX + homeW / 2}
          y={homeY + homeH / 2 - 6}
          textAnchor="middle"
          className="text-[10px] font-semibold fill-secondary"
        >
          Main Residence
        </text>
        <text
          x={homeX + homeW / 2}
          y={homeY + homeH / 2 + 8}
          textAnchor="middle"
          className="text-[9px] fill-muted-foreground"
        >
          ~{mainHomeWidth}ft x {mainHomeDepth}ft
        </text>

        {/* 6ft separation zone */}
        <rect
          x={homeX - 4}
          y={homeY + homeH}
          width={homeW + 8}
          height={separation}
          fill="#EF4444"
          opacity="0.08"
          stroke="#EF4444"
          strokeWidth="0.5"
          strokeDasharray="3 3"
        />

        {/* ADU build zone */}
        {aduZoneH > 0 && (
          <>
            <rect
              x={aduZoneX}
              y={aduZoneY}
              width={aduZoneW}
              height={Math.max(aduZoneH, 0)}
              fill="#3ECDA2"
              opacity="0.12"
              stroke="#3ECDA2"
              strokeWidth="1.5"
              rx="3"
            />
            <text
              x={aduZoneX + aduZoneW / 2}
              y={aduZoneY + Math.max(aduZoneH, 20) / 2 - 4}
              textAnchor="middle"
              className="text-[11px] font-bold"
              fill="#2BA87F"
            >
              ADU Build Zone
            </text>
            <text
              x={aduZoneX + aduZoneW / 2}
              y={aduZoneY + Math.max(aduZoneH, 20) / 2 + 10}
              textAnchor="middle"
              className="text-[9px]"
              fill="#2BA87F"
            >
              Estimated buildable area
            </text>
          </>
        )}

        {/* Labels */}
        {/* Property boundary label */}
        <text x={lotX + lotW / 2} y={lotY - 6} textAnchor="middle" className="text-[9px] font-medium fill-secondary">
          Property Boundary ({lotWidth}ft x {lotDepth}ft)
        </text>

        {/* Setback label */}
        <text x={lotX + lotW + 4} y={lotY + setback + 10} className="text-[8px] fill-warning" textAnchor="start">
          3ft setback
        </text>

        {/* Separation label */}
        <text x={homeX + homeW + 8} y={homeY + homeH + separation / 2 + 3} className="text-[8px] fill-destructive" textAnchor="start">
          6ft min.
        </text>

        {/* Legend */}
        <rect x={12} y={svgHeight - 60} width={10} height={10} fill="#0F2A4A" opacity="0.15" stroke="#0F2A4A" strokeWidth="1" rx="1" />
        <text x={26} y={svgHeight - 52} className="text-[8px] fill-muted-foreground">Main Home</text>

        <rect x={12} y={svgHeight - 44} width={10} height={10} fill="#3ECDA2" opacity="0.15" stroke="#3ECDA2" strokeWidth="1" rx="1" />
        <text x={26} y={svgHeight - 36} className="text-[8px] fill-muted-foreground">ADU Build Zone</text>

        <line x1={12} y1={svgHeight - 24} x2={22} y2={svgHeight - 24} stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" />
        <text x={26} y={svgHeight - 20} className="text-[8px] fill-muted-foreground">3ft Setbacks</text>

        <line x1={12} y1={svgHeight - 10} x2={22} y2={svgHeight - 10} stroke="#EF4444" strokeWidth="1" strokeDasharray="3 3" />
        <text x={26} y={svgHeight - 6} className="text-[8px] fill-muted-foreground">6ft Separation</text>
      </svg>
    </div>
  );
}
