'use client'
import av from "../../../public/images/pfp.jpg"
import Image from 'next/image'
import { useState, useRef, ChangeEvent, FormEvent } from 'react'
import InputFiled from '@/public/components/Tn/InputFiled'
import { FaFileUpload } from "react-icons/fa";
import Logo from "@/public/images/birdparklogo.png"
import { useRouter } from 'next/navigation'


function Page() {
    const [avatar, setAvatar] = useState<any>(av)
    const [username, setUsername] = useState('')
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [birthday, setBirthday] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter()

    const handleIconClick = () => {
        fileInputRef.current?.click();
    };

    const handleUploadAvatar = async (file : any ) => {

        try{
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

        }catch(error){
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
        setError('');

        const avatarUrl = avatar !== av ? await handleUploadAvatar(fileInputRef.current?.files?.[0]) : undefined;


        if (!username || !fullName || !email || !password || !confirmPassword || !birthday || !avatarUrl) {
            setError('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
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
                    profileImage: avatarUrl ,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Registration failed');
                return;
            }

            router.push('/Login');
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
      <div className='flex flex-col items-center justify-center  min-h-screen py-10 gap-6'> 
    <h1>{error}</h1>
      <div className="flex flex-col gap-y-8">
         {/* top image select*/}
     <div className='flex items-center gap-5 mb-10'>
            <Image src={Logo} alt='logo' className='w-10 h-10 object-contain' />
            <h1 className='text-3xl font-light tracking-wide'>Welcome to Bird Park</h1>
          </div>


      <div className='flex  items-center gap-x-5  '>

      <Image
        src={avatar}
        alt="Avatar"
        width={15}
        height={15}
        className="rounded-full border-1  w-15 h-15 object-cover cursor-pointer"
      />
            <input
                type="file"
                accept=".jpg,.jpeg,.png"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
      <span         onClick={handleIconClick}  className=' flex gap-x-2  text-2xl text-gray-500'> <FaFileUpload />
 Upload an avatar</span>

      </div>

     <form onSubmit={handleSubmit} className='xl:grid-cols-3  lg:grid-cols-2  grid gap-x-10  gap-y-10 lg:w-200 md:grid-cols-2  xl:w-250'>

        <div className='flex flex-col gap-y-3'>    
        <label className="text-xl">Choose an user name </label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder='Ex: antthecreator' className=' bg-(--colorbg) dark:bg-(--colorbgdark1) lg:text-xl py-2 px-4 rounded-full w-full max-w-sm' />
        </div>

          <div className='flex flex-col gap-y-3'>    
        <label className="text-xl">Enter your full name </label>
        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder='Ex: R.H. Richerd' className='bg-(--colorbg) dark:bg-(--colorbgdark1) lg:text-xl py-2 px-4 rounded-full w-full max-w-sm' />
        </div>



           <div className='flex flex-col gap-y-3'>    
        <label className="text-xl">Enter your email </label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Ex: richerdthelionheart11@gmail.com' className='bg-(--colorbg) dark:bg-(--colorbgdark1) lg:text-xl py-2 px-4 rounded-full w-full max-w-sm' />
        </div>

        
            <div className='flex flex-col gap-y-3'>    
        <label className="text-xl">Choose your birthday  </label>
        <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className='bg-(--colorbg) dark:bg-(--colorbgdark1) lg:text-xl py-2 px-4 rounded-full w-full max-w-sm' />
        </div>


        
            <div className='flex flex-col gap-y-3'>    
        <label className="text-xl">Create a password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='' className='bg-(--colorbg) dark:bg-(--colorbgdark1) lg:text-xl py-2 px-4 rounded-full w-full max-w-sm' />
        </div>

 
            <div className='flex flex-col gap-y-3'>    
        <label className="text-xl">Confirm password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder='' className='bg-(--colorbg) dark:bg-(--colorbgdark1) lg:text-xl py-2 px-4 rounded-full w-full max-w-sm' />
        </div>

        <div className="space-y-5">
        <button className='bg-white w-full max-w-sm font-serif text-black py-1 rounded-full text-lg font-medium hover:bg-gray-200 transition-all'>
            Create Account
        </button>

   <div className='flex flex-wrap justify-center gap-4 sm:gap-8 text-xl text-gray-500'>
            <button className='hover:text-white whitespace-nowrap'>Terms of Service</button>
            <button className='hover:text-white whitespace-nowrap'>Privacy policy</button>
          </div>

</div>

        </form>
       </div>
    </div>
    )
}

export default Page;