import { useEffect, useState } from 'react'
import LogoMark from '../components/LogoMark'
import {
  getCart,
  removeCartItem,
  updateCartItem,
} from '../services/cartService'

const formatPrice = (price) =>
  new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(price)

const getProductId = (product) => product?._id || ''

function CartPage({ onNavigate }) {
  const [state, setState] = useState(() => ({
    status: sessionStorage.getItem('accessToken') ? 'loading' : 'guest',
    cart: null,
    message: '',
  }))

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken')

    if (!token) {
      return undefined
    }

    let ignore = false

    getCart(token)
      .then((cart) => {
        if (!ignore) {
          setState({ status: 'ready', cart, message: '' })
        }
      })
      .catch((error) => {
        if (!ignore) {
          setState({ status: 'error', cart: null, message: error.message })
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  const changeQuantity = async (product, quantity) => {
    const token = sessionStorage.getItem('accessToken')
    setState((current) => ({ ...current, message: '' }))

    try {
      const cart = await updateCartItem(token, getProductId(product), quantity)
      setState({ status: 'ready', cart, message: '' })
    } catch (error) {
      setState((current) => ({ ...current, message: error.message }))
    }
  }

  const removeItem = async (product) => {
    const token = sessionStorage.getItem('accessToken')
    setState((current) => ({ ...current, message: '' }))

    try {
      const cart = await removeCartItem(token, getProductId(product))
      setState({ status: 'ready', cart, message: '' })
    } catch (error) {
      setState((current) => ({ ...current, message: error.message }))
    }
  }

  const items = state.cart?.items || []
  const totalPrice = items.reduce((total, item) => {
    const price = item.product?.price || 0

    return total + price * item.quantity
  }, 0)

  return (
    <div className="cart-page">
      <header className="cart-page__nav">
        <button
          className="brand"
          type="button"
          onClick={() => onNavigate('home')}
          aria-label="메인 페이지로 이동"
        >
          <LogoMark className="brand__mark" />
        </button>
        <button type="button" onClick={() => onNavigate('home')}>
          쇼핑으로 돌아가기 <span aria-hidden="true">↙</span>
        </button>
      </header>

      <main className="cart-page__main">
        <div className="cart-page__heading">
          <p>YOUR CART</p>
          <h1>장바구니</h1>
        </div>

        {state.message ? <p className="cart-page__message">{state.message}</p> : null}

        {state.status === 'guest' ? (
          <section className="cart-page__empty">
            <h2>로그인 후 장바구니를 확인할 수 있습니다.</h2>
            <button type="button" onClick={() => onNavigate('login')}>
              로그인하기
            </button>
          </section>
        ) : state.status === 'loading' ? (
          <p className="cart-page__status">장바구니를 불러오고 있습니다.</p>
        ) : state.status === 'error' ? (
          <p className="cart-page__status">{state.message}</p>
        ) : items.length ? (
          <div className="cart-layout">
            <section className="cart-list">
              {items.map((item) => {
                const product = item.product
                const productId = getProductId(product)

                return (
                  <article className="cart-item" key={productId || item.addedAt}>
                    {product?.imageUrl ? (
                      <img src={product.imageUrl} alt="" />
                    ) : (
                      <div className="cart-item__placeholder" />
                    )}
                    <div>
                      <p>{product?.brand || product?.category || '상품'}</p>
                      <h2>{product?.title || '삭제된 상품'}</h2>
                      <strong>
                        {formatPrice((product?.price || 0) * item.quantity)}
                      </strong>
                    </div>
                    <div className="cart-item__actions">
                      <div className="cart-quantity">
                        <button
                          type="button"
                          onClick={() =>
                            changeQuantity(product, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1 || !productId}
                          aria-label="수량 줄이기"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            changeQuantity(product, item.quantity + 1)
                          }
                          disabled={
                            !productId || item.quantity >= (product?.stock || 0)
                          }
                          aria-label="수량 늘리기"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(product)}
                        disabled={!productId}
                      >
                        삭제
                      </button>
                    </div>
                  </article>
                )
              })}
            </section>
            <aside className="cart-summary">
              <p>ORDER</p>
              <h2>주문 요약</h2>
              <dl>
                <div>
                  <dt>상품 수량</dt>
                  <dd>{state.cart.totalQuantity || 0}개</dd>
                </div>
                <div>
                  <dt>합계</dt>
                  <dd>{formatPrice(totalPrice)}</dd>
                </div>
              </dl>
              <button
                className="cart-checkout"
                type="button"
                onClick={() => onNavigate('order')}
              >
                결제하기
              </button>
            </aside>
          </div>
        ) : (
          <section className="cart-page__empty">
            <h2>장바구니가 비어 있습니다.</h2>
            <button type="button" onClick={() => onNavigate('home')}>
              상품 둘러보기
            </button>
          </section>
        )}
      </main>
    </div>
  )
}

export default CartPage
