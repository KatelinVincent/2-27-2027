import React from "react"
import { StaticImage } from "gatsby-plugin-image"

export default function Photos() {
  return (
    <>
      <style>{`
        @media (max-width: 600px) {
          .engagement-grid {
            grid-template-columns: 1fr !important;
            grid-auto-rows: auto !important;
          }
          .engagement-grid > div {
            grid-row: span 1 !important;
            grid-column: span 1 !important;
          }
          .engagement-grid > div img {
            height: auto !important;
          }
        }
      `}</style>

      {/* ── Engagement Photos ── */}
      <div
        id="photos"
        className="full-bleed"
        style={{ background: "var(--linen)", padding: "5rem 0" }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 2rem" }}>
          <span className="section-label">Jacob & Kate</span>
          <h2 className="section-title">
            <em>A few</em> of our favorites
          </h2>
          <div className="divider-ornament">— N —</div>

          <div
            className="engagement-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.6fr 1fr",
              gridAutoRows: "280px",
              gap: "0.75rem",
              marginTop: "2rem",
            }}
          >
            <div style={{ gridRow: "span 2" }}>
              <StaticImage src="../images/photo-9.jpg" alt="Jacob and Kate" layout="fullWidth" style={{ borderRadius: 6, height: "100%" }} imgStyle={{ objectFit: "cover" }} />
            </div>
            <div style={{ gridRow: "span 2" }}>
              <StaticImage src="../images/photo-7.jpg" alt="Jacob and Kate" layout="fullWidth" style={{ borderRadius: 6, height: "100%" }} imgStyle={{ objectFit: "cover", objectPosition: "center top" }} />
            </div>
            <div style={{ gridRow: "span 2" }}>
              <StaticImage src="../images/photo-5.jpg" alt="Jacob and Kate" layout="fullWidth" style={{ borderRadius: 6, height: "100%" }} imgStyle={{ objectFit: "cover" }} />
            </div>
            <div style={{ gridColumn: "span 3", gridRow: "span 2" }}>
              <StaticImage src="../images/photo-10.jpg" alt="Jacob and Kate" layout="fullWidth" style={{ borderRadius: 6, height: "100%" }} imgStyle={{ objectFit: "cover", objectPosition: "center 40%" }} />
            </div>
            <div style={{ gridRow: "span 2" }}>
              <StaticImage src="../images/photo-8.jpg" alt="Jacob and Kate" layout="fullWidth" style={{ borderRadius: 6, height: "100%" }} imgStyle={{ objectFit: "cover" }} />
            </div>
            <div style={{ gridRow: "span 2" }}>
              <StaticImage src="../images/photo-12.jpg" alt="Jacob and Kate" layout="fullWidth" style={{ borderRadius: 6, height: "100%" }} imgStyle={{ objectFit: "cover" }} />
            </div>
            <div style={{ gridRow: "span 2" }}>
              <StaticImage src="../images/photo-11.jpg" alt="Jacob and Kate" layout="fullWidth" style={{ borderRadius: 6, height: "100%" }} imgStyle={{ objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Banner ── */}
      <div
        className="full-bleed"
        style={{ position: "relative", height: 1020, overflow: "hidden" }}
      >
        <StaticImage
          src="../images/photo-14.jpg"
          alt="Jacob and Kate"
          layout="fullWidth"
          style={{ position: "absolute", inset: 0, height: "100%" }}
          imgStyle={{ objectFit: "cover", objectPosition: "center 50%" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.18)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: "0.5rem",
        }}>
          <p style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.4rem, 4vw, 2.4rem)",
            color: "white", letterSpacing: "0.05em", margin: 0,
            textShadow: "0 1px 8px rgba(0,0,0,0.4)",
          }}>
            February 27, 2027
          </p>
          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.75rem", color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.2em", textTransform: "uppercase", margin: 0,
          }}>
            Windemere Farm · San Marcos, Texas
          </p>
        </div>
      </div>
    </>
  )
}