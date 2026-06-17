import React from "react";

function InputFiled({
  placeholder,
  type,
  value,
  onChange,
  onKeyDown,
  className,
}: any) {
  return (
    <input
      className={`bg-(--colorbg) dark:bg-(--colorbgdark1) lg:text-xl py-1 px-3 rounded-full ${className}`}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  );
}

export default InputFiled;