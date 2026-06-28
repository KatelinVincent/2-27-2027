import React, { useState, useEffect } from "react"

export default function SignupPopup() {
  const [visible, setVisible] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem("nemeth-signup-dismissed")
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem("nemeth-signup-dismissed", "true")
    setVisible(false)
  }

  const handleSubmit = async () => {
    if (!name || !phone) return
    setSubmitting(true)
    try {
        await fetch("https://formspree.io/f/xojowbrd", {
            method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      })
      setSubmitted(true)
      localStorage.setItem("nemeth-signup-dismissed", "true")
    } catch (e) {
      console.error(e)
    }
    setSubmitting(false)
  }

  if (!visible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 201,
        background: "var(--ivory)",
        borderRadius: 12,
        padding: "2.5rem 2rem",
        width: "min(440px, 90vw)",
        textAlign: "center",
        boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
      }}>
        {/* Close */}
        <button
          onClick={dismiss}
          style={{
            position: "absolute", top: "1rem", right: "1rem",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--dusty)", fontSize: "1.2rem", lineHeight: 1,
          }}
        >
          ×
        </button>

        {!submitted ? (
          <>
            <p style={{ fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--sage)", marginBottom: "0.5rem" }}>
              Stay in the loop
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 400, color: "var(--text)", marginBottom: "0.5rem" }}>
              Wedding Updates
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--dusty)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              Sign up to receive text alerts about the wedding — travel tips, day-of details, and anything else you need to know.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  padding: "0.75rem 1rem",
                  border: "0.5px solid var(--linen-dark)",
                  borderRadius: 6,
                  background: "var(--linen)",
                  fontSize: "0.85rem",
                  color: "var(--text)",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{
                  padding: "0.75rem 1rem",
                  border: "0.5px solid var(--linen-dark)",
                  borderRadius: 6,
                  background: "var(--linen)",
                  fontSize: "0.85rem",
                  color: "var(--text)",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !name || !phone}
              style={{
                width: "100%",
                padding: "0.85rem",
                background: "var(--sage)",
                color: "white",
                border: "none",
                borderRadius: 6,
                fontSize: "0.7rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: submitting || !name || !phone ? "not-allowed" : "pointer",
                opacity: submitting || !name || !phone ? 0.6 : 1,
                fontFamily: "inherit",
                transition: "opacity 0.2s",
              }}
            >
              {submitting ? "Signing up..." : "Sign me up"}
            </button>

            <p style={{ fontSize: "0.65rem", color: "var(--dusty)", marginTop: "1rem" }}>
              We'll only text you with wedding updates — no spam, promise.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🌿</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 400, color: "var(--text)", marginBottom: "0.5rem" }}>
              You're in!
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--dusty)", lineHeight: 1.6 }}>
              We'll text you when we have updates. See you on February 27th!
            </p>
          </>
        )}
      </div>
    </>
  )
}