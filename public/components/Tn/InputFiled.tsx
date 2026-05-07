import React from 'react'

function InputFiled({ placeholder , type , onchange }: any) {
  return (
    <input className='bg-(--colorbg) dark:bg-(--colorbgdark1) lg:text-xl py-1 px-3 rounded-full' type={type} placeholder={placeholder} onChange={onchange} />
  )
}

export default InputFiled