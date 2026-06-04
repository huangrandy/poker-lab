import type { CSSProperties } from "react";
import Link from "next/link";

const cards = [
  {
    href: "/",
    title: "Card flipping",
    description: "Keep the current hover and flip demo.",
  },
  {
    href: "/table",
    title: "Table layout",
    description: "Open the new 6-seat desktop table mockup.",
  },
];

export default function MenuPage() {
  return (
    <main style={styles.page}>
      <section style={styles.shell}>
        <div style={styles.header}>
          <p style={styles.kicker}>Poker lab</p>
          <h1 style={styles.title}>Choose a demo</h1>
          <p style={styles.subtitle}>
            Jump between the existing card animation and the new table layout.
          </p>
        </div>

        <div style={styles.grid}>
          {cards.map((card) => (
            <Link key={card.href} href={card.href} style={styles.card}>
              <span style={styles.cardTitle}>{card.title}</span>
              <span style={styles.cardDescription}>{card.description}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "32px",
    background:
      "radial-gradient(circle at top, #153f2a 0%, #0a1710 55%, #050b08 100%)",
    color: "#fff",
  },
  shell: {
    width: "min(880px, 100%)",
    display: "grid",
    gap: "24px",
  },
  header: {
    textAlign: "center" as const,
    display: "grid",
    gap: "12px",
  },
  kicker: {
    margin: 0,
    fontSize: "11px",
    letterSpacing: "0.34em",
    textTransform: "uppercase" as const,
    color: "rgba(255,255,255,0.62)",
  },
  title: {
    margin: 0,
    fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
    lineHeight: 1,
    letterSpacing: "-0.04em",
  },
  subtitle: {
    margin: "0 auto",
    maxWidth: "34rem",
    fontSize: "15px",
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.72)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
  },
  card: {
    minHeight: "180px",
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    padding: "24px",
    display: "grid",
    alignContent: "space-between",
    gap: "18px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.24)",
    backdropFilter: "blur(14px)",
  },
  cardTitle: {
    fontSize: "1.2rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  cardDescription: {
    fontSize: "14px",
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.72)",
    maxWidth: "18rem",
  },
} satisfies Record<string, CSSProperties>;
