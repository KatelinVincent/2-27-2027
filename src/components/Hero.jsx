import React, { useEffect, useState } from "react"

function BotanicalSVG({ style }) {
  return (
    <svg style={style} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M80,280 Q60,200 120,150 Q160,110 140,50" stroke="#7A8C6E" strokeWidth="1.5" fill="none"/>
      <ellipse cx="120" cy="150" rx="35" ry="20" fill="#7A8C6E" transform="rotate(-30 120 150)"/>
      <ellipse cx="95"  cy="190" rx="28" ry="16" fill="#7A8C6E" transform="rotate(20 95 190)"/>
      <ellipse cx="140" cy="110" rx="30" ry="17" fill="#7A8C6E" transform="rotate(-50 140 110)"/>
      <circle  cx="140" cy="50"  r="12" fill="#8A9BAD"/>
      <path d="M50,270 Q30,220 70,180 Q100,150 85,100" stroke="#7A8C6E" strokeWidth="1" fill="none"/>
      <ellipse cx="72" cy="180" rx="22" ry="13" fill="#B8C4AC" transform="rotate(15 72 180)"/>
      <ellipse cx="85" cy="130" rx="18" ry="10" fill="#B8C4AC" transform="rotate(-40 85 130)"/>
      <circle  cx="50" cy="95"  r="8" fill="#8A9BAD"/>
    </svg>
  )
}

function useCountdown(targetDate) {
  const calculate = () => {
    const diff = new Date(targetDate) - new Date()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000)  / 60000),
      seconds: Math.floor((diff % 60000)    / 1000),
    }
  }
  const [time, setTime] = useState(calculate)
  useEffect(() => {
    const id = setInterval(() => setTime(calculate()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

export default function Hero() {
  const { days, hours, minutes, seconds } = useCountdown("2027-02-27T17:00:00")

  const pad = n => String(n).padStart(2, "0")

  return (
    <section style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "6rem 2rem 8rem",
      position: "relative",
      overflow: "hidden",
      background: "var(--ivory)",
    }}>
      <BotanicalSVG style={{
        position: "absolute", opacity: 0.12, pointerEvents: "none",
        top: -40, left: -60, width: 320, transform: "rotate(15deg)",
      }}/>
      <BotanicalSVG style={{
        position: "absolute", opacity: 0.12, pointerEvents: "none",
        bottom: -40, right: -60, width: 320, transform: "rotate(195deg)",
      }}/>

      <p style={{
        fontSize: "0.65rem", letterSpacing: "0.3em",
        textTransform: "uppercase", color: "var(--dusty)", marginBottom: "1.2rem",
        animation: "fadeUp 1s ease both",
      }}>
        We're getting married
      </p>

      <h1 style={{
        fontFamily: "'Great Vibes', cursive",
        fontSize: "clamp(3rem, 11vw, 5rem)",
        color: "var(--sage)", lineHeight: 1.15,
        animation: "fadeUp 1s 0.2s ease both", opacity: 0,
        animationFillMode: "both",
      }}>
        Jacob<br />
        <span style={{ color: "var(--linen-dark)" }}>&</span><br />
        Kate
      </h1>

      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "0.7rem", letterSpacing: "0.3em",
        textTransform: "uppercase", color: "var(--dusty)",
        marginTop: "0.5rem",
        animation: "fadeUp 1s 0.3s ease both", opacity: 0, animationFillMode: "both",
      }}>
        Becoming the Nemeths
      </p>

      <div style={{
        display: "flex", alignItems: "center", gap: "1rem",
        margin: "1.5rem auto", width: "min(320px, 80%)",
        animation: "fadeUp 1s 0.35s ease both", opacity: 0, animationFillMode: "both",
      }}>
        <div style={{ flex: 1, height: "0.5px", background: "var(--linen-dark)" }}/>
        <span style={{ color: "var(--sage-light)", fontSize: "0.7rem" }}>N</span>
        <div style={{ flex: 1, height: "0.5px", background: "var(--linen-dark)" }}/>
      </div>

      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "clamp(1.1rem, 4vw, 1.4rem)", fontStyle: "italic",
        color: "var(--warm)", letterSpacing: "0.05em",
        animation: "fadeUp 1s 0.4s ease both", opacity: 0, animationFillMode: "both",
      }}>
        February 27, 2027
      </p>

      <p style={{
        fontSize: "0.7rem", letterSpacing: "0.2em",
        textTransform: "uppercase", color: "var(--dusty)", marginTop: "0.5rem",
        animation: "fadeUp 1s 0.5s ease both", opacity: 0, animationFillMode: "both",
      }}>
        Texas Hill Country
      </p>

      {/* Countdown */}
      <div style={{
        display: "flex", gap: "2rem", marginTop: "3rem",
        animation: "fadeUp 1s 0.6s ease both", opacity: 0, animationFillMode: "both",
      }}>
        {[
          { value: days,             label: "Days" },
          { value: pad(hours),       label: "Hours" },
          { value: pad(minutes),     label: "Minutes" },
          { value: pad(seconds),     label: "Seconds" },
        ].map(({ value, label }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2.5rem", fontWeight: 300,
              color: "var(--sage)", display: "block", lineHeight: 1,
            }}>
              {value}
            </span>
            <span style={{
              fontSize: "0.6rem", letterSpacing: "0.2em",
              textTransform: "uppercase", color: "var(--dusty)", marginTop: "0.3rem",
              display: "block",
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Scroll hint — hidden on short screens via a wrapping span trick */}
      <div className="scroll-hint-wrap" style={{
        position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
        animation: "fadeUp 1s 1s ease both", opacity: 0, animationFillMode: "both",
      }}>
        <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--dusty)" }}>
          Scroll
        </span>
        <div style={{
          width: "0.5px", height: "40px",
          background: "linear-gradient(to bottom, var(--linen-dark), transparent)",
          animation: "scrollPulse 2s 1.5s ease-in-out infinite",
        }}/>
      </div>
    </section>
  )
}