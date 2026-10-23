import { useEffect, useState } from 'react'
import Header from '../components/Header'
import useHomeSession from '../hooks/useHomeSession'
import { addCartItem, getCart } from '../services/cartService'
import { getCatalogItem } from '../services/catalogService'

const formatPrice = (price) =>
  new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(price)

function ProductDetailPage({ productId, expectedKind, onNavigate }) {
  const { session, logout } = useHomeSession()
  const [state, setState] = useState({
    status: 'loading',
    product: null,
    message: '',
  })
  const [quantity, setQuantity] = useState(1)
  const [cartCount, setCartCount] = useState(0)
  const [adding, setAdding] = useState(false)
  const [notice, setNotice] = useState('')
  const isMember = session.status === 'member'
  const isGuest = session.status === 'guest'

  useEffect(() => {
    let ignore = false

    getCatalogItem(productId)
      .then((product) => {
        if (!ignore) {
          setState(
            product.kind === expectedKind
              ? { status: 'ready', product, message: '' }
              : {
                  status: 'error',
                  product: null,
                  message: `${
                    expectedKind === 'course' ? '강의' : '상품'
                  } 정보를 찾을 수 없습니다.`,
                },
          )
        }
      })
      .catch((error) => {
        if (!ignore) {
          setState({
            status: 'error',
            product: null,
            message: error.message,
          })
        }
      })

    return () => {
      ignore = true
    }
  }, [expectedKind, productId])

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

  const handleAdd = async () => {
    if (expectedKind === 'course') {
      setNotice('수강 신청 상담을 선택했습니다.')
      window.setTimeout(() => setNotice(''), 2400)
      return
    }

    const token = sessionStorage.getItem('accessToken')

    if (!token) {
      setNotice('로그인 후 장바구니에 담을 수 있습니다.')
      window.setTimeout(() => setNotice(''), 2400)
      return
    }

    setAdding(true)

    try {
      const cart = await addCartItem(token, state.product._id, quantity)
      setCartCount(cart.totalQuantity || 0)
      setNotice(`${quantity}개를 장바구니에 담았습니다.`)
    } catch (error) {
      setNotice(error.message)
    } finally {
      setAdding(false)
      window.setTimeout(() => setNotice(''), 2400)
    }
  }

  return (
    <div className="product-detail-page">
      <Header
        variant="light"
        onNavigate={onNavigate}
        userName={isMember ? session.name : ''}
        cartCount={isMember ? cartCount : 0}
        showAuthActions={isGuest}
        showAdminLink={isMember && session.role === '어드민'}
        onLogout={logout}
      />

      {state.status === 'loading' ? (
        <main className="product-detail-state">
          <p>
            {expectedKind === 'course' ? '강의' : '상품'} 정보를 불러오고
            있습니다.
          </p>
        </main>
      ) : state.status === 'error' ? (
        <main className="product-detail-state">
          <p className="section-kicker">
            {expectedKind === 'course' ? 'CLASS' : 'PRODUCT'}
          </p>
          <h1>{state.message}</h1>
          <button type="button" onClick={() => onNavigate('home')}>
            메인으로 돌아가기
          </button>
        </main>
      ) : (
        <>
          <main className="product-detail">
            <div className="product-detail__visual">
              <p>
                {expectedKind === 'course'
                  ? 'VOCAL CLASS'
                  : 'VOCAL EQUIPMENT'}
              </p>
              <img
                src={state.product.imageUrl}
                alt={state.product.title}
              />
              {state.product.badge ? (
                <span>{state.product.badge}</span>
              ) : null}
            </div>

            <section className="product-detail__copy">
              <div className="product-detail__identity">
                <p>
                  {state.product.category} ·{' '}
                  {expectedKind === 'course'
                    ? state.product.level || 'ALL LEVEL'
                    : state.product.sku}
                </p>
                <span>
                  {expectedKind === 'course'
                    ? state.product.instructor || 'VOCAL COACH'
                    : state.product.brand || 'VOCAL MALL SELECT'}
                </span>
              </div>
              <h1>{state.product.title}</h1>
              <strong className="product-detail__price">
                {formatPrice(state.product.price)}
              </strong>
              <p className="product-detail__description">
                {state.product.description ||
                  (expectedKind === 'course'
                    ? '내 목소리를 정확히 이해하고 발전시키는 보컬 클래스입니다.'
                    : '좋은 소리를 위한 기준으로 엄선한 보컬 장비입니다.')}
              </p>

              <dl className="product-detail__specs">
                <div>
                  <dt>{expectedKind === 'course' ? 'COACH' : 'SKU'}</dt>
                  <dd>
                    {expectedKind === 'course'
                      ? state.product.instructor || '전문 보컬 코치'
                      : state.product.sku}
                  </dd>
                </div>
                <div>
                  <dt>
                    {expectedKind === 'course' ? 'DURATION' : 'CATEGORY'}
                  </dt>
                  <dd>
                    {expectedKind === 'course'
                      ? state.product.duration || '별도 안내'
                      : state.product.category}
                  </dd>
                </div>
                <div>
                  <dt>{expectedKind === 'course' ? 'LEVEL' : 'STOCK'}</dt>
                  <dd>
                    {expectedKind === 'course'
                      ? state.product.level || '전체'
                      : state.product.stock > 0
                        ? `${state.product.stock}개`
                        : '품절'}
                  </dd>
                </div>
              </dl>

              {expectedKind === 'product' && state.product.specs?.length ? (
                <section className="product-detail__details">
                  <div className="product-detail__details-heading">
                    <p>PRODUCT SPECIFICATIONS</p>
                    <h2>상세 사양</h2>
                  </div>
                  <dl className="product-detail__specs product-detail__specs--extended">
                    {state.product.specs.map((spec) => (
                      <div key={`${spec.label}-${spec.value}`}>
                        <dt>{spec.label}</dt>
                        <dd>{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                  {state.product.sourceUrl ? (
                    <a
                      className="product-detail__source"
                      href={state.product.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      제조사 상품 정보 확인
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                </section>
              ) : null}

              <div
                className={`product-detail__purchase ${
                  expectedKind === 'course'
                    ? 'product-detail__purchase--course'
                    : ''
                }`}
              >
                {expectedKind === 'product' ? (
                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((current) => Math.max(1, current - 1))
                      }
                      aria-label="수량 줄이기"
                    >
                      −
                    </button>
                    <strong>{quantity}</strong>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((current) =>
                          Math.min(
                            state.product.stock || 1,
                            current + 1,
                          ),
                        )
                      }
                      aria-label="수량 늘리기"
                    >
                      +
                    </button>
                  </div>
                ) : null}
                <button
                  className="product-detail__cart"
                  type="button"
                  onClick={handleAdd}
                  disabled={
                    adding ||
                    (expectedKind === 'product' && state.product.stock < 1)
                  }
                >
                  {adding
                    ? '담는 중...'
                    : expectedKind === 'course'
                      ? '수강 신청하기'
                      : state.product.stock > 0
                        ? '장바구니에 담기'
                        : '현재 품절'}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </section>
          </main>

          <section className="product-detail-info">
            <p>
              {expectedKind === 'course'
                ? 'TRAIN YOUR TRUE VOICE'
                : 'RECORD YOUR TRUE VOICE'}
            </p>
            <h2>
              {expectedKind === 'course' ? (
                <>
                  내 목소리를 아는 순간,
                  <br />
                  훈련의 방향이 달라집니다.
                </>
              ) : (
                <>
                  연습실의 작은 차이가
                  <br />
                  목소리의 완성도를 바꿉니다.
                </>
              )}
            </h2>
            <div>
              <article>
                <span>01</span>
                <h3>
                  {expectedKind === 'course' ? '성종 분석' : '엄선된 장비'}
                </h3>
                <p>
                  {expectedKind === 'course'
                    ? '타고난 성대 특질과 현재 발성 습관을 세밀하게 분석합니다.'
                    : '보컬 연습과 레코딩에 실제로 필요한 장비를 선별합니다.'}
                </p>
              </article>
              <article>
                <span>02</span>
                <h3>
                  {expectedKind === 'course' ? '맞춤 훈련' : '안전한 포장'}
                </h3>
                <p>
                  {expectedKind === 'course'
                    ? '성종과 목표에 맞는 단계별 훈련으로 소리의 기반을 만듭니다.'
                    : '민감한 오디오 장비가 손상되지 않도록 안전하게 포장합니다.'}
                </p>
              </article>
              <article>
                <span>03</span>
                <h3>
                  {expectedKind === 'course' ? '표현 확장' : '구매 상담'}
                </h3>
                <p>
                  {expectedKind === 'course'
                    ? '안정된 발성을 바탕으로 곡 해석과 표현의 범위를 넓힙니다.'
                    : '사용 환경과 목적에 맞는 장비 선택을 안내해드립니다.'}
                </p>
              </article>
            </div>
          </section>
        </>
      )}

      {notice ? <p className="commerce-notice">{notice}</p> : null}
    </div>
  )
}

export default ProductDetailPage
