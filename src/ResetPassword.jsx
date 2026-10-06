import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function ResetPassword() {
  const [sessionStatus, setSessionStatus] = useState('checking')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let recoverySessionDetected = false
    let active = true

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY' || session) {
          recoverySessionDetected = true
          setSessionStatus('ready')
        }
      }
    )

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active || recoverySessionDetected) return
      setSessionStatus(!error && data.session ? 'ready' : 'invalid')
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()

    if (password !== confirmPassword) {
      setMessage('The passwords do not match.')
      return
    }

    setSaving(true)
    setMessage('')

    const { error } = await supabase.auth.updateUser({ password })

    setSaving(false)
    if (error) {
      setMessage(error.message)
      return
    }

    setPassword('')
    setConfirmPassword('')
    setMessage('Your password has been updated successfully.')
    setSessionStatus('success')
  }

  return (
    <main className="admin-page">
      <section className="admin-login reset-password-page">
        <h1>Choose a New Password.</h1>

        {sessionStatus === 'checking' ? (
          <p className="admin-intro" role="status">Verifying your recovery link...</p>
        ) : sessionStatus === 'invalid' ? (
          <p className="admin-intro" role="alert">
            This recovery link is invalid or has expired. Return to Admin to request a new one.
          </p>
        ) : sessionStatus === 'success' ? (
          <p className="admin-intro" role="status">{message}</p>
        ) : (
          <>
            <p className="admin-intro">Enter and confirm your new password.</p>
            <form className="reset-password-form" onSubmit={handleSubmit}>
              <label>
                New password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              <label>
                Confirm new password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </label>
              <button type="submit" disabled={saving}>
                {saving ? 'Saving password...' : 'Save new password'}
              </button>
            </form>
          </>
        )}

        {message && sessionStatus !== 'success' && (
          <p className="admin-message" role="alert">{message}</p>
        )}
        <a href="/admin">Return to Admin</a>
      </section>
    </main>
  )
}