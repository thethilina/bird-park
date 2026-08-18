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
import LightLogo from "@/public/images/birdparklogodark.png"

import Link from 'next/link'

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

    const handleIconClick = () => fileInputRef.current?.click();

    const handleUploadAvatar = async (file: any) => {
        try {
            loader.start();
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await response.json();
            loader.done();
            if (data.success) {
                setAvatar(data.url);
                toast.success('Avatar uploaded!');
                return data.url;
            } else {
                toast.error('Failed to upload avatar');
            }
        } catch (error) {
            loader.done();
            toast.error('Error uploading avatar');
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
            toast.error('All fields are required including a profile photo');
            return;
        }
        if (usernameStatus === 'taken') { toast.error('Username is already taken'); return; }
        if (usernameStatus === 'invalid') { toast.error('Please choose a valid username'); return; }
        if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
        if (passwordStrength.score < 2) { toast.error('Password is too weak. Please choose a stronger password.'); return; }

        setLoading(true);
        try {
            loader.start();
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, fullName, email, password, birthday, profileImage: avatarUrl }),
            });
            const data = await response.json();
            if (!response.ok) {
                toast.error(data.message || 'Registration failed');
                loader.done();
                return;
            }
            loader.done();
            toast.success('Account created! Redirecting to login...');
            router.push('/Login');
        } catch (err: any) {
            loader.done();
            toast.error(err.message || 'An unexpected error occurred');
        } finally {
            loader.done();
            setLoading(false);
        }
    };

    const UsernameIndicator = () => {
        if (usernameStatus === 'idle') return null;
        if (usernameStatus === 'checking') return <FiLoader className="animate-spin text-gray-800 dark:text-gray-400" size={20} />;
        if (usernameStatus === 'available') return <FiCheck className=" text-green-800 dark:text-green-400" size={20    } />;
        if (usernameStatus === 'taken') return <FiX className="text-red-700 dark:text-red-400" size={20} />;
        if (usernameStatus === 'invalid') return <FiX className="text-amber-800 dark:text-amber-400" size={20} />;
        return null;
    };

    const usernameStatusColor = usernameStatus === 'available' ? '#4ade80' : usernameStatus === 'taken' ? '#f87171' : usernameStatus === 'invalid' ? '#fbbf24' : '#9ca3af';

    const fieldClass = 'bg-[#8989A9] dark:bg-(--colorbgdark1) text-base py-2.5 px-5 rounded-full w-full outline-none focus:ring-2 focus:ring-white/20 transition-all';

    return (
        <div className='flex flex-col items-center justify-center min-h-screen px-5 py-12 sm:px-8'>
            <div className='w-full max-w-2xl space-y-8'>

                {/* Logo */}
                <div className='flex items-center gap-3'>
                       <Image src={Logo} alt='logo' className='w-10 h-10 hidden dark:block object-contain' />
                        <Image src={LightLogo} alt='logo' className='w-10 h-10 dark:hidden  object-contain' />
                    <h1 className='text-2xl sm:text-3xl font-light tracking-wide'>Welcome to Bird Park</h1>
                </div>

                {/* Subtitle */}
                <div className='space-y-1'>
                    <Link href='/Login' className='text-lg dark:text-gray-400 dark:hover:text-white underline underline-offset-4 transition-colors'>
                        Already have an account? Log in
                    </Link>
                </div>

                {/* Avatar upload */}
                <div className='flex items-center gap-x-4'>
                    <Image
                        src={avatar}
                        alt="Avatar"
                        width={60}
                        height={60}
                        className="rounded-full border border-black/60 dark:border-white/20 w-14 h-14 sm:w-16 sm:h-16 object-cover cursor-pointer shrink-0"
                    />
                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                    <span
                        onClick={handleIconClick}
                        className='flex items-center gap-x-2 dark:text-gray-400 cursor-pointer dark:hover:text-gray-200 transition-colors text-md sm:text-lg font-medium'
                    >
                        <FaFileUpload size={15} />
                        Upload a profile photo
                    </span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6'>

                    {/* Username */}
                    <div className='flex flex-col  gap-y-2'>
                        <label className="text-md font-medium dark:text-gray-300">Username</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder='e.g. antthecreator'
                                className={fieldClass + ' pr-10'}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <UsernameIndicator />
                            </div>
                        </div>
                        {usernameMessage && username && (
                            <p style={{  color: usernameStatusColor }} className="text-md">{usernameMessage}</p>
                        )}
                    </div>

                    {/* Full Name */}
                    <div className='flex flex-col gap-y-2'>
                        <label className="text-md font-medium dark:text-gray-300">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder='e.g. Richard Lionheart'
                            className={fieldClass}
                        />
                    </div>

                    {/* Email */}
                    <div className='flex flex-col gap-y-2'>
                        <label className="text-md font-medium dark:text-gray-300">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='e.g. richard@gmail.com'
                            className={fieldClass}
                        />
                    </div>

                    {/* Birthday */}
                    <div className='flex flex-col gap-y-2'>
                        <label className="text-md font-medium dark:text-gray-300">Birthday</label>
                        <input
                            type="date"
                            value={birthday}
                            onChange={(e) => setBirthday(e.target.value)}
                            className={fieldClass}
                        />
                    </div>

                    {/* Password */}
                    <div className='flex flex-col gap-y-2'>
                        <label className="text-md font-medium dark:text-gray-300">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder='Create a strong password'
                            className={fieldClass}
                        />
                        {password && (
                            <div className="flex flex-col gap-1">
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {[1, 2, 3, 4].map((level) => (
                                        <div
                                            key={level}
                                            style={{
                                                flex: 1, height: '3px', borderRadius: '2px',
                                                background: passwordStrength.score >= level ? passwordStrength.color : 'rgba(255,255,255,0.1)',
                                                transition: 'background 0.3s',
                                            }}
                                        />
                                    ))}
                                </div>
                                <span style={{ fontSize: '0.72rem', color: passwordStrength.color, fontWeight: 500 }}>
                                    {passwordStrength.label}
                                </span>
                                {passwordStrength.suggestions.length > 0 && passwordStrength.score < 3 && (
                                    <ul style={{ fontSize: '0.68rem', color: '#9ca3af', paddingLeft: '14px', margin: 0 }}>
                                        {passwordStrength.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className='flex flex-col gap-y-2'>
                        <label className="text-md font-medium dark:text-gray-300">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder='Repeat your password'
                            className={fieldClass}
                        />
                        {confirmPassword && password !== confirmPassword && (
                            <p style={{ fontSize: '0.72rem', color: '#f87171' }}>Passwords do not match</p>
                        )}
                        {confirmPassword && password === confirmPassword && confirmPassword.length > 0 && (
                            <p style={{ fontSize: '0.72rem', color: '#4ade80' }}>Passwords match ✓</p>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="sm:col-span-2 space-y-4 pt-2">
                        <button
                            disabled={loading || usernameStatus === 'taken' || usernameStatus === 'checking' || passwordStrength.score < 2}
                            className='bg-black/90 text-white hover:cursor-pointer dark:bg-white w-full font-serif dark:text-black py-2.5 rounded-full text-base font-medium dark:hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                        <div className='flex flex-wrap justify-center gap-4 text-sm text-gray-500'>
                            <Link href='/terms-of-service' className='hover:text-white transition-colors whitespace-nowrap'>Terms of Service</Link>
                            <Link href='/privacy-policy' className='hover:text-white transition-colors whitespace-nowrap'>Privacy Policy</Link>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    )
}

export default Page;