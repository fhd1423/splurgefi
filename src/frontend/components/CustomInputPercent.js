import React from 'react';
import { styled } from '@mui/system';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Typography } from '@mui/material';

// Entire input container (includes icon button and textfield)
const CustomInputContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  backgroundColor: "#1B1B1B",
  borderRadius: "10px",
  width: "170px",
  height: "90px",
});

// Custom styles for textfield component
const CustomInput = styled(InputBase)({
  color: "white",
  fontSize: "2rem", 
  "& .MuiInputBase-input": {
    textAlign: "center",
    padding: "0 10px", 
    width: "calc(100% - 40px)", 
    height: "100%",
  },
});

export default function CustomInputPercent({
  title,
  placeHolder,
  value,
  onValueChange,
  onToggle, // Function to handle the toggle between up and down
  isUpSelected, // Boolean variable to determine the icon state
}) {
  return (
    <div>
      <Typography
        variant="subtitle1"
        color="white"
        fontWeight="600"
        gutterBottom
        style={{ marginBottom: "8px", textAlign: "left" }}
      >
        {title}
      </Typography>
      <CustomInputContainer>
        <IconButton onClick={onToggle} style={{ color: 'white', padding: '10px' }}>
          {isUpSelected ? <ArrowDropUpIcon fontSize="large" /> : <ArrowDropDownIcon fontSize="large"/>}
        </IconButton>
        <CustomInput
          placeholder={placeHolder}
          value={value}
          onChange={onValueChange}
        />
      </CustomInputContainer>
    </div>
  );
}
