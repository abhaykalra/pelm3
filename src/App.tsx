import * as React from "react";
import styled from 'styled-components';

import {CLIENT_ID, CLIENT_SECRET, USER_ID, ENVIRONMENT} from './constants'

import { v4 as uuidv4 } from 'uuid';

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

import { ConnectButton } from './connectButton'
import { ConnectedContent } from "./connectedContent";
import { Config, useConnect } from "react-pelm-connect";
import logo from './logo.jpeg';
import { Center, Flex } from "@chakra-ui/react";


type State = {

    isLoading: boolean;
    error?: string;
    connectToken?: string;
    accessToken?: string;
}

const theme = createTheme();
const userId = uuidv4();

export class App extends React.Component<{}, State> {

    constructor() {
        super({})

        this.state = {
            isLoading: true,
            error: undefined,
            connectToken: undefined,
            accessToken: undefined,
            // accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJhdXRoLXNlcnZlciIsImV4cCI6MTY0NTc0NzUwMy4wNTgwMDg0LCJ1c2VyIjoiMmQxZGEyMmYtYjhhNi00MTQ3LWI1OGMtMDdlMDIwOGJmOWJmIiwiY2xpZW50X2lkIjoiZmI2M2NhYzAtMGEyNy00YzEwLThkMzUtZmY0NDIzYmZhOGJiIn0.NU9jDHPPoqE7SxsSG8LtZRYjW6HWi_RWGkzxGhUd4D7bSm1LzU1M5c-cvTBwRZhPLsdI7o70j-ZNgJzPSBHIZxDEdvIK254eNk2wSpUrnh9S-BY08WoykSKXjQV9SkK8kszu3CiUkui0WTs0NgWWdI7gVgzk9dFs1vrfqL2A8J-2ycu--oGdVadC9VCjoirh8M6SGTsIvQSj2syQgsvuzf_gGk3taryPywm4LDn4T6cQYcjh5zXdSiyO7rVeEzpzaUenfYxPnPsKfZd3pNua0GSPhym1u9ZIPGYVomaDht4-B3ZPHcdACLPdH_F__1qYvOoyuxaFv98VXzIHWlUnJA'
        }
    }

    componentDidMount(): void {
        this.generateConnectToken(userId)
    }

    /*
        We're requeseting the connect_token here for simplicity.
        In an ideal world, you would make this request from your server and then pass the token to your client.
    */
    generateConnectToken(userId: string) {
        this.setState({ isLoading: true })

        const headers = new Headers();
        headers.set('Environment', ENVIRONMENT);
        headers.set('client_id', CLIENT_ID);
        headers.set('client_secret', CLIENT_SECRET);

        const data = new FormData();
        // data.append('user_id', USER_ID)
        data.append('user_id', userId)

        const requestOptions = {
            method: 'POST',
            headers,
            body: data,
        };

        fetch('https://api.pelm.com/auth/connect-token', requestOptions)
        // fetch('http://127.0.0.1:5000/auth/connect-token', requestOptions)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.text().then(text => { throw new Error(text) })
                }
            })
            .then((data) => {
                this.setState({
                    isLoading: false,
                    connectToken: data['connect_token']
                })
            })
            .catch((error: Error) => {
                try {
                    this.setState({
                        isLoading: false,
                        error: error.message
                    })
                    const errorObject = JSON.parse(error.message);
                    console.log(errorObject)
                } catch(e) {
                    console.log("an error occurred")
                }
            });
    }

    /*
        We're requeseting the access_token here for simplicity.
        In an ideal world, you would pass this authorizationCode to your server, which would then:
        1. use the authorizationCode to get an access_token and refresh_token
        2. save the access_token and refresh_token to your db
        3. use the access_token to make requests for a given user's energy data
    */
    generateAccessToken(authorizationCode: string) {
        this.setState({ isLoading: true })

        const headers = new Headers();

        headers.set('Environment', ENVIRONMENT);
        headers.set('client_id', CLIENT_ID);
        headers.set('client_secret', CLIENT_SECRET);

        const data = new FormData();
        data.append('grant_type', 'code')
        data.append('code', authorizationCode)

        const requestOptions = {
            method: 'POST',
            body: data,
            headers
        };

        fetch('https://api.pelm.com/auth/token', requestOptions)
        // fetch('http://127.0.0.1:5000/auth/token', requestOptions)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.text().then(text => { throw new Error(text) })
                }
            })
            .then((data) => {
                console.log("access_token")
                console.log(data['access_token'])

                this.setState({
                    isLoading: false,
                    accessToken: data['access_token']
                })
            })
            .catch((error: Error) => {
                try {
                    this.setState({
                        isLoading: false,
                        error: error.message
                    })
                    const errorObject = JSON.parse(error.message);
                    console.log(errorObject)
                } catch(e) {
                    console.log("an error occurred")
                }
            });
    }

    onSuccess = (authorizationCode: string) => {
        this.generateAccessToken(authorizationCode)
    }

    onExit = () => {
        console.log("exit")
    }

    renderConnectUtilityMessage() {
        const config: Config = {
            connectToken: this.state.connectToken!,
            onSuccess: this.onSuccess,
            onExit: this.onExit,
            environment: ENVIRONMENT,
        }
        return <Container>
                <Box sx={{ my: 4 }} >
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                    FORD INTELLIGENT BACKUP POWER CALCULATOR
                    </Typography>
                    <br/>
                    <br/>
                    <Typography variant="h6" align="justify" marginLeft={15} marginRight={15}>
                    The Ford F-150 Lightning connects to your house when it needs to charge, but it can seamlessly return the favor by powering your house. This creates a variety of use cases such as providing backup power during outages or storing excess solar power generated in the day to use at night. Learn more about Ford Intelligent Back Up Power here.
                    </Typography>
                    <br/>
                    <Typography variant="h6" align="justify" marginLeft={15} marginRight={15}>
                    This calculator uses your real energy data to provide detailed information about the Ford lightning’s ability to power your house such as:<br/>
                    <div>
                    <Typography variant="h6" align="justify" marginLeft={5}>
                    <ul>
                        <li>how much battery % is required to power your house during the day</li>
                        <li>how much battery % is required to power your house during the night</li>
                        <li>whether you can commute to work the next day after powering your house overnight</li>
                    </ul>
                    </Typography>
                    </div>
                <br/>
                Connect your utility account to get started.
                </Typography>
                    <br/>               
                    <Box marginLeft={60}>
                    <ConnectButton config={config}/>
                    </Box>
                </Box>
            </Container>
    }

    render(): React.ReactNode {
        if (this.state.isLoading) {
            return "Loading"
        }

        if (this.state.error) {
            return "Error: " + this.state.error
        }

        const children = this.state.accessToken
            ? <ConnectedContent accessToken={this.state.accessToken!} userId={userId}/>
            : this.renderConnectUtilityMessage()
        
        

        return <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppBar position="relative">
                <Toolbar>
                <Flex  marginRight={25}>
                <img src="https://bookface-images.s3.amazonaws.com/logos/88b5b5bde795ed7c4807f44c49234937475d1a8f.png" alt="Cinque Terre" width="100" height="300" ></img>
                </Flex>
                  
                <img src="https://www.carlogos.org/car-logos/ford-logo-2003.png" alt="Cinque Terre" width="100" height="300"></img>
               
                
               
         

                    
             
                </Toolbar>
            </AppBar>
            <main>
                <>
                {children}
                <CssBaseline />

              
        
    
                </>
            </main>
        </ThemeProvider>

        
    }
}