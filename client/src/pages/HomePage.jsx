import { useEffect, useState } from 'react'
import Header from '../components/Header'
import CommerceShowcase from '../components/commerce/CommerceShowcase'
import HomeHero from '../components/home/HomeHero'
import useHomeSession from '../hooks/useHomeSession'
import useScaledFrame from '../hooks/useScaledFrame'
import { getCart } from '../services/cartService'

function HomePage({ onNavigate }) {
  const frameRef = useScaledFrame(1440, 900)
  const { session, logout } = useHomeSession()
  const [cartCount, setCartCount] = useState(0)
  const isMember = session.status === 'member'
  const isGuest = session.status === 'guest'

  useEffect(() => {
    const sectionId = window.location.hash.replace('#', '')

    if (!sectionId) {
      return undefined
    }

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!isMember) {
      return undefined
    }

    const token = sessionStorage.getItem('accessToken')
    let ignore = false

    getCart(token)
      .then((cart) => {
        if (!ignore) {
          setCartCount(cart.totalQuantity || 0)
        }
      })
      .catch(() => {
        if (!ignore) {
          setCartCount(0)
        }
      })

    return () => {
      ignore = true
    }
  }, [isMember])

  return (
    <main className="home">
      <section className="home-stage" id="academy" aria-label="보컬학원 소개">
        <div className="home-page" ref={frameRef}>
          <div className="home-page__grain" aria-hidden="true" />
          <Header
            onNavigate={onNavigate}
            userName={isMember ? session.name : ''}
            cartCount={isMember ? cartCount : 0}
            showAuthActions={isGuest}
            showAdminLink={isMember && session.role === '어드민'}
            onLogout={logout}
          />
          <HomeHero onNavigate={onNavigate} showAuthActions={isGuest} />
        </div>
      </section>
      <CommerceShowcase onNavigate={onNavigate} />
    </main>
  )
}

export default HomePage
