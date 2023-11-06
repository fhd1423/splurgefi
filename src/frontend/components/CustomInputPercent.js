import React from "react";
import { styled } from "@mui/system";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";

// Custom styles for the input container
const CustomInputContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center", // Center the child horizontally and vertically
  backgroundColor: "#1B1B1B",
  borderRadius: "10px",
  width: "160px", // Fixed width as requested
  height: "90px", // Fixed height as requested
  padding: "0", // No padding, as the input will dictate the content size
});

// Custom styles for the input component
const CustomInput = styled(InputBase)({
  color: "white",
  fontSize: "2rem", // Large font size for better visibility
  "& .MuiInputBase-input": {
    textAlign: "center", // Center the text inside the input
    padding: "0", // Remove padding to prevent misalignment
    width: "100%", // Input should fill the container width
    height: "100%", // Input should fill the container height
  },
});

export default function CustomInputPercent({ title }) {
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
        <CustomInput placeholder="0%" />
      </CustomInputContainer>
    </div>
  );
}
