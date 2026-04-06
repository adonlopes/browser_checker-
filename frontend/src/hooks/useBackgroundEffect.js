import { useEffect } from 'react'

/**
 * Draws a subtle text-pattern that becomes visible near the cursor.
 * Pattern: repeating "CROSS-BROWSER TESTING" text grid on a dark canvas.
 */
export function useBackgroundEffect() {
  useEffect(() => {
    const canvas = document.getElementById('bg-canvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let mouse = { x: -9999, y: -9999 }
    let animId

    const CELL = 52
    const TEXT = ['CHROME', 'FIREFOX', 'SAFARI', 'EDGE', 'BRAVE', 'TEST', 'QA', 'CSS', 'HTML', 'RENDER']
    const RADIUS = 160
    const BASE_ALPHA = 0.04
    const HOVER_ALPHA = 0.22

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const cols = Math.ceil(canvas.width / CELL) + 1
      const rows = Math.ceil(canvas.height / CELL) + 1

      // Detect current theme to pick text color
      const isLight = document.documentElement.classList.contains('light-theme')
      const [r, g, b] = isLight ? [0, 0, 0] : [255, 255, 255]

      ctx.font = '500 9px JetBrains Mono, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      for (let r2 = 0; r2 < rows; r2++) {
        for (let c = 0; c < cols; c++) {
          const x = c * CELL + CELL / 2
          const y = r2 * CELL + CELL / 2
          const dx = x - mouse.x
          const dy = y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const proximity = Math.max(0, 1 - dist / RADIUS)
          const alpha = BASE_ALPHA + proximity * (HOVER_ALPHA - BASE_ALPHA)
          const word = TEXT[(r2 * cols + c) % TEXT.length]
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
          ctx.fillText(word, x, y)
        }
      }

      animId = requestAnimationFrame(draw)
    }

    function onMouseMove(e) {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    function onMouseLeave() {
      mouse.x = -9999
      mouse.y = -9999
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])
}
