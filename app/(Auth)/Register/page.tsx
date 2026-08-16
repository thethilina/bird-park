'use client'
import av from "../../../public/images/pfp.jpg"
import Image from 'next/image'
import { useState, useRef, useEffect, useCallback, ChangeEvent } from 'react'
import { FaFileUpload } from "react-icons/fa";
import { FiCheck, FiX, FiLoader } from "react-icons/fi";
import Logo from "@/public/images/birdparklogo.png"
import { useRouter } from 'next/navigation'
import { useTopLoader } from "nextjs-toploader"
import { toast } from 'react-toastify'
import { useAuth } from "@/contexts/AuthContext"
import { evaluatePasswordStrength } from '@/lib/passwordStrength'

function Page() {
    const [avatar, setAvatar] = useState<any>(av)
    const [username, setUsername] = useState('')
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [birthday, setBirthday] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter()
    const loader = useTopLoader()
    const { setUser } = useAuth()

    // Username availability state
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
    const [usernameMessage, setUsernameMessage] = useState('');
    const usernameTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Password strength
    const passwordStrength = evaluatePasswordStrength(password);

    // Debounced username check
    const checkUsername = useCallback(async (value: string) => {
        if (!value || value.length < 3) {
            setUsernameStatus('invalid');
            setUsernameMessage('At least 3 characters required');
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            setUsernameStatus('invalid');
            setUsernameMessage('Only letters, numbers, and underscores');
            return;
        }

        setUsernameStatus('checking');
        try {
            const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(value)}`);
            const data = await res.json();
            setUsernameStatus(data.available ? 'available' : 'taken');
            setUsernameMessage(data.message);
        } catch {
            setUsernameStatus('idle');
            setUsernameMessage('');
        }
    }, []);

    useEffect(() => {
        if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current);
        if (!username) {
            setUsernameStatus('idle');
            setUsernameMessage('');
            return;
        }
        usernameTimerRef.current = setTimeout(() => checkUsername(username), 500);
        return () => {
            if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current);
        };
    }, [username, checkUsername]);



    const handleIconClick = () => {
        fileInputRef.current?.click();
    };

    const handleUploadAvatar = async (file: any) => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            if (data.success) {
                setAvatar(data.url);
                return data.url;
            }
        } catch (error) {
            console.error("Error uploading avatar:", error);
        }
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setAvatar(imageUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const avatarUrl = avatar !== av ? await handleUploadAvatar(fileInputRef.current?.files?.[0]) : undefined;

        if (!username || !fullName || !email || !password || !confirmPassword || !birthday || !avatarUrl) {
            toast.error('All fields are required');
            return;
        }

        if (usernameStatus === 'taken') {
            toast.error('Username is already taken');
            return;
        }

        if (usernameStatus === 'invalid') {
            toast.error('Please choose a valid username');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (passwordStrength.score < 2) {
            toast.error('Password is too weak. Please choose a stronger password.');
            return;
        }

        setLoading(true);

        try {
            loader.start()
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    fullName,
                    email,
                    password,
                    birthday,
                    profileImage: avatarUrl,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || 'Registration failed');
                loader.done()
                return;
            }
            loader.done()
            toast.success('Registration successful! Redirecting to login...');
            router.push('/Login');
        } catch (err: any) {
            loader.done()
            toast.error(err.message || 'An error occurred');
        } finally {
            loader.done()
            setLoading(false);
        }
    };

    // Username status indicator
    const UsernameIndicator = () => {
        if (usernameStatus === 'idle') return null;
        if (usernameStatus === 'checking') return <FiLoader className="animate-spin text-gray-400" size={16} />;
        if (usernameStatus === 'available') return <FiCheck className="text-green-400" size={16} />;
        if (usernameStatus === 'taken') return <FiX className="text-red-400" size={16} />;
        if (usernameStatus === 'invalid') return <FiX className="text-amber-400" size={16} />;
        return null;
    };

    const usernameStatusColor = usernameStatus === 'available' ? '#4ade80' : usernameStatus === 'taken' ? '#f87171' : usernameStatus === 'invalid' ? '#fbbf24' : '#9ca3af';

    return (
      <div className='flex flex-col items-center justify-center min-h-screen py-10 gap-6'>

        <div className="flex flex-col gap-y-8">
          {/* Top logo */}
          <div className='flex items-center gap-5 mb-4'>
            <Image src={Logo} alt='logo' className='w-10 h-10 object-contain' />
            <h1 className='text-3xl font-light tracking-wide'>Welcome to Bird Park</h1>
          </div>

          {/* Avatar upload */}
          <div className='flex items-center gap-x-5'>
            <Image
              src={avatar}
              alt="Avatar"
              width={15}
              height={15}
              className="rounded-full border-1 w-15 h-15 object-cover cursor-pointer"
            />
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <span onClick={handleIconClick} className='flex gap-x-2 text-2xl text-gray-500 cursor-pointer hover:text-gray-300 transition-colors'>
              <FaFileUpload /> Upload an avatar
            </span>
          </div>

          <form onSubmit={handleSubmit} className='xl:grid-cols-3 lg:grid-cols-2 grid gap-x-10 gap-y-10 lg:w-200 md:grid-cols-2 xl:w-250'>

            {/* Username with live validation */}
            <div className='flex flex-col gap-y-3'>
              <label className="text-xl">Choose a username</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder='Ex: antthecreator'
                  className='bg-(--colorbg) dark:bg-(--colorbgdark1) lg:text-xl py-2 px-4 rounded-full w-full max-w-sm pr-10'
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <UsernameIndicator />
                </div>
              </div>
              {usernameMessage && username && (
                <p style={{ fontSize: '0.75rem', color: usernameStatusColor, marginTop: '-4px' }}>
                  {usernameMessage}
                </p>
              )}
            </div>

            <div className='flex flex-col gap-y-3'>
              <label className="text-xl">Enter your full name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder='Ex: R.H. Richerd' className='bg-(--colorbg) dark:bg-(--colorbgdark1) lg:text-xl py-2 px-4 rounded-full w-full max-w-sm' />
            </div>

            <div className='flex flex-col gap-y-3'>
              <label className="text-xl">Enter your email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Ex: richerdthelionheart11@gmail.com' className='bg-(--colorbg) dark:bg-(--colorbgdark1) lg:text-xl py-2 px-4 rounded-full w-full max-w-sm' />
            </div>

            <div className='flex flex-col gap-y-3'>
              <label className="text-xl">Choose your birthday</label>
              <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className='bg-(--colorbg) dark:bg-(--colorbgdark1) lg:text-xl py-2 px-4 rounded-full w-full max-w-sm' />
            </div>

            {/* Password with strength meter */}
            <div className='flex flex-col gap-y-3'>
              <label className="text-xl">Create a password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='' className='bg-(--colorbg) dark:bg-(--colorbgdark1) lg:text-xl py-2 px-4 rounded-full w-full max-w-sm' />
              {password && (
                <div className="flex flex-col gap-1 max-w-sm">
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
                  {/* Label + suggestions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: passwordStrength.color, fontWeight: 500 }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  {passwordStrength.suggestions.length > 0 && passwordStrength.score < 3 && (
                    <ul style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0, paddingLeft: '16px' }}>
                      {passwordStrength.suggestions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className='flex flex-col gap-y-3'>
              <label className="text-xl">Confirm password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder='' className='bg-(--colorbg) dark:bg-(--colorbgdark1) lg:text-xl py-2 px-4 rounded-full w-full max-w-sm' />
              {confirmPassword && password !== confirmPassword && (
                <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '-4px' }}>
                  Passwords do not match
                </p>
              )}
              {confirmPassword && password === confirmPassword && confirmPassword.length > 0 && (
                <p style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '-4px' }}>
                  Passwords match ✓
                </p>
              )}
            </div>

            <div className="space-y-5">
              <button
                disabled={loading || usernameStatus === 'taken' || usernameStatus === 'checking' || passwordStrength.score < 2}
                className='bg-white w-full max-w-sm font-serif text-black py-1 rounded-full text-lg font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>

              <div className='flex flex-wrap justify-center gap-4 sm:gap-8 text-xl text-gray-500'>
                <button type="button" className='hover:text-white whitespace-nowrap'>Terms of Service</button>
                <button type="button" className='hover:text-white whitespace-nowrap'>Privacy policy</button>
              </div>
            </div>

          </form>
        </div>
      </div>
    )
}

export default Page;