import React from "react";
import { styled } from "@mui/system";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// Entire input container (includes selector and textfield)
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
  fontSize: "1.25rem", // Adjust the font size if necessary
  "& .MuiInputBase-input": {
    textAlign: "left",
    padding: "0 10px", // Padding for spacing
    width: "100%", // Adjust width to make room for select
    height: "100%",
  },
});

// Custom styles for the select component
const CustomSelect = styled(Select)({
  color: "white",
  "& .MuiSelect-select": {
    paddingRight: "8px", // Keep the right padding
    paddingLeft: "0", // Remove left padding here to allow for custom padding in renderValue
    minWidth: "40px",
    height: "100%",
    fontSize: "1.25rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start", // Align items to the start
  },
  "& .MuiSelect-icon": {
    color: "white",
    top: "50%",
    transform: "translateY(-50%)",
    position: "absolute",
    left: "7px", // Position the icon on the left
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  margin: "0",
  borderRadius: "0 10px 10px 0",
});

export default function CustomInputPercent({
  title,
  placeHolder,
  value,
  onValueChange,
  onSelectorChange,
  selectorValue,
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
        <CustomSelect
          value={selectorValue}
          onChange={onSelectorChange}
          displayEmpty
          IconComponent={selectorValue ? null : KeyboardArrowDownIcon}
          renderValue={(selected) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                paddingLeft: "30px", // Increased padding to create space
              }}
            >
              {selected}
            </div>
          )}
        >
          <MenuItem value="+">+</MenuItem>
          <MenuItem value="-">-</MenuItem>
        </CustomSelect>
        <CustomInput
          placeholder={placeHolder}
          value={value}
          onChange={onValueChange}
        />
      </CustomInputContainer>
    </div>
  );
}
