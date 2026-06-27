import React from "react"

export default function Registry() {
  return (
    <section id="registry" style={{ padding: "5rem 2rem", maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
      <span className="section-label">Gifts</span>
      <h2 className="section-title">Our <em>Registry</em></h2>
      <div className="divider-ornament">— N —</div>

      <p style={{ fontSize: "0.85rem", color: "var(--dusty)", lineHeight: 1.8, marginTop: "1.5rem", marginBottom: "2rem" }}>
        Your presence is the greatest gift. If you'd like to honor us further, we've registered at the links below.
      </p>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        <a href="https://www.yourregistrylink.com" target="_blank" rel="noopener noreferrer" className="registry-btn">
          Registry Name
        </a>
        {/* Add more links as needed */}
      </div>
    </section>
  )
}