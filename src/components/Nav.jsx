import React, { useState } from "react"

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
  boxSizing: "border-box",
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

const links = [
  { label: "Our Story", href: "#story" },
  { label: "Photos",    href: "#photos" },
  { label: "Details",   href: "#details" },
  { label: "The Aisle", href: "#game" },
  { label: "Registry",  href: "#registry" },
]

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav style={navStyle}>
        <span style={logoStyle}>The Nemeths</span>

        <ul style={{ display: "flex", gap: "1.5rem", listStyle: "none", margin: 0, padding: 0 }} className="nav-desktop">
          {links.map(({ label, href }) => (
            <li key={href}>
              <a href={href} style={linkStyle}>{label}</a>
            </li>
          ))}
        </ul>

        <button
          className="nav-hamburger"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
          style={{ background: "none", border: "none", cursor: "pointer", padding: "0.25rem", display: "flex", flexDirection: "column", gap: "5px" }}
        >
          <span style={{ display: "block", width: 22, height: "0.5px", background: "var(--sage)", transition: "transform 0.2s", transform: open ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
          <span style={{ display: "block", width: 22, height: "0.5px", background: "var(--sage)", opacity: open ? 0 : 1, transition: "opacity 0.2s" }} />
          <span style={{ display: "block", width: 22, height: "0.5px", background: "var(--sage)", transition: "transform 0.2s", transform: open ? "rotate(-45deg) translate(4px, -4px)" : "none" }} />
        </button>
      </nav>

      {open && (
        <div style={{
          position: "fixed",
          top: "3.5rem",
          left: 0,
          width: "100%",
          zIndex: 99,
          background: "rgba(249,245,238,0.97)",
          backdropFilter: "blur(8px)",
          borderBottom: "0.5px solid var(--linen-dark)",
          padding: "1.5rem 2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          boxSizing: "border-box",
        }}>
          {links.map(({ label, href }) => (
            <a key={href} href={href} style={{ ...linkStyle, fontSize: "0.8rem" }} onClick={() => setOpen(false)}>{label}</a>
          ))}
        </div>
      )}

      <style>{`
        .nav-desktop { display: flex; }
        .nav-hamburger { display: none; }
        @media (max-width: 600px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  )
}