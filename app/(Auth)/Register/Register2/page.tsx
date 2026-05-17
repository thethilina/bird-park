'use client'
import av from "../../../../public/images/pfp.jpg"
import Image from 'next/image'
import { useState, useRef, ChangeEvent } from 'react'
import InputFiled from '@/public/components/Tn/InputFiled'
import { FaFileUpload } from "react-icons/fa";


function Page() {
    const [avatar, setAvatar] = useState<any>(av)
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleIconClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setAvatar(imageUrl);
        }
    };

    return (
      <div className='flex flex-col items-center justify-center  py-20  '>

      <div className="flex flex-col space-y-10     ">
      {/* top image select*/}
      <div className='flex  items-center gap-x-10  '>

      <Image
        src={avatar}
        alt="Avatar"
      
        className="rounded-full border-1  w-20 h-20 object-cover cursor-pointer"
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <span         onClick={handleIconClick}  className=' flex gap-x-2  text-2xl text-gray-500'> <FaFileUpload />
 Upload an avatar</span>

      </div>

          
      {/* input fields */}

<div className=" flex   space-x-10 ">


      {/** left side */}

 <div className="space-y-10">





{/** name fields */}

<div className="space-y-3">
<label htmlFor="name" className="block text-xl font-medium text-gray-700">
Choose a user name
</label>
    <InputFiled 
                placeholder='' 
                type='text' 
                className="bg-[#2D2D44] border-none rounded-full py-4 px-6 text-sm placeholder:text-gray-400"
            />


</div>

{/** full name*/}

<div className="space-y-3">
<label htmlFor="fullName" className="block text-xl font-medium text-gray-700">
Enter your full name
</label>
    <InputFiled 
                placeholder='' 
                type='text' 
                className="bg-[#2D2D44] border-none rounded-full py-4 px-6 text-sm placeholder:text-gray-400"
            />
</div>

{/** birthday*/}
<div className="space-y-3"> 
<label htmlFor="name" className="block text-xl font-medium text-gray-700">
Enter your birthday
</label>
    <InputFiled 
                placeholder='' 
                type='date' 
                className="bg-[#2D2D44] border-none rounded-full py-4 px-6 text-sm placeholder:text-gray-400"
            />
</div>


 </div>

      {/** right side */}


    <div className="space-y-10">
      
      
      
            {/** password */}

<div className="space-y-3">
<label htmlFor="name" className="block text-xl font-medium text-gray-700">
Create a password
</label>
    <InputFiled 
                placeholder='' 
                type='password' 
                className="bg-[#2D2D44] border-none rounded-full py-4 px-6 text-sm placeholder:text-gray-400"
            />
</div>



                  {/** cpnfirm passworrd */}

<div className="space-y-3">
<label htmlFor="name" className="block text-xl font-medium text-gray-700">
Confirm your password
</label>
    <InputFiled 
                placeholder='' 
                type='password' 
                className="bg-[#2D2D44] border-none rounded-full py-4 px-6 text-sm placeholder:text-gray-400"
            />
</div>
      
         <button className='bg-white w-full font-serif text-black py-1 rounded-full text-lg font-medium hover:bg-gray-200 transition-all'>
            Create
          </button>
      
      </div>  












</div>

</div>
      
       
    </div>
    )
}

export default Page;