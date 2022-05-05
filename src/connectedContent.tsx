import * as React from "react";
import styled from 'styled-components';

import {CLIENT_ID, CLIENT_SECRET, USER_ID, ENVIRONMENT} from './constants'

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
import { EnergyAccountBrowser } from "./energyAccountBrowser";
import { EnergyAccountDetails } from "./energyAccountDetails";

import { EnergyAccount } from './types'


type Props = {
    userId: string;
    accessToken: string;
}

type State = {
    energyAccounts: EnergyAccount[]
    selectedEnergyAccount?: EnergyAccount;
    selectedEnergyAccountUsageIntervals?: {};
}

const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const theme = createTheme();

export class ConnectedContent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            energyAccounts: [],
            selectedEnergyAccount: undefined
        }
    }

    componentDidMount() {
        const accessToken = this.props.accessToken
        const headers = new Headers();
        headers.set('Environment', ENVIRONMENT);
        headers.set('Authorization', 'Bearer ' + accessToken);
        headers.set('client_id', CLIENT_ID);
        headers.set('client_secret', CLIENT_SECRET);

        const requestOptions = {
            method: 'GET',
            headers
        };

        const url = 'https://api.pelm.com/users/' + this.props.userId + '/accounts'

        fetch(url, requestOptions)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.text().then(text => { throw new Error(text) })
                }
            })
            .then((data) => {
                console.log(data);
                const energyAccounts: EnergyAccount[] = [];

                data.forEach((element: any) => {

                    const parsedEnergyAccount = {
                        id: element['id'],
                        accountNumber: element['account_number'],
                        address: element['address'],
                        unit: element['unit']
                    }
                    energyAccounts.push(parsedEnergyAccount)
                });

                this.setState({
                    energyAccounts,
                })
            })
            .catch((error: Error) => {
                try {
                    const errorObject = JSON.parse(error.message);
                    console.log(errorObject)

                } catch(e) {
                    console.log("an error occurred")
                }
            });
    }

    onEnergyAccountSelect = (selectedEnergyAccount: EnergyAccount) => {
        console.log("selectedEnergyAccount: ")
        console.log(selectedEnergyAccount)
        this.setState({
            selectedEnergyAccount
        })
    }

    clearSelectedEnergyAccount = () => {
        this.setState({
            selectedEnergyAccount: undefined
        })
    }

    render() {
        return (
            <>
                <EnergyAccountBrowser energyAccounts={this.state.energyAccounts} onEnergyAccountSelect={this.onEnergyAccountSelect} />
                {this.state.selectedEnergyAccount &&
                    <EnergyAccountDetails 
                    energyAccount={this.state.selectedEnergyAccount!} 
                    accessToken={this.props.accessToken}
                    onBack={this.clearSelectedEnergyAccount}
                    />
                }
            </>
        )

        return this.state.selectedEnergyAccount
            ? <EnergyAccountDetails 
            energyAccount={this.state.selectedEnergyAccount!} 
            accessToken={this.props.accessToken}
            onBack={this.clearSelectedEnergyAccount}
            />
            : <EnergyAccountBrowser energyAccounts={this.state.energyAccounts} onEnergyAccountSelect={this.onEnergyAccountSelect} />
            
            
            
        
       
    }

}
 // return <ThemeProvider theme={theme}>
        //     <CssBaseline />
        //     <AppBar position="relative">
        //         <Toolbar>
        //         <Typography variant="h6" color="inherit" noWrap>
        //             Album layout
        //         </Typography>
        //         </Toolbar>
        //     </AppBar>
        //     <main>
        //         {children}
                
                
        //     </main>
        // </ThemeProvider>