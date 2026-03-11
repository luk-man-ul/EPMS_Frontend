import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, Button, Card } from '../../components/ui'

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Add password reset logic here
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
        padding: '20px',
      }}>
        <Card padding="lg" style={{ maxWidth: '440px', width: '100%', textAlign: 'center' }}>
          {/* Success Icon */}
          <div style={{
            width: '64px',
            height: '64px',
            background: '#1a1a1a',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '32px',
          }}>
            ✓
          </div>

          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1a1a1a',
            marginBottom: '12px',
          }}>
            Check Your Email
          </h2>

          <p style={{
            fontSize: '14px',
            color: '#666666',
            lineHeight: '1.6',
            marginBottom: '32px',
          }}>
            We've sent a password reset link to{' '}
            <span style={{ color: '#1a1a1a', fontWeight: 600 }}>
              {email}
            </span>
            . Please check your inbox and follow the instructions.
          </p>

          <Button
            variant="primary"
            onClick={() => navigate('/auth/login')}
            style={{ width: '100%', marginBottom: '16px' }}
          >
            Back to Login
          </Button>

          <Button
            variant="ghost"
            onClick={() => setIsSubmitted(false)}
          >
            Didn't receive the email? Resend
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
      padding: '20px',
    }}>
      <Card padding="lg" style={{ maxWidth: '440px', width: '100%' }}>
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/auth/login')}
          style={{ marginBottom: '24px' }}
        >
          ← Back to Login
        </Button>

        {/* Logo/Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#1a1a1a',
            marginBottom: '8px',
            letterSpacing: '0.5px',
          }}>
            ISPM
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#666666',
            fontWeight: 500,
          }}>
            Reset your password
          </p>
        </div>

        {/* Info Message */}
        <div style={{
          background: '#fafafa',
          border: '1px solid #e5e5e5',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '28px',
        }}>
          <p style={{
            fontSize: '13px',
            color: '#666666',
            lineHeight: '1.6',
            margin: 0,
          }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Reset Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '28px' }}>
            <Input
              type="email"
              label="Email Address"
              value={email}
              onChange={(value) => setEmail(value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            style={{ width: '100%' }}
          >
            Send Reset Link
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default ForgotPasswordPage
