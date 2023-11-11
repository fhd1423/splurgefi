import React from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export default function Trade() {
  const labelStyle = {
    backgroundColor: "#50D890",
    color: "white",
    padding: "6px 12px",
    borderRadius: "20px",
    fontWeight: "bold",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const pendingStyle = {
    ...labelStyle,
    backgroundColor: "transparent",
    border: "1px solid white",
  };

  return (
    <Paper
      style={{
        padding: "16px",
        backgroundColor: "#1B1B1B",
        color: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
        width: "100%", // Set to 100% to use full width of the parent
        maxWidth: "1090px", // Adjust the max-width to fit your design needs
        marginLeft: 0,
        marginRight: 0,
      }}
    >
      <Grid container justifyContent="space-between" alignItems="center">
        {/* Left section with labels */}
        <Grid item xs={9} sm={9} md={10} lg={10}>
          <Typography
            variant="h5"
            style={{ fontWeight: "bold", paddingBottom: "16px" }}
          >
            WETH → JOE
          </Typography>
          <Grid container alignItems="center" spacing={1}>
            <Grid item>
              <Typography style={labelStyle}>5 Batches</Typography>
            </Grid>
            <Grid item>
              <Typography style={labelStyle}>+5%</Typography>
            </Grid>
            <Grid item>
              <Typography style={labelStyle}>11/25/2023</Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* Right section with pending status */}
        <Grid item xs={3} sm={3} md={2} lg={2}>
          <Typography style={{ ...pendingStyle, textAlign: "right" }}>
            Pending (2/5)
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
