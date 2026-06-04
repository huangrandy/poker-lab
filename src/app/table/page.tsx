"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

type Seat = {
  id: string;
  angle: number;
  label: string;
  stack: string;
  action: string;
};

const DESIGN = {
  width: 1600,
  height: 980,
  centerX: 800,
  centerY: 490,
  tableWidth: 1380,
  tableHeight: 760,
  seatRadiusX: 708,
  seatRadiusY: 392,
  seatUnitWidth: 380,
  seatUnitHeight: 220,
  seatWidth: 328,
  seatHeight: 132,
  cardWidth: 82,
  cardHeight: 118,
  cardGap: 16,
  communityCardWidth: 92,
  communityCardHeight: 138,
  communityCardGap: 18,
  potWidth: 232,
  potHeight: 72,
} as const;

type SeatLayout = {
  kind: "center" | "side";
  flipX: boolean;
  flipY: boolean;
  actionNudgeY?: number;
};

const seats: Seat[] = [
  { id: "seat-1", angle: 90, label: "Seat 1", stack: "$0", action: "Check" },
  { id: "seat-2", angle: 30, label: "Seat 2", stack: "$0", action: "Check" },
  { id: "seat-3", angle: 330, label: "Seat 3", stack: "$0", action: "Check" },
  { id: "seat-4", angle: 270, label: "Seat 4", stack: "$0", action: "Check" },
  { id: "seat-5", angle: 210, label: "Seat 5", stack: "$0", action: "Check" },
  { id: "seat-6", angle: 150, label: "Seat 6", stack: "$0", action: "Check" },
];

const seatLayouts: Record<number, SeatLayout> = {
  90: { kind: "center", flipX: false, flipY: false },
  270: { kind: "center", flipX: false, flipY: true, actionNudgeY: -85 },
  210: { kind: "side", flipX: false, flipY: false },
  30: { kind: "side", flipX: true, flipY: true },
  150: { kind: "side", flipX: false, flipY: true },
  330: { kind: "side", flipX: true, flipY: false },
};

const seatLocalRects = {
  center: {
    banner: { left: 22, top: 64, width: 336, height: 132 },
    cards: { left: 100, top: 0, width: 180, height: 118 },
    action: { left: 122, top: 230, width: 136, height: 32 },
  },
  side: {
    banner: { left: 20, top: 64, width: 340, height: 132 },
    cards: { left: 8, top: 6, width: 180, height: 118 },
    action: { left: 375, top: 50, width: 136, height: 32 },
  },
} as const;

function useTableScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const availableWidth = window.innerWidth - 48;
      const availableHeight = window.innerHeight - 48;
      const widthScale = availableWidth / DESIGN.width;
      const heightScale = availableHeight / DESIGN.height;
      setScale(Math.min(1, widthScale, heightScale));
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return scale;
}

function pointOnEllipse(angle: number, radiusX: number, radiusY: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: DESIGN.centerX + Math.cos(radians) * radiusX,
    y: DESIGN.centerY - Math.sin(radians) * radiusY,
  };
}

function scaledPoint(point: { x: number; y: number }, scale: number) {
  return {
    x: point.x * scale,
    y: point.y * scale,
  };
}

type SeatPlacement = Seat & {
  left: number;
  top: number;
  layout: SeatLayout;
};

function mirrorRect(
  rect: { left: number; top: number; width: number; height: number },
  boxWidth: number,
  boxHeight: number,
  flipX: boolean,
  flipY: boolean
) {
  return {
    left: flipX ? boxWidth - rect.left - rect.width : rect.left,
    top: flipY ? boxHeight - rect.top - rect.height : rect.top,
    width: rect.width,
    height: rect.height,
  };
}

export default function TablePage() {
  const scale = useTableScale();
  const boardWidth = DESIGN.width * scale;
  const boardHeight = DESIGN.height * scale;
  const tableWidth = DESIGN.tableWidth * scale;
  const tableHeight = DESIGN.tableHeight * scale;

  const scaleStyle = {
    "--table-scale": scale,
    "--board-width": `${DESIGN.width}px`,
    "--board-height": `${DESIGN.height}px`,
    "--table-width": `${DESIGN.tableWidth}px`,
    "--table-height": `${DESIGN.tableHeight}px`,
    "--seat-width": `${DESIGN.seatWidth}px`,
    "--seat-height": `${DESIGN.seatHeight}px`,
    "--card-width": `${DESIGN.cardWidth}px`,
    "--card-height": `${DESIGN.cardHeight}px`,
    "--community-card-width": `${DESIGN.communityCardWidth}px`,
    "--community-card-height": `${DESIGN.communityCardHeight}px`,
  } as CSSProperties & Record<string, string | number>;

  const seatPlacements: SeatPlacement[] = seats.map((seat) => {
    const point = scaledPoint(
      pointOnEllipse(seat.angle, DESIGN.seatRadiusX, DESIGN.seatRadiusY),
      scale
    );

    return {
      ...seat,
      left: point.x,
      top: point.y,
      layout: seatLayouts[seat.angle],
    };
  });

  return (
    <main style={styles.page}>
      <div style={{ ...styles.viewport, width: boardWidth, height: boardHeight }}>
        <section style={{ ...styles.board, ...scaleStyle, width: boardWidth, height: boardHeight }}>
          <div
            style={{
              ...styles.tableRim,
              left: (boardWidth - tableWidth) / 2,
              top: (boardHeight - tableHeight) / 2,
              width: tableWidth,
              height: tableHeight,
            }}
          >
            <div style={styles.tableSurface} />
          </div>

          <div style={styles.centerStack}>
            <div
              style={{
                ...styles.pot,
                width: DESIGN.potWidth * scale,
                height: DESIGN.potHeight * scale,
                top: 314 * scale,
              }}
            >
              <span style={{ ...styles.potLabel, fontSize: `${11 * scale}px` }}>
                Pot
              </span>
              <span style={{ ...styles.potValue, fontSize: `${44 * scale}px` }}>
                $340
              </span>
            </div>

            <div
              style={{
                ...styles.communityRow,
                top: 438 * scale,
                gap: 18 * scale,
                width:
                  DESIGN.communityCardWidth * 5 * scale +
                  DESIGN.communityCardGap * 4 * scale,
              }}
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`community-${index}`}
                  style={{
                    ...styles.communityCard,
                    width: DESIGN.communityCardWidth * scale,
                    height: DESIGN.communityCardHeight * scale,
                  }}
                />
              ))}
            </div>
          </div>

          {seatPlacements.map((seat) => {
            const localRects = seatLocalRects[seat.layout.kind];
            const bannerRect = mirrorRect(
              localRects.banner,
              DESIGN.seatUnitWidth,
              DESIGN.seatUnitHeight,
              seat.layout.flipX,
              seat.layout.flipY
            );
            const cardsWidth = DESIGN.cardWidth * 2 + DESIGN.cardGap;
            const cardsRect = {
              left:
                bannerRect.left + (bannerRect.width - cardsWidth) / 2,
              top: bannerRect.top - DESIGN.cardHeight + 30,
              width: cardsWidth,
              height: DESIGN.cardHeight,
            };
            const actionRect = mirrorRect(
              localRects.action,
              DESIGN.seatUnitWidth,
              DESIGN.seatUnitHeight,
              seat.layout.flipX,
              seat.layout.flipY
            );

            return (
              <div
                key={seat.id}
                style={{
                  ...styles.seatGroup,
                  left: seat.left,
                  top: seat.top,
                  width: DESIGN.seatUnitWidth * scale,
                  height: DESIGN.seatUnitHeight * scale,
                }}
              >
                <div
                  style={{
                    ...styles.holeCards,
                    left: cardsRect.left * scale,
                    top: cardsRect.top * scale,
                    width: cardsRect.width * scale,
                    gap: DESIGN.cardGap * scale,
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      ...styles.holeCard,
                      width: DESIGN.cardWidth * scale,
                      height: DESIGN.cardHeight * scale,
                    }}
                  />
                  <div
                    style={{
                      ...styles.holeCard,
                      width: DESIGN.cardWidth * scale,
                      height: DESIGN.cardHeight * scale,
                    }}
                  />
                </div>

                <div
                  style={{
                    ...styles.actionTag,
                    left: actionRect.left * scale,
                    top:
                      (actionRect.top + (seat.layout.actionNudgeY ?? 0)) * scale,
                    width: actionRect.width * scale,
                    height: actionRect.height * scale,
                    zIndex: 2,
                    fontSize: `${13 * scale}px`,
                  }}
                >
                  {seat.action}
                </div>

                <div
                  style={{
                    ...styles.seat,
                    left: bannerRect.left * scale,
                    top: bannerRect.top * scale,
                    width: DESIGN.seatWidth * scale,
                    height: DESIGN.seatHeight * scale,
                    gap: 14 * scale,
                    padding: 14 * scale,
                    zIndex: 3,
                  }}
                >
                  <div
                    style={{
                      ...styles.avatar,
                      width: 74 * scale,
                      height: 74 * scale,
                    }}
                  />
                  <div style={styles.seatText}>
                    <div
                      style={{
                        ...styles.seatLabel,
                        fontSize: `${18 * scale}px`,
                      }}
                    >
                      {seat.label}
                    </div>
                    <div
                      style={{
                        ...styles.seatStack,
                        fontSize: `${14 * scale}px`,
                      }}
                    >
                      {seat.stack}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
    padding: "24px",
    background: "#07100c",
    color: "#fff",
  },
  viewport: {
    position: "relative" as const,
  },
  board: {
    position: "relative" as const,
  },
  seatGroup: {
    position: "absolute" as const,
    transform: "translate(-50%, -50%)",
    overflow: "visible",
  },
  tableRim: {
    position: "absolute" as const,
    borderRadius: "9999px",
    background: "#2e2e2e",
    boxShadow: "none",
    padding: "14px",
  },
  tableSurface: {
    width: "100%",
    height: "100%",
    borderRadius: "9999px",
    background: "#1b6f3c",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
  },
  centerStack: {
    position: "absolute" as const,
    inset: 0,
  },
  pot: {
    position: "absolute" as const,
    left: "50%",
    transform: "translateX(-50%)",
    borderRadius: "18px",
    background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "grid",
    placeItems: "center",
    alignContent: "center",
    gap: "2px",
    padding: "10px 20px",
  },
  potLabel: {
    fontSize: "11px",
    letterSpacing: "0.28em",
    textTransform: "uppercase" as const,
    color: "rgba(255,255,255,0.62)",
  },
  potValue: {
    fontSize: "30px",
    fontWeight: 700,
    lineHeight: 1,
  },
  communityRow: {
    position: "absolute" as const,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "18px",
  },
  communityCard: {
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#f1f1f1",
    boxShadow: "none",
  },
  holeCards: {
    position: "absolute" as const,
    display: "flex",
  },
  holeCard: {
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#f1f1f1",
    boxShadow: "none",
  },
  actionTag: {
    position: "absolute" as const,
    borderRadius: "9999px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.2)",
    color: "rgba(255,255,255,0.82)",
    display: "grid",
    placeItems: "center",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    whiteSpace: "nowrap",
  },
  seat: {
    position: "absolute" as const,
    borderRadius: "18px",
    background: "#090909",
    border: "1px solid rgba(255,255,255,0.14)",
    boxShadow: "none",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
  },
  avatar: {
    flex: "0 0 auto",
    borderRadius: "9999px",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  seatText: {
    display: "grid",
    gap: "8px",
    minWidth: 0,
  },
  seatLabel: {
    fontWeight: 600,
    letterSpacing: "-0.02em",
  },
  seatStack: {
    color: "rgba(255,255,255,0.8)",
  },
} satisfies Record<string, CSSProperties>;
