const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const getAuthHeaders = (token, includeJson = false) => ({
  ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

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

export const getCart = async (token) => {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    headers: getAuthHeaders(token),
    credentials: 'include',
  })
  const data = await parseResponse(response, '장바구니를 가져오지 못했습니다.')

  return data.cart
}

export const addCartItem = async (token, productId, quantity) => {
  const response = await fetch(`${API_BASE_URL}/cart/items`, {
    method: 'POST',
    headers: getAuthHeaders(token, true),
    credentials: 'include',
    body: JSON.stringify({ productId, quantity }),
  })
  const data = await parseResponse(response, '장바구니에 담지 못했습니다.')

  return data.cart
}

export const updateCartItem = async (token, productId, quantity) => {
  const response = await fetch(`${API_BASE_URL}/cart/items/${productId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(token, true),
    credentials: 'include',
    body: JSON.stringify({ quantity }),
  })
  const data = await parseResponse(response, '수량을 변경하지 못했습니다.')

  return data.cart
}

export const removeCartItem = async (token, productId) => {
  const response = await fetch(`${API_BASE_URL}/cart/items/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
    credentials: 'include',
  })
  const data = await parseResponse(
    response,
    '장바구니에서 상품을 삭제하지 못했습니다.',
  )

  return data.cart
}
