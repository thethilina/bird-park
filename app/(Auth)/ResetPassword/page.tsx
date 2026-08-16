'use client'
import { useState, Suspense } from 'react'
import Image from 'next/image'
import Logo from "@/public/images/birdparklogo.png"
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTopLoader } from 'nextjs-toploader'
import { evaluatePasswordStrength } from '@/lib/passwordStrength'
import { RiLockPasswordLine } from 'react-icons/ri'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const router = useRouter()
  const loader = useTopLoader()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const passwordStrength = evaluatePasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Invalid reset link. Please request a new one.')
      return
    }

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (passwordStrength.score < 2) {
      setError('Password is too weak. Please choose a stronger password.')
      return
    }

    setLoading(true)
    loader.start()

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to reset password')
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/Login'), 3000)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
      loader.done()
    }
  }

  if (!token) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen py-10 px-6'>
        <div className='w-full max-w-sm text-center space-y-6'>
          <Image src={Logo} alt='logo' className='w-10 h-10 object-contain mx-auto' />
          <h2 className='text-2xl text-white font-light'>Invalid Reset Link</h2>
          <p className='text-sm text-gray-400'>
            This password reset link is invalid or has expired.
          </p>
          <Link
            href='/ForgotPassword'
            className='inline-block bg-white font-serif text-black py-2 px-8 rounded-full text-lg font-medium hover:bg-gray-200 transition-all'
          >
            Request New Link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen py-10 px-6'>
      <div className='w-full max-w-sm text-center space-y-8'>

        {/* Logo */}
        <div className='flex items-center justify-center gap-3 mb-6'>
          <Image src={Logo} alt='logo' className='w-10 h-10 object-contain' />
          <h1 className='text-xl font-light tracking-wide'>Bird Park</h1>
        </div>

        {!success ? (
          <>
            {/* Header */}
            <div className='space-y-3'>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(222,190,131,0.1)', border: '1px solid rgba(222,190,131,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 8px',
              }}>
                <RiLockPasswordLine style={{ color: '#DEBE83', width: 28, height: 28 }} />
              </div>
              <h1 className='text-3xl text-[#DEBE83] font-light'>Reset Password</h1>
              <p className='text-sm text-gray-400 leading-relaxed'>
                Choose a new password for your account.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '10px 16px', borderRadius: '12px',
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171', fontSize: '0.875rem',
              }}>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className='flex flex-col gap-4 text-left'>
              <div>
                <input
                  id="reset-new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='New password'
                  className='bg-[#2D2D44] border-none rounded-full py-4 px-6 text-sm placeholder:text-gray-400 w-full'
                  style={{ outline: 'none' }}
                />
                {password && (
                  <div style={{ marginTop: '8px', paddingLeft: '8px', paddingRight: '8px' }}>
                    {/* Strength bar */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          style={{
                            flex: 1,
                            height: '4px',
                            borderRadius: '2px',
                            background: passwordStrength.score >= level ? passwordStrength.color : 'rgba(255,255,255,0.1)',
                            transition: 'background 0.3s',
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: passwordStrength.color, fontWeight: 500 }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    {passwordStrength.suggestions.length > 0 && passwordStrength.score < 3 && (
                      <ul style={{ fontSize: '0.7rem', color: '#9ca3af', margin: '4px 0 0', paddingLeft: '16px' }}>
                        {passwordStrength.suggestions.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div>
                <input
                  id="reset-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder='Confirm new password'
                  className='bg-[#2D2D44] border-none rounded-full py-4 px-6 text-sm placeholder:text-gray-400 w-full'
                  style={{ outline: 'none' }}
                />
                {confirmPassword && (
                  <p style={{
                    fontSize: '0.75rem',
                    color: password === confirmPassword ? '#4ade80' : '#f87171',
                    marginTop: '4px',
                    paddingLeft: '8px',
                  }}>
                    {password === confirmPassword ? 'Passwords match ✓' : 'Passwords do not match'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || passwordStrength.score < 2 || password !== confirmPassword}
                className='bg-white w-full font-serif text-black py-2 rounded-full text-lg font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2'
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Success state */}
            <div className='space-y-4'>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 8px',
              }}>
                <RiLockPasswordLine style={{ color: '#22c55e', width: 28, height: 28 }} />
              </div>
              <h2 className='text-2xl text-white font-light'>Password Reset!</h2>
              <p className='text-sm text-gray-400 leading-relaxed'>
                Your password has been successfully reset. Redirecting you to login...
              </p>
            </div>

            <Link
              href='/Login'
              className='inline-block bg-white font-serif text-black py-2 px-8 rounded-full text-lg font-medium hover:bg-gray-200 transition-all'
            >
              Go to Login
            </Link>
          </>
        )}

      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-white">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
