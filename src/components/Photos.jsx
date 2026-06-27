import React from "react"
// Uncomment these once you have gatsby-plugin-image set up and photos in src/images/
import { StaticImage } from "gatsby-plugin-image"

// ─── Instructions ───────────────────────────────────────────────────────────
// 1. Drop your photos into src/images/ named:
//      photo-tall.jpg, photo-1.jpg, photo-2.jpg, photo-3.jpg, photo-4.jpg
// 2. Replace each <PhotoPlaceholder> below with the corresponding <StaticImage>
//    Example:
//      <StaticImage
//        src="../images/photo-tall.jpg"
//        alt="Jacob and Kate"
//        layout="fullWidth"
//        style={{ borderRadius: 6, height: "100%" }}
//      />
// ────────────────────────────────────────────────────────────────────────────

function PhotoPlaceholder({ tall }) {
  return (
    <div style={{
      background: "var(--sage-pale)",
      border: "0.5px solid var(--sage-light)",
      borderRadius: 6,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: "0.5rem",
      minHeight: tall ? 336 : 160,
      color: "var(--sage)",
      fontSize: "0.65rem",
      letterSpacing: "0.15em",
      textTransform: "uppercase",
    }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21,15 16,10 5,21"/>
      </svg>
      Add photo
    </div>
  )
}

export default function Photos() {
  return (
    <div id="photos" className="full-bleed" style={{ background: "var(--linen)", padding: "5rem 0" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 2rem" }}>
        <span className="section-label">Jacob & Kate</span>
        <h2 className="section-title"><em>A few</em> of our favorites</h2>
        <div className="divider-ornament">— N —</div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.75rem",
          marginTop: "2rem",
        }}>
          <div style={{ gridRow: "span 2" }}>
            <StaticImage src="../images/photo-tall.jpg" alt="Jacob and Kate" layout="fullWidth" style={{ borderRadius: 6, height: "100%" }} />
          </div>

          <div><StaticImage src="../images/photo-1.jpg" alt="Jacob and Kate" layout="fullWidth" style={{ borderRadius: 6, height: "100%" }} /></div>
          <div><StaticImage src="../images/photo-2.jpg" alt="Jacob and Kate" layout="fullWidth" style={{ borderRadius: 6, height: "100%" }} /></div>
          <div><StaticImage src="../images/photo-3.jpg" alt="Jacob and Kate" layout="fullWidth" style={{ borderRadius: 6, height: "100%" }} /></div>
          <div><StaticImage src="../images/photo-3.jpg" alt="Jacob and Kate" layout="fullWidth" style={{ borderRadius: 6, height: "100%" }} /></div>
          </div>
      </div>
    </div>
  )
}
