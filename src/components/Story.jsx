import React from "react"

// ─── Edit your story here ───────────────────────────────────────────────────
const timelineItems = [
  {
    year: "Where We Met",
    quote: "From Neighbors to Soulmates.",
    detail: "We met Jacob's senior year of college when we were neighbors in college. We became fast friends, bonding over Jacob's love for cooking and my love for eating. We spent countless hours together, sharing meals and laughter, and our friendship blossomed into something truly special.",
  },
  {
    year: "First Date",
    quote: "Add your first date story here.",
    detail: "Our first official date, if you can call it that, was in Kate's car. We shared a P-terrys burger and fries before we went home to watch a movie on Kate's couch. It was a simple and sweet evening that marked the beginning of our romantic journey together.",
  },
  {
    year: "The Proposal",
    quote: "Add your proposal story here.",
    detail: "Jacob proposed to Kate in New York City's conservatory garden in Central Park. It was a beautiful and romantic setting, surrounded by nature and the vibrant energy of the city. Jacob got down on one knee and asked Kate to be his partner for life, and she said yes! It was a moment filled with love, joy, and excitement for their future together.",
  },
  {
    year: "February 27, 2027",
    quote: "The Nemeths begin.",
    detail: "Texas Hill Country — surrounded by everyone we love.",
  },
]
// ───────────────────────────────────────────────────────────────────────────

export default function Story() {
  return (
    <section id="story" style={{ padding: "5rem 2rem", maxWidth: 760, margin: "0 auto" }}>
      <span className="section-label">How it started</span>
      <h2 className="section-title">The Nemeth <em>Story</em></h2>
      <div className="divider-ornament">— N —</div>

      <div style={{ position: "relative", paddingLeft: "1.5rem", borderLeft: "0.5px solid var(--linen-dark)" }}>
        {timelineItems.map(({ year, quote, detail }, i) => (
          <div key={i} style={{ marginBottom: "2.5rem", position: "relative" }}>
            {/* dot */}
            <div style={{
              position: "absolute", left: "-1.75rem", top: "0.35rem",
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--sage-light)", border: "1.5px solid var(--sage)",
            }}/>
            <p style={{
              fontSize: "0.65rem", letterSpacing: "0.2em",
              textTransform: "uppercase", color: "var(--sage)", marginBottom: "0.3rem",
            }}>
              {year}
            </p>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem",
              fontStyle: "italic", color: "var(--warm)", lineHeight: 1.6, marginBottom: "0.4rem",
            }}>
              "{quote}"
            </p>
            <p style={{ fontSize: "0.82rem", color: "var(--dusty)", lineHeight: 1.6 }}>
              {detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
