import React, { useState } from 'react';

export default function TimeSelector({
  selectedTradeAction,
  onTradeActionChange,
  title,
}) {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState('Select time');
  const options = [
    { value: 900, label: '15 mins' },
    { value: 3600, label: '1 hr' },
    { value: 14400, label: '4 hrs' },
    { value: 57600, label: '24 hrs' },
  ];

  return (
    <div>
      <p className='text-white text-sm font-semibold mb-0'>{title}</p>
      <div className='relative'>
        <button
          onClick={() => setOpen(!open)}
          className='mt-3 bg-[#1B1B1B] text-white py-5 px-4 rounded-xl leading-none flex justify-between items-center w-full'
        >
          {time}
          <svg
            className='fill-current h-4 w-4'
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 20 20'
          >
            <path d='M5.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.576 0 0.436 0.445 0.408 1.197 0 1.615l-4.695 4.502c-0.533 0.481-1.408 0.481-1.942 0l-4.695-4.502c-0.408-0.418-0.436-1.17 0-1.615z' />
          </svg>
        </button>
        {open && (
          <div className='absolute z-10 mt-1 w-full rounded shadow bg-[#1B1B1B]'>
            {options.map((option) => (
              <button
                key={option.value}
                className='text-white block px-4 py-2 text-sm w-full text-left rounded-md hover:bg-green-700 hover:bg-opacity-20'
                onClick={() => {
                  onTradeActionChange('timeBwTrade', option.value);
                  setOpen(false);
                  setTime(option.label);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
