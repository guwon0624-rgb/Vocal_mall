import { useEffect, useRef, useState } from 'react'
import LogoMark from './LogoMark'

function Header({
  onNavigate,
  userName,
  cartCount = 0,
  showAuthActions = true,
  showAdminLink = false,
  onLogout,
  variant = 'dark',
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const accountRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) {
      return undefined
    }

    const closeMenu = (event) => {
      if (!accountRef.current?.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeMenu)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('pointerdown', closeMenu)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  const openHomeSection = (sectionId) => {
    const section = document.getElementById(sectionId)

    if (section) {
      window.history.replaceState({}, '', `/#${sectionId}`)
      section.scrollIntoView({ behavior: 'smooth' })
      return
    }

    onNavigate('home', sectionId)
  }

  return (
    <header
      className={`site-header${variant === 'light' ? ' site-header--light' : ''}`}
    >
      <button
        className="brand"
        type="button"
        onClick={() => onNavigate('home')}
        aria-label="메인 페이지로 이동"
      >
        <LogoMark className="brand__mark" />
      </button>

      <nav className="header-links" aria-label="주요 메뉴">
        <button type="button" onClick={() => openHomeSection('academy')}>
          학원소개
        </button>
        <button type="button" onClick={() => openHomeSection('courses')}>
          레슨
        </button>
        <button type="button" onClick={() => openHomeSection('equipment')}>
          장비
        </button>
        <button type="button" onClick={() => onNavigate('orders')}>
          주문내역
        </button>
      </nav>
      <nav className="header-nav" aria-label="계정 메뉴">
        {showAdminLink ? (
          <button
            className="header-admin"
            type="button"
            onClick={() => onNavigate('admin')}
          >
            어드민 페이지
          </button>
        ) : null}
        {userName ? (
          <div className="header-account" ref={accountRef}>
            <button
              className="header-greeting"
              type="button"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {userName}님 반갑습니다
              <span className="header-greeting__caret" aria-hidden="true" />
            </button>
            {menuOpen ? (
              <div className="header-menu" role="menu">
                <button
                  className="header-menu__item"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false)
                    onLogout?.()
                  }}
                >
                  로그아웃
                </button>
              </div>
            ) : null}
          </div>
        ) : showAuthActions ? (
          <>
            <button
              className="header-login"
              type="button"
              onClick={() => onNavigate('login')}
            >
              로그인
            </button>
            <button
              className="header-join"
              type="button"
              onClick={() => onNavigate('signup')}
            >
              회원가입
              <span aria-hidden="true">↗</span>
            </button>
          </>
        ) : null}
        <button
          className="header-cart"
          type="button"
          onClick={() => onNavigate('cart')}
          aria-label={`장바구니, ${cartCount}개 상품`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6.2 7.5h11.6l-.9 10.2a1.4 1.4 0 0 1-1.4 1.3H8.5a1.4 1.4 0 0 1-1.4-1.3L6.2 7.5Z" />
            <path d="M9 7.4V6.2A3 3 0 0 1 12 3.2v0a3 3 0 0 1 3 3v1.2" />
          </svg>
          <span className="header-cart__count">{cartCount}</span>
        </button>
      </nav>
    </header>
  )
}

export default Header
