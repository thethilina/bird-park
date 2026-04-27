import logo from "../images/birdparklogo.png"
import logolight from "../images/birdparklogodark.png"
import avatar from "../images/avatar.jpg"
import Image from "next/image"
import { IoMdSearch } from "react-icons/io";
import { FaRegPlusSquare } from "react-icons/fa";
import { IoMailSharp } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import userData from "@/TestDataBase/userdata";
import Link from "next/link";

function NavBar() {
  return (
    
    <nav className="sticky  z-100 px-5  py-1  lg:px-10 xl:px-20 bg-(--color-background) dark:bg-(--background)  border-(--border)  lg:pt-5  w-full top-0 border-b-2   lg:py-3   flex items-center justify-between ">


    {/** right side */}
    <div className="flex  items-center  gap-x-4 lg:gap-x-8">
    <GiHamburgerMenu className="lg:hidden" />

    <Image src={logo} alt="birdpark logo" className="lg:w-9 w-7 hidden dark:block " />     
    <Image src={logolight} alt="birdpark logo" className="lg:w-10 w-7 dark:hidden " />

    <ul className=" items-center gap-x-5 text-2xl hidden lg:flex">
   <Link href={"/"}><li>Board</li></Link>
    <li>Circles</li>    
    </ul>

    </div>

    {/** search bar */}

    <div className="relative hidden lg:block">
      <IoMdSearch className="absolute right-3 top-1 size-7  " />
      <input placeholder="Explore..." type="text" className="font-sans bg-(--colorbg) dark:bg-(--colorbgdark) border border-(--border) dark:border-(--borderdark)   rounded-xl py-1.5 px-4" />
    </div>

    {/** left side */}
    <div className="flex items-center gap-x-5 lg:gap-x-7 color-(--primary) dark:color-(--primarydark) ">

    <FaRegPlusSquare className=" size-6 lg:size-7" />
    <IoMailSharp className=" size-7 lg:size-8" />
    <Image src={userData.avatar}  alt="user avatar" className="w-7 lg:w-9 rounded-full border border-white" />
    </div>


    </nav>
  )
}

export default NavBar