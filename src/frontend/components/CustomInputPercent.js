import React from "react";
import { styled } from "@mui/system";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";

// Custom styles for the input container
const CustomInputContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#1B1B1B",
  borderRadius: "10px",
  width: "160px",
  height: "90px",
  padding: "0",
});

// Custom styles for the input component
const CustomInput = styled(InputBase)({
  color: "white",
  fontSize: "2rem",
  "& .MuiInputBase-input": {
    textAlign: "center",
    padding: "0",
    width: "100%",
    height: "100%",
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
