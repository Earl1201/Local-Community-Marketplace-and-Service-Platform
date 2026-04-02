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

/* Password strength analyser */
const getPasswordStrength = (pw) => {
  if (!pw) return null
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 1) return { score: 1, label: 'Weak',   color: '#ef4444', width: '25%' }
  if (score === 2) return { score: 2, label: 'Fair',   color: '#f59e0b', width: '50%' }
  if (score === 3) return { score: 3, label: 'Good',   color: '#10b981', width: '75%' }
  return            { score: 4, label: 'Strong', color: '#059669', width: '100%' }
}

/* Field validators */
const validateName = (v) => {
  if (!v?.trim()) return 'Full name is required'
  if (v.trim().length < 2) return 'Name must be at least 2 characters'
  return ''
}
const validateEmail = (v) => {
  if (!v) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address'
  return ''
}
const validatePassword = (v) => {
  if (!v) return 'Password is required'
  if (v.length < 6) return 'Password must be at least 6 characters'
  return ''
}

const validators = { fullName: validateName, email: validateEmail, password: validatePassword }

export default function RegisterForm({ onToggleForm, onSuccess }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  const strength = getPasswordStrength(password)

  const getFieldError = (field) => (touched[field] ? errors[field] : '')

  const handleBlur = (field, value) => {
    setTouched((t) => ({ ...t, [field]: true }))
    setErrors((e) => ({ ...e, [field]: validators[field](value) }))
  }

  const setField = (field, setter) => (e) => {
    setter(e.target.value)
    if (touched[field]) {
      setErrors((err) => ({ ...err, [field]: validators[field](e.target.value) }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const allErrors = {
      fullName: validateName(fullName),
      email:    validateEmail(email),
      password: validatePassword(password),
    }
    setTouched({ fullName: true, email: true, password: true })
    setErrors(allErrors)
    if (Object.values(allErrors).some(Boolean)) return

    setLoading(true)
    const { error } = await signUp(email, password, fullName.trim())
    if (error) {
      setErrors({ server: error.message })
      setLoading(false)
    } else {
      onSuccess?.()
    }
  }

  return (
    <div className="auth-form">
      <h2>Join the Community 🌱</h2>
      <p className="subtitle">Create your free account and start trading locally</p>

      {errors.server && (
        <div className="error-message" role="alert">
          <AlertIcon />
          {errors.server}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Full name */}
        <div className="form-group">
          <label htmlFor="reg-name">Full Name</label>
          <input
            id="reg-name"
            type="text"
            value={fullName}
            onChange={setField('fullName', setFullName)}
            onBlur={(e) => handleBlur('fullName', e.target.value)}
            placeholder="Earl Brian"
            className={getFieldError('fullName') ? 'error' : ''}
            autoComplete="name"
            aria-invalid={!!getFieldError('fullName')}
          />
          {getFieldError('fullName') && (
            <p className="field-error" role="alert">⚠ {getFieldError('fullName')}</p>
          )}
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="reg-email">Email Address</label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={setField('email', setEmail)}
            onBlur={(e) => handleBlur('email', e.target.value)}
            placeholder="your@email.com"
            className={getFieldError('email') ? 'error' : ''}
            autoComplete="email"
            aria-invalid={!!getFieldError('email')}
          />
          {getFieldError('email') && (
            <p className="field-error" role="alert">⚠ {getFieldError('email')}</p>
          )}
        </div>

        {/* Password with strength meter */}
        <div className="form-group">
          <label htmlFor="reg-password">Password</label>
          <div className="password-input-wrapper">
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setField('password', setPassword)}
              onBlur={(e) => handleBlur('password', e.target.value)}
              placeholder="Create a strong password"
              className={getFieldError('password') ? 'error' : ''}
              autoComplete="new-password"
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
            <p className="field-error" role="alert">⚠ {getFieldError('password')}</p>
          )}

          {/* Strength bar — shown whenever password has a value */}
          {password && strength && (
            <div className="password-strength" aria-live="polite">
              <div className="strength-bar">
                <div
                  className="strength-fill"
                  style={{ width: strength.width, background: strength.color }}
                />
              </div>
              <span className="strength-text" style={{ color: strength.color }}>
                {strength.label}
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary btn-block"
          disabled={loading}
          style={{ marginTop: 10 }}
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="toggle-form">
        Already have an account?{' '}
        <button type="button" onClick={onToggleForm} className="link-button">
          Sign in
        </button>
      </p>
    </div>
  )
}