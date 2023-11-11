import { styled } from "@mui/material/styles";

const GradientText = styled("span")(() => ({
  background: `linear-gradient(to bottom, #50D890, #FFFFFF)`, // Gradient from #50D890 to white
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  display: "inline-block", // Ensures the gradient is only as wide as the text
}));

export default GradientText;
