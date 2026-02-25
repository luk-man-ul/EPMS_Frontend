const API_URL = 'http://localhost:3000'

//////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////

export interface AuthUser {
  id: string
  email: string
  role: string
  permissions: string[]
}

export interface LoginResponse {
  success: boolean
  user?: AuthUser
  error?: string
}

//////////////////////////////////////////////////////////
// LOGIN
//////////////////////////////////////////////////////////

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Login failed',
      }
    }

    // 🔥 Save token
    localStorage.setItem('token', data.access_token)

    // 🔥 Save user (IMPORTANT — must match AuthContext)
    localStorage.setItem('user', JSON.stringify(data.user))

    return {
      success: true,
      user: data.user,
    }
  } catch (error) {
    return {
      success: false,
      error: 'Server error. Please try again.',
    }
  }
}

//////////////////////////////////////////////////////////
// GET CURRENT USER
//////////////////////////////////////////////////////////

export const getCurrentUser = (): AuthUser | null => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

//////////////////////////////////////////////////////////
// LOGOUT
//////////////////////////////////////////////////////////

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

//////////////////////////////////////////////////////////
// CHECK AUTH
//////////////////////////////////////////////////////////

export const isAuthenticated = () => {
  return !!localStorage.getItem('token')
}

//////////////////////////////////////////////////////////
// AUTH HEADERS
//////////////////////////////////////////////////////////

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token')

  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}
