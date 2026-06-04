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
  cardRadiusX: 592,
  cardRadiusY: 320,
  actionRadiusX: 472,
  actionRadiusY: 252,
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

const seats: Seat[] = [
  { id: "seat-1", angle: 90, label: "Seat 1", stack: "$0", action: "Check" },
  { id: "seat-2", angle: 30, label: "Seat 2", stack: "$0", action: "Check" },
  { id: "seat-3", angle: 330, label: "Seat 3", stack: "$0", action: "Check" },
  { id: "seat-4", angle: 270, label: "Seat 4", stack: "$0", action: "Check" },
  { id: "seat-5", angle: 210, label: "Seat 5", stack: "$0", action: "Check" },
  { id: "seat-6", angle: 150, label: "Seat 6", stack: "$0", action: "Check" },
];

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

  const seatRadii = {
    seatX: DESIGN.seatRadiusX,
    seatY: DESIGN.seatRadiusY,
    cardX: DESIGN.cardRadiusX,
    cardY: DESIGN.cardRadiusY,
    actionX: DESIGN.actionRadiusX,
    actionY: DESIGN.actionRadiusY,
  };

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
                top: 324 * scale,
              }}
            >
              <span style={{ ...styles.potLabel, fontSize: `${11 * scale}px` }}>
                Pot
              </span>
              <span style={{ ...styles.potValue, fontSize: `${30 * scale}px` }}>
                $340
              </span>
            </div>

            <div
              style={{
                ...styles.communityRow,
                top: 466 * scale,
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

          {seats.map((seat) => {
            const seatPoint = scaledPoint(
              pointOnEllipse(seat.angle, seatRadii.seatX, seatRadii.seatY),
              scale
            );
            const cardPoint = scaledPoint(
              pointOnEllipse(seat.angle, seatRadii.cardX, seatRadii.cardY),
              scale
            );
            const actionPoint = scaledPoint(
              pointOnEllipse(seat.angle, seatRadii.actionX, seatRadii.actionY),
              scale
            );

            return (
              <div key={seat.id}>
                <div
                  style={{
                    ...styles.holeCards,
                    left: cardPoint.x,
                    top: cardPoint.y,
                    width:
                      DESIGN.cardWidth * 2 * scale + DESIGN.cardGap * scale,
                    gap: DESIGN.cardGap * scale,
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
                    left: actionPoint.x,
                    top: actionPoint.y,
                    padding: `${10 * scale}px ${16 * scale}px`,
                    fontSize: `${14 * scale}px`,
                  }}
                >
                  {seat.action}
                </div>

                <div
                  style={{
                    ...styles.seat,
                    left: seatPoint.x,
                    top: seatPoint.y,
                    width: DESIGN.seatWidth * scale,
                    height: DESIGN.seatHeight * scale,
                    gap: 16 * scale,
                    padding: 16 * scale,
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
    background:
      "radial-gradient(circle at top, #17201b 0%, #09110d 52%, #050807 100%)",
    color: "#fff",
  },
  viewport: {
    position: "relative" as const,
  },
  board: {
    position: "relative" as const,
  },
  tableRim: {
    position: "absolute" as const,
    borderRadius: "9999px",
    background:
      "linear-gradient(180deg, rgba(248,248,248,0.45) 0%, rgba(160,160,160,0.18) 24%, rgba(36,36,36,0.95) 100%)",
    boxShadow:
      "0 40px 100px rgba(0,0,0,0.55), inset 0 2px 1px rgba(255,255,255,0.2)",
    padding: "18px",
  },
  tableSurface: {
    width: "100%",
    height: "100%",
    borderRadius: "9999px",
    background:
      "radial-gradient(circle at 50% 0%, rgba(72, 180, 103, 0.18) 0%, rgba(23, 120, 57, 0.12) 28%, rgba(17, 94, 49, 0.95) 58%, rgba(11, 59, 31, 1) 100%)",
    boxShadow:
      "inset 0 0 0 1px rgba(255,255,255,0.1), inset 0 0 60px rgba(0,0,0,0.34)",
  },
  centerStack: {
    position: "absolute" as const,
    inset: 0,
  },
  pot: {
    position: "absolute" as const,
    left: "50%",
    transform: "translateX(-50%)",
    borderRadius: "16px",
    background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "grid",
    placeItems: "center",
    alignContent: "center",
    gap: "4px",
    backdropFilter: "blur(8px)",
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
    border: "1px solid rgba(255,255,255,0.12)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(243,243,243,0.96) 100%)",
    boxShadow:
      "0 14px 28px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.75)",
  },
  holeCards: {
    position: "absolute" as const,
    transform: "translate(-50%, -50%)",
    display: "flex",
  },
  holeCard: {
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.12)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(246,246,246,0.96) 100%)",
    boxShadow:
      "0 12px 22px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.7)",
  },
  actionTag: {
    position: "absolute" as const,
    transform: "translate(-50%, -50%)",
    borderRadius: "9999px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.26)",
    color: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(10px)",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    whiteSpace: "nowrap",
  },
  seat: {
    position: "absolute" as const,
    transform: "translate(-50%, -50%)",
    borderRadius: "20px",
    background: "rgba(0,0,0,0.9)",
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow: "0 18px 36px rgba(0,0,0,0.42)",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
  },
  avatar: {
    flex: "0 0 auto",
    borderRadius: "9999px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.1) 100%)",
    border: "1px solid rgba(255,255,255,0.16)",
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
