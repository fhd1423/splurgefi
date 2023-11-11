import { Grid, Typography, useMediaQuery, useTheme } from "@mui/material";

const Graph = () => {
  // Access theme to use breakpoints
  const theme = useTheme();
  // Use media queries to adjust styles based on screen size
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <div
      className="mt-10 mb-44 px-4 sm:px-6 md:px-8"
      style={{
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      }}
    >
      <Grid container spacing={2} alignItems="center" justifyContent="center">
        {/* Text Section */}
        <Grid item xs={12} md={6}>
          {/* Pumpinator Heading */}
          <Typography
            variant={isMobile ? "h3" : "h2"}
            component="h2"
            style={{
              fontWeight: "bold",
              marginBottom: "20px",
              marginLeft: isMobile ? "10px" : "25px",
              color: "#50D890",
            }}
          >
            The Pumpinator
          </Typography>

          {/* Introductory Text */}
          <Typography
            variant={isMobile ? "h4" : "h3"}
            component="h3"
            style={{
              marginTop: "20px",
              marginBottom: "20px",
              marginLeft: isMobile ? "10px" : "25px",
            }}
          >
            Never miss a pump.
          </Typography>

          {/* Numbered Text Instructions */}
          <Typography
            variant={isMobile ? "h6" : "h5"}
            component="h5"
            style={{
              marginLeft: isMobile ? "10px" : "25px",
              marginTop: "10px",
              marginBottom: "20px",
            }}
          >
            Set your conditions:
          </Typography>
          <Typography
            variant={isMobile ? "body1" : "h5"}
            style={{ marginLeft: isMobile ? "20px" : "45px" }}
          >
            1. Trade 69,000 $JOE for $WETH
          </Typography>
          <Typography
            variant={isMobile ? "body1" : "h5"}
            style={{ marginLeft: isMobile ? "20px" : "45px" }}
          >
            2. 3 batches/tranches
          </Typography>
          <Typography
            variant={isMobile ? "body1" : "h5"}
            style={{
              marginLeft: isMobile ? "20px" : "45px",
              marginBottom: "10px",
            }}
          >
            3. Sell every time it pumps 10% above moving avg
          </Typography>

          {/* Outro Text */}
          <Typography
            variant={isMobile ? "h6" : "h5"}
            component="h5"
            style={{
              marginTop: "25px",
              marginLeft: isMobile ? "10px" : "25px",
            }}
          >
            Sit back and let us automate your gains. 💪
          </Typography>
        </Grid>
        {/* Image Section */}
        <Grid item xs={12} md={6}>
          <img
            src="/assets/Graph.png"
            alt="Chart"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              maxWidth: "100%",
              borderRadius: "8px",
            }}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default Graph;
