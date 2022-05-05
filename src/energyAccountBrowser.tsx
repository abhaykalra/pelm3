import * as React from "react";
import styled from 'styled-components';

// import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
// import CameraIcon from '@mui/icons-material/PhotoCamera';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { EnergyAccount } from './types'
import { FormControl, InputLabel, MenuItem } from "@mui/material";
import { EnergyAccountDetails } from "./energyAccountDetails";
import { Select  as Selectt } from '@chakra-ui/react'

type Props = {
    energyAccounts: EnergyAccount[];
    selectedEnergyAccount?: EnergyAccount;
    onEnergyAccountSelect: (selectedEnergyAccount: EnergyAccount) => void;
}





const theme = createTheme();

export const EnergyAccountBrowser = (props: Props) => {

    const onEnergyAccountSelect = (evt: SelectChangeEvent<number>) => {
        let id = evt.target.value;

        let acc = props.energyAccounts.find(acc => acc.id == id);

        props.onEnergyAccountSelect(acc!)
    }
 

    /* export const EnergyAccountBrowser = (props: Props) => {

        const onEnergyAccountSelect = (selectedEnergyAccount: EnergyAccount) => () => {
            props.onEnergyAccountSelect(selectedEnergyAccount)
        } */
    return <>
            {/* Hero unit */}
           
            <Container sx={{ py: 8 }} maxWidth="md">
            {/* End hero unit */}

            <Grid container spacing={1}>

           
               

            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Select Property</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={1}
                    label="Age"
                    onChange={onEnergyAccountSelect}

                >
                    {props.energyAccounts.map((account) => (
                        <MenuItem value={account.id}>{account.address}</MenuItem>
                    ))}
                </Select>
                
                </FormControl>
          
                </Grid>
            
            

            
            </Container>

            
            
        </>
}
