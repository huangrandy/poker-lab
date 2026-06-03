"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import type { CSSProperties, PointerEvent } from "react";
import { useState } from "react";

type Suit = "spades" | "hearts" | "diamonds" | "clubs";

type CardTemplate = {
  rank: string;
  offsetY?: number;
  tilt?: number;
  overlap?: number;
};

type CardData = CardTemplate & {
  suit: Suit;
  suitLabel: string;
  isRed: boolean;
};

const cards: CardTemplate[] = [
  {
    rank: "A",
    tilt: -8,
    offsetY: 0,
  },
  {
    rank: "K",
    tilt: 8,
    offsetY: 14,
  },
];

export default function Home() {
  const [suits, setSuits] = useState<[Suit, Suit]>(["spades", "hearts"]);
  const hand = cards.map((card, index) =>
    createCardData(card, suits[index], index === 0 ? 0 : -24)
  );

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.header}>
          <p style={styles.kicker}>Poker hand</p>
          <h1 style={styles.title}>Two-card hand</h1>
          <p style={styles.subtitle}>
            Hover each card to tilt it toward the cursor. Click to flip it.
          </p>
        </div>

        <div style={styles.menuBar}>
          {suits.map((suit, index) => (
            <label key={`suit-${index}`} style={styles.menuItem}>
              <span style={styles.menuLabel}>
                {index === 0 ? "Left card" : "Right card"}
              </span>
              <select
                value={suit}
                onChange={(event) => {
                  const nextSuit = event.target.value as Suit;
                  setSuits((current) => {
                    const next = [...current] as [Suit, Suit];
                    next[index] = nextSuit;
                    return next;
                  });
                }}
                style={styles.select}
              >
                <option value="spades">Spades</option>
                <option value="hearts">Hearts</option>
                <option value="diamonds">Diamonds</option>
                <option value="clubs">Clubs</option>
              </select>
            </label>
          ))}
        </div>

        <div style={styles.hand}>
          {hand.map((card) => (
            <PokerCard key={`${card.rank}-${card.suit}`} {...card} />
          ))}
        </div>
      </div>
    </main>
  );
}

function PokerCard({
  rank,
  suit,
  suitLabel,
  isRed,
  offsetY = 0,
  tilt = 0,
  overlap = 0,
}: CardData) {
  const prefersReducedMotion = useReducedMotion();
  const [flipped, setFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const xPercent = useMotionValue(0);
  const yPercent = useMotionValue(0);
  const scale = useSpring(1, { stiffness: 260, damping: 24 });

  const hoverTilt = prefersReducedMotion ? 0 : 8;
  const rotateX = useTransform(
    yPercent,
    [-0.5, 0.5],
    [`${hoverTilt}deg`, `-${hoverTilt}deg`]
  );
  const rotateY = useTransform(
    xPercent,
    [-0.5, 0.5],
    [`-${hoverTilt}deg`, `${hoverTilt}deg`]
  );
  const sheenX = useTransform(() => mouseX.get() - 180);
  const sheenY = useTransform(() => mouseY.get() - 180);

  const updatePointer = (event: PointerEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion) {
      return;
    }

    const { width, height, left, top } =
      event.currentTarget.getBoundingClientRect();

    const currentX = event.clientX - left;
    const currentY = event.clientY - top;

    xPercent.set(currentX / width - 0.5);
    yPercent.set(currentY / height - 0.5);
    mouseX.set(currentX);
    mouseY.set(currentY);
  };

  const resetPointer = () => {
    xPercent.set(0);
    yPercent.set(0);
    scale.set(1);
    setIsHovered(false);
  };

  return (
    <div
      style={{
        ...styles.cardOuter,
        marginLeft: overlap,
        transform: `translateY(${offsetY}px) rotate(${tilt}deg)`,
      }}
    >
      <motion.button
        type="button"
        aria-pressed={flipped}
        aria-label={`${rank} of ${suitLabel}. Click to flip.`}
        onClick={() => setFlipped((current) => !current)}
        onPointerEnter={(event) => {
          setIsHovered(true);
          updatePointer(event);
          if (!prefersReducedMotion) {
            scale.set(1.035);
          }
        }}
        onPointerMove={updatePointer}
        onPointerLeave={resetPointer}
        style={{
          ...styles.cardFrame,
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
          perspective: "1200px",
        }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 240, damping: 26 }
          }
          style={{
            ...styles.flipStage,
            transformStyle: "preserve-3d",
          }}
        >
          <div style={styles.faceFront}>
            <motion.div
              animate={{ opacity: isHovered && !prefersReducedMotion ? 0.25 : 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                width: "360px",
                height: "360px",
                borderRadius: "9999px",
                pointerEvents: "none",
                left: sheenX,
                top: sheenY,
              }}
            >
              <div
                style={{
                  ...styles.sheen,
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0) 72%)",
                }}
              />
            </motion.div>
            <PokerFace rank={rank} suit={suit} isRed={isRed} />
          </div>

          <div aria-hidden="true" style={styles.faceBack}>
            <div style={styles.backStripe} />
            <div style={styles.backInnerRing} />
            <div style={styles.backCenter}>
              <div style={styles.backBadge}>Back</div>
            </div>
          </div>
        </motion.div>
      </motion.button>

      <div style={styles.caption}>
        {rank} of {suitLabel}
      </div>
    </div>
  );
}

function PokerFace({
  rank,
  suit,
  isRed,
}: {
  rank: string;
  suit: Suit;
  isRed: boolean;
}) {
  const suitGlyph = {
    spades: "♠",
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
  }[suit];

  const textColor = isRed ? "#ef476f" : "#4a3f7a";
  const glowColor = isRed ? "rgba(255, 84, 158, 0.65)" : "rgba(184, 151, 255, 0.7)";
  const softGlowColor = isRed ? "rgba(255, 84, 158, 0.28)" : "rgba(184, 151, 255, 0.3)";

  return (
    <div style={styles.faceContent}>
      <div style={{ ...styles.faceTop, color: textColor }}>
        <div style={styles.faceCornerStack}>
          <span
            style={{
              ...styles.rank,
              color: textColor,
              textShadow: `0 0 2px rgba(255,255,255,0.9), 0 0 10px ${softGlowColor}, 0 0 22px ${glowColor}`,
            }}
          >
            {rank}
          </span>
          <span
            style={{
              ...styles.cornerSuit,
              color: textColor,
              textShadow: `0 0 2px rgba(255,255,255,0.9), 0 0 10px ${softGlowColor}, 0 0 22px ${glowColor}`,
            }}
          >
            {suitGlyph}
          </span>
        </div>
        <span
          style={{
            ...styles.cornerSuit,
            color: textColor,
            textShadow: `0 0 2px rgba(255,255,255,0.9), 0 0 10px ${softGlowColor}, 0 0 22px ${glowColor}`,
          }}
        >
          {suitGlyph}
        </span>
      </div>

      <div style={{ ...styles.faceCenter, color: textColor }}>
        <div style={styles.centerStack}>
          <div
            style={{
              ...styles.centerSuit,
              color: textColor,
              textShadow: `0 0 3px rgba(255,255,255,0.95), 0 0 14px ${softGlowColor}, 0 0 32px ${glowColor}`,
              filter: "drop-shadow(0 0 12px rgba(255,255,255,0.14))",
            }}
          >
            {suitGlyph}
          </div>
          <div
            style={{
              ...styles.centerLabel,
              color: textColor,
              textShadow: `0 0 8px ${softGlowColor}`,
            }}
          >
            {suit}
          </div>
        </div>
      </div>

      <div style={{ ...styles.faceBottom, color: textColor }}>
        <div style={styles.faceCornerStack}>
          <span
            style={{
              ...styles.rank,
              color: textColor,
              textShadow: `0 0 2px rgba(255,255,255,0.9), 0 0 10px ${softGlowColor}, 0 0 22px ${glowColor}`,
            }}
          >
            {rank}
          </span>
          <span
            style={{
              ...styles.cornerSuit,
              color: textColor,
              textShadow: `0 0 2px rgba(255,255,255,0.9), 0 0 10px ${softGlowColor}, 0 0 22px ${glowColor}`,
            }}
          >
            {suitGlyph}
          </span>
        </div>
        <span
          style={{
            ...styles.cornerSuit,
            color: textColor,
            textShadow: `0 0 2px rgba(255,255,255,0.9), 0 0 10px ${softGlowColor}, 0 0 22px ${glowColor}`,
          }}
        >
          {suitGlyph}
        </span>
      </div>
    </div>
  );
}

function createCardData(
  card: CardTemplate,
  suit: Suit,
  overlap: number
): CardData {
  const suitLabel = suit.charAt(0).toUpperCase() + suit.slice(1);

  return {
    ...card,
    suit,
    suitLabel,
    isRed: suit === "hearts" || suit === "diamonds",
    overlap,
  };
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    overflow: "hidden",
    padding: "48px 24px",
    color: "#fff",
    background:
      "radial-gradient(circle at top, #1f7a44 0%, #0f3b24 42%, #07150d 100%)",
  },
  shell: {
    minHeight: "calc(100vh - 96px)",
    maxWidth: "1100px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "24px",
  },
  header: {
    textAlign: "center",
    maxWidth: "700px",
  },
  kicker: {
    margin: 0,
    fontSize: "12px",
    letterSpacing: "0.35em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.65)",
  },
  title: {
    margin: "12px 0 0",
    fontSize: "clamp(2rem, 4vw, 2.75rem)",
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
  },
  subtitle: {
    margin: "12px auto 0",
    maxWidth: "42rem",
    fontSize: "14px",
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.7)",
  },
  menuBar: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },
  menuItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minWidth: "150px",
  },
  menuLabel: {
    fontSize: "11px",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.72)",
  },
  select: {
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    padding: "12px 14px",
    fontSize: "14px",
    outline: "none",
    backdropFilter: "blur(12px)",
  },
  hand: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardOuter: {
    position: "relative",
    width: "240px",
    height: "368px",
  },
  cardFrame: {
    position: "relative",
    width: "100%",
    height: "100%",
    borderRadius: "28px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
  },
  flipStage: {
    position: "absolute",
    inset: 0,
    borderRadius: "24px",
  },
  faceFront: {
    position: "absolute",
    inset: 0,
    borderRadius: "24px",
    background: "linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)",
    boxShadow: "0 25px 50px rgba(0,0,0,0.35)",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    overflow: "hidden",
  },
  sheen: {
    position: "absolute",
    borderRadius: "9999px",
    width: "360px",
    height: "360px",
    left: "-120px",
    top: "-120px",
  },
  faceBack: {
    position: "absolute",
    inset: 0,
    borderRadius: "24px",
    border: "1px solid rgba(6,95,70,0.2)",
    background:
      "radial-gradient(circle at top, #1f8a4a 0%, #0f5f34 45%, #0b3f23 100%)",
    boxShadow: "0 25px 50px rgba(0,0,0,0.35)",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    transform: "rotateY(180deg)",
    overflow: "hidden",
  },
  backStripe: {
    position: "absolute",
    inset: "12px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.1)",
    background:
      "repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0, rgba(255,255,255,0.08) 10px, transparent 10px, transparent 20px)",
  },
  backInnerRing: {
    position: "absolute",
    inset: "24px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.15)",
    background:
      "radial-gradient(circle at center, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.02) 100%)",
  },
  backCenter: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  backBadge: {
    width: "80px",
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "9999px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.85)",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
  },
  caption: {
    position: "absolute",
    left: "50%",
    bottom: "-28px",
    transform: "translateX(-50%)",
    fontSize: "10px",
    letterSpacing: "0.35em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.55)",
  },
  faceContent: {
    position: "relative",
    display: "flex",
    height: "100%",
    width: "100%",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "16px",
    borderRadius: "24px",
  },
  faceTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  faceBottom: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    transform: "rotate(180deg)",
  },
  faceCornerStack: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1,
  },
  rank: {
    fontSize: "32px",
    fontWeight: 600,
  },
  cornerSuit: {
    marginTop: "4px",
    fontSize: "18px",
  },
  faceCenter: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  centerStack: {
    textAlign: "center",
  },
  centerSuit: {
    fontSize: "84px",
    lineHeight: 1,
    textShadow:
      "0 0 2px rgba(255,255,255,0.9), 0 0 10px rgba(255,255,255,0.45), 0 0 24px rgba(255,255,255,0.18)",
    filter: "drop-shadow(0 0 8px rgba(255,255,255,0.12))",
  },
  centerLabel: {
    marginTop: "12px",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.45em",
    textTransform: "uppercase",
    color: "rgba(73, 53, 99, 0.48)",
    textShadow: "0 0 8px rgba(255,255,255,0.18)",
  },
};
