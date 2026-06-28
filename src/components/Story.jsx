import React from "react"
import { StaticImage } from "gatsby-plugin-image"

const timelineItems = [
  {
    year: "Where We Met",
    quote: "From Neighbors to Soulmates.",
    detail: "We met during Jacob's senior year of college. We were neighbors, it started with his cooking and my appetite. We spent so much time together telling stories, sharing laughs and at some point, we began to see each other as more than friends.",
  },
  {
    year: "First Date",
    quote: "Tacos in San Antonio.",
    detail: "Given our start as friends, we did not have a traditional first date. But the first time we dressed up and planned a night out, he took me to a taco spot in San Antonio followed by coffes at a local cafe by the river. After that, we stayed at his parents house and I got to meet what would become my second family. It was a perfect night.",
  },
  {
    year: "The Proposal",
    quote: "He asked. I said yes.",
    detail: "Jacob proposed in the Conservatory Garden in Central Park. He had printed out many maps in order to plan an organic walk through the park. He got down on one knee in the middle of the garden and asked me to marry him. I said yes, of course.",
  },
  {
    year: "February 27, 2027",
    quote: "The Nemeths begin.",
    detail: "Texas Hill Country — surrounded by everyone we love.",
  },
]

export default function Story() {
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {/* Background photo */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <StaticImage
          src="../images/photo-1.jpg"
          alt=""
          layout="fullWidth"
          style={{ height: "100%" }}
          imgStyle={{ objectFit: "cover", objectPosition: "center top" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(245, 240, 232, 0.88)" }} />
      </div>

      <section id="story" style={{ position: "relative", zIndex: 1, padding: "5rem 2rem", maxWidth: 760, margin: "0 auto" }}>
        <span className="section-label">How it started</span>
        <h2 className="section-title">The Nemeth <em>Story</em></h2>
        <div className="divider-ornament">— N —</div>

        <div style={{ position: "relative", paddingLeft: "1.5rem", borderLeft: "0.5px solid var(--linen-dark)" }}>
          {timelineItems.map(({ year, quote, detail }, i) => (
            <div key={i} style={{ marginBottom: "2.5rem", position: "relative" }}>
              <div style={{
                position: "absolute", left: "-1.75rem", top: "0.35rem",
                width: 8, height: 8, borderRadius: "50%",
                background: "var(--sage-light)", border: "1.5px solid var(--sage)",
              }}/>
              <p style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sage)", marginBottom: "0.3rem" }}>
                {year}
              </p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", fontStyle: "italic", color: "var(--warm)", lineHeight: 1.6, marginBottom: "0.4rem" }}>
                "{quote}"
              </p>
              <p style={{ fontSize: "0.82rem", color: "var(--dusty)", lineHeight: 1.6 }}>
                {detail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}