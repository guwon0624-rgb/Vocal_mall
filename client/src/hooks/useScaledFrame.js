import { useEffect, useRef } from 'react'

function useScaledFrame(width, height) {
  const frameRef = useRef(null)

  useEffect(() => {
    const frame = frameRef.current

    if (!frame) {
      return undefined
    }

    let animationFrameId = 0
    let lastScale = -1

    const updateScale = () => {
      animationFrameId = 0

      const stage = frame.parentElement
      const availableWidth = stage?.clientWidth || window.innerWidth

      if (!availableWidth) {
        return
      }

      const scale = availableWidth / width

      if (scale === lastScale) {
        return
      }

      lastScale = scale
      frame.style.transform = `translate(-50%, 0) scale(${scale})`

      if (stage) {
        stage.style.height = `${height * scale}px`
      }
    }

    const scheduleUpdate = () => {
      if (!animationFrameId) {
        animationFrameId = window.requestAnimationFrame(updateScale)
      }
    }

    scheduleUpdate()
    window.addEventListener('resize', scheduleUpdate, { passive: true })
    window.visualViewport?.addEventListener('resize', scheduleUpdate, {
      passive: true,
    })

    return () => {
      window.removeEventListener('resize', scheduleUpdate)
      window.visualViewport?.removeEventListener('resize', scheduleUpdate)

      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId)
      }
    }
  }, [height, width])

  return frameRef
}

export default useScaledFrame
