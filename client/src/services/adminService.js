const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const request = async (path, token, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    credentials: 'include',
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const validationMessage = data.errors
      ?.map((error) => error.message)
      .join(' ')

    throw new Error(
      validationMessage || data.message || '요청을 처리하지 못했습니다.',
    )
  }

  return data
}

export const getManagedUsers = async (token, role) => {
  const data = await request(
    `/users?role=${encodeURIComponent(role)}`,
    token,
  )

  return data.users
}

export const updateManagedUser = async (token, id, updates) => {
  const data = await request(`/users/${id}`, token, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })

  return data.user
}

export const deleteManagedUser = async (token, id) => {
  await request(`/users/${id}`, token, {
    method: 'DELETE',
  })
}

export const getManagedOrders = async (token) => {
  const data = await request('/orders/manage', token)

  return data.orders
}

export const updateManagedOrder = async (token, id, updates) => {
  const data = await request(`/orders/${id}`, token, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })

  return data.order
}
