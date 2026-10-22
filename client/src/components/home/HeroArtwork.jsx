import { memo } from 'react'
import LogoMark from '../LogoMark'

const SOUND_BAR_HEIGHTS = [38, 68, 46, 82, 56, 92, 62, 76, 42]

function HeroArtwork() {
  return (
    <div className="hero__art" aria-hidden="true">
      <div className="hero__orbit hero__orbit--outer" />
      <div className="hero__orbit hero__orbit--inner" />
      <div className="speaker-ripples">
        <span />
        <span />
      </div>
      <p className="hero__art-label">VOCAL TRAINING</p>
      <LogoMark className="hero__mark" />
      <div className="sound-bars">
        {SOUND_BAR_HEIGHTS.map((height, index) => (
          <span
            key={height}
            style={{
              '--bar-height': `${height}%`,
              '--bar-delay': `${index * 0.018}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default memo(HeroArtwork)
