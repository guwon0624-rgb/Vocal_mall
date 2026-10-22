import { useEffect, useState } from 'react'
import LogoMark from '../components/LogoMark'
import { getMyOrders } from '../services/orderService'

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

const ORDER_STATUSES = ['주문접수', '결제완료', '배송준비', '배송중', '배송완료', '취소']

function OrdersPage({ onNavigate }) {
  const [status, setStatus] = useState(() =>
    sessionStorage.getItem('accessToken') ? 'loading' : 'guest',
  )
  const [orders, setOrders] = useState([])
  const [selectedStatus, setSelectedStatus] = useState('전체')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken')

    if (!token) {
      return undefined
    }

    let ignore = false

    getMyOrders(token)
      .then((nextOrders) => {
        if (!ignore) {
          setOrders(nextOrders)
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

  const visibleOrders =
    selectedStatus === '전체'
      ? orders
      : orders.filter((order) => order.status === selectedStatus)

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
          <p>ORDERS</p>
          <h1>내 주문</h1>
        </div>

        {status === 'guest' ? (
          <section className="cart-page__empty">
            <h2>로그인 후 주문 목록을 확인할 수 있습니다.</h2>
            <button type="button" onClick={() => onNavigate('login')}>
              로그인하기
            </button>
          </section>
        ) : status === 'loading' ? (
          <p className="cart-page__status">주문 목록을 불러오고 있습니다.</p>
        ) : status === 'error' ? (
          <p className="cart-page__status">{message}</p>
        ) : (
          <>
            <div className="order-tabs" role="tablist" aria-label="주문 상태">
              {['전체', ...ORDER_STATUSES].map((orderStatus) => {
                const count =
                  orderStatus === '전체'
                    ? orders.length
                    : orders.filter((order) => order.status === orderStatus).length

                return (
                  <button
                    key={orderStatus}
                    type="button"
                    role="tab"
                    aria-selected={selectedStatus === orderStatus}
                    onClick={() => setSelectedStatus(orderStatus)}
                  >
                    {orderStatus}
                    <span>{count}</span>
                  </button>
                )
              })}
            </div>
            {visibleOrders.length ? (
              <ul className="order-list">
                {visibleOrders.map((order) => (
                  <li key={order._id}>
                    <article>
                      <header>
                        <div>
                          <p>{formatDate(order.createdAt)}</p>
                          <h2>{order.orderNumber}</h2>
                        </div>
                        <strong>{order.status}</strong>
                      </header>
                      <ul>
                        {order.items.map((item) => (
                          <li key={`${order._id}-${item.sku}-${item.product}`}>
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
                      <footer>
                        <span>
                          {order.payment?.method} · {order.payment?.status}
                        </span>
                        <strong>{formatPrice(order.amounts?.totalAmount)}</strong>
                      </footer>
                    </article>
                  </li>
                ))}
              </ul>
            ) : (
              <section className="cart-page__empty">
                <h2>
                  {selectedStatus === '전체'
                    ? '아직 주문한 상품이 없습니다.'
                    : `${selectedStatus} 상태의 주문이 없습니다.`}
                </h2>
                {selectedStatus === '전체' ? (
                  <button type="button" onClick={() => onNavigate('home')}>
                    쇼핑으로 돌아가기
                  </button>
                ) : null}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default OrdersPage
