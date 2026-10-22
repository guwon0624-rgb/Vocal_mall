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

export const getCatalogItems = async (kind) => {
  const query = kind ? `?kind=${encodeURIComponent(kind)}` : ''
  const response = await fetch(`${API_BASE_URL}/catalog${query}`)
  const data = await parseResponse(
    response,
    '강의와 상품을 가져오지 못했습니다.',
  )

  return data.items
}

export const getCatalogItem = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/catalog/${encodeURIComponent(id)}`,
  )
  const data = await parseResponse(
    response,
    '상품 정보를 가져오지 못했습니다.',
  )

  return data.item
}

export const getAdminCatalogItems = async (token) => {
  const response = await fetch(`${API_BASE_URL}/catalog/manage`, {
    headers: getAuthHeaders(token),
    credentials: 'include',
  })
  const data = await parseResponse(
    response,
    '관리할 강의와 상품을 가져오지 못했습니다.',
  )

  return data.items
}

export const createCatalogItem = async (token, item) => {
  const response = await fetch(`${API_BASE_URL}/catalog`, {
    method: 'POST',
    headers: getAuthHeaders(token, true),
    credentials: 'include',
    body: JSON.stringify(item),
  })
  const data = await parseResponse(response, '등록에 실패했습니다.')

  return data.item
}

export const updateCatalogItem = async (token, id, item) => {
  const response = await fetch(`${API_BASE_URL}/catalog/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(token, true),
    credentials: 'include',
    body: JSON.stringify(item),
  })
  const data = await parseResponse(response, '수정에 실패했습니다.')

  return data.item
}

export const deleteCatalogItem = async (token, id) => {
  const response = await fetch(`${API_BASE_URL}/catalog/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
    credentials: 'include',
  })

  await parseResponse(response, '삭제에 실패했습니다.')
}

export const uploadCatalogImage = async (token, file) => {
  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch(`${API_BASE_URL}/uploads/image`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    credentials: 'include',
    body: formData,
  })
  const data = await parseResponse(
    response,
    '이미지 업로드에 실패했습니다.',
  )

  return data.image
}
