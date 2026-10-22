import { memo, useEffect, useState } from 'react'

const HEADLINE = {
  firstLine: '타고남을 넘어,',
  secondLine: '성종에 답을 찾다',
}

const TOTAL_LENGTH = HEADLINE.firstLine.length + HEADLINE.secondLine.length

function TypingHeadline() {
  const [typedLength, setTypedLength] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? TOTAL_LENGTH
      : 0,
  )

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    let currentLength = 0
    let timeoutId
    let cancelled = false

    const schedule = (callback, delay) => {
      timeoutId = window.setTimeout(() => {
        if (!cancelled) {
          callback()
        }
      }, delay)
    }

    const typeNextCharacter = () => {
      currentLength += 1
      setTypedLength(currentLength)

      if (currentLength < TOTAL_LENGTH) {
        const delay =
          currentLength === HEADLINE.firstLine.length ? 420 : 90
        schedule(typeNextCharacter, delay)
        return
      }

      schedule(() => {
        currentLength = 0
        setTypedLength(0)
        schedule(typeNextCharacter, 620)
      }, 5000)
    }

    schedule(typeNextCharacter, 620)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [])

  const firstLineLength = Math.min(
    typedLength,
    HEADLINE.firstLine.length,
  )
  const secondLineLength = Math.max(
    0,
    typedLength - HEADLINE.firstLine.length,
  )

  return (
    <h1
      className="typing-headline reveal reveal--two"
      aria-label={`${HEADLINE.firstLine} ${HEADLINE.secondLine}`}
    >
      <span
        className="typing-headline__line typing-headline__line--first"
        aria-hidden="true"
      >
        {HEADLINE.firstLine.slice(0, firstLineLength)}
      </span>
      <span
        className="typing-headline__line typing-headline__line--second"
        aria-hidden="true"
      >
        {HEADLINE.secondLine.slice(0, secondLineLength)}
      </span>
    </h1>
  )
}

export default memo(TypingHeadline)
