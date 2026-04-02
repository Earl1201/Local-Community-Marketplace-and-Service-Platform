import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

const validateEmail = (email) => {
  if (!email) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address'
  return ''
}

const validatePassword = (password) => {
  if (!password) return 'Password is required'
  if (password.length < 6) return 'Password must be at least 6 characters'
  return ''
}

export default function LoginForm({ onToggleForm, onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const getFieldError = (field) => (touched[field] ? errors[field] : '')

  const handleBlur = (field, value) => {
    setTouched((t) => ({ ...t, [field]: true }))
    const err =
      field === 'email' ? validateEmail(value) : validatePassword(value)
    setErrors((e) => ({ ...e, [field]: err }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const emailErr = validateEmail(email)
    const passErr = validatePassword(password)
    setTouched({ email: true, password: true })
    setErrors({ email: emailErr, password: passErr })

    if (emailErr || passErr) return

    setLoading(true)
    const { error } = await signIn(email, password)

    if (error) {
      setErrors({ server: error.message })
      setLoading(false)
    } else {
      onSuccess?.()
    }
  }

  return (
    <div className="auth-form">
      <h2>Welcome Back 👋</h2>
      <p className="subtitle">Sign in to your Community Market account</p>

      {errors.server && (
        <div className="error-message" role="alert">
          <AlertIcon />
          {errors.server}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className="form-group">
          <label htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (touched.email) setErrors((err) => ({ ...err, email: validateEmail(e.target.value) }))
            }}
            onBlur={(e) => handleBlur('email', e.target.value)}
            placeholder="earlbrian@email.com"
            className={getFieldError('email') ? 'error' : ''}
            autoComplete="email"
            aria-describedby={getFieldError('email') ? 'email-error' : undefined}
            aria-invalid={!!getFieldError('email')}
          />
          {getFieldError('email') && (
            <p className="field-error" id="email-error" role="alert">
              ⚠ {getFieldError('email')}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <div className="password-input-wrapper">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (touched.password) setErrors((err) => ({ ...err, password: validatePassword(e.target.value) }))
              }}
              onBlur={(e) => handleBlur('password', e.target.value)}
              placeholder="••••••••"
              className={getFieldError('password') ? 'error' : ''}
              autoComplete="current-password"
              aria-describedby={getFieldError('password') ? 'pass-error' : undefined}
              aria-invalid={!!getFieldError('password')}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {getFieldError('password') && (
            <p className="field-error" id="pass-error" role="alert">
              ⚠ {getFieldError('password')}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary btn-block"
          disabled={loading}
          style={{ marginTop: 10 }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p className="toggle-form">
        Don't have an account?{' '}
        <button type="button" onClick={onToggleForm} className="link-button">
          Create account
        </button>
      </p>
    </div>
  )
}