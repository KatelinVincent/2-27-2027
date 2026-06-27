import React from "react"
import { StaticImage } from "gatsby-plugin-image"

const cards = [
  {
    title: "Ceremony",
    body: "February 27, 2027 · Texas Hill Country. Full details to follow with your invitation.",
    confirmed: true,
  },
  {
    title: "Reception",
    body: "Immediately following the ceremony. Dinner, dancing, and all the good things.",
    confirmed: true,
  },
]

export default function Details() {
  return (
<div style={{ position: "relative", overflow: "hidden", minHeight: 600 }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <StaticImage
          src="../images/photo-3.jpg"
          alt=""
          layout="fullWidth"
          style={{ height: "100%" }}
          imgStyle={{ objectFit: "cover", objectPosition: "center 30%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(245, 240, 232, 0.88)" }} />
      </div>

      <section id="details" style={{ position: "relative", zIndex: 1, padding: "5rem 2rem", maxWidth: 760, margin: "0 auto" }}>
        <span className="section-label">Mark your calendars</span>
        <h2 className="section-title">Nemeth Wedding <em>Details</em></h2>
        <div className="divider-ornament">— N —</div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          marginTop: "2rem",
        }}>
          {cards.map(({ title, body, confirmed }) => (
            <div
              key={title}
              style={{
                background: "rgba(255, 253, 248, 0.85)",
                border: `0.5px solid ${confirmed ? "var(--sage-light)" : "var(--linen-dark)"}`,
                borderRadius: 8,
                padding: "1.5rem",
              }}
            >
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.2rem", fontWeight: 400,
                color: "var(--text)", marginBottom: "0.4rem",
              }}>
                {title}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--dusty)", lineHeight: 1.6 }}>
                {body}
              </p>
              {!confirmed && (
                <span style={{
                  display: "inline-block", marginTop: "0.75rem",
                  fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase",
                  color: "var(--dusty)", border: "0.5px solid var(--dusty-light)",
                  borderRadius: 20, padding: "0.25rem 0.75rem",
                }}>
                  Coming Soon
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}