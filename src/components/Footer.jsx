import React from "react"

export default function Footer() {
  return (
    <footer style={{
      background: "var(--text)",
      color: "var(--linen)",
      textAlign: "center",
      padding: "3rem 2rem",
    }}>
      <p style={{
        fontFamily: "'Great Vibes', cursive",
        fontSize: "2.5rem",
        color: "var(--sage-light)",
        marginBottom: "0.3rem",
      }}>
        Jacob & Kate
      </p>
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "0.85rem",
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color: "var(--linen-dark)",
        fontStyle: "italic",
        marginBottom: "0.75rem",
      }}>
        The Nemeths · Est. February 27, 2027
      </p>
      <p style={{
        fontSize: "0.7rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "var(--dusty-light)",
        opacity: 0.6,
      }}>
        Texas Hill Country
      </p>
    </footer>
  )
}
