"use client";

import {
  useAnimationControls,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import type { CSSProperties, MouseEvent, PointerEvent } from "react";
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
  isFolded: boolean;
};

type PokerCardProps = CardData & {
  flickTuning: FlickTuning;
};

type FlickTuning = {
  force: number;
  snapBack: number;
  damping: number;
  cornerBias: number;
};

const defaultFlickTuning: FlickTuning = {
  force: 0.75,
  snapBack: 260,
  damping: 18,
  cornerBias: 1,
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
  const [isFolded, setIsFolded] = useState(false);
  const [flickTuning, setFlickTuning] = useState(defaultFlickTuning);
  const [isTuningOpen, setIsTuningOpen] = useState(true);
  const [openSuitPicker, setOpenSuitPicker] = useState<number | null>(null);
  const hand = cards.map((card, index) =>
    createCardData(card, suits[index], index === 0 ? 0 : -24, isFolded)
  );

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.demoNav}>
          <Link href="/menu" style={styles.demoLink}>
            Demo hub
          </Link>
          <Link href="/table" style={styles.demoLink}>
            Table layout
          </Link>
        </div>

        <div style={styles.header}>
          <p style={styles.kicker}>Poker hand</p>
          <h1 style={styles.title}>Two-card hand</h1>
          <p style={styles.subtitle}>
            Hover each card to tilt it toward the cursor. Use Fold to turn the
            whole hand.
          </p>
        </div>

        <div style={styles.menuBar}>
          {suits.map((suit, index) => (
            <SuitPicker
              key={`suit-${index}`}
              label={index === 0 ? "Left card" : "Right card"}
              value={suit}
              isOpen={openSuitPicker === index}
              onToggle={() =>
                setOpenSuitPicker((current) => (current === index ? null : index))
              }
              onClose={() => setOpenSuitPicker((current) => (current === index ? null : current))}
              onSelect={(nextSuit) => {
                setSuits((current) => {
                  const next = [...current] as [Suit, Suit];
                  next[index] = nextSuit;
                  return next;
                });
                setOpenSuitPicker(null);
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsFolded((current) => !current)}
          style={styles.foldButton}
        >
          {isFolded ? "Reveal hand" : "Fold"}
        </button>

        <section style={styles.tuningPanel} aria-label="Flick tuning">
          <button
            type="button"
            onClick={() => setIsTuningOpen((current) => !current)}
            style={styles.tuningToggle}
            aria-expanded={isTuningOpen}
          >
            <div>
              <p style={styles.tuningKicker}>Flick tuning</p>
              <p style={styles.tuningText}>
                Adjust the impulse live. Lower values keep the card subtler.
              </p>
            </div>
            <span style={styles.tuningChevron}>{isTuningOpen ? "▾" : "▸"}</span>
          </button>
          <div
            style={{
              ...styles.tuningBody,
              display: isTuningOpen ? "grid" : "none",
            }}
          >
            <div style={styles.sliderGrid}>
              <SliderRow
                label="Flick Force"
                value={flickTuning.force}
                min={0.35}
                max={1.2}
                step={0.01}
                format={(value) => value.toFixed(2)}
                onChange={(value) =>
                  setFlickTuning((current) => ({ ...current, force: value }))
                }
              />
              <SliderRow
                label="Snap Back"
                value={flickTuning.snapBack}
                min={160}
                max={360}
                step={1}
                format={(value) => `${Math.round(value)}`}
                onChange={(value) =>
                  setFlickTuning((current) => ({ ...current, snapBack: value }))
                }
              />
              <SliderRow
                label="Damping"
                value={flickTuning.damping}
                min={10}
                max={30}
                step={1}
                format={(value) => `${Math.round(value)}`}
                onChange={(value) =>
                  setFlickTuning((current) => ({ ...current, damping: value }))
                }
              />
              <SliderRow
                label="Corner Bias"
                value={flickTuning.cornerBias}
                min={0.6}
                max={1.5}
                step={0.01}
                format={(value) => value.toFixed(2)}
                onChange={(value) =>
                  setFlickTuning((current) => ({ ...current, cornerBias: value }))
                }
              />
            </div>
          </div>
        </section>

        <div style={styles.hand}>
          {hand.map((card) => (
            <PokerCard key={`${card.rank}-${card.suit}`} {...card} flickTuning={flickTuning} />
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
  isFolded,
  flickTuning,
}: PokerCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const flickControls = useAnimationControls();

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

  const triggerFlick = async (event: MouseEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const hasPointerCoords = event.clientX !== 0 || event.clientY !== 0;
    const currentX = hasPointerCoords
      ? event.clientX - rect.left
      : rect.width / 2;
    const currentY = hasPointerCoords
      ? event.clientY - rect.top
      : rect.height / 2;
    const xRatio = currentX / rect.width - 0.5;
    const yRatio = currentY / rect.height - 0.5;

    const cornerWeight = 0.85 + flickTuning.cornerBias * 0.55;
    const pushRotateX = Math.max(
      -14,
      Math.min(14, -yRatio * 20 * flickTuning.force * cornerWeight)
    );
    const pushRotateY = Math.max(
      -14,
      Math.min(14, xRatio * 20 * flickTuning.force * cornerWeight)
    );
    await flickControls.start({
      rotateX: pushRotateX,
      rotateY: pushRotateY,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.035,
        ease: "easeOut",
      },
    });

    await flickControls.start({
      rotateX: 0,
      rotateY: 0,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: flickTuning.snapBack,
        damping: flickTuning.damping,
        mass: 0.82,
      },
    });
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
        aria-pressed={isFolded}
        aria-label={`${rank} of ${suitLabel}. Click to flick the card.`}
        onClick={triggerFlick}
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
          animate={flickControls}
          initial={false}
          style={{
            ...styles.flickStage,
            transformOrigin: "50% 50%",
            transformStyle: "preserve-3d",
          }}
        >
          <motion.div
            animate={{ rotateY: isFolded ? 180 : 0 }}
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
        </motion.div>
      </motion.button>

      <div style={styles.caption}>
        {rank} of {suitLabel}
      </div>
    </div>
  );
}

function SuitPicker({
  label,
  value,
  isOpen,
  onToggle,
  onClose,
  onSelect,
}: {
  label: string;
  value: Suit;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (value: Suit) => void;
}) {
  const options: Suit[] = ["spades", "hearts", "diamonds", "clubs"];

  return (
    <div style={styles.menuItem} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        onClose();
      }
    }}>
      <span style={styles.menuLabel}>{label}</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={onToggle}
        style={styles.suitButton}
      >
        <span>{value.charAt(0).toUpperCase() + value.slice(1)}</span>
        <span style={styles.suitChevron}>{isOpen ? "▴" : "▾"}</span>
      </button>
      {isOpen ? (
        <div style={styles.suitMenu} role="listbox" aria-label={label}>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={option === value}
              onClick={() => onSelect(option)}
              style={{
                ...styles.suitOption,
                ...(option === value ? styles.suitOptionActive : {}),
              }}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}) {
  return (
    <label style={styles.sliderRow}>
      <div style={styles.sliderRowLabel}>
        <span>{label}</span>
        <span>{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={styles.sliderInput}
      />
    </label>
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
  overlap: number,
  isFolded: boolean
): CardData {
  const suitLabel = suit.charAt(0).toUpperCase() + suit.slice(1);

  return {
    ...card,
    suit,
    suitLabel,
    isRed: suit === "hearts" || suit === "diamonds",
    overlap,
    isFolded,
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
  tuningPanel: {
    width: "min(720px, 100%)",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    padding: "16px",
    display: "grid",
    gap: "14px",
    backdropFilter: "blur(14px)",
  },
  tuningToggle: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    width: "100%",
    border: 0,
    background: "transparent",
    color: "inherit",
    padding: 0,
    cursor: "pointer",
    textAlign: "left",
  },
  tuningBody: {
    display: "grid",
    gap: "14px",
  },
  tuningChevron: {
    flex: "0 0 auto",
    marginTop: "2px",
    fontSize: "18px",
    color: "rgba(255,255,255,0.82)",
  },
  tuningHeader: {
    display: "grid",
    gap: "4px",
  },
  tuningKicker: {
    margin: 0,
    fontSize: "11px",
    letterSpacing: "0.28em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.68)",
  },
  tuningText: {
    margin: 0,
    fontSize: "13px",
    lineHeight: 1.5,
    color: "rgba(255,255,255,0.72)",
  },
  sliderGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  sliderRow: {
    display: "grid",
    gap: "8px",
    padding: "10px 12px 12px",
    borderRadius: "16px",
    background: "rgba(0,0,0,0.1)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  sliderRowLabel: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.78)",
  },
  sliderInput: {
    width: "100%",
    accentColor: "#f4d7a1",
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
  demoNav: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
  },
  demoLink: {
    borderRadius: "9999px",
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    padding: "10px 16px",
    fontSize: "12px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(12px)",
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
    position: "relative",
  },
  menuLabel: {
    fontSize: "11px",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.72)",
  },
  suitButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(14, 52, 31, 0.7)",
    color: "#f8fafc",
    padding: "12px 14px",
    fontSize: "14px",
    outline: "none",
    backdropFilter: "blur(12px)",
    cursor: "pointer",
  },
  suitChevron: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.78)",
  },
  suitMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 20,
    marginTop: "6px",
    borderRadius: "14px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(8, 34, 20, 0.96)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
  },
  suitOption: {
    display: "block",
    width: "100%",
    border: 0,
    background: "transparent",
    color: "#f8fafc",
    textAlign: "left",
    padding: "12px 14px",
    fontSize: "14px",
    cursor: "pointer",
  },
  suitOptionActive: {
    background: "rgba(244, 215, 161, 0.16)",
    color: "#fff5d8",
  },
  foldButton: {
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "9999px",
    padding: "12px 20px",
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
    fontSize: "14px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
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
  flickStage: {
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
