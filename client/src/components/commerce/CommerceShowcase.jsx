import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { getCatalogItems } from '../../services/catalogService'
import AcademyStory from '../home/AcademyStory'

const formatPrice = (price) =>
  new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(price)

function CatalogCard({ item, index, onAdd, onOpen }) {
  const isCourse = item.kind === 'course'
  const metadata = isCourse
    ? [item.instructor, item.duration, item.level].filter(Boolean)
    : [item.brand, `재고 ${item.stock ?? 0}개`].filter(Boolean)

  return (
    <article
      className={`catalog-card catalog-card--${item.kind}`}
      data-scroll-reveal
      style={{ '--reveal-delay': `${index * 90}ms` }}
    >
      <button
        className="catalog-card__visual"
        type="button"
        onClick={() => onOpen(item)}
        aria-label={`${item.title} ${
          isCourse ? '강의' : '상품'
        } 상세 보기`}
      >
        <img src={item.imageUrl} alt="" loading="lazy" />
        <span className="catalog-card__category">{item.category}</span>
        {item.badge ? (
          <span className="catalog-card__badge">{item.badge}</span>
        ) : null}
      </button>
      <div className="catalog-card__body">
        <p className="catalog-card__meta">{metadata.join(' · ')}</p>
        <h3>
          <button type="button" onClick={() => onOpen(item)}>
            {item.title}
          </button>
        </h3>
        <p className="catalog-card__description">{item.description}</p>
        <div className="catalog-card__purchase">
          <strong>{formatPrice(item.price)}</strong>
          <button type="button" onClick={() => onAdd(item)}>
            {isCourse ? '수강 신청' : '장바구니'}
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </article>
  )
}

const visibleCountFor = (width) => {
  if (width < 640) {
    return 1
  }

  if (width < 980) {
    return 2
  }

  return 3
}

function CatalogCarousel({ items, emptyMessage, label, onAdd, onOpen }) {
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [visibleCount, setVisibleCount] = useState(3)
  const [offset, setOffset] = useState(0)
  const maxIndex = Math.max(items.length - visibleCount, 0)
  const safeIndex = Math.min(index, maxIndex)

  useEffect(() => {
    const viewport = viewportRef.current

    if (!viewport) {
      return undefined
    }

    const update = () => {
      setVisibleCount(visibleCountFor(viewport.clientWidth))
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(viewport)

    return () => observer.disconnect()
  }, [items.length])

  useEffect(() => {
    setIndex((current) => Math.min(current, maxIndex))
  }, [maxIndex])

  useLayoutEffect(() => {
    const track = trackRef.current
    const card = track?.children[0]

    if (!track || !card) {
      setOffset(0)
      return
    }

    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0
    const step = card.getBoundingClientRect().width + gap
    setOffset(safeIndex * step)
  }, [items.length, safeIndex, visibleCount])

  if (!items.length) {
    return <p className="catalog-empty">{emptyMessage}</p>
  }

  return (
    <div className="catalog-slider">
      <button
        className="catalog-slider__arrow catalog-slider__arrow--prev"
        type="button"
        aria-label={`이전 ${label}`}
        disabled={safeIndex === 0}
        onClick={() => setIndex((current) => Math.max(current - 1, 0))}
      >
        <span aria-hidden="true">←</span>
      </button>
      <div className="catalog-slider__viewport" ref={viewportRef}>
        <div
          className="catalog-slider__track"
          ref={trackRef}
          style={{
            '--visible': visibleCount,
            transform: `translate3d(-${offset}px, 0, 0)`,
          }}
        >
          {items.map((item, itemIndex) => (
            <CatalogCard
              item={item}
              index={itemIndex}
              key={item._id}
              onAdd={onAdd}
              onOpen={onOpen}
            />
          ))}
        </div>
      </div>
      <button
        className="catalog-slider__arrow catalog-slider__arrow--next"
        type="button"
        aria-label={`다음 ${label}`}
        disabled={safeIndex >= maxIndex}
        onClick={() =>
          setIndex((current) => Math.min(current + 1, maxIndex))
        }
      >
        <span aria-hidden="true">→</span>
      </button>
    </div>
  )
}

function CommerceShowcase({ onNavigate }) {
  const [catalog, setCatalog] = useState({
    status: 'loading',
    courses: [],
    products: [],
    message: '',
  })
  const [cart, setCart] = useState([])
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let ignore = false

    Promise.all([getCatalogItems('course'), getCatalogItems('product')])
      .then(([courses, products]) => {
        if (!ignore) {
          setCatalog({
            status: 'ready',
            courses,
            products,
            message: '',
          })
        }
      })
      .catch((error) => {
        if (!ignore) {
          setCatalog({
            status: 'error',
            courses: [],
            products: [],
            message: error.message,
          })
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    const elements = document.querySelectorAll('[data-scroll-reveal]')

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.12,
      },
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [catalog.courses.length, catalog.products.length])

  const handleAdd = (item) => {
    setCart((current) => [...current, item._id])
    setNotice(
      item.kind === 'course'
        ? `${item.title} 수강 상담을 선택했습니다.`
        : `${item.title}을 장바구니에 담았습니다.`,
    )
    window.setTimeout(() => setNotice(''), 2400)
  }

  const handleOpen = (item) => {
    onNavigate(item.kind, item._id)
  }

  const handlePointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * 100
    const y = ((event.clientY - bounds.top) / bounds.height) * 100

    event.currentTarget.style.setProperty('--pointer-x', `${x}%`)
    event.currentTarget.style.setProperty('--pointer-y', `${y}%`)
  }

  return (
    <div className="commerce-showcase" onPointerMove={handlePointerMove}>
      <section className="commerce-intro" aria-labelledby="commerce-title">
        <div className="commerce-intro__orb" aria-hidden="true" />
        <div data-scroll-reveal>
          <p className="commerce-eyebrow">01 / LEARN · RECORD · PERFORM</p>
          <h2 id="commerce-title">
            목소리를 배우고,
            <span>완성하는 모든 곳.</span>
          </h2>
          <p>
            내 성종에 맞는 강의부터 연습과 녹음에 필요한 장비까지 한 공간에서
            만나보세요.
          </p>
          <a href="#method">우리의 방식 <span aria-hidden="true">↓</span></a>
        </div>
      </section>

      <AcademyStory />

      <section
        className="commerce-section commerce-section--courses"
        id="courses"
        aria-labelledby="courses-title"
      >
        <div className="commerce-section__heading" data-scroll-reveal>
          <div>
            <p className="commerce-section__index">03 / CLASSES</p>
            <h2 id="courses-title">지금 필요한 목소리 수업</h2>
          </div>
          <p>
            타고난 성대 특질을 이해하고 단계별 훈련으로 소리의 가능성을
            확장합니다.
          </p>
        </div>
        {catalog.status === 'loading' ? (
          <p className="catalog-empty">강의를 준비하고 있습니다.</p>
        ) : catalog.status === 'error' ? (
          <p className="catalog-empty">{catalog.message}</p>
        ) : (
          <CatalogCarousel
            items={catalog.courses}
            emptyMessage="등록된 강의가 없습니다."
            label="강의"
            onAdd={handleAdd}
            onOpen={handleOpen}
          />
        )}
      </section>

      <section
        className="commerce-section commerce-section--products"
        id="equipment"
        aria-labelledby="products-title"
      >
        <div className="commerce-section__heading" data-scroll-reveal>
          <div>
            <p className="commerce-section__index">04 / EQUIPMENT</p>
            <h2 id="products-title">좋은 소리를 위한 장비</h2>
          </div>
          <div className="commerce-cart">
            <span>CART</span>
            <strong>{cart.length.toString().padStart(2, '0')}</strong>
          </div>
        </div>
        {catalog.status === 'loading' ? (
          <p className="catalog-empty">상품을 준비하고 있습니다.</p>
        ) : catalog.status === 'error' ? (
          <p className="catalog-empty">{catalog.message}</p>
        ) : (
          <CatalogCarousel
            items={catalog.products}
            emptyMessage="등록된 상품이 없습니다."
            label="장비"
            onAdd={handleAdd}
            onOpen={handleOpen}
          />
        )}
      </section>

      {notice ? <p className="commerce-notice">{notice}</p> : null}
    </div>
  )
}

export default CommerceShowcase
