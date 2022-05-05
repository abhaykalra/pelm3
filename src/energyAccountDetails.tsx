import * as React from "react";
import styled from 'styled-components';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush } from 'recharts';
import { LineChart, Line, Label } from 'recharts';

import {CLIENT_ID, CLIENT_SECRET, ENVIRONMENT} from './constants'

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
import { EnergyAccount } from './types'
import { Input, Flex, Image, Box as Boxx, Progress, Center, Spacer} from '@chakra-ui/react';
import LinearProgressWithLabel from '@mui/material/LinearProgress';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress, {
  CircularProgressProps,
} from '@mui/material/CircularProgress';

function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number },
) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
        variant="h4" component="h2"
          
          color="text.secondary"

        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

export default function CircularStatic() {
  const [progress, setProgress] = React.useState(10);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 10));
    }, 800);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return <CircularProgressWithLabel value={progress} />;
}


// app rn takes time from 6 to 6 last day and returns true or false on whether house can be run 
// what i want now is average of time from 6 to 6 last 10 days for this make multiple api class and mean it 

const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });
type Props = {
    energyAccount: EnergyAccount;
    accessToken: string;
    onBack: () => void;
}

type State = {
    intervalData?: number[];
    intervalDataNight?: number[];
    milestowork?: number;   // user input on how many miles they drive to and from work  
    consumption?: number;
    consumptionNight?: number;
    canRunHome?: boolean;
    renderCalculations?: boolean;
    usageList?: number[];
    usageListNight?: number[];
    usageListDay?: number[];
    fordPage?: boolean;
    canRun?: JSX.Element;
    canRunMessage?: JSX.Element;
  
}



const theme = createTheme();
export class EnergyAccountDetails extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            intervalData: undefined,
            intervalDataNight: undefined,    // this is a table with all the usage data but not sure how to use it to do calculations    
            milestowork: undefined,       // since it is undefined here?????     ----ASK SEBI-----
            consumption: 0,
            consumptionNight: 0,
            canRunHome: false,
            renderCalculations: false,
            usageList: [],
            usageListNight: [],
            usageListDay: [],
            fordPage: false,
            canRun: undefined,
            canRunMessage: undefined
        }
    }

    onChangeText(text: any){
        this.setState({
            milestowork: text
        })
    }

    componentWillReceiveProps(nextProps: Props) {
        if (nextProps.energyAccount != this.props.energyAccount) {
            this.setState({consumption: 0,
                consumptionNight: 0});
            this.fetchIntervalsNight()
        }
    }

    componentDidMount() {
        this.fetchIntervalsNight()
    }

    fetchIntervalsNight(startTimeStamp?: string, endTimeStamp?: string) {

        const usage_list_night: number[] = []
        const usage_list_day: number[] = []
        const StartTime = (Math.floor(new Date().setHours(0,0,0,0))/1000 - 24*60*60*10)
        const EndTime = (Math.floor(new Date().setHours(0,0,0,0))/1000)
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


        const url = 'https://api.pelm.com/accounts/' 
        + this.props.energyAccount.id 
        + '/intervals?' 
        + new URLSearchParams({
            ...(StartTime ? {'start_date': '' + StartTime} : null),
            ...(EndTime ? {'end_date': '' + EndTime} : null)
        })

        console.log(url);

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
                
                const intervalsNight = data['intervals']
                intervalsNight.forEach((interval: any) => {
                    interval['time'] = new Date(parseInt(interval['start']) * 1000).toLocaleString();
                    interval['timeDate'] = new Date(parseInt(interval['start']) * 1000);
                })
                var data_filter = intervalsNight.filter( (interval: any) => interval['timeDate'].getHours() >= 6 && interval['timeDate'].getHours() < 18)
                var data_filter_night = intervalsNight.filter( (interval: any) => interval['timeDate'].getHours() >= 18 || interval['timeDate'].getHours() < 6)
                let tSumNight = 0;
                let tSum = 0;
               
                
                console.log(data_filter_night);
                console.log(data_filter);
                data_filter_night.forEach((interval: any) => {
                    tSumNight += parseFloat(interval['usage']);
                });

                data_filter.forEach((interval: any) => {
                    tSum += parseFloat(interval['usage']);
                });

                usage_list_night.push(tSumNight);
                usage_list_day.push(tSum);

                this.setState({
                    usageListNight: [...usage_list_night]
                })
                this.setState({
                    usageListDay: [...usage_list_day]
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
        
        (() => {
        this.setState({
            intervalDataNight: undefined
        })
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

        // get date in unix from internet API 
        // then take time as 6am to 6pm in unix for today's date and then enter these as start and end 
        
    

        const url = 'https://api.pelm.com/accounts/' 
        + this.props.energyAccount.id 
        + '/intervals'

        fetch(url, requestOptions)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.text().then(text => { throw new Error(text) })
                }
            })
            .then((data) => {
                
                const intervalsNight = data['intervals']
                
                this.setState({
                    intervalDataNight: intervalsNight
                })

                this.calculateBoth();
                
            })
            .catch((error: Error) => {
                try {
                    const errorObject = JSON.parse(error.message);
                    console.log(errorObject)

                } catch(e) {
                    console.log("an error occurred")
                }
            });

        })();
    }



    /* fetchIntervals(startTimeStamp?: string, endTimeStamp?: string) {

        const usage_list: number[] = []
        for (let i = 1; i < 11; i++){
        const sixAmUnix = (Math.floor(new Date().setHours(6,0,0,0))/1000 - 24*60*60*i)
        const sixPmUnix = (Math.floor(new Date().setHours(17,0,0,0))/1000 - 24*60*60*i)
        const accessToken = this.props.accessToken
        const headers = new Headers();
        headers.set('Environment', ENVIRONMENT);
        headers.set('Authorization', 'Bearer ' + accessToken);
        headers.set('client_id', CLIENT_ID);
        headers.set('client_secret', CLIENT_SECRET);

        const requestOptions = {
            method: 'GET',
            headers
        }; */

        // get date in unix from internet API 
        // then take time as 6am to 6pm in unix for today's date and then enter these as start and end 

        /*const url = 'https://api.pelm.com/accounts/' 
            + this.props.energyAccount.id 
            + '/intervals' 
            + new URLSearchParams({
                ...(startTimeStamp ? {'startTimeStamp': startTimeStamp} : null),
                ...(endTimeStamp ? {'endTimeStamp': endTimeStamp} : null)
            })*/
        
    

        /* const url = 'https://api.pelm.com/accounts/' 
        + this.props.energyAccount.id 
        + '/intervals?' 
        + new URLSearchParams({
            ...(sixAmUnix ? {'start_date': '' + sixAmUnix} : null),
            ...(sixPmUnix ? {'end_date': '' + sixPmUnix} : null)
        })

        console.log(url);

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
                
                const intervals = data['intervals']
                intervals.forEach((interval: any) => {
                    interval['time'] = new Date(parseInt(interval['start']) * 1000).toISOString();
                })

                let tSum = 0;

                intervals.forEach((interval: any) => {
                    tSum += parseFloat(interval['usage']);
                });

                usage_list.push(tSum);

                this.setState({
                    usageList: [...usage_list]
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
        
        (() => {
        this.setState({
            intervalData: undefined
        })
        const accessToken = this.props.accessToken
        const headers = new Headers();
        headers.set('Environment', ENVIRONMENT);
        headers.set('Authorization', 'Bearer ' + accessToken);
        headers.set('client_id', CLIENT_ID);
        headers.set('client_secret', CLIENT_SECRET);

        const requestOptions = {
            method: 'GET',
            headers
        }; */

        // get date in unix from internet API 
        // then take time as 6am to 6pm in unix for today's date and then enter these as start and end 
        
    

        /* const url = 'https://api.pelm.com/accounts/' 
        + this.props.energyAccount.id 
        + '/intervals'

        fetch(url, requestOptions)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.text().then(text => { throw new Error(text) })
                }
            })
            .then((data) => {
                
                const intervals = data['intervals']
                
                this.setState({
                    intervalData: intervals
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

        })();
    }

}
 */


    calculateNight() {  

        const sum_of_usage_night = this.state.usageListNight!.reduce((a, b) => a + b, 0)
        const average_usage_night = sum_of_usage_night/10

        console.log(average_usage_night);
        this.setState({fordPage: false});
        this.setState({renderCalculations: true});
        const milescandrive = (131-average_usage_night)*2.4;
        const yes =  <Typography variant="h6" color="green" >           
                        Yes
                </Typography>;
        const no = <Typography variant="h6" color="red" >           
                No
        </Typography>;
        const yesmsg =  <Typography variant="h6" color="black" >           
        You can drive up to {milescandrive} miles after powering your house overnight.
                </Typography>;
        const nomsg =  <Typography variant="h6" color="black" >           
                You can't commute to and from work after running this property overnight
                        </Typography>;
            
        this.setState({consumptionNight: average_usage_night});
        console.log("calculate method")
        console.log(this)
        
 
        if (this.state.milestowork == null) return;
        if (131 - this.state.milestowork! * 0.5 - average_usage_night  > 0){  // this.consumption is the utility used  
                                                                 // i added a ! by copying already impplemented funs but what does it do 
            this.setState({canRunHome: true})
            this.setState({canRun: yes})
            this.setState({canRunMessage: yesmsg})
            
        } else {
            this.setState({canRunHome: false}) 
            this.setState({canRun: no})
            this.setState({canRunMessage: nomsg })
            
        }
        
    }

    calculate() {  

       


        const sum_of_usage = this.state.usageListDay!.reduce((a, b) => a + b, 0)
        const average_usage = sum_of_usage/10

        console.log(average_usage);
        this.setState({fordPage: false});
        this.setState({renderCalculations: true});
        this.setState({consumption: average_usage});
    
        
    }

    calculateBoth() {
        
        this.calculateNight();
        this.calculate();
    }

    useOnThis() {
        this.setState({fordPage: true});
    }

    renderCalculate() {
            return <Card
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h4" component="h2">
                    Percentage Required to Power this Property from 6am-6pm <br /> magic!!!
                </Typography>
                <Typography variant="h4" >
                can you run your home lmao: {this.state.canRunHome}
                </Typography>

                <Button
                    onClick={() => this.props.onBack()}
                    variant="contained"
                    sx={{'margin-top': '15px'}}
                >
                    Use Ford Intelligent Backup Power on this Property
                </Button>    
            </CardContent>
        </Card>;
    }

        
        

        
    

    //if calculate then this front end else that frontr end 
    
    renderFordWebpage() {
        return <Card
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'black'}}
        >
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h4" component="h2" align="center" color="white">
                EXPAND YOUR DEFINITION OF WHAT A TRUCK CAN BE
                </Typography>
                <Typography align="center" color="white">
                The Ford F-150 Lightning connects to 
                your house when it needs to power up, 
                but can seamlessly return the favor
                 without even the push of a button
                  if the lights go out with available
                   Ford Intelligent Backup Power. 
                    Best of all, you can monitor your truck’s 
                   status from just about anywhere with your phone.
                   </Typography>
            </CardContent>

            <CardContent sx={{ flexGrow: 1 }}> 
                <Typography gutterBottom variant="h4" component="h2" align="center" color="white">
                FORD INTELLIGENT BACKUP POWER 
                </Typography>

                <Flex justify="center" py="20px">
                    <img src="https://www.ford.com/is/image/content/dam/vdm_ford/live/en_us/ford/nameplate/f-150lightning/2022/collections/dm/22_FRD_F15_BEV_53754.tif?croppathe=1_21x9&wid=900&fit=crop&hei=385"></img>
                </Flex>
    
                <Typography align="center" color="white">
                Security and peace of mind are invaluable during severe weather and unpredictable events. That’s why Ford helps ensure you never have to worry about being left in the dark. The all-electric F-150 Lightning features available Ford Intelligent Backup Power that can provide full-home power for up to three days on a fully charged battery, or as long as 10 days if rationing power. Combined with the available 80-amp Ford Charge Station Pro, it’s an essential technology that you can count on when you need it most. 
                   </Typography>
                   <br/>
                   <Flex justify="center">
                   <Button
                    onClick={(e) => {
                        e.preventDefault();
                        window.location.href='https://www.ford.com/trucks/f150/f150-lightning/2022/features/intelligent-backup-power/';
                        }}
                    variant="contained"
                    sx={{'margin-top': '15px'}}
                >
                    Learn About Intelligent Backup Power
                </Button>  
                </Flex>

                   <Grid container spacing={2}>
  <Grid item xs={4}>
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'black' }}>
  <CardContent sx={{ flexGrow: 1 }}>
  <Flex justify="center" py="20px">
                    <img src="https://www.ford.com/is/image/content/dam/vdm_ford/live/en_us/ford/nameplate/f-150lightning/2022/collections/dm/22_FRD_F15_BEV_53780.tif?croppathe=1_3x2&wid=900&fit=crop&hei=600"></img>
                </Flex>
  <Typography variant="h5" color="white" align="center" >           
        TRUCK CHARGES UP 
    <br/><br/>
 </Typography>
 <Typography variant="h6" color="white" align="center" >      
 You get home and plug in your truck with the available 80-amp Ford Charge Station Pro. The F-150 Lightning charges using power from the grid.  <br/><br/>
  </Typography>
  
  </CardContent>
  </Card>
  </Grid>

  <Grid item xs={4}>
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'black' }}>
  <CardContent sx={{ flexGrow: 1 }}>
  <Flex justify="center" py="20px">
                    <img src="https://www.ford.com/is/image/content/dam/vdm_ford/live/en_us/ford/nameplate/f-150lightning/2022/collections/dm/22_FRD_F15_BEV_53760.tif?croppathe=1_3x2&wid=900&fit=crop&hei=600"></img>
                </Flex>
  <Typography variant="h5" color="white" align="center">           
        GRID GOES DOWN 
    <br/><br/>
 </Typography>
 <Typography variant="h6" color="white" align="center" >      
 But what happens when the power gets knocked out by a storm? No problem. The Ford F-150 Lightning is there to help. You can set Ford Intelligent Backup Power to automatically or manually kick in and power your home just like a generato  <br/><br/>
  </Typography>
 
  </CardContent>
  </Card>
  </Grid>
  
  <Grid item xs={4}>
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' , bgcolor: 'black'}}>
  <CardContent sx={{ flexGrow: 1 }}>
  <Flex justify="center" py="20px">
                    <img src="https://www.ford.com/is/image/content/dam/vdm_ford/live/en_us/ford/nameplate/f-150lightning/2022/collections/dm/22_FRD_F15_BEV_53781.tif?croppathe=1_3x2&wid=900&fit=crop&hei=600"></img>
                </Flex>
  <Typography variant="h5" color="white" align="center" >      
  F-150 LIGHTNING GOES TO WORK  <br/><br/>
  </Typography>
  <Typography variant="h6" color="white" align="center" >      
  With the ability to off-board up to 9.6 kW of peak energy, F-150 Lightning can provide full-home power for up to three days, or as long as ten days if power is rationed.  <br/><br/>
  </Typography>
  </CardContent>
  </Card>
  </Grid>
  
</Grid>

            </CardContent>
        </Card>;
    }
    
   

    renderAccountDetails() {
        return <Card
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h4" component="h2">
                    Account details
                </Typography>
                <Typography>
                Address: {this.props.energyAccount.address}
                </Typography>
                <Typography>
                Account number: {this.props.energyAccount.accountNumber}
                </Typography>
                <Button
                    onClick={this.useOnThis.bind(this)}
                    variant="contained"
                    sx={{'margin-top': '15px'}}
                >
                    Demo Ford Intelligent Backup Power on This Property
                </Button>    
            </CardContent>
        </Card>;
    }

    renderIntervals() {

        const content = !this.state.intervalData    //what is this ! before his ----ASK SEBI----
            ? <div>Loading</div>

        : <ResponsiveContainer width="100%" height="100%">
            <AreaChart
            // width={500}
            // height={400}
            data={this.state.intervalData!}
            margin={{
                top: 10,
                right: 30,
                left: 30,
                bottom: 0,
            }}
            >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time">
            </XAxis>
            <YAxis>
                <Label
                angle={270}
                position="left"
                style={{
                    textAnchor: 'middle',
                    fill: theme.palette.text.primary,
                    ...theme.typography.body1,
                }}
                >
                Usage (kWh)
                </Label>
            </YAxis>
            <Tooltip />
            <Area type="monotone" dataKey="usage" stroke="#8884d8" fill="#8884d8" />
            <Brush dataKey='name' height={30} stroke="#8884d8" startIndex={this.state.intervalData!.length - 25}/>
            </AreaChart>
        </ResponsiveContainer>

        return <Card
        sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}
        >
            <Typography align="center" gutterBottom variant="h4" component="h2">
                My usage
            </Typography>
            <Toolbar>
               
                </Toolbar>
            {content}
        </Card>
    }


    renderFordWebpageRest() {
    return <Card
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white'}}
        >
 <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h4" component="h2" align="center" color="black">
                DEMO INTELLIGENT BACKUP POWER ON YOUR PROPERTY
                </Typography>
         
                <Flex justify="center" py="10px">
                    <img src="https://uploads-ssl.webflow.com/61f32627b9a1ec019c3d7e40/61f9c3e33afdb97bc4e1851e_Code%20Example%201.png"></img>
                </Flex>
                <Typography align="center" color="black" marginRight={10} marginLeft={10}>
                Using Pelm’s API, we can calculate the percentage battery of the Ford F-150 Lightning needed to power your selected property during the day (6am-6pm) and at night (6pm-6am) as well as whether or not you can power your property overnight after commuting to and from work during the day. To proceed please enter the information below.
                   </Typography>
                   <br/>
                
            </CardContent>

            <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" color="black" align="center" marginRight={50} marginLeft={50}>
                Approximately how many miles do you drive to work and back every day:  
                </Typography>
                <br/>
           <Flex align='center' marginLeft={480}>
                <Input 
                variant='filled' placeholder='        Miles Driven' onChange = {e => this.setState({milestowork: parseInt(e.target.value)})}/>    
                <Button
                    onClick={this.calculateBoth.bind(this)}
                    variant="contained"
                    sx={{'margin-left': '15px'}}
                    
                >
                    Calculate
                </Button> 
               </Flex>
                
               
            
                
            </CardContent>
            </Card>
    
                  
                }


    
               

    render() {

        return (
            <>
                

               <Box
                            sx={{
                                bgcolor: 'grey',
                                pt: 8,
                                pb: 6,
                            }}
                        >
                            
                        
                            <Container sx={{ py: 1 }} maxWidth="lg">
                     
                        
                <Grid container spacing={1}>
                <Grid item xs={4} marginLeft={18}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                
                <Typography variant="h6" color="inherit" >           
                        % battery to power my house during the day
                    <br/>

                    

                </Typography>
                <br/>
                <br/>

                <Flex marginLeft={110}>
                <CircularProgressWithLabel size={100}
                        thickness={4} variant="determinate" value={Number(this.state.consumption)/131*100} />
                </Flex>
                <br/>
                <Flex >
                <Typography variant="h5" color="inherit" >
                Over the last 10 days
                , you used on average {Math.round(this.state.usageListDay![0]/10)} kWh 
                of electricity between 6am - 6pm local time.
                </Typography>
                </Flex>
                </CardContent>
                </Card>
                </Grid>

                

                <Grid item xs={4} marginLeft={11} >
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                
                <Typography variant="h6" color="inherit" >           
                        % battery to power my house during the night 
                    


                </Typography>
                <br/>
                <br/>
                <Flex marginLeft={110}>
                <CircularProgressWithLabel size={100}
                        thickness={4} variant="determinate" value={Number(this.state.consumptionNight)/131*100} />
                </Flex>
                <br/>
                <Flex >
                <Typography variant="h5" color="inherit" >
                Over the last 10 days
                , you used on average {Math.round(this.state.usageListNight![0]/10)} kWh 
                of electricity between 6pm - 6am local time.
                </Typography>
                </Flex>
                
                </CardContent>
                </Card>
                </Grid>
                
                
                
                </Grid>
                </Container>
                <br/>

                <Container sx={{ py: 8 }} maxWidth="md">
            {/* End hero unit */}

            

            <Grid container spacing={1}>

                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'row', width: '100%' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" color="inherit">      
                Can I get to work and back after powering my house overnight?
                
                </Typography>
                <br/>
                
            <Flex>
                <Box width={300}>
                    <Typography variant="h6" color="inherit">      
                    Input total number of 
                    miles <br/>
                    required for daily commute
                
                </Typography>
                <br/>
                <Spacer/>

                <Input 
                variant='filled' placeholder='        Miles Driven' onChange = {e => this.setState({milestowork: parseInt(e.target.value)})}/>    
                <br/>
                <Button
                    onClick={this.calculateBoth.bind(this)}
                    variant="contained"
                    
                >
                    Calculate
                </Button> 
               </Box>
               <Spacer/>
               <Box width={300}>
                <Typography variant="h4" color="inherit" align="center">      
                {this.state.canRun} <br/>
                </Typography>
                <Typography variant="h6" color="black">      
                {this.state.canRunMessage}
                </Typography>
                
                </Box>
                </Flex>
                </CardContent>
                </Card>
                </Grid>

                        </Container>
                    </Box>
                    
            </>
        )

        if (this.state.fordPage){
            return <>
            <Box
            sx={{
                bgcolor: 'black',
                pt: 8,
                pb: 6,
            }}
        >
            
        
        <Container maxWidth={false}>
        <Button
        
                        variant="contained"
                        onClick={() => this.props.onBack()}
                    >
                        Back 
                    </Button>
                    <br/>
            <Grid container spacing={3}>
                {/* Chart */}
            
                
                <Grid item xs={12}bgcolor="black">
                    {this.renderFordWebpage()}
                </Grid> <br/>
                </Grid>
                </Container>
                </Box>

            <Box
            sx={{
                bgcolor: 'white',
                pt: 8,
                pb: 6,
            }}>
                <Container maxWidth={false}>
        
            <Grid container spacing={3}>
                {/* Chart */}
            
                
                <Grid item xs={12}bgcolor="white">
                    {this.renderFordWebpageRest()}
                </Grid> <br/>
                </Grid>
                </Container>
                
                </Box>
                </>
            
        }
        
        if (this.state.renderCalculations){
            return <Box
            sx={{
                bgcolor: 'grey',
                pt: 8,
                pb: 6,
            }}
        >
            
        
        <Container maxWidth="lg">
        <Button
                        // variant="contained"
                        onClick={() => this.props.onBack()}
                    >
                        Back 
                    </Button>
           
  <Grid container spacing={2}>
  <Grid item xs={4}>
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
  <CardContent sx={{ flexGrow: 1 }}>
  
  <Typography variant="h6" color="inherit" >           
        % battery to power my house during the day 
    <br/>

    

 </Typography>
 <br/>
 <br/>

 <Flex marginLeft={110}>
 <CircularProgressWithLabel size={100}
        thickness={4} variant="determinate" value={Number(this.state.consumption)/131*100} />
  </Flex>
  </CardContent>
  </Card>
  </Grid>

  <Grid item xs={4}>
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
  <CardContent sx={{ flexGrow: 1 }}>
  
  <Typography variant="h6" color="inherit" >      
{this.state.canRun} <br/>
  </Typography>
  
  </CardContent>
  </Card>
  </Grid>

  <Grid item xs={4}>
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
  <CardContent sx={{ flexGrow: 1 }}>
  
  <Typography variant="h6" color="inherit" >           
        % battery to power my house during the night 
    


 </Typography>
 <br/>
 <br/>
 <Flex marginLeft={110}>
 <CircularProgressWithLabel size={100}
        thickness={4} variant="determinate" value={Number(this.state.consumptionNight)/131*100} />
  </Flex>
 
  </CardContent>
  </Card>
  </Grid>
  
  
  
</Grid>

        </Container>
    </Box>

        }
        return <Box
            sx={{
                bgcolor: 'background.paper',
                pt: 8,
                pb: 6,
            }}
        >
        
    
        <Container maxWidth="lg">
            <Grid container spacing={3}>
                {/* Chart */}
                <Grid item xs={12}>
                    <Button
                        // variant="contained"
                        onClick={() => this.props.onBack()}
                    >
                        Back 
                    </Button>

                    

        

                </Grid>
                <Grid item xs={12}>
                    {this.renderAccountDetails()}
                </Grid>
            
            
            
            </Grid>
            
        </Container>
    </Box>
    }
}