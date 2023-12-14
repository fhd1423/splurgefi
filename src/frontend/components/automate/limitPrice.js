import React, { useState } from 'react';
import TextField from '@mui/material/TextField';

export default function LimitPriceInput({ onValueChange, label, value }) {
  const handleInputChange = (event) => {
    const newValue = event.target.value;
    onValueChange(newValue);
  };

  return (
    <div>
      <label style={{ color: 'white', fontSize: '1rem' }}>{label}</label>
      <TextField
        variant='outlined'
        type='number'
        placeholder='0'
        value={value}
        onChange={handleInputChange}
        style={{ width: '100%' }}
      />
    </div>
  );
}
