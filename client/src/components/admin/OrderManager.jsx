import { useEffect, useMemo, useState } from 'react'
import {
  getManagedOrders,
  updateManagedOrder,
} from '../../services/adminService'
import AdminPagination from './AdminPagination'

const ORDER_STATUSES = ['주문접수', '결제완료', '배송준비', '배송중', '배송완료', '취소']
const LOCKED_CANCEL_STATUSES = new Set(['배송중', '배송완료', '취소'])

const formatPrice = (price) =>
  `${new Intl.NumberFormat('ko-KR').format(price || 0)}원`

const formatDate = (value) => {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const formatAddress = (shipping = {}) =>
  [
    shipping.postalCode ? `(${shipping.postalCode})` : '',
    shipping.address1,
    shipping.address2,
  ]
    .filter(Boolean)
    .join(' ')

const statusOptionsFor = (currentStatus) => {
  if (currentStatus === '취소') {
    return ['취소']
  }

  if (LOCKED_CANCEL_STATUSES.has(currentStatus)) {
    return ORDER_STATUSES.filter((orderStatus) => orderStatus !== '취소')
  }

  return ORDER_STATUSES
}

function OrderManager() {
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [selectedId, setSelectedId] = useState('')
  const [updatingId, setUpdatingId] = useState('')

  const filteredOrders = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('ko')

    return orders.filter((order) => {
      const shipping = order.shipping || {}
      const buyerName = order.buyerName || order.user?.name || ''
      const haystack = [
        order.orderNumber,
        buyerName,
        order.buyerEmail,
        shipping.recipientName,
        shipping.address1,
        shipping.address2,
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('ko')
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery)
      const matchesStatus = !statusFilter || order.status === statusFilter

      return matchesQuery && matchesStatus
    })
  }, [orders, searchQuery, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedOrders = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize

    return filteredOrders.slice(startIndex, startIndex + pageSize)
  }, [filteredOrders, pageSize, safePage])
  const selectedOrder =
    orders.find((order) => order._id === selectedId) || null

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken')
    let ignore = false

    getManagedOrders(token)
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

  const handleStatusChange = async (order, nextStatus) => {
    if (!nextStatus || nextStatus === order.status || updatingId) {
      return
    }

    if (
      nextStatus === '취소' &&
      !window.confirm(
        `${order.orderNumber} 주문을 취소할까요? 결제 완료 건은 환불로 바뀌고 재고가 복구됩니다.`,
      )
    ) {
      return
    }

    const token = sessionStorage.getItem('accessToken')
    setUpdatingId(order._id)
    setMessage('')

    try {
      const updated = await updateManagedOrder(token, order._id, {
        status: nextStatus,
      })
      setOrders((current) =>
        current.map((item) =>
          item._id === order._id
            ? { ...item, ...updated, user: item.user }
            : item,
        ),
      )
      setMessage('주문 상태를 변경했습니다.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <section className="admin-workspace">
      <header className="admin-workspace__header">
        <div>
          <p>ORDER MANAGEMENT</p>
          <h1>주문 관리</h1>
          <span>주문자와 배송지를 확인하고 주문 상태를 변경합니다.</span>
        </div>
        <strong>{orders.length} ORDERS</strong>
      </header>

      {message ? <p className="admin-message">{message}</p> : null}

      <div className="admin-catalog-toolbar">
        <label className="admin-catalog-search">
          <span>주문 검색</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value)
              setCurrentPage(1)
            }}
            placeholder="주문번호, 주문자, 배송지"
          />
        </label>
        <label className="admin-catalog-category">
          <span>주문 상태</span>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">전체 상태</option>
            {ORDER_STATUSES.map((orderStatus) => (
              <option value={orderStatus} key={orderStatus}>
                {orderStatus}
              </option>
            ))}
          </select>
        </label>
        <p>
          <strong>{filteredOrders.length}</strong>
          <span>/ {orders.length} ORDERS</span>
        </p>
      </div>

      <div className="admin-catalog-layout">
        <div className="admin-catalog-list">
          {status === 'loading' ? (
            <p className="admin-empty">목록을 불러오고 있습니다.</p>
          ) : filteredOrders.length ? (
            paginatedOrders.map((order) => {
              const shipping = order.shipping || {}
              const firstItem = order.items?.[0]
              const extraCount = Math.max((order.items?.length || 0) - 1, 0)
              const address = formatAddress(shipping)

              return (
                <article
                  className={`admin-order-row${
                    selectedId === order._id ? ' is-selected' : ''
                  }`}
                  key={order._id}
                >
                  {firstItem?.imageUrl ? (
                    <img src={firstItem.imageUrl} alt="" />
                  ) : (
                    <span className="admin-order-thumb" aria-hidden="true" />
                  )}
                  <div>
                    <div className="admin-order-row__head">
                      <div>
                        <h2>{order.orderNumber}</h2>
                        <p>{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="admin-order-row__controls">
                        <select
                          aria-label={`${order.orderNumber} 주문 상태`}
                          value={order.status}
                          disabled={
                            order.status === '취소' || updatingId === order._id
                          }
                          onChange={(event) =>
                            handleStatusChange(order, event.target.value)
                          }
                        >
                          {statusOptionsFor(order.status).map((orderStatus) => (
                            <option value={orderStatus} key={orderStatus}>
                              {orderStatus}
                            </option>
                          ))}
                        </select>
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            onClick={() => setSelectedId(order._id)}
                          >
                            상세보기
                          </button>
                        </div>
                      </div>
                    </div>
                    <dl className="admin-order-facts">
                      <div>
                        <dt>주문자</dt>
                        <dd>
                          {order.buyerName}
                          {order.buyerEmail ? (
                            <small>{order.buyerEmail}</small>
                          ) : null}
                        </dd>
                      </div>
                      <div>
                        <dt>배송주소</dt>
                        <dd>
                          {shipping.recipientName || '받는 사람 없음'}
                          {shipping.phone ? ` · ${shipping.phone}` : ''}
                          {address ? <small>{address}</small> : null}
                        </dd>
                      </div>
                    </dl>
                    <div className="admin-order-row__summary">
                      <span>
                        {firstItem?.title || '상품 정보 없음'}
                        {extraCount ? ` 외 ${extraCount}건` : ''}
                        {' · '}
                        {order.payment?.method} · {order.payment?.status}
                      </span>
                      <strong>{formatPrice(order.amounts?.totalAmount)}</strong>
                    </div>
                  </div>
                </article>
              )
            })
          ) : (
            <p className="admin-empty">
              {orders.length
                ? '검색 조건에 맞는 주문이 없습니다.'
                : '등록된 주문이 없습니다.'}
            </p>
          )}
          <AdminPagination
            currentPage={safePage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setCurrentPage(1)
            }}
            pageSize={pageSize}
            totalItems={filteredOrders.length}
          />
        </div>

        <aside className="admin-editor admin-order-detail">
          {selectedOrder ? (
            <OrderDetail
              order={selectedOrder}
              updating={updatingId === selectedOrder._id}
              onClose={() => setSelectedId('')}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <div className="admin-editor__placeholder">
              <span>◎</span>
              <h2>주문 상세</h2>
              <p>상세보기를 누르면 상품, 결제, 배송 요청까지 확인할 수 있습니다.</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}

function OrderDetail({ order, updating, onClose, onStatusChange }) {
  const shipping = order.shipping || {}
  const amounts = order.amounts || {}
  const address = formatAddress(shipping)

  return (
    <>
      <div className="admin-editor__heading">
        <div>
          <p>ORDER DETAIL</p>
          <h2>{order.orderNumber}</h2>
        </div>
        <button type="button" onClick={onClose}>
          닫기
        </button>
      </div>
      <label className="admin-order-detail__status">
        주문 상태
        <select
          value={order.status}
          disabled={order.status === '취소' || updating}
          onChange={(event) => onStatusChange(order, event.target.value)}
        >
          {statusOptionsFor(order.status).map((orderStatus) => (
            <option value={orderStatus} key={orderStatus}>
              {orderStatus}
            </option>
          ))}
        </select>
      </label>
      <dl>
        <div>
          <dt>주문일시</dt>
          <dd>{formatDate(order.createdAt)}</dd>
        </div>
        <div>
          <dt>주문자</dt>
          <dd>
            {order.buyerName}
            {order.buyerEmail ? <small>{order.buyerEmail}</small> : null}
          </dd>
        </div>
        <div>
          <dt>배송주소</dt>
          <dd>
            {shipping.recipientName}
            {shipping.phone ? ` · ${shipping.phone}` : ''}
            {address ? <small>{address}</small> : null}
            {shipping.request ? <small>요청사항 · {shipping.request}</small> : null}
          </dd>
        </div>
        <div>
          <dt>결제</dt>
          <dd>
            {order.payment?.method} · {order.payment?.status}
            {order.payment?.paidAt ? (
              <small>{formatDate(order.payment.paidAt)}</small>
            ) : null}
            {order.payment?.paymentId ? (
              <small>{order.payment.paymentId}</small>
            ) : null}
          </dd>
        </div>
        {order.cancelledAt ? (
          <div>
            <dt>취소일시</dt>
            <dd>{formatDate(order.cancelledAt)}</dd>
          </div>
        ) : null}
      </dl>
      <ul className="admin-order-detail__items">
        {order.items?.map((item) => (
          <li key={`${item.sku}-${item.product}`}>
            {item.imageUrl ? (
              <img src={item.imageUrl} alt="" />
            ) : (
              <span aria-hidden="true" />
            )}
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
      <dl className="admin-order-detail__amounts">
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
    </>
  )
}

export default OrderManager
