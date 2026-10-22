import { memo } from 'react'
import HeroArtwork from './HeroArtwork'
import TypingHeadline from './TypingHeadline'

function HomeHero({ onNavigate, showAuthActions }) {
  return (
    <div className="hero">
      <div className="hero__copy">
        <p className="hero__eyebrow reveal reveal--one">
          J HANS VOCAL ACADEMY
        </p>
        <TypingHeadline />
        <p className="hero__description reveal reveal--three">
          성대의 길이와 두께, 무게는 모두 다릅니다. 타고난 성대 특질과
          성종을 정확히 이해하고, 내 목소리에 맞는 방법으로 훈련합니다.
        </p>
        {showAuthActions ? (
          <div className="hero__actions reveal reveal--four">
            <button
              className="primary-cta"
              type="button"
              onClick={() => onNavigate('signup')}
            >
              <span>회원가입</span>
              <span className="primary-cta__arrow" aria-hidden="true">
                →
              </span>
            </button>
            <button
              className="ghost-cta"
              type="button"
              onClick={() => onNavigate('login')}
            >
              로그인
            </button>
          </div>
        ) : null}
      </div>

      <HeroArtwork />
    </div>
  )
}

export default memo(HomeHero)
