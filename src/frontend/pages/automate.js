"use client";
import React from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import CustomToggle from "../components/CustomToggle";
import CustomInputToken from "../components/CustomInputToken";

// Define your custom styles using Material-UI's makeStyles hook
const useStyles = makeStyles((theme) => ({
  paper: {
    backgroundColor: '#2B2B2B', // Your modal's background color
    padding: theme.spacing(2), // You can adjust the padding as needed
    color: theme.palette.text.primary,
  },
  // Add additional styles for your grid and components as needed
}));

export default function StepOne() {

    const classes = useStyles();

    // Sample options for testing
    const tokenOptions = [
        { label: "WETH", value: "WETH" },
        { label: "JOE", value: "JOE" },
    ];

    // State for toggleSelector 
    const [toggleSelection, setToggleSelection] = useState('buy');


    // Handlers to update the state
    const handleInputTokenChange = (value) => {
        // console.log("Input Token Value:", value); 
        setInputTokenValue(value);
    };

    const handleInputTokenSelect = (token) => {
        // console.log("Input Token Selected:", token); 
        setInputToken(token);
    };

    return (
        <Paper className={classes.paper}>
            <Grid container spacing={2}> {/* Adjust spacing as needed */}
            <Grid item xs={12}>
                <CustomToggle selection={toggleSelection} setSelection={setToggleSelection}/>
            </Grid>
            <Grid item xs={6}>
                <CustomInputToken
                    title="Input Token"
                    options={tokenOptions}
                    onValueChange={handleInputTokenChange}
                    onSelectChange={handleInputTokenSelect}
                />
            </Grid>
            <Grid item xs={6}>
                {/* Output Token component */}
            </Grid>
            <Grid item xs={4}>
                {/* Percent Change component */}
            </Grid>
            <Grid item xs={4}>
                {/* Batches component */}
            </Grid>
            <Grid item xs={4}>
                {/* Average Price component */}
            </Grid>
            <Grid item xs={12}>
                {/* Automation Deadline component */}
            </Grid>
            <Grid item xs={12}>
                {/* Connect Wallet Button */}
            </Grid>
            </Grid>
        </Paper>
    );

}