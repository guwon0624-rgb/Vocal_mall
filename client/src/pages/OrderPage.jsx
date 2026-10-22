import { useEffect, useState } from 'react'
import * as PortOne from '@portone/browser-sdk/v2'
import LogoMark from '../components/LogoMark'
import { getCart } from '../services/cartService'
import { createOrder } from '../services/orderService'

const formatPrice = (price) =>
  new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(price)

const EMPTY_FORM = {
  recipientName: '',
  email: '',
  phone: '',
  postalCode: '',
  address1: '',
  address2: '',
  request: '',
  method: '무통장입금',
}

const PORTONE_STORE_ID = 'store-adfacb62-f4c3-471e-8d70-fd28c5b37e3d'
const PORTONE_CHANNEL_KEY = 'channel-key-743bbc2d-b925-4834-bd68-26fca2f24b30'

const PAY_METHOD = {
  카드: 'CARD',
  무통장입금: 'VIRTUAL_ACCOUNT',
}

const readStoredUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem('user') || '{}')
  } catch {
    return {}
  }
}

function OrderPage({ onNavigate }) {
  const [status, setStatus] = useState(() =>
    sessionStorage.getItem('accessToken') ? 'loading' : 'guest',
  )
  const [cart, setCart] = useState(null)
  const [form, setForm] = useState(() => {
    const user = readStoredUser()

    return {
      ...EMPTY_FORM,
      recipientName: user.name || '',
      email: user.email || '',
    }
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken')

    if (!token) {
      return undefined
    }

    let ignore = false

    getCart(token)
      .then((nextCart) => {
        if (!ignore) {
          setCart(nextCart)
          setStatus('ready')
        }
      })
      .catch((error) => {
        if (!ignore) {
          setMessage(error.message)
          setStatus('error')
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  const items = cart?.items || []
  const itemsTotal = items.reduce(
    (total, item) => total + (item.product?.price || 0) * item.quantity,
    0,
  )

  const handleChange = ({ target }) => {
    setForm((current) => ({
      ...current,
      [target.name]: target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const token = sessionStorage.getItem('accessToken')

    if (!form.recipientName.trim() || !form.email.trim() || !form.phone.trim() || !form.postalCode.trim() || !form.address1.trim()) {
      setMessage('받는 사람, 이메일, 연락처, 우편번호, 주소를 입력해 주세요.')
      return
    }

    if (itemsTotal <= 0) {
      setMessage('결제 금액이 없습니다.')
      return
    }

    const shipping = {
      recipientName: form.recipientName.trim(),
      phone: form.phone.trim(),
      postalCode: form.postalCode.trim(),
      address1: form.address1.trim(),
      address2: form.address2.trim(),
      request: form.request.trim(),
    }
    const orderName =
      items.length > 1
        ? `${items[0].product?.title || '상품'} 외 ${items.length - 1}건`
        : items[0]?.product?.title || '주문 상품'

    setMessage('')
    setStatus('submitting')

    let response

    try {
      response = await PortOne.requestPayment({
        storeId: PORTONE_STORE_ID,
        channelKey: PORTONE_CHANNEL_KEY,
        paymentId: crypto.randomUUID().replaceAll('-', ''),
        orderName,
        totalAmount: Math.round(itemsTotal),
        currency: 'KRW',
        payMethod: PAY_METHOD[form.method] || 'CARD',
        customer: {
          fullName: shipping.recipientName,
          phoneNumber: shipping.phone,
          email: form.email.trim(),
        },
        redirectUrl: `${window.location.origin}/order`,
      })
    } catch (error) {
      setStatus('ready')
      setMessage(error.message || '결제창을 열지 못했습니다.')
      return
    }

    if (!response || response.code != null) {
      setStatus('ready')
      setMessage(response?.message || '결제가 취소되었습니다.')
      return
    }

    if (!response.paymentId) {
      setStatus('ready')
      setMessage('결제 번호를 확인하지 못했습니다.')
      return
    }

    try {
      const createdOrder = await createOrder(token, {
        shippingFee: 0,
        payment: {
          method: form.method,
          paymentId: response.paymentId,
        },
        shipping,
      })

      onNavigate('orderSuccess', createdOrder._id)
    } catch (error) {
      setStatus('ready')
      setMessage(
        error.message === 'Failed to fetch'
          ? '결제는 완료되었지만 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.'
          : `결제는 완료되었지만 주문을 저장하지 못했습니다. ${error.message}`,
      )
    }
  }

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
        <button type="button" onClick={() => onNavigate('cart')}>
          장바구니로 돌아가기 <span aria-hidden="true">↙</span>
        </button>
      </header>

      <main className="cart-page__main">
        <div className="cart-page__heading">
          <p>CHECKOUT</p>
          <h1>주문하기</h1>
        </div>

        {message ? <p className="cart-page__message">{message}</p> : null}

        {status === 'guest' ? (
          <section className="cart-page__empty">
            <h2>로그인 후 주문할 수 있습니다.</h2>
            <button type="button" onClick={() => onNavigate('login')}>
              로그인하기
            </button>
          </section>
        ) : status === 'loading' ? (
          <p className="cart-page__status">주문 정보를 불러오고 있습니다.</p>
        ) : status === 'error' ? (
          <p className="cart-page__status">{message}</p>
        ) : items.length ? (
          <form className="cart-layout" onSubmit={handleSubmit}>
            <section className="cart-list order-form">
              <fieldset className="order-fields">
                <legend>배송 정보</legend>
                <label className="field">
                  <span className="field__label">받는 사람</span>
                  <input
                    name="recipientName"
                    type="text"
                    value={form.recipientName}
                    onChange={handleChange}
                    maxLength={40}
                    required
                  />
                </label>
                <label className="field">
                  <span className="field__label">이메일</span>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    maxLength={80}
                    required
                  />
                </label>
                <label className="field">
                  <span className="field__label">연락처</span>
                  <input
                    name="phone"
                    type="text"
                    value={form.phone}
                    onChange={handleChange}
                    maxLength={20}
                    required
                  />
                </label>
                <label className="field">
                  <span className="field__label">우편번호</span>
                  <input
                    name="postalCode"
                    type="text"
                    value={form.postalCode}
                    onChange={handleChange}
                    maxLength={10}
                    required
                  />
                </label>
                <label className="field field--wide">
                  <span className="field__label">주소</span>
                  <input
                    name="address1"
                    type="text"
                    value={form.address1}
                    onChange={handleChange}
                    maxLength={120}
                    required
                  />
                </label>
                <label className="field field--wide">
                  <span className="field__label">상세 주소</span>
                  <input
                    name="address2"
                    type="text"
                    value={form.address2}
                    onChange={handleChange}
                    maxLength={120}
                  />
                </label>
                <label className="field field--wide">
                  <span className="field__label">배송 요청사항</span>
                  <textarea
                    name="request"
                    value={form.request}
                    onChange={handleChange}
                    maxLength={100}
                  />
                </label>
              </fieldset>

              <fieldset className="order-pay">
                <legend>결제 수단</legend>
                {['무통장입금', '카드'].map((method) => (
                  <label key={method}>
                    <input
                      type="radio"
                      name="method"
                      value={method}
                      checked={form.method === method}
                      onChange={handleChange}
                    />
                    <span>{method}</span>
                  </label>
                ))}
              </fieldset>
            </section>

            <aside className="cart-summary">
              <p>ORDER</p>
              <h2>결제 금액</h2>
              <ul className="order-summary__items">
                {items.map((item) => (
                  <li key={item.product?._id || item.addedAt}>
                    <span>
                      {item.product?.title || '삭제된 상품'} × {item.quantity}
                    </span>
                    <strong>
                      {formatPrice((item.product?.price || 0) * item.quantity)}
                    </strong>
                  </li>
                ))}
              </ul>
              <dl>
                <div>
                  <dt>상품 합계</dt>
                  <dd>{formatPrice(itemsTotal)}</dd>
                </div>
                <div>
                  <dt>배송비</dt>
                  <dd>{formatPrice(0)}</dd>
                </div>
                <div>
                  <dt>결제 금액</dt>
                  <dd>{formatPrice(itemsTotal)}</dd>
                </div>
              </dl>
              <button
                className="cart-checkout"
                type="submit"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? '결제 중...' : '결제하기'}
              </button>
            </aside>
          </form>
        ) : (
          <section className="cart-page__empty">
            <h2>주문할 상품이 없습니다.</h2>
            <button type="button" onClick={() => onNavigate('cart')}>
              장바구니로 돌아가기
            </button>
          </section>
        )}
      </main>
    </div>
  )
}

export default OrderPage
