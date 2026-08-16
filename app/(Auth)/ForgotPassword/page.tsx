'use client'
import { useState } from 'react'
import Image from 'next/image'
import Logo from "@/public/images/birdparklogo.png"
import Link from 'next/link'
import { useTopLoader } from 'nextjs-toploader'
import { IoMdArrowBack } from 'react-icons/io'
import { HiOutlineMail } from 'react-icons/hi'

function Page() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const loader = useTopLoader()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    loader.start()

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Something went wrong')
        return
      }

      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
      loader.done()
    }
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen py-10 px-6'>
      <div className='w-full max-w-sm text-center space-y-8'>

        {/* Logo */}
        <div className='flex items-center justify-center gap-3 mb-6'>
          <Image src={Logo} alt='logo' className='w-10 h-10 object-contain' />
          <h1 className='text-xl font-light tracking-wide'>Bird Park</h1>
        </div>

        {!submitted ? (
          <>
            {/* Header */}
            <div className='space-y-3'>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(222,190,131,0.1)', border: '1px solid rgba(222,190,131,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 8px',
              }}>
                <HiOutlineMail style={{ color: '#DEBE83', width: 28, height: 28 }} />
              </div>
              <h1 className='text-3xl text-[#DEBE83] font-light'>Forgot Password</h1>
              <p className='text-sm text-gray-400 leading-relaxed'>
                Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
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
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
              <input
                id="forgot-password-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email'
                className='bg-[#2D2D44] border-none rounded-full py-4 px-6 text-sm placeholder:text-gray-400 w-full'
                style={{ outline: 'none' }}
              />
              <button
                type="submit"
                disabled={loading}
                className='bg-white w-full font-serif text-black py-2 rounded-full text-lg font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            {/* Back to login */}
            <Link
              href='/Login'
              className='flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors'
            >
              <IoMdArrowBack size={16} />
              Back to login
            </Link>
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
                <HiOutlineMail style={{ color: '#22c55e', width: 28, height: 28 }} />
              </div>
              <h2 className='text-2xl text-white font-light'>Check your email</h2>
              <p className='text-sm text-gray-400 leading-relaxed'>
                We&apos;ve sent a password reset link to <span className='text-white font-medium'>{email}</span>.
                The link will expire in 1 hour.
              </p>
              <p className='text-xs text-gray-500'>
                Didn&apos;t receive it? Check your spam folder or{' '}
                <button
                  onClick={() => { setSubmitted(false); setError(''); }}
                  className='text-[#DEBE83] hover:underline'
                >
                  try again
                </button>.
              </p>
            </div>

            <Link
              href='/Login'
              className='inline-block bg-white font-serif text-black py-2 px-8 rounded-full text-lg font-medium hover:bg-gray-200 transition-all'
            >
              Return to Login
            </Link>
          </>
        )}

      </div>
    </div>
  )
}

export default Page
