"use client"
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import InputFiled from '@/public/components/Tn/InputFiled'
import { useAuth } from "@/contexts/AuthContext";
import { ToastContainer, toast } from 'react-toastify';
import { useTopLoader } from 'nextjs-toploader';
import SettingsSkeleton from '@/public/components/SettingsSkeleton';

function page() {

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, setUser } = useAuth();
  const [thereisachange , setThereisachange] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username , setUsername] = useState('');
  const [fullName , setFullName] = useState('');
  const [birthday , setBirthday] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage , setProfileImage] = useState('');
  const loader = useTopLoader();

  const uploadsuccess = () => toast("Image uploaded successfully!", {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    type: "success",
    });

  const uploaderror = () => toast("Failed to upload image. Please try again.", {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    type: "error",
    });

  const savesuccess = ()=> toast("Changes saved successfully!",{

position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    type: "success",


  }   )  

    const saveerror = ()=> toast("Error saving changes!",{

position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    type: "error",


  }   )  


  const handleIconClick = () => {
        fileInputRef.current?.click();
    };

  const handleUploadAvatar = async (file: File) => {
    try {
      loader.start();
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        uploadsuccess();
        loader.done();
        return data.url;

      } else {
        loader.done();
        uploaderror();

      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      uploaderror();
        loader.done();
    }

    return null;
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = await handleUploadAvatar(file);
    if (imageUrl) {
      setProfileImage(imageUrl);
    }
  };

  useEffect(() => {
    if (user !== undefined && user !== null) {
      setUsername(user.username || '');
      setFullName(user.fullName || '');
      setBirthday(user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '');
      setBio(user.bio || '');
      setProfileImage(user.profileImage || '');
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setThereisachange(false);
      return;
    }

    const originalBirthday = user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '';
    const originalBio = user.bio || '';
    const originalProfileImage = user.profileImage || '';

    setThereisachange(
      fullName !== (user.fullName || '') ||
      birthday !== originalBirthday ||
      bio !== originalBio ||
      profileImage !== originalProfileImage ||
      username !== (user.username || '')
    );
  }, [user, fullName, birthday, bio, profileImage, username]);

  const handleCancel = () => {
    if (!user) return;

    setFullName(user.fullName || '');
    setBirthday(user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '');
    setBio(user.bio || '');
    setProfileImage(user.profileImage || '');
    setUsername(user.username || '');
  };

  const handleSave = async () => {
    try {
      loader.start()
      const response = await fetch('/api/artists/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          bio,
          birthday,
          username,
          profileImage,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        saveerror()
        loader.done()
        return;
      }

      if (setUser) {
        setUser(data.artist);
      }

      setThereisachange(false);
savesuccess()   
        loader.done()
 } catch (error) {
      console.error(error);
      saveerror()
              loader.done()

    }
  };

  if (isLoading) return <SettingsSkeleton />;

  return (
    <div className=' space-y-5 sm:space-y-15 font-sans   px-3 md:px-5 pb-20 '>
      <ToastContainer />
      {/** top section */}
      <div className='flex sticky  top-12   bg-(--background) sm:relative flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-(--border) pb-5 gap-y-4 sm:gap-y-0'>
        <div className='space-y-3'>
          <h1 className=' pt-2 font-semibold text-xl lg:text-2xl'>Choose how you appear on Bird Park</h1>    
          <h2>Signed as {user?.email}</h2>
        </div>

        <div className='flex gap-3 sm:space-x-4'>
          <button
            onClick={handleSave}
            disabled={!thereisachange}
            className={`px-4 py-1.5 rounded-md text-white transition-colors duration-200 ${
              thereisachange ? 'bg-[#385893] hover:bg-[#2c4573] hover:cursor-pointer' : 'cursor-not-allowed bg-[#3f4858]'
            }`}
          >
            Save
          </button>

          <button
            onClick={handleCancel}
            className='px-4 py-1.5 bg-[#f0f0f0] hover:bg-[#e2e2e2] text-black rounded-md transition-colors duration-200 hover:cursor-pointer'
          >
            Cancel
          </button>
        </div>
      </div>

      {/** middle section */}
      <div className='flex flex-col lg:flex-row items-start gap-y-10 lg:gap-y-0 lg:gap-x-10 w-full'>
        {/** avatar */}
        <div className='space-y-3 w-full lg:w-1/2'>
          <h2 className='text-xl font-semibold'>Avatar</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Your avatar will appear throughout Bird Park next to your posts, comments, and anywhere your presence is seen.
          </p>
          <div className='flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-10'>
            {profileImage && (
              <img 
                src={profileImage} 
                alt='avatar' 
                className='object-cover rounded-lg w-32 h-32 sm:w-40 sm:h-40 md:w-50 md:h-50 shrink-0' 
              />
            )}
            <div className='space-y-4 flex flex-col justify-around'>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Use an image that’s at least 98 × 98 pixels and under 4MB. PNG or GIF formats are supported (no animations). Make sure your avatar follows Bird Park’s community guidelines.
              </p>   
              <div className='space-x-3'>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <button 
                  className='px-4 py-1.5 bg-[#385893] hover:bg-[#2c4573] text-white rounded-md transition-colors duration-200 hover:cursor-pointer' 
                  onClick={handleIconClick}
                >
                  Change
                </button>
                <button 
                  onClick={() => setProfileImage('')} 
                  className='px-4 py-1.5 bg-[#f0f0f0] hover:bg-[#e2e2e2] text-black rounded-md transition-colors duration-200 hover:cursor-pointer'
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        {/** Full Name*/}
        <div className='w-full lg:w-1/2 space-y-3'>
          <h1 className='text-xl font-semibold'>Full Name</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Add your full name for Bird Park crew identification—it helps the community recognize and trust who’s behind the work.
          </p>
          <InputFiled value={fullName} onChange={(e:any) => setFullName(e.target.value)} />
        </div>
      </div>      

      {/** bottom section */}
      <div className='flex flex-col lg:flex-row items-start gap-y-10 lg:gap-y-0 lg:gap-x-10 w-full'>
        {/** User Name */}
        <div className='space-y-3 w-full lg:w-1/2'>
          <h1 className='text-xl font-semibold'>User Name</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Choose a name that reflects you and your work. This name will be visible across Bird Park wherever your presence appears.
          </p>
          <InputFiled placeholder={user?.username} value={username} onChange={(e:any) => setUsername(e.target.value)} />
        </div>    

        {/**birthday */}
        <div className='space-y-3 w-full lg:w-1/2'>
          <h1 className='text-xl font-semibold'>Birthday</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Add your birthdate to help us understand your age and keep the Bird Park community safe and appropriate for everyone.
          </p>
          <InputFiled type="date" placeholder={user?.birthday} value={birthday} onChange={(e:any) => setBirthday(e.target.value)} />
        </div>
      </div>
    </div>
  );
}

export default page;