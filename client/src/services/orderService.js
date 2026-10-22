const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const parseResponse = async (response, fallbackMessage) => {
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const validationMessage = data.errors
      ?.map((error) => error.message)
      .join(' ')

    throw new Error(validationMessage || data.message || fallbackMessage)
  }

  return data
}

export const createOrder = async (token, order) => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(order),
  })
  const data = await parseResponse(response, '주문을 생성하지 못했습니다.')

  return data.order
}

export const getMyOrders = async (token) => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
  })
  const data = await parseResponse(response, '주문 목록을 가져오지 못했습니다.')

  return data.orders
}

export const getOrder = async (token, orderId) => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
  })
  const data = await parseResponse(response, '주문 정보를 가져오지 못했습니다.')

  return data.order
}
