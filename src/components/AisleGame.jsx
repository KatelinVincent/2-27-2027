import React, { useEffect, useRef, useState } from "react"

const W = 380
const H = 480
const ROWS = 9
const ROW_H = H / ROWS
const ALTAR_ROW = 8
const START_ROW = 0
const SAFE_ROWS = new Set([0, 4, 8])

const C = {
  sage:    "#7A8C6E", sageL:  "#B8C4AC", sagePale: "#EDF0E8",
  dusty:   "#8A9BAD", dustyL: "#C4CDD6",
  ivory:   "#F9F5EE", linen:  "#EDE5D8", linenD:   "#D4C5B0",
  warm:    "#6B5B45", text:   "#3D3530", gold:     "#C8A96E",
}

const ROW_CFG = [
  null,
  { type: "guest",  dir:  1, speed: 1.2, minGap: 200 },
  { type: "chair",  dir: -1, speed: 1.4, minGap: 220 },
  { type: "flower", dir:  1, speed: 1.0, minGap: 240 },
  null,
  { type: "petal",  dir: -1, speed: 0.8, minGap: 260 },
  { type: "ribbon", dir:  1, speed: 1.1, minGap: 230 },
  { type: "ring",   dir: -1, speed: 1.3, minGap: 210 },
  null,
]

function rowY(r) { return H - ROW_H * (r + 1) + ROW_H / 2 }

export default function AisleGame() {
  const canvasRef = useRef(null)
  const stateRef  = useRef(null)
  const [status, setStatus] = useState("Press any key or tap to begin")
  const [score,  setScore]  = useState(0)
  const [best,   setBest]   = useState(0)
  const [lives,  setLives]  = useState(3)

  useEffect(() => {
    if (typeof CanvasRenderingContext2D !== "undefined" && !CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        this.beginPath()
        this.moveTo(x + r, y)
        this.lineTo(x + w - r, y)
        this.quadraticCurveTo(x + w, y, x + w, y + r)
        this.lineTo(x + w, y + h - r)
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
        this.lineTo(x + r, y + h)
        this.quadraticCurveTo(x, y + h, x, y + h - r)
        this.lineTo(x, y + r)
        this.quadraticCurveTo(x, y, x + r, y)
        this.closePath()
      }
    }
    const canvas = canvasRef.current
    const ctx    = canvas.getContext("2d")

    let gamePhase = "idle"
    let playerRow, playerX, playerDisplayX, playerDisplayY
    let obstacles, scoreVal, bestVal = 0, livesVal, frame, flashTimer
    let loopId

    function initPlayer() {
      playerRow = START_ROW; playerX = 52
      playerDisplayX = 52; playerDisplayY = rowY(START_ROW)
    }

    function startGame() {
      cancelAnimationFrame(loopId)
      gamePhase = "playing"; obstacles = []; scoreVal = 0
      livesVal = 3; frame = 0; flashTimer = 0
      initPlayer()
      setScore(0); setLives(3); setStatus("")
      loopId = requestAnimationFrame(loop)
    }

    function trySpawn(r) {
      const cfg = ROW_CFG[r]
      if (!cfg) return
      const speedScale = 1 + scoreVal * 0.008
      const spd = cfg.speed * cfg.dir * speedScale
      const rowObs = obstacles.filter(o => o.row === r)
      if (cfg.dir === 1) {
        const tooClose = rowObs.some(o => o.x < cfg.minGap)
        if (!tooClose) obstacles.push({ row: r, x: -35, type: cfg.type, speed: spd })
      } else {
        const tooClose = rowObs.some(o => o.x > W - cfg.minGap)
        if (!tooClose) obstacles.push({ row: r, x: W + 35, type: cfg.type, speed: spd })
      }
    }

    function drawFlowerAt(x, y, r, col) {
      ctx.fillStyle = col
      for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        ctx.ellipse(x + Math.cos(i * 1.257) * r * 1.4, y + Math.sin(i * 1.257) * r * 1.4, r, r * 0.55, i * 1.257, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = C.ivory; ctx.beginPath(); ctx.arc(x, y, r * 0.5, 0, Math.PI * 2); ctx.fill()
    }

    function drawLane(r) {
      const y = rowY(r) - ROW_H / 2
      if (r === ALTAR_ROW)       ctx.fillStyle = C.sagePale
      else if (r === START_ROW)  ctx.fillStyle = C.linen
      else if (SAFE_ROWS.has(r)) ctx.fillStyle = "#E8EDE2"
      else                       ctx.fillStyle = r % 2 === 0 ? C.ivory : "#F3EDE6"
      ctx.fillRect(0, y, W, ROW_H)
      ctx.strokeStyle = C.linenD; ctx.lineWidth = 0.5
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    }

    function drawLaneLabel(r) {
      const labels = { 1:"Guests", 2:"Seating", 3:"Bouquets", 5:"Petals", 6:"Ribbons", 7:"Ring Bearer", 8:"Altar" }
      if (!labels[r]) return
      ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = C.sage
      ctx.font = `300 9.5px "Jost",sans-serif`; ctx.textAlign = "right"
      ctx.fillText(labels[r].toUpperCase(), W - 8, rowY(r) + 4)
      ctx.restore()
    }

    function drawAltar() {
      const y = rowY(ALTAR_ROW)
      ctx.strokeStyle = C.sage; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(W - 26, H)
      ctx.bezierCurveTo(W - 26, y, W - 4, y - 60, W - 26, 0); ctx.stroke()
      for (let i = 0; i < 4; i++) {
        const fy = i * (H / 3.5) + 18
        drawFlowerAt(W - 26, fy, 7, C.sageL)
        drawFlowerAt(W - 26, fy, 4, C.dustyL)
      }
      ctx.fillStyle = C.linenD; ctx.fillRect(W - 19, y - 20, 4, 20)
      ctx.fillStyle = C.gold;   ctx.beginPath(); ctx.arc(W - 17, y - 22, 3, 0, Math.PI * 2); ctx.fill()
    }

    function drawObstacle(o) {
      const y = rowY(o.row)
      ctx.save()
      if (o.type === "guest") {
        ctx.fillStyle = "#F5E6D3"; ctx.beginPath(); ctx.arc(o.x, y - 14, 6, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = o.speed > 0 ? C.dusty : C.warm
        ctx.beginPath(); ctx.roundRect(o.x - 8, y - 8, 16, 14, 2); ctx.fill()
        ctx.fillStyle = C.linenD; ctx.fillRect(o.x - 10, y + 4, 20, 4)
      } else if (o.type === "chair") {
        ctx.fillStyle = C.warm; ctx.strokeStyle = C.linen; ctx.lineWidth = 0.5
        ctx.beginPath(); ctx.roundRect(o.x - 12, y - 14, 24, 22, 3); ctx.fill(); ctx.stroke()
        ctx.fillStyle = C.linen; ctx.fillRect(o.x - 9, y - 12, 18, 10)
        ctx.strokeStyle = C.sageL; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(o.x - 6, y - 14); ctx.lineTo(o.x + 6, y - 14); ctx.stroke()
      } else if (o.type === "flower") {
        drawFlowerAt(o.x, y, 10, C.dustyL)
        drawFlowerAt(o.x, y, 6,  C.sagePale)
      } else if (o.type === "petal") {
        ctx.fillStyle = C.dustyL; ctx.globalAlpha = 0.65
        for (let i = 0; i < 4; i++) {
          ctx.beginPath()
          ctx.ellipse(o.x + i * 8 - 12, y + Math.sin(frame * 0.05 + i) * 4, 5, 3, i * 0.8, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (o.type === "ribbon") {
        ctx.strokeStyle = C.sageL; ctx.lineWidth = 3; ctx.globalAlpha = 0.75
        ctx.beginPath(); ctx.moveTo(o.x - 18, y)
        ctx.bezierCurveTo(o.x - 6, y - 10, o.x + 6, y + 10, o.x + 18, y); ctx.stroke()
      } else if (o.type === "ring") {
        ctx.fillStyle = "#F5E6D3"; ctx.beginPath(); ctx.arc(o.x, y - 13, 5, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = C.ivory;   ctx.fillRect(o.x - 4, y - 8, 8, 12)
        ctx.fillStyle = C.sage;    ctx.fillRect(o.x - 3, y - 6, 6, 4)
        ctx.fillStyle = C.linenD;  ctx.fillRect(o.x - 7, y + 3, 14, 6)
        ctx.strokeStyle = C.gold;  ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.arc(o.x, y + 6, 3, 0, Math.PI * 2); ctx.stroke()
      }
      ctx.restore()
    }

    function drawPlayer() {
      const x = playerDisplayX, y = playerDisplayY
      ctx.save()
      if (flashTimer > 0 && Math.floor(flashTimer / 5) % 2 === 0) ctx.globalAlpha = 0.25
      const gx = x + 15
      ctx.fillStyle = C.text;    ctx.beginPath(); ctx.roundRect(gx - 5, y - 6, 10, 14, 2); ctx.fill()
      ctx.fillStyle = "#F5E6D3"; ctx.beginPath(); ctx.arc(gx, y - 12, 6, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = C.sageL;   ctx.beginPath(); ctx.arc(gx - 2, y - 1, 2, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = C.ivory; ctx.strokeStyle = C.sageL; ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.moveTo(x - 12, y + 2); ctx.bezierCurveTo(x - 16, y + 16, x + 16, y + 16, x + 12, y + 2)
      ctx.fill(); ctx.stroke()
      ctx.fillStyle = C.ivory; ctx.beginPath(); ctx.ellipse(x, y - 2, 7, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
      ctx.fillStyle = "#F5E6D3"; ctx.beginPath(); ctx.arc(x, y - 13, 6, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = "rgba(249,245,238,0.9)"; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(x + 3, y - 17)
      ctx.bezierCurveTo(x + 16, y - 9, x + 14, y + 4, x + 8, y + 10); ctx.stroke()
      drawFlowerAt(x + 9, y + 4, 5, C.dustyL)
      drawFlowerAt(x + 9, y + 4, 3, C.sageL)
      ctx.restore()
    }

    function drawOverlay(line1, line2, sub) {
      ctx.fillStyle = "rgba(237,229,216,0.93)"
      ctx.beginPath(); ctx.roundRect(20, H / 2 - 62, W - 40, 124, 8); ctx.fill()
      ctx.strokeStyle = C.sageL; ctx.lineWidth = 0.5
      ctx.beginPath(); ctx.roundRect(20, H / 2 - 62, W - 40, 124, 8); ctx.stroke()
      ctx.textAlign = "center"
      ctx.fillStyle = C.sage; ctx.font = `italic 1.25rem "Cormorant Garamond",serif`
      ctx.fillText(line1, W / 2, H / 2 - 24)
      if (line2) { ctx.fillStyle = C.warm; ctx.font = `italic 1rem "Cormorant Garamond",serif`; ctx.fillText(line2, W / 2, H / 2 + 4) }
      if (sub)   { ctx.fillStyle = C.dusty; ctx.font = `300 0.62rem "Jost",sans-serif`; ctx.fillText(sub, W / 2, H / 2 + 32) }
      ctx.textAlign = "left"
    }

    function checkCollision() {
      if (SAFE_ROWS.has(playerRow)) return false
      for (const o of obstacles) {
        if (o.row !== playerRow) continue
        if (Math.abs(playerDisplayX - o.x) < 22 && Math.abs(playerDisplayY - rowY(o.row)) < 18) return true
      }
      return false
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      for (let r = 0; r < ROWS; r++) drawLane(r)
      for (let r = 0; r < ROWS; r++) drawLaneLabel(r)
      drawAltar()
      obstacles.forEach(drawObstacle)
      drawPlayer()
      if (gamePhase === "idle") drawOverlay("Help Jacob & Kate reach the altar", "Hop up through each lane — avoid the chaos", "Arrow keys to move &nbsp;·&nbsp; Mobile: tap Up / Down or swipe")
      if (gamePhase === "dead") drawOverlay("Almost — try again?", `Score: ${scoreVal}`, "Start or any key to retry")
      if (gamePhase === "win")  drawOverlay("The Nemeths made it!", "See you February 27th", `Final score: ${scoreVal}`)
    }

    function loop() {
      if (gamePhase !== "playing") return
      frame++
      for (let r = 1; r <= 7; r++) {
        if (SAFE_ROWS.has(r)) continue
        const cfg = ROW_CFG[r]
        if (!cfg) continue
        const interval = Math.floor(cfg.minGap / (cfg.speed * (1 + scoreVal * 0.008))) + 10
        if (frame % interval === (r * 7) % interval) trySpawn(r)
      }
      obstacles.forEach(o => { o.x += o.speed * (1 + scoreVal * 0.008) })
      obstacles = obstacles.filter(o => o.x > -80 && o.x < W + 80)
      if (flashTimer > 0) flashTimer--
      playerDisplayX += (playerX - playerDisplayX) * 0.3
      playerDisplayY += (rowY(playerRow) - playerDisplayY) * 0.3
      if (flashTimer === 0 && checkCollision()) {
        livesVal--; setLives(livesVal)
        if (livesVal <= 0) {
          gamePhase = "dead"
          if (scoreVal > bestVal) { bestVal = scoreVal; setBest(bestVal) }
          setScore(scoreVal); setStatus(""); draw(); return
        }
        flashTimer = 50; initPlayer()
        setStatus("Watch out!")
        setTimeout(() => { if (gamePhase === "playing") setStatus("") }, 1400)
      }
      if (frame % 45 === 0) {
        scoreVal++
        if (scoreVal > bestVal) { bestVal = scoreVal; setBest(bestVal) }
        setScore(scoreVal)
      }
      draw()
      loopId = requestAnimationFrame(loop)
    }

    function moveUp() {
      if (gamePhase === "idle" || gamePhase === "dead" || gamePhase === "win") { startGame(); return }
      if (playerRow < ALTAR_ROW) {
        playerRow++
        if (playerRow === ALTAR_ROW) {
          gamePhase = "win"; scoreVal += 25
          if (scoreVal > bestVal) { bestVal = scoreVal; setBest(bestVal) }
          setScore(scoreVal); setStatus(""); draw()
        }
      }
    }
    function moveDown()  { if (gamePhase === "playing" && playerRow > START_ROW) playerRow-- }
    function moveLeft()  { if (gamePhase === "playing") playerX = Math.max(20, playerX - 22) }
    function moveRight() { if (gamePhase === "playing") playerX = Math.min(W - 65, playerX + 22) }

    const onKey = e => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault()
      if (gamePhase === "idle" || gamePhase === "dead" || gamePhase === "win") { startGame(); return }
      if (e.key === "ArrowUp")    moveUp()
      if (e.key === "ArrowDown")  moveDown()
      if (e.key === "ArrowLeft")  moveLeft()
      if (e.key === "ArrowRight") moveRight()
    }

    let tx = 0, ty = 0
    const onTouchStart = e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY }
    const onTouchEnd   = e => {
      const dx = tx - e.changedTouches[0].clientX
      const dy = ty - e.changedTouches[0].clientY
      if (Math.abs(dy) < 12 && Math.abs(dx) < 12) { moveUp(); return }
      Math.abs(dy) > Math.abs(dx) ? (dy > 0 ? moveUp() : moveDown()) : (dx > 0 ? moveLeft() : moveRight())
    }

    canvas.addEventListener("touchstart", onTouchStart, { passive: true })
    canvas.addEventListener("touchend",   onTouchEnd,   { passive: true })
    document.addEventListener("keydown",  onKey)
    stateRef.current = { startGame, moveUp, moveDown }

    obstacles = []; frame = 0; scoreVal = 0; livesVal = 3
    initPlayer(); draw()

    return () => {
      cancelAnimationFrame(loopId)
      canvas.removeEventListener("touchstart", onTouchStart)
      canvas.removeEventListener("touchend",   onTouchEnd)
      document.removeEventListener("keydown",  onKey)
    }
  }, [])

  return (
    <div id="game" className="full-bleed" style={{ background: "var(--sage-pale)", padding: "5rem 0" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 2rem", textAlign: "center" }}>
        <span className="section-label">A little fun</span>
        <h2 className="section-title" style={{ textAlign: "center" }}>
          Get the <em>Nemeths</em> to the altar
        </h2>
        <p style={{ fontSize: "0.8rem", color: "var(--dusty)", marginTop: "-0.5rem" }}>
          Help Jacob & Kate hop through the chaos and make it down the aisle.
        </p>
        <div className="divider-ornament">— N —</div>

        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{
            border: "1px solid var(--linen-dark)", borderRadius: 8,
            display: "block", margin: "0 auto", maxWidth: "100%",
            cursor: "pointer", touchAction: "none",
          }}
        />

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          maxWidth: W, margin: "0.75rem auto 0",
          fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--dusty)",
        }}>
          <div>Score <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1rem", letterSpacing: 0, color: "var(--sage)" }}>{score}</span></div>
          <div style={{ display: "flex", gap: 5 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 11, height: 11,
                background: i < lives ? "var(--dusty)" : "var(--linen-dark)",
                clipPath: "polygon(50% 90%,5% 35%,20% 10%,50% 30%,80% 10%,95% 35%)",
              }}/>
            ))}
          </div>
          <div>Best <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "1rem", letterSpacing: 0, color: "var(--sage)" }}>{best}</span></div>
        </div>

        <p style={{
          fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic",
          fontSize: "1.05rem", color: "var(--warm)", minHeight: "1.4rem", marginTop: "0.6rem",
        }}>
          {status}
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1rem" }}>
          {[
            { label: "Start / Restart", action: () => stateRef.current?.startGame() },
            { label: "Up",              action: () => stateRef.current?.moveUp() },
            { label: "Down",            action: () => stateRef.current?.moveDown() },
          ].map(({ label, action }) => (
            <button key={label} onClick={action} style={{
              fontFamily: "'Jost',sans-serif", fontSize: "0.62rem",
              letterSpacing: "0.2em", textTransform: "uppercase",
              padding: "0.55rem 1.2rem", border: "0.5px solid var(--sage)",
              color: "var(--sage)", background: "transparent", borderRadius: 4, cursor: "pointer",
            }}>
              {label}
            </button>
          ))}
        </div>

        <p style={{ fontSize: "0.65rem", color: "var(--dusty)", marginTop: "0.75rem", letterSpacing: "0.08em", lineHeight: 1.6 }}>
          Arrow keys or WASD to move &nbsp;·&nbsp; Mobile: tap Up / Down or swipe
        </p>
      </div>
    </div>
  )
}
