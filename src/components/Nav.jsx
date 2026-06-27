import React from "react"

const navStyle = {
  position: "fixed",
  top: 0,
  width: "100%",
  zIndex: 100,
  padding: "1rem 2rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(249,245,238,0.92)",
  backdropFilter: "blur(8px)",
  borderBottom: "0.5px solid var(--linen-dark)",
}

const logoStyle = {
  fontFamily: "'Great Vibes', cursive",
  fontSize: "1.6rem",
  color: "var(--sage)",
  letterSpacing: "0.02em",
}

const linkStyle = {
  fontSize: "0.7rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--warm)",
  textDecoration: "none",
  transition: "color 0.2s",
}

export default function Nav() {
  return (
    <nav style={navStyle}>
      <span style={logoStyle}>The Nemeths</span>
      <ul style={{ display: "flex", gap: "1.5rem", listStyle: "none" }}>
        {[
          { label: "Our Story",  href: "#story" },
          { label: "Photos",     href: "#photos" },
          { label: "Details",    href: "#details" },
          { label: "The Aisle",  href: "#game" },
          { label: "Love Story Quiz", href: "#love-story-quiz" },
        ].map(({ label, href }) => (
          <li key={href}>
            <a href={href} style={linkStyle}>{label}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
