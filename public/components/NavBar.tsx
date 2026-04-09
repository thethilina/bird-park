import logo from "../images/birdparklogo.png"
import logolight from "../images/birdparklogodark.png"
import testavetar from "../images/testavetar.png"
import Image from "next/image"
import { IoMdSearch } from "react-icons/io";
import { FaRegPlusSquare } from "react-icons/fa";
import { IoMailSharp } from "react-icons/io5";


function NavBar() {
  return (
    
    <nav className="lg:fixed  hidden border-(--border)  lg:pt-5  w-full top-0 border-b   lg:py-3   lg:flex lg:items-center lg:justify-around lg:self-center ">


    {/** right side */}
    <div className="flex  items-center  gap-x-8">

    <Image src={logo} alt="birdpark logo" className="w-9 hidden dark:block " />     
    <Image src={logolight} alt="birdpark logo" className="w-10 dark:hidden " />

    <ul className="flex items-center gap-x-5 text-2xl ">
    <li>Board</li>
    <li>Circles</li>    
    </ul>

    </div>

    {/** search bar */}

    <div className="relative">
      <IoMdSearch className="absolute right-3 top-1 size-7  " />
      <input placeholder="Explore..." type="text" className="font-sans bg-(--colorbg) dark:bg-(--colorbgdark) border border-(--border) dark:border-(--borderdark)   rounded-xl py-1.5 px-4" />
    </div>

    {/** left side */}
    <div className="flex items-center gap-x-7 color-(--primary) dark:color-(--primarydark) ">

    <FaRegPlusSquare className="size-7" />
    <IoMailSharp className="size-8" />
    <Image src={testavetar} alt="user avatar" className="w-9 rounded-full " />
    </div>


    </nav>
  )
}

export default NavBar