import { useEffect, useState } from 'react'
import LogoMark from '../components/LogoMark'
import { getOrder } from '../services/orderService'

const formatPrice = (price) =>
  new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(price || 0)

const formatDate = (value) => {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function OrderSuccessPage({ orderId, onNavigate }) {
  const [status, setStatus] = useState(() =>
    sessionStorage.getItem('accessToken') ? 'loading' : 'guest',
  )
  const [order, setOrder] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken')

    if (!token || !orderId) {
      return undefined
    }

    let ignore = false

    getOrder(token, orderId)
      .then((nextOrder) => {
        if (!ignore) {
          setOrder(nextOrder)
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
  }, [orderId])

  const shipping = order?.shipping || {}
  const amounts = order?.amounts || {}
  const address = [shipping.address1, shipping.address2].filter(Boolean).join(' ')

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
          <p>THANK YOU</p>
          <h1>주문이 완료되었습니다.</h1>
          {status === 'ready' ? (
            <p className="order-success__thanks">
              보컬몰을 이용해 주셔서 감사합니다. 주문하신 상품은 아래 정보대로
              정성껏 준비해 보내드리겠습니다.
            </p>
          ) : null}
        </div>

        {status === 'guest' ? (
          <section className="cart-page__empty">
            <h2>로그인 후 주문 정보를 확인할 수 있습니다.</h2>
            <button type="button" onClick={() => onNavigate('login')}>
              로그인하기
            </button>
          </section>
        ) : status === 'loading' ? (
          <p className="cart-page__status">주문 정보를 불러오고 있습니다.</p>
        ) : status === 'error' ? (
          <p className="cart-page__status">{message}</p>
        ) : (
          <section className="order-receipt" aria-label="주문 정보">
            <header className="order-receipt__intro">
              <div>
                <p>ORDER</p>
                <h2>주문 정보</h2>
              </div>
              <strong>{order.orderNumber}</strong>
            </header>

            <dl className="order-receipt__facts">
              <div>
                <dt>주문일시</dt>
                <dd>{formatDate(order.createdAt)}</dd>
              </div>
              <div>
                <dt>주문 상태</dt>
                <dd>{order.status}</dd>
              </div>
              <div>
                <dt>주문자</dt>
                <dd>
                  {order.buyerName}
                  <span>{order.buyerEmail}</span>
                </dd>
              </div>
              <div>
                <dt>결제</dt>
                <dd>
                  {order.payment?.method} · {order.payment?.status}
                  {order.payment?.paidAt ? (
                    <span>{formatDate(order.payment.paidAt)}</span>
                  ) : null}
                </dd>
              </div>
            </dl>

            <div className="order-receipt__shipping">
              <h3>배송 정보</h3>
              <p>
                {shipping.recipientName}
                <span>{shipping.phone}</span>
              </p>
              <p>
                {shipping.postalCode ? `(${shipping.postalCode}) ` : ''}
                {address}
              </p>
              {shipping.request ? <p>요청사항 · {shipping.request}</p> : null}
            </div>

            <ul className="order-receipt__items">
              {order.items.map((item) => (
                <li key={`${item.sku}-${item.product}`}>
                  <img src={item.imageUrl} alt="" />
                  <div>
                    <p>{item.sku}</p>
                    <h3>{item.title}</h3>
                    <span>
                      {formatPrice(item.price)} × {item.quantity}
                    </span>
                  </div>
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                </li>
              ))}
            </ul>

            <dl className="order-receipt__amounts">
              <div>
                <dt>상품 합계</dt>
                <dd>{formatPrice(amounts.itemsTotal)}</dd>
              </div>
              <div>
                <dt>배송비</dt>
                <dd>{formatPrice(amounts.shippingFee)}</dd>
              </div>
              <div>
                <dt>결제 금액</dt>
                <dd>{formatPrice(amounts.totalAmount)}</dd>
              </div>
            </dl>
            <div className="order-receipt__actions">
              <button type="button" onClick={() => onNavigate('orders')}>
                주문 목록 보기
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default OrderSuccessPage
