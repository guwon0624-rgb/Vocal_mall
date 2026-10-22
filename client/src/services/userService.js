const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const createUser = async (userData) => {
  const payload = Object.fromEntries(
    Object.entries(userData).filter(
      ([key, value]) => key !== 'confirmPassword' && value !== '',
    ),
  )

  if (payload.age) {
    payload.age = Number(payload.age)
  }

  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const validationMessage = data.errors
      ?.map((error) => error.message)
      .join(' ')

    throw new Error(
      validationMessage || data.message || '가입 요청에 실패했습니다.',
    )
  }

  return data.user
}

export const loginUser = async ({ email, password }) => {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const validationMessage = data.errors
      ?.map((error) => error.message)
      .join(' ')

    throw new Error(
      validationMessage || data.message || '로그인에 실패했습니다.',
    )
  }

  return {
    user: data.user,
    token: data.token,
  }
}

export const getCurrentUser = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
    credentials: 'include',
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || '유저 정보를 가져오지 못했습니다.')
  }

  return data.user
}

export const logoutUser = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
    credentials: 'include',
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || '로그아웃에 실패했습니다.')
  }
}
