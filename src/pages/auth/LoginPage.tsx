import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const API_URL = 'http://localhost:3000'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login: setAuthUser } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      setLoading(false)

      if (!response.ok) {
        setError(data.message || 'Login failed')
        return
      }

      // Save via AuthContext
      setAuthUser(data)

      // 🔥 Redirect based on role (correct routes)
      const role = data.user.role

      if (role === 'ADMIN') {
  navigate('/admin/dashboard', { replace: true })
} else if (role === 'TEAM_LEAD' || role === 'EMPLOYEE') {
  navigate('/app/dashboard', { replace: true })
} else {
  navigate('/unauthorized', { replace: true })
}
    } catch (err) {
      setLoading(false)
      setError('Server error. Please try again.')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          width: '100%',
          maxWidth: '440px',
          padding: '48px 40px',
          border: '1px solid #e5e5e5',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#1a1a1a',
              marginBottom: '8px',
              letterSpacing: '0.5px',
            }}
          >
            EPMS
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#666666',
              fontWeight: 500,
            }}
          >
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {error && (
            <div
              style={{
                background: '#fff5f5',
                border: '1px solid #feb2b2',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '20px',
                fontSize: '13px',
                color: '#c53030',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                border: '1px solid #e5e5e5',
                borderRadius: '10px',
                marginTop: '8px',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                border: '1px solid #e5e5e5',
                borderRadius: '10px',
                marginTop: '8px',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />{' '}
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#999' : '#1a1a1a',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage