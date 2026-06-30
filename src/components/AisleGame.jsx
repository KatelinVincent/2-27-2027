import React, { useEffect, useRef, useState, useCallback } from "react"

const SUPABASE_URL = process.env.GATSBY_SUPABASE_URL
const SUPABASE_KEY = process.env.GATSBY_SUPABASE_KEY

const SB_HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
}

const W = 380
const H = 480
const ROW_H = 53
const PLAYER_SCREEN_Y = H * 0.72

const C = {
  sage: "#7A8C6E", sageL: "#B8C4AC", sagePale: "#EDF0E8",
  dusty: "#8A9BAD", dustyL: "#C4CDD6",
  ivory: "#F9F5EE", linen: "#EDE5D8", linenD: "#D4C5B0",
  warm: "#6B5B45", text: "#3D3530", gold: "#C8A96E",
  danger: "#C47A6E",
}

const LANE_CYCLE = [
  null,
  { type: "guest",  dir:  1, baseSpd: 1.2, baseGap: 210 },
  { type: "chair",  dir: -1, baseSpd: 1.4, baseGap: 230 },
  { type: "flower", dir:  1, baseSpd: 1.0, baseGap: 250 },
  null,
  { type: "petal",  dir: -1, baseSpd: 0.8, baseGap: 270 },
  { type: "ribbon", dir:  1, baseSpd: 1.1, baseGap: 240 },
  { type: "ring",   dir: -1, baseSpd: 1.3, baseGap: 220 },
]

const LANE_LABELS = [
  null, "Guests", "Seating", "Bouquets", null, "Petals", "Ribbons", "Ring Bearer"
]

function isSafe(wr) { return wr % 4 === 0 }

function getLaneCfg(wr) {
  if (isSafe(wr)) return null
  return LANE_CYCLE[((wr % 8) + 8) % 8]
}

function getLaneLabel(wr) {
  if (isSafe(wr)) return null
  const idx = ((wr % 8) + 8) % 8
  if (idx === 2 && wr >= 12) return "Uncle Dave"
  return LANE_LABELS[idx]
}

function getDifficulty(dist) {
  const spd = 1 + dist * 0.015
  const gapShrink = Math.min(dist * 2, 80)
  const uncle = dist >= 12
  const photographer = dist >= 25
  let phase = "The Ceremony Begins"
  if (dist >= 50) phase = "Absolute Chaos"
  else if (dist >= 25) phase = "Say Cheese!"
  else if (dist >= 12) phase = "Uncle Dave Arrives"
  else if (dist >= 5) phase = "Picking Up the Pace"
  return { spd, gapShrink, uncle, photographer, phase }
}

function getEffectiveLane(wr, diff) {
  const base = getLaneCfg(wr)
  if (!base) return null
  const idx = ((wr % 8) + 8) % 8
  if (idx === 2 && diff.uncle) {
    return { type: "uncle", dir: 1, baseSpd: 0.7, baseGap: 300 - diff.gapShrink * 0.4 }
  }
  return { ...base, baseGap: Math.max(base.baseGap - diff.gapShrink, 100) }
}

// ─── Supabase helpers ───

async function fetchLeaderboard() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/leaderboard?select=name,score,created_at&order=score.desc&limit=15`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    if (!res.ok) return []
    return await res.json()
  } catch { return [] }
}

async function insertScore(name, score) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/leaderboard`, {
      method: "POST",
      headers: SB_HEADERS,
      body: JSON.stringify({ name, score }),
    })
  } catch { /* silent */ }
}

// ─── Component ───

export default function AisleGame() {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const [dist, setDist] = useState(0)
  const [best, setBest] = useState(0)
  const [lives, setLives] = useState(3)
  const [status, setStatus] = useState("")
  const [phase, setPhase] = useState("")
  const [gameOver, setGameOver] = useState(false)
  const [idle, setIdle] = useState(true)
  const [showLb, setShowLb] = useState(false)
  const [leaderboard, setLeaderboard] = useState([])
  const [lbLoading, setLbLoading] = useState(false)
  const [playerName, setPlayerName] = useState("")
  const [nameInput, setNameInput] = useState("")
  const [nameKnown, setNameKnown] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Load saved name from localStorage + leaderboard from Supabase
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aisle-game-name")
      if (saved) { setPlayerName(saved); setNameInput(saved); setNameKnown(true) }
    } catch {}
    loadLb()
  }, [])

  const loadLb = async () => {
    setLbLoading(true)
    const board = await fetchLeaderboard()
    setLeaderboard(board)
    setLbLoading(false)
  }

  const submitScore = useCallback(async (name, sc) => {
    const t = name.trim().slice(0, 24)
    if (!t || sc <= 0) return
    try { localStorage.setItem("aisle-game-name", t) } catch {}
    setPlayerName(t); setNameKnown(true); setNameInput(t)
    await insertScore(t, sc)
    const board = await fetchLeaderboard()
    setLeaderboard(board)
    setSubmitted(true); setShowLb(true)
  }, [])

  useEffect(() => {
    if (typeof CanvasRenderingContext2D !== "undefined" && !CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        this.beginPath(); this.moveTo(x + r, y); this.lineTo(x + w - r, y)
        this.quadraticCurveTo(x + w, y, x + w, y + r); this.lineTo(x + w, y + h - r)
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h); this.lineTo(x + r, y + h)
        this.quadraticCurveTo(x, y + h, x, y + h - r); this.lineTo(x, y + r)
        this.quadraticCurveTo(x, y, x + r, y); this.closePath()
      }
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    let gp = "idle"
    let pWR = 0, pX = 52, pDX = 52, pDY = PLAYER_SCREEN_Y
    let camOff = 0
    let obsMap = new Map()
    let maxRow = 0
    let lv = 3, fr = 0, flashT = 0, stunT = 0
    let photoT = 0, photoX = 0, photoY = 0, flashFx = 0
    let bestV = 0, loopId

    function screenY(wr) { return PLAYER_SCREEN_Y - (wr - camOff) * ROW_H }

    function visibleRange() {
      const lo = Math.floor(camOff - 3)
      const hi = Math.ceil(camOff + H / ROW_H + 2)
      return [Math.max(lo, 0), hi]
    }

    function startGame() {
      cancelAnimationFrame(loopId)
      gp = "playing"; pWR = 0; pX = 52; pDX = 52; pDY = PLAYER_SCREEN_Y
      camOff = 0; obsMap = new Map(); maxRow = 0
      lv = 3; fr = 0; flashT = 0; stunT = 0; photoT = 0; flashFx = 0
      setDist(0); setLives(3); setStatus(""); setPhase("The Ceremony Begins")
      setGameOver(false); setSubmitted(false); setShowLb(false); setIdle(false)
      loopId = requestAnimationFrame(loop)
    }

    function trySpawn(wr) {
      const diff = getDifficulty(maxRow)
      const cfg = getEffectiveLane(wr, diff)
      if (!cfg) return
      if (!obsMap.has(wr)) obsMap.set(wr, [])
      const arr = obsMap.get(wr)
      const spd = cfg.baseSpd * cfg.dir * diff.spd
      if (cfg.dir === 1) {
        if (arr.some(o => o.x < (cfg.baseGap || 200))) return
        arr.push({ x: -40, type: cfg.type, speed: spd, phase: Math.random() * 6.28, _drawY: null })
      } else {
        if (arr.some(o => o.x > W - (cfg.baseGap || 200))) return
        arr.push({ x: W + 40, type: cfg.type, speed: spd, phase: Math.random() * 6.28, _drawY: null })
      }
    }

    // ── Ambient petals ──
    const ambientPetals = []
    for (let i = 0; i < 18; i++) {
      ambientPetals.push({
        x: Math.random() * W, y: Math.random() * H,
        r: 2 + Math.random() * 3, rot: Math.random() * 6.28,
        dx: (Math.random() - 0.5) * 0.3, dy: 0.15 + Math.random() * 0.25,
        spin: (Math.random() - 0.5) * 0.02,
        col: Math.random() > 0.5 ? C.dustyL : C.sageL,
        alpha: 0.15 + Math.random() * 0.2,
      })
    }

    function updateAmbientPetals() {
      for (const p of ambientPetals) {
        p.x += p.dx; p.y += p.dy; p.rot += p.spin
        if (p.y > H + 10) { p.y = -10; p.x = Math.random() * W }
        if (p.x < -10) p.x = W + 10
        if (p.x > W + 10) p.x = -10
      }
    }

    function drawAmbientPetals() {
      for (const p of ambientPetals) {
        ctx.save(); ctx.globalAlpha = p.alpha; ctx.fillStyle = p.col
        ctx.translate(p.x, p.y); ctx.rotate(p.rot)
        ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.5, 0, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      }
    }

    // ── Drawing helpers ──

    function shadow(x, y, w, h) {
      ctx.save(); ctx.globalAlpha = 0.07; ctx.fillStyle = "#000"
      ctx.beginPath(); ctx.ellipse(x, y + h * 0.5 + 2, w * 0.5, 3, 0, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    }

    function drawFlowerAt(x, y, r, col, petalCount) {
      const n = petalCount || 5
      ctx.save()
      // Outer petals
      ctx.fillStyle = col
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2
        ctx.beginPath()
        ctx.ellipse(x + Math.cos(a) * r * 1.2, y + Math.sin(a) * r * 1.2, r * 0.9, r * 0.45, a, 0, Math.PI * 2)
        ctx.fill()
      }
      // Inner petals (lighter, rotated)
      ctx.globalAlpha = 0.6
      ctx.fillStyle = C.ivory
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + 0.3
        ctx.beginPath()
        ctx.ellipse(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7, r * 0.5, r * 0.25, a, 0, Math.PI * 2)
        ctx.fill()
      }
      // Center
      ctx.globalAlpha = 1
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x, y, r * 0.35, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = "#E8D4A0"; ctx.beginPath(); ctx.arc(x, y, r * 0.2, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    }

    function drawLeaf(x, y, size, angle) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle)
      ctx.fillStyle = C.sageL; ctx.globalAlpha = 0.5
      ctx.beginPath(); ctx.moveTo(0, 0)
      ctx.quadraticCurveTo(size * 0.5, -size * 0.4, size, 0)
      ctx.quadraticCurveTo(size * 0.5, size * 0.4, 0, 0)
      ctx.fill()
      // Vein
      ctx.strokeStyle = C.sage; ctx.lineWidth = 0.4; ctx.globalAlpha = 0.3
      ctx.beginPath(); ctx.moveTo(1, 0); ctx.lineTo(size - 1, 0); ctx.stroke()
      ctx.restore()
    }

    // ── Lane drawing ──

    function drawLane(wr) {
      const sy = screenY(wr)
      const top = sy - ROW_H / 2
      if (top > H + ROW_H || top + ROW_H < -ROW_H) return
      const safe = isSafe(wr)

      // Background
      if (safe && wr % 8 === 0) ctx.fillStyle = wr === 0 ? C.linen : C.sagePale
      else if (safe) ctx.fillStyle = "#E8EDE2"
      else ctx.fillStyle = wr % 2 === 0 ? C.ivory : "#F3EDE6"
      ctx.fillRect(0, top, W, ROW_H)

      // Aisle runner (center carpet strip)
      ctx.save()
      const runnerW = 70
      const rx = (W - runnerW) / 2
      ctx.fillStyle = safe ? "rgba(184,196,172,0.12)" : "rgba(212,197,176,0.18)"
      ctx.fillRect(rx, top, runnerW, ROW_H)
      // Runner edge trim
      ctx.strokeStyle = safe ? "rgba(184,196,172,0.2)" : "rgba(212,197,176,0.25)"
      ctx.lineWidth = 0.5
      ctx.setLineDash([3, 4])
      ctx.beginPath(); ctx.moveTo(rx, top); ctx.lineTo(rx, top + ROW_H); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(rx + runnerW, top); ctx.lineTo(rx + runnerW, top + ROW_H); ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()

      // Row divider
      ctx.strokeStyle = C.linenD; ctx.lineWidth = 0.5; ctx.globalAlpha = 0.6
      ctx.beginPath(); ctx.moveTo(0, top); ctx.lineTo(W, top); ctx.stroke()
      ctx.globalAlpha = 1

      // Safe row: garland arch with flowers
      if (safe && wr > 0) {
        ctx.save()
        // Draped garland on both sides
        for (const side of [-1, 1]) {
          const cx = side === -1 ? 22 : W - 22
          // Vertical vine
          ctx.strokeStyle = C.sageL; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.4
          ctx.beginPath(); ctx.moveTo(cx, top + 2)
          ctx.bezierCurveTo(cx + side * 4, sy - 4, cx - side * 4, sy + 4, cx, top + ROW_H - 2)
          ctx.stroke()
          ctx.globalAlpha = 1
          // Flowers along vine
          drawFlowerAt(cx, sy - 8, 4, C.dustyL, 5)
          drawFlowerAt(cx, sy + 8, 3.5, C.sageL, 5)
          drawFlowerAt(cx + side * 2, sy, 3, "#D4B8C4", 4)
          // Leaves
          drawLeaf(cx + side * 3, sy - 14, 7, side * 0.6)
          drawLeaf(cx + side * 3, sy + 14, 6, side * -0.4)
        }
        // Connecting garland swag across top
        ctx.strokeStyle = C.sageL; ctx.lineWidth = 1; ctx.globalAlpha = 0.25
        ctx.beginPath(); ctx.moveTo(22, top + 6)
        ctx.quadraticCurveTo(W / 2, top + 16, W - 22, top + 6); ctx.stroke()
        ctx.globalAlpha = 1
        // Rest text
        ctx.globalAlpha = 0.12; ctx.fillStyle = C.sage
        ctx.font = `italic 8px "Cormorant Garamond",serif`; ctx.textAlign = "center"
        ctx.fillText("✦  safe  ✦", W / 2, sy + 3)
        ctx.restore()
      }

      // Start row
      if (wr === 0) {
        ctx.save(); ctx.globalAlpha = 0.2; ctx.fillStyle = C.sage
        ctx.font = `italic 9px "Cormorant Garamond",serif`; ctx.textAlign = "center"
        ctx.fillText("✦  start  ✦", W / 2, sy + 3); ctx.restore()
      }

      // Lane label
      const label = getLaneLabel(wr)
      if (label) {
        ctx.save(); ctx.globalAlpha = 0.14; ctx.fillStyle = C.sage
        ctx.font = `300 8.5px "Jost",sans-serif`; ctx.textAlign = "right"
        ctx.fillText(label.toUpperCase(), W - 8, sy + 4); ctx.restore()
      }
    }

    // ── Obstacle drawing ──

    function drawObs(o, wr) {
      const sy = screenY(wr)
      if (sy < -50 || sy > H + 50) return
      ctx.save()

      if (o.type === "guest") {
        shadow(o.x, sy, 22, 20)
        // Legs
        ctx.fillStyle = C.linenD
        ctx.fillRect(o.x - 4, sy + 5, 3, 8)
        ctx.fillRect(o.x + 1, sy + 5, 3, 8)
        // Body
        const bodyCol = o.speed > 0 ? C.dusty : "#9B7E6B"
        ctx.fillStyle = bodyCol
        ctx.beginPath(); ctx.roundRect(o.x - 9, sy - 8, 18, 16, 3); ctx.fill()
        // Collar/detail
        ctx.fillStyle = C.ivory; ctx.globalAlpha = 0.6
        ctx.beginPath(); ctx.moveTo(o.x - 2, sy - 8); ctx.lineTo(o.x + 2, sy - 8)
        ctx.lineTo(o.x, sy - 4); ctx.closePath(); ctx.fill()
        ctx.globalAlpha = 1
        // Head
        ctx.fillStyle = "#F0DCC8"; ctx.beginPath(); ctx.arc(o.x, sy - 14, 6.5, 0, Math.PI * 2); ctx.fill()
        // Hair
        ctx.fillStyle = o.speed > 0 ? "#8B7355" : "#5C4A3A"
        ctx.beginPath(); ctx.arc(o.x, sy - 16, 5.5, Math.PI, Math.PI * 2); ctx.fill()
        // Eyes
        ctx.fillStyle = C.text; ctx.globalAlpha = 0.7
        ctx.beginPath(); ctx.arc(o.x - 2, sy - 14, 0.8, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(o.x + 2, sy - 14, 0.8, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
      }

      else if (o.type === "chair") {
        shadow(o.x, sy, 26, 22)
        // Chiavari chair — back frame
        ctx.strokeStyle = C.warm; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(o.x - 8, sy - 16); ctx.lineTo(o.x - 8, sy + 6); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(o.x + 8, sy - 16); ctx.lineTo(o.x + 8, sy + 6); ctx.stroke()
        // Back slats
        ctx.lineWidth = 1
        for (let i = -4; i <= 4; i += 4) {
          ctx.beginPath(); ctx.moveTo(o.x + i, sy - 16); ctx.lineTo(o.x + i, sy - 4); ctx.stroke()
        }
        // Top rail
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(o.x - 9, sy - 16); ctx.lineTo(o.x + 9, sy - 16); ctx.stroke()
        // Seat cushion
        ctx.fillStyle = C.linen
        ctx.beginPath(); ctx.roundRect(o.x - 10, sy - 4, 20, 8, 2); ctx.fill()
        ctx.strokeStyle = C.linenD; ctx.lineWidth = 0.5
        ctx.beginPath(); ctx.roundRect(o.x - 10, sy - 4, 20, 8, 2); ctx.stroke()
        // Chair sash
        ctx.fillStyle = C.sageL; ctx.globalAlpha = 0.7
        ctx.fillRect(o.x - 10, sy - 2, 20, 3)
        // Front legs
        ctx.globalAlpha = 1; ctx.strokeStyle = C.warm; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(o.x - 8, sy + 4); ctx.lineTo(o.x - 9, sy + 10); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(o.x + 8, sy + 4); ctx.lineTo(o.x + 9, sy + 10); ctx.stroke()
      }

      else if (o.type === "flower") {
        shadow(o.x, sy, 24, 18)
        // Vase
        ctx.fillStyle = C.linenD
        ctx.beginPath(); ctx.moveTo(o.x - 5, sy + 4); ctx.lineTo(o.x - 7, sy + 14)
        ctx.lineTo(o.x + 7, sy + 14); ctx.lineTo(o.x + 5, sy + 4); ctx.closePath(); ctx.fill()
        ctx.strokeStyle = C.warm; ctx.lineWidth = 0.5
        ctx.beginPath(); ctx.moveTo(o.x - 5, sy + 4); ctx.lineTo(o.x - 7, sy + 14)
        ctx.lineTo(o.x + 7, sy + 14); ctx.lineTo(o.x + 5, sy + 4); ctx.closePath(); ctx.stroke()
        // Stems
        ctx.strokeStyle = C.sage; ctx.lineWidth = 1; ctx.globalAlpha = 0.5
        ctx.beginPath(); ctx.moveTo(o.x - 3, sy + 4); ctx.lineTo(o.x - 6, sy - 6); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(o.x, sy + 4); ctx.lineTo(o.x, sy - 10); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(o.x + 3, sy + 4); ctx.lineTo(o.x + 5, sy - 5); ctx.stroke()
        ctx.globalAlpha = 1
        // Leaves
        drawLeaf(o.x - 4, sy, 8, -0.8)
        drawLeaf(o.x + 4, sy, 7, 0.6)
        // Blooms
        drawFlowerAt(o.x - 6, sy - 8, 6, C.dustyL, 5)
        drawFlowerAt(o.x + 5, sy - 7, 5, "#D4B8C4", 5)
        drawFlowerAt(o.x, sy - 12, 7, C.sageL, 6)
      }

      else if (o.type === "petal") {
        for (let i = 0; i < 5; i++) {
          ctx.save()
          const px = o.x + i * 9 - 18
          const py = sy + Math.sin(fr * 0.04 + i * 1.3 + o.phase) * 6
          const rot = fr * 0.02 + i * 1.1
          ctx.globalAlpha = 0.4 + Math.sin(fr * 0.03 + i) * 0.15
          ctx.fillStyle = i % 2 === 0 ? C.dustyL : "#D4B8C4"
          ctx.translate(px, py); ctx.rotate(rot)
          ctx.beginPath(); ctx.ellipse(0, 0, 4 + i * 0.5, 2.5, 0, 0, Math.PI * 2); ctx.fill()
          ctx.restore()
        }
      }

      else if (o.type === "ribbon") {
        ctx.globalAlpha = 0.6
        // Flowing ribbon with gradient feel
        const wave = Math.sin(fr * 0.03 + o.phase) * 3
        ctx.strokeStyle = C.sageL; ctx.lineWidth = 4; ctx.lineCap = "round"
        ctx.beginPath(); ctx.moveTo(o.x - 22, sy + wave)
        ctx.bezierCurveTo(o.x - 10, sy - 10 + wave, o.x + 10, sy + 10 - wave, o.x + 22, sy - wave)
        ctx.stroke()
        // Lighter inner line
        ctx.strokeStyle = C.sagePale; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(o.x - 20, sy + wave)
        ctx.bezierCurveTo(o.x - 8, sy - 9 + wave, o.x + 8, sy + 9 - wave, o.x + 20, sy - wave)
        ctx.stroke()
        // Bow at center
        ctx.globalAlpha = 0.7; ctx.fillStyle = C.sageL
        ctx.beginPath(); ctx.ellipse(o.x, sy, 4, 3, 0.3, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.ellipse(o.x, sy, 4, 3, -0.3, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = C.sage; ctx.beginPath(); ctx.arc(o.x, sy, 1.5, 0, Math.PI * 2); ctx.fill()
      }

      else if (o.type === "ring") {
        shadow(o.x, sy, 18, 22)
        // Ring bearer kid
        // Legs
        ctx.fillStyle = C.linenD
        ctx.fillRect(o.x - 3, sy + 6, 2.5, 7)
        ctx.fillRect(o.x + 0.5, sy + 6, 2.5, 7)
        // Body (cute vest)
        ctx.fillStyle = C.sage
        ctx.beginPath(); ctx.roundRect(o.x - 6, sy - 5, 12, 13, 2); ctx.fill()
        // Shirt collar
        ctx.fillStyle = C.ivory
        ctx.beginPath(); ctx.roundRect(o.x - 5, sy - 5, 10, 4, 1); ctx.fill()
        // Head
        ctx.fillStyle = "#F0DCC8"; ctx.beginPath(); ctx.arc(o.x, sy - 11, 5.5, 0, Math.PI * 2); ctx.fill()
        // Hair
        ctx.fillStyle = "#8B7355"
        ctx.beginPath(); ctx.arc(o.x, sy - 13, 4.5, Math.PI, Math.PI * 2); ctx.fill()
        // Blush cheeks
        ctx.fillStyle = "#E8B8A8"; ctx.globalAlpha = 0.3
        ctx.beginPath(); ctx.arc(o.x - 3, sy - 10, 2, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(o.x + 3, sy - 10, 2, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
        // Pillow
        ctx.fillStyle = C.ivory; ctx.strokeStyle = C.linenD; ctx.lineWidth = 0.6
        ctx.beginPath(); ctx.roundRect(o.x - 8, sy + 1, 16, 6, 2); ctx.fill(); ctx.stroke()
        // Tassel detail
        ctx.strokeStyle = C.gold; ctx.lineWidth = 0.6
        ctx.beginPath(); ctx.moveTo(o.x - 8, sy + 4); ctx.lineTo(o.x - 10, sy + 7); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(o.x + 8, sy + 4); ctx.lineTo(o.x + 10, sy + 7); ctx.stroke()
        // Ring on pillow
        ctx.strokeStyle = C.gold; ctx.lineWidth = 2
        ctx.beginPath(); ctx.arc(o.x, sy + 4, 3, 0, Math.PI * 2); ctx.stroke()
        // Diamond sparkle
        ctx.fillStyle = "#FFF"; ctx.globalAlpha = 0.9
        ctx.beginPath(); ctx.arc(o.x, sy + 1.5, 1.5, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 0.5 + Math.sin(fr * 0.1) * 0.3
        ctx.fillStyle = C.gold; ctx.font = "6px sans-serif"; ctx.textAlign = "center"
        ctx.fillText("✦", o.x + 4, sy - 0.5)
        ctx.globalAlpha = 1
      }

      else if (o.type === "uncle") {
        const weaveY = sy + Math.sin(fr * 0.04 + o.phase) * 16
        shadow(o.x, weaveY, 26, 22)
        // Legs (wobbly)
        const wb = Math.sin(fr * 0.08 + o.phase) * 4
        ctx.strokeStyle = "#5C4A3A"; ctx.lineWidth = 2.5; ctx.lineCap = "round"
        ctx.beginPath(); ctx.moveTo(o.x - 4, weaveY + 9); ctx.lineTo(o.x - 7 + wb, weaveY + 20); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(o.x + 4, weaveY + 9); ctx.lineTo(o.x + 7 - wb, weaveY + 20); ctx.stroke()
        // Body (rumpled suit)
        ctx.fillStyle = "#5C4A3A"
        ctx.beginPath(); ctx.roundRect(o.x - 11, weaveY - 7, 22, 18, 3); ctx.fill()
        // Undone shirt
        ctx.fillStyle = C.ivory; ctx.globalAlpha = 0.8
        ctx.beginPath(); ctx.moveTo(o.x - 3, weaveY - 7); ctx.lineTo(o.x + 3, weaveY - 7)
        ctx.lineTo(o.x + 1, weaveY + 2); ctx.lineTo(o.x - 1, weaveY + 2); ctx.closePath(); ctx.fill()
        ctx.globalAlpha = 1
        // Loose tie
        ctx.strokeStyle = C.danger; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(o.x, weaveY - 5)
        ctx.quadraticCurveTo(o.x + 4, weaveY + 2, o.x + 2, weaveY + 8); ctx.stroke()
        // Head (flushed)
        ctx.fillStyle = "#D4A882"; ctx.beginPath(); ctx.arc(o.x, weaveY - 14, 7.5, 0, Math.PI * 2); ctx.fill()
        // Rosy cheeks
        ctx.fillStyle = "#D4887A"; ctx.globalAlpha = 0.4
        ctx.beginPath(); ctx.arc(o.x - 4, weaveY - 12, 2.5, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(o.x + 4, weaveY - 12, 2.5, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
        // Messy hair
        ctx.fillStyle = "#6B5040"
        ctx.beginPath(); ctx.arc(o.x, weaveY - 17, 6, Math.PI * 0.9, Math.PI * 2.1); ctx.fill()
        ctx.beginPath(); ctx.ellipse(o.x + 5, weaveY - 17, 3, 2, 0.5, 0, Math.PI * 2); ctx.fill()
        // Goofy grin
        ctx.strokeStyle = "#8B6040"; ctx.lineWidth = 1
        ctx.beginPath(); ctx.arc(o.x, weaveY - 11, 3.5, 0.2, Math.PI - 0.2); ctx.stroke()
        // Champagne glass (held out to side)
        const armX = o.x + 13
        ctx.strokeStyle = "#5C4A3A"; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(o.x + 10, weaveY - 3); ctx.lineTo(armX, weaveY - 8); ctx.stroke()
        // Glass
        ctx.fillStyle = "rgba(200,169,110,0.3)"
        ctx.beginPath(); ctx.moveTo(armX - 3, weaveY - 18); ctx.lineTo(armX + 3, weaveY - 18)
        ctx.lineTo(armX + 2, weaveY - 12); ctx.lineTo(armX - 2, weaveY - 12); ctx.closePath(); ctx.fill()
        ctx.strokeStyle = C.linenD; ctx.lineWidth = 0.6
        ctx.beginPath(); ctx.moveTo(armX - 3, weaveY - 18); ctx.lineTo(armX + 3, weaveY - 18)
        ctx.lineTo(armX + 2, weaveY - 12); ctx.lineTo(armX - 2, weaveY - 12); ctx.closePath(); ctx.stroke()
        // Stem
        ctx.beginPath(); ctx.moveTo(armX, weaveY - 12); ctx.lineTo(armX, weaveY - 8); ctx.stroke()
        // Bubbles
        ctx.fillStyle = "#FFF"; ctx.globalAlpha = 0.5
        ctx.beginPath(); ctx.arc(armX - 1, weaveY - 16 + Math.sin(fr * 0.08) * 1.5, 1, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(armX + 1, weaveY - 15 + Math.cos(fr * 0.06) * 1.5, 0.7, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
        o._drawY = weaveY
      }

      ctx.restore()
    }

    // ── Player drawing ──

    function drawPlayer() {
      const x = pDX, y = pDY
      ctx.save()
      if (flashT > 0 && Math.floor(flashT / 5) % 2 === 0) ctx.globalAlpha = 0.25
      if (stunT > 0) ctx.globalAlpha = 0.45

      // Shared shadow
      shadow(x + 5, y, 35, 24)

      // ── Groom (Jacob) — right side ──
      const gx = x + 16
      // Legs
      ctx.fillStyle = "#3D3530"
      ctx.fillRect(gx - 3, y + 6, 2.5, 8); ctx.fillRect(gx + 0.5, y + 6, 2.5, 8)
      // Shoes
      ctx.fillStyle = "#2A231E"
      ctx.fillRect(gx - 4, y + 13, 4, 2); ctx.fillRect(gx, y + 13, 4, 2)
      // Suit body
      ctx.fillStyle = C.text
      ctx.beginPath(); ctx.roundRect(gx - 6, y - 7, 12, 15, 2); ctx.fill()
      // Lapels
      ctx.fillStyle = C.ivory; ctx.globalAlpha = 0.5
      ctx.beginPath(); ctx.moveTo(gx - 2, y - 7); ctx.lineTo(gx, y - 2); ctx.lineTo(gx - 4, y - 2); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(gx + 2, y - 7); ctx.lineTo(gx, y - 2); ctx.lineTo(gx + 4, y - 2); ctx.closePath(); ctx.fill()
      ctx.globalAlpha = 1
      // Boutonniere
      drawFlowerAt(gx - 5, y - 3, 2, C.dustyL, 4)
      // Tie
      ctx.fillStyle = C.sage
      ctx.beginPath(); ctx.moveTo(gx - 1, y - 6); ctx.lineTo(gx + 1, y - 6)
      ctx.lineTo(gx + 0.5, y + 2); ctx.lineTo(gx - 0.5, y + 2); ctx.closePath(); ctx.fill()
      // Head
      ctx.fillStyle = "#F0DCC8"; ctx.beginPath(); ctx.arc(gx, y - 13, 6, 0, Math.PI * 2); ctx.fill()
      // Hair
      ctx.fillStyle = "#5C4A3A"
      ctx.beginPath(); ctx.arc(gx, y - 15.5, 5, Math.PI * 0.85, Math.PI * 2.15); ctx.fill()
      ctx.beginPath(); ctx.ellipse(gx - 3, y - 16, 3, 2, -0.3, 0, Math.PI * 2); ctx.fill()
      // Eyes + smile
      ctx.fillStyle = C.text; ctx.globalAlpha = 0.7
      ctx.beginPath(); ctx.arc(gx - 2, y - 13, 0.7, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(gx + 2, y - 13, 0.7, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = C.warm; ctx.lineWidth = 0.6; ctx.globalAlpha = 0.5
      ctx.beginPath(); ctx.arc(gx, y - 11, 2, 0.2, Math.PI - 0.2); ctx.stroke()
      ctx.globalAlpha = 1

      // ── Bride (Kate) — left side ──
      const bx = x - 4
      // Dress (layered A-line)
      ctx.fillStyle = C.ivory; ctx.strokeStyle = C.sageL; ctx.lineWidth = 0.6
      // Dress bottom layer (fuller)
      ctx.beginPath()
      ctx.moveTo(bx - 13, y + 4); ctx.bezierCurveTo(bx - 17, y + 18, bx + 13, y + 18, bx + 9, y + 4)
      ctx.fill(); ctx.stroke()
      // Dress bodice
      ctx.fillStyle = C.ivory
      ctx.beginPath(); ctx.ellipse(bx - 2, y - 1, 7.5, 8.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
      // Waist sash
      ctx.fillStyle = C.sageL; ctx.globalAlpha = 0.5
      ctx.fillRect(bx - 9, y + 1, 14, 2.5)
      ctx.globalAlpha = 1
      // Lace detail on bodice
      ctx.strokeStyle = C.linenD; ctx.lineWidth = 0.3; ctx.globalAlpha = 0.3
      for (let i = -5; i <= 5; i += 3) {
        ctx.beginPath(); ctx.arc(bx - 2 + i, y - 4, 2, 0, Math.PI * 2); ctx.stroke()
      }
      ctx.globalAlpha = 1
      // Head
      ctx.fillStyle = "#F0DCC8"; ctx.beginPath(); ctx.arc(bx - 2, y - 14, 6, 0, Math.PI * 2); ctx.fill()
      // Hair (updo)
      ctx.fillStyle = "#8B6B4A"
      ctx.beginPath(); ctx.arc(bx - 2, y - 16, 5, Math.PI * 0.8, Math.PI * 2.2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(bx - 2, y - 19, 3.5, 2.5, 0, 0, Math.PI * 2); ctx.fill()
      // Hair flower
      drawFlowerAt(bx + 2, y - 19, 2.5, "#D4B8C4", 4)
      // Eyes + smile
      ctx.fillStyle = C.text; ctx.globalAlpha = 0.7
      ctx.beginPath(); ctx.arc(bx - 4, y - 14, 0.7, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(bx, y - 14, 0.7, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = C.warm; ctx.lineWidth = 0.6; ctx.globalAlpha = 0.5
      ctx.beginPath(); ctx.arc(bx - 2, y - 12, 2, 0.2, Math.PI - 0.2); ctx.stroke()
      ctx.globalAlpha = 1
      // Veil (flowing behind)
      ctx.strokeStyle = "rgba(249,245,238,0.5)"; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(bx + 1, y - 18)
      ctx.bezierCurveTo(bx + 14, y - 12, bx + 16, y + 2, bx + 10, y + 12); ctx.stroke()
      ctx.strokeStyle = "rgba(249,245,238,0.3)"; ctx.lineWidth = 0.6
      ctx.beginPath(); ctx.moveTo(bx + 2, y - 17)
      ctx.bezierCurveTo(bx + 18, y - 8, bx + 18, y + 6, bx + 12, y + 14); ctx.stroke()
      // Bouquet
      drawFlowerAt(bx + 7, y + 5, 4.5, C.dustyL, 5)
      drawFlowerAt(bx + 10, y + 3, 3.5, C.sageL, 4)
      drawFlowerAt(bx + 8, y + 2, 3, "#D4B8C4", 4)
      // Bouquet stems
      ctx.strokeStyle = C.sage; ctx.lineWidth = 0.6; ctx.globalAlpha = 0.4
      ctx.beginPath(); ctx.moveTo(bx + 8, y + 7); ctx.lineTo(bx + 7, y + 12); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(bx + 9, y + 7); ctx.lineTo(bx + 10, y + 12); ctx.stroke()
      ctx.globalAlpha = 1

      // Stun indicator
      if (stunT > 0) {
        ctx.globalAlpha = 0.6 + Math.sin(fr * 0.15) * 0.3
        ctx.fillStyle = C.gold; ctx.font = "10px sans-serif"; ctx.textAlign = "center"
        ctx.fillText("✧", x - 6, y - 24); ctx.fillText("✧", x + 18, y - 22)
        ctx.textAlign = "left"; ctx.globalAlpha = 1
      }
      ctx.restore()
    }

    // ── Effects & HUD ──

    function drawPhotoFlash() {
      if (flashFx <= 0) return
      ctx.save()
      const a = Math.min(flashFx / 15, 0.55)
      // Radial flash from photographer position
      const grad = ctx.createRadialGradient(photoX, photoY, 0, photoX, photoY, 200)
      grad.addColorStop(0, `rgba(255,251,232,${a})`)
      grad.addColorStop(1, `rgba(255,251,232,0)`)
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)
      // Camera icon
      ctx.globalAlpha = Math.min(flashFx / 10, 1)
      ctx.fillStyle = C.text; ctx.font = "bold 18px sans-serif"; ctx.textAlign = "center"
      ctx.fillText("📸", photoX, photoY)
      ctx.fillStyle = C.warm; ctx.font = `italic 11px "Cormorant Garamond",serif`
      ctx.fillText("Smile!", photoX, photoY + 16)
      ctx.textAlign = "left"; ctx.restore()
    }

    function drawHud() {
      // Frosted top bar
      ctx.save()
      const grad = ctx.createLinearGradient(0, 0, 0, 22)
      grad.addColorStop(0, "rgba(237,229,216,0.5)")
      grad.addColorStop(1, "rgba(237,229,216,0)")
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, 22)
      ctx.fillStyle = C.sage; ctx.globalAlpha = 0.25
      ctx.font = `300 8px "Jost",sans-serif`; ctx.textAlign = "left"
      const d = getDifficulty(maxRow)
      ctx.fillText(d.phase.toUpperCase(), 6, 14)
      ctx.textAlign = "right"
      ctx.fillText(`DISTANCE ${maxRow}`, W - 6, 14)
      ctx.restore()
      // Progress bar
      const pct = Math.min(maxRow / 60, 1)
      ctx.fillStyle = pct > 0.7 ? C.danger : C.sageL
      ctx.globalAlpha = 0.35; ctx.fillRect(0, 0, W * pct, 2); ctx.globalAlpha = 1
    }

    function drawOverlay(l1, l2, sub) {
      // Dim background
      ctx.fillStyle = "rgba(237,229,216,0.88)"
      ctx.fillRect(0, 0, W, H)
      // Card
      const cw = W - 50, ch = 140, cx = 25, cy = H / 2 - ch / 2
      ctx.fillStyle = C.ivory
      ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 10); ctx.fill()
      ctx.strokeStyle = C.sageL; ctx.lineWidth = 0.8
      ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 10); ctx.stroke()
      // Inner border
      ctx.strokeStyle = C.linenD; ctx.lineWidth = 0.3
      ctx.beginPath(); ctx.roundRect(cx + 6, cy + 6, cw - 12, ch - 12, 7); ctx.stroke()
      // Corner flowers
      drawFlowerAt(cx + 14, cy + 14, 5, C.dustyL, 5)
      drawFlowerAt(cx + cw - 14, cy + 14, 4, C.sageL, 4)
      drawFlowerAt(cx + 14, cy + ch - 14, 4, "#D4B8C4", 4)
      drawFlowerAt(cx + cw - 14, cy + ch - 14, 5, C.dustyL, 5)
      // Text
      ctx.textAlign = "center"
      ctx.fillStyle = C.sage; ctx.font = `italic 1.3rem "Cormorant Garamond",serif`
      ctx.fillText(l1, W / 2, H / 2 - 22)
      if (l2) { ctx.fillStyle = C.warm; ctx.font = `italic 1rem "Cormorant Garamond",serif`; ctx.fillText(l2, W / 2, H / 2 + 6) }
      if (sub) { ctx.fillStyle = C.dusty; ctx.font = `300 0.6rem "Jost",sans-serif`; ctx.fillText(sub, W / 2, H / 2 + 34) }
      // Ornament
      ctx.fillStyle = C.sageL; ctx.globalAlpha = 0.4; ctx.font = `300 0.5rem "Jost",sans-serif`
      ctx.fillText("— ✦ —", W / 2, H / 2 + 50)
      ctx.globalAlpha = 1; ctx.textAlign = "left"
    }

    function checkCollision() {
      if (isSafe(pWR)) return false
      const arr = obsMap.get(pWR)
      if (!arr) return false
      for (const o of arr) {
        const oy = o.type === "uncle" && o._drawY != null ? o._drawY : screenY(pWR)
        if (Math.abs(pDX - o.x) < 22 && Math.abs(pDY - oy) < 18) return true
      }
      return false
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      const [lo, hi] = visibleRange()
      for (let wr = lo; wr <= hi; wr++) drawLane(wr)
      for (let wr = lo; wr <= hi; wr++) {
        const arr = obsMap.get(wr)
        if (arr) arr.forEach(o => drawObs(o, wr))
      }
      drawAmbientPetals()
      drawPlayer()
      if (gp === "playing") { drawHud(); drawPhotoFlash() }
      if (gp === "idle") drawOverlay("Help Jacob & Kate reach the altar", "How far can you go?", "Arrow keys to move  ·  Mobile: tap or swipe")
      if (gp === "dead") drawOverlay("The wedding planner is furious", `Distance: ${maxRow}`, "Tap or press any key to retry")
    }

    function loop() {
      if (gp !== "playing") return
      fr++
      updateAmbientPetals()
      camOff += (pWR - camOff) * 0.15
      const [lo, hi] = visibleRange()
      const diff = getDifficulty(maxRow)
      for (let wr = lo; wr <= hi; wr++) {
        if (isSafe(wr)) continue
        const cfg = getEffectiveLane(wr, diff)
        if (!cfg) continue
        const interval = Math.max(Math.floor((cfg.baseGap || 200) / (cfg.baseSpd * diff.spd)) + 8, 14)
        if (fr % interval === ((wr * 7 + wr) & 0x7F) % interval) trySpawn(wr)
      }
      for (const [wr, arr] of obsMap) {
        for (const o of arr) o.x += o.speed
        obsMap.set(wr, arr.filter(o => o.x > -80 && o.x < W + 80))
      }
      for (const wr of obsMap.keys()) {
        if (wr < lo - 5 || wr > hi + 5) obsMap.delete(wr)
      }
      if (diff.photographer) {
        photoT++
        if (photoT % 200 === 100) {
          flashFx = 30
          photoX = 40 + Math.random() * (W - 80)
          photoY = PLAYER_SCREEN_Y - 60 + Math.random() * 120
          if (stunT <= 0) stunT = 28
        }
      }
      if (flashFx > 0) flashFx--
      if (flashT > 0) flashT--
      if (stunT > 0) stunT--
      pDX += (pX - pDX) * 0.3
      pDY += (screenY(pWR) - pDY) * 0.3
      if (flashT === 0 && checkCollision()) {
        lv--; setLives(lv)
        if (lv <= 0) {
          gp = "dead"
          if (maxRow > bestV) { bestV = maxRow; setBest(bestV) }
          setDist(maxRow); setGameOver(true); draw(); return
        }
        flashT = 50
        let safeRow = pWR
        while (safeRow > 0 && !isSafe(safeRow)) safeRow--
        pWR = safeRow; pDY = screenY(pWR)
        setStatus("Watch out!")
        setTimeout(() => { if (gp === "playing") setStatus("") }, 1200)
      }
      draw()
      loopId = requestAnimationFrame(loop)
    }

    function moveUp() {
      if (gp === "idle" || gp === "dead") { startGame(); return }
      if (gp !== "playing" || stunT > 0) return
      pWR++
      if (pWR > maxRow) {
        maxRow = pWR; setDist(maxRow)
        const d = getDifficulty(maxRow); setPhase(d.phase)
        if (maxRow > bestV) { bestV = maxRow; setBest(bestV) }
      }
    }
    function moveDown() { if (gp === "playing" && stunT <= 0 && pWR > 0) pWR-- }
    function moveLeft() { if (gp === "playing" && stunT <= 0) pX = Math.max(20, pX - 22) }
    function moveRight() { if (gp === "playing" && stunT <= 0) pX = Math.min(W - 65, pX + 22) }

    const onKey = e => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault()
      if (gp === "idle" || gp === "dead") { startGame(); return }
      if (e.key === "ArrowUp") moveUp()
      if (e.key === "ArrowDown") moveDown()
      if (e.key === "ArrowLeft") moveLeft()
      if (e.key === "ArrowRight") moveRight()
    }

    let tx = 0, ty = 0
    const onTS = e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY }
    const onTE = e => {
      const dx = tx - e.changedTouches[0].clientX
      const dy = ty - e.changedTouches[0].clientY
      if (Math.abs(dy) < 12 && Math.abs(dx) < 12) { moveUp(); return }
      Math.abs(dy) > Math.abs(dx) ? (dy > 0 ? moveUp() : moveDown()) : (dx > 0 ? moveLeft() : moveRight())
    }

    canvas.addEventListener("touchstart", onTS, { passive: true })
    canvas.addEventListener("touchend", onTE, { passive: true })
    document.addEventListener("keydown", onKey)
    stateRef.current = { startGame, moveUp, moveDown, moveLeft, moveRight }
    draw()

    return () => {
      cancelAnimationFrame(loopId)
      canvas.removeEventListener("touchstart", onTS)
      canvas.removeEventListener("touchend", onTE)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  const handleSubmit = () => {
    const name = nameInput.trim()
    if (name && dist > 0) submitScore(name, dist)
  }

  return (
    <div id="game" className="full-bleed" style={{ background: "var(--sage-pale,#EDF0E8)", padding: "5rem 0" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 2rem", textAlign: "center" }}>
        <canvas ref={canvasRef} width={W} height={H} style={{
          border: "1px solid var(--linen-dark,#D4C5B0)", borderRadius: 8,
          display: "block", margin: "0 auto", maxWidth: "100%",
          cursor: "pointer", touchAction: "none",
        }} />

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          maxWidth: W, margin: "0.75rem auto 0",
          fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: C.dusty,
        }}>
          <div>Distance <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1rem", letterSpacing: 0, color: C.sage }}>{dist}</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {phase && !idle && <span style={{ fontSize: "0.48rem", color: C.warm, letterSpacing: "0.1em" }}>{phase}</span>}
            <div style={{ display: "flex", gap: 5 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 11, height: 11,
                  background: i < lives ? C.dusty : C.linenD,
                  clipPath: "polygon(50% 90%,5% 35%,20% 10%,50% 30%,80% 10%,95% 35%)",
                }} />
              ))}
            </div>
          </div>
          <div>Best <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1rem", letterSpacing: 0, color: C.sage }}>{best}</span></div>
        </div>

        <p style={{
          fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic",
          fontSize: "1.05rem", color: C.warm, minHeight: "1.4rem", marginTop: "0.6rem",
        }}>{status}</p>


        {gameOver && !submitted && (
          <div style={{
            padding: "1.25rem 1.5rem", border: `1px solid ${C.linenD}`,
            borderRadius: 8, background: C.ivory, maxWidth: 320, margin: "1.25rem auto 0",
          }}>
            {nameKnown ? (
              <>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.1rem", color: C.warm, margin: "0 0 0.75rem" }}>
                  Submit as <strong>{playerName}</strong>?
                </p>
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                  <button onClick={() => submitScore(playerName, dist)} style={{
                    fontFamily: "'Jost',sans-serif", fontSize: "0.62rem", letterSpacing: "0.2em",
                    textTransform: "uppercase", padding: "0.5rem 1.2rem", border: "none",
                    color: "white", background: C.sage, borderRadius: 4, cursor: "pointer",
                  }}>Submit ({dist})</button>
                  <button onClick={() => setNameKnown(false)} style={{
                    fontFamily: "'Jost',sans-serif", fontSize: "0.62rem", letterSpacing: "0.2em",
                    textTransform: "uppercase", padding: "0.5rem 1rem", border: `0.5px solid ${C.dusty}`,
                    color: C.dusty, background: "transparent", borderRadius: 4, cursor: "pointer",
                  }}>Change Name</button>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1.1rem", color: C.warm, margin: "0 0 0.75rem" }}>
                  Sign the guestbook
                </p>
                <input
                  type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
                  placeholder="Your name" maxLength={24} autoFocus
                  onKeyDown={e => { if (e.key === "Enter") handleSubmit() }}
                  style={{
                    fontFamily: "'Jost',sans-serif", fontSize: "0.8rem", padding: "0.5rem 0.75rem",
                    border: `1px solid ${C.linenD}`, borderRadius: 4, width: "100%",
                    boxSizing: "border-box", background: "white", color: C.text,
                    outline: "none", textAlign: "center",
                  }}
                />
                <button onClick={handleSubmit} disabled={!nameInput.trim()} style={{
                  fontFamily: "'Jost',sans-serif", fontSize: "0.62rem", letterSpacing: "0.2em",
                  textTransform: "uppercase", padding: "0.5rem 1.4rem",
                  border: "none", color: "white", borderRadius: 4, marginTop: "0.6rem",
                  background: nameInput.trim() ? C.sage : C.linenD,
                  cursor: nameInput.trim() ? "pointer" : "default",
                }}>Save Score: {dist}</button>
              </>
            )}
          </div>
        )}

        {leaderboard.length > 0 && !idle && (
          <div style={{ marginTop: "1.5rem", maxWidth: 340, margin: "1.5rem auto 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: "0.75rem" }}>
              <div style={{ width: 30, height: 1, background: C.sageL }} />
              <span style={{ fontFamily: "'Jost',sans-serif", fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase", color: C.sage }}>
                Guestbook Leaderboard
              </span>
              <div style={{ width: 30, height: 1, background: C.sageL }} />
            </div>
            {lbLoading ? (
              <p style={{ fontSize: "0.75rem", color: C.dusty, fontStyle: "italic" }}>Loading...</p>
            ) : (
              <div style={{ borderTop: `1px solid ${C.linenD}` }}>
                {leaderboard.slice(0, 10).map((entry, i) => (
                  <div key={`${entry.name}-${entry.created_at}-${i}`} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "0.45rem 0.5rem", borderBottom: `1px solid ${C.linenD}`,
                    background: i === 0 ? "rgba(200,169,110,0.08)" : "transparent",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic",
                        fontSize: "0.9rem", color: i < 3 ? C.gold : C.dusty, minWidth: 18,
                      }}>{i === 0 ? "♛" : i + 1}</span>
                      <span style={{
                        fontFamily: "'Jost',sans-serif", fontSize: "0.72rem",
                        letterSpacing: "0.06em", color: C.text,
                      }}>{entry.name}</span>
                    </div>
                    <span style={{
                      fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic",
                      fontSize: "1rem", color: C.sage,
                    }}>{entry.score}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={loadLb} style={{
              fontFamily: "'Jost',sans-serif", fontSize: "0.55rem", letterSpacing: "0.15em",
              textTransform: "uppercase", padding: "0.4rem 1rem", border: `0.5px solid ${C.dusty}`,
              color: C.dusty, background: "transparent", borderRadius: 4,
              cursor: "pointer", marginTop: "0.6rem",
            }}>Refresh</button>
          </div>
        )}

      </div>
    </div>
  )
}