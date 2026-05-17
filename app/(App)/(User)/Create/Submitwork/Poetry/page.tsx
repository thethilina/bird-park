"use client";

import React, { useState } from 'react';
import { IoCloudUpload } from "react-icons/io5";

function Page() {
  // State for user inputs
  const [title, setTitle] = useState('');
  const [poem, setPoem] = useState('');

  // Styling states
  const [font, setFont] = useState('Georgia, serif');
  const [fontSize, setFontSize] = useState('20px'); // Default text-xl equivalent
  const [textColor, setTextColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');

  // 25 distinct system fonts
  const fontOptions = [
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Palatino', value: '"Palatino Linotype", Palatino, Palladio, "URW Palladio L", serif' },
    { name: 'Garamond', value: 'Garamond, Baskerville, "Baskerville Old Face", "Hoefler Text", "Times New Roman", serif' },
    { name: 'Bookman', value: '"Bookman Old Style", Bookman, "URW Bookman L", serif' },
    { name: 'Times New Roman', value: '"Times New Roman", Times, Baskerville, Georgia, serif' },
    { name: 'Helvetica', value: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
    { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { name: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, jam, sans-serif' },
    { name: 'Gill Sans', value: '"Gill Sans", "Gill Sans MT", Calibri, sans-serif' },
    { name: 'Optima', value: 'Optima, Segoe, "Segoe UI", Candara, Calibri, sans-serif' },
    { name: 'Century Gothic', value: '"Century Gothic", CenturyGothic, AppleGothic, sans-serif' },
    { name: 'Gadget', value: 'Gadget, sans-serif' },
    { name: 'Courier New', value: '"Courier New", Courier, monospace' },
    { name: 'Lucida Sans Typewriter', value: '"Lucida Sans Typewriter", "Lucida Console", Monaco, monospace' },
    { name: 'Monaco', value: 'Monaco, Consolas, "Lucida Console", monospace' },
    { name: 'Consolas', value: 'Consolas, monaco, monospace' },
    { name: 'Copperplate', value: 'Copperplate, "Copperplate Gothic Light", fantasy' },
    { name: 'Papyrus', value: 'Papyrus, fantasy' },
    { name: 'Brush Script', value: '"Brush Script MT", cursive' },
    { name: 'Comic Sans', value: '"Comic Sans MS", cursive, sans-serif' },
    { name: 'Impact', value: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif' },
    { name: 'Lucida Handwriting', value: '"Lucida Handwriting", cursive' },
    { name: 'Apple Chancery', value: '"Apple Chancery", cursive' },
    { name: 'Courier', value: 'Courier, monospace' }
  ];

  // Font size options mapped to pixel sizes
  const sizeOptions = [
    { name: 'Small', value: '14px' },
    { name: 'Normal', value: '16px' },
    { name: 'Large', value: '20px' },
    { name: 'XL', value: '24px' },
    { name: '2XL', value: '32px' },
    { name: '3XL', value: '40px' },
  ];

  return (
    <div className="">
      
      {/* Title Input Field directly above toolbar */}
      <div className="w-full mb-3">
        <input 
          type="text"
          placeholder="Poem Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-2 py-1 text-2xl font-semibold bg-transparent border-b outline-none border-(--border)"
        />
      </div>

      {/**tool bar */}
      <div 
        className="mb-5 w-full rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) px-4 py-2 text-2xl dark:bg-(--colorbgdark) flex flex-wrap items-center gap-4 text-base" 
      >
        {/* Font Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Font:</label>
          <select 
            value={font}
            onChange={(e) => setFont(e.target.value)}
            className="p-1 text-sm border rounded bg-transparent border-(--border) dark:text-white text-black"
          >
            {fontOptions.map((f, idx) => (
              <option key={idx} value={f.value} className="text-black">
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Size:</label>
          <select 
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="p-1 text-sm border rounded bg-transparent border-(--border) dark:text-white text-black"
          >
            {sizeOptions.map((s, idx) => (
              <option key={idx} value={s.value} className="text-black">
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Text Color Picker */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Text:</label>
          <input 
            type="color" 
            value={textColor} 
            onChange={(e) => setTextColor(e.target.value)}
            className="w-6 h-6 border rounded cursor-pointer border-(--border)"
          />
        </div>

        {/* Background Color Picker */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Bg:</label>
          <input 
            type="color" 
            value={bgColor} 
            onChange={(e) => setBgColor(e.target.value)}
            className="w-6 h-6 border rounded cursor-pointer border-(--border)"
          />
        </div>
      </div>

      {/**poem area */}
      <div 
        className="w-full gap-y-3 items-center justify-center flex flex-col h-130 rounded-xl border-2 border-dotted border-(--border) p-4"
        style={{ backgroundColor: bgColor }}
      >
        <textarea
          placeholder="Write your poem here..."
          value={poem}
          onChange={(e) => setPoem(e.target.value)}
          className="w-full h-full bg-transparent border-none outline-none resize-none text-left p-2"
          style={{ fontFamily: font, fontSize: fontSize, color: textColor }}
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end w-full p-2 mt-4 text-right">
        <button className="mr-3 px-4 py-2">Draft</button>
        <button className="px-4 py-2 font-bold flex items-center gap-2">
          <IoCloudUpload /> Upload
        </button>
      </div>
    </div>
  );
}

export default Page;