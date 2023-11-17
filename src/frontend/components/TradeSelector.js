import React, { useState } from "react";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { styled } from "@mui/system";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Typography from "@mui/material/Typography";

// Custom styles for the form control
const CustomFormControl = styled(FormControl)({
  backgroundColor: "#1B1B1B",
  borderRadius: "10px",
  width: "340px",
  height: "90px",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 10px",
});

// Custom styles for the select component
const CustomSelect = styled(Select)({
  "& .MuiSelect-select": {
    color: "white",
    lineHeight: "80px", // Center the text vertically
    paddingLeft: "10px", // Give some space from the left side
    paddingRight: "32px", // Make room for the icon
    fontSize: "1.25rem",
  },
  "& .MuiSelect-icon": {
    display: "none", // Hide the default icon
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
});

export default function TradeSelector({
  selectedTradeAction,
  onTradeActionChange,
}) {
  const [open, setOpen] = useState(false);

  const handleChange = (event) => {
    onTradeActionChange(event.target.value); // This should call the handler passed from step-two.js
  };

  // Function to toggle the select dropdown
  const toggleDropdown = () => {
    setOpen((prev) => !prev);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <Typography
        variant="subtitle1"
        color="white"
        fontWeight="600"
        gutterBottom
        style={{ marginBottom: "8px", textAlign: "left" }}
      >
        Trade Based On
      </Typography>
      <CustomFormControl fullWidth>
        <CustomSelect
          open={open}
          value={selectedTradeAction}
          onChange={handleChange}
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          displayEmpty
          IconComponent={KeyboardArrowDownIcon}
        >
          <MenuItem value={"avg. 15 min price"}>Avg. 15 min price</MenuItem>
          <MenuItem value={"avg. 4 hr price"}>Avg. 4 hr price</MenuItem>
          <MenuItem value={"avg. 8 hr price"}>Avg. 8 hr price</MenuItem>
          <MenuItem value={"avg. 24 hr price"}>Avg. 24 hr price</MenuItem>


        </CustomSelect>
        <IconButton
          onClick={toggleDropdown} 
          sx={{
            position: "absolute",
            top: "50%",
            right: 10,
            transform: "translateY(-50%)",
            color: "#FFFFFF",
            backgroundColor: "transparent",
          }}
        >
          <KeyboardArrowDownIcon />
        </IconButton>
      </CustomFormControl>
    </Box>
  );
}
