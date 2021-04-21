import { Box, FormControl, FormHelperText, InputLabel, LinearProgress, Select, TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import CustomizedDialogs from './DialogBox';

const REGEX_EMAIL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const REGEX_PHONE = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  inputs: {
    margin: '16px 0'
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

function getSteps() {
  return ['Give initial details', 'Submit Form'];
}

export default function HorizontalLabelPositionBelowStepper() {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();
  const [data, setData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    'ProductInterest__c': ''
  });
  const [errors, setErrors] = useState({ });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [modaldata, setModalData] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors({ ...errors, [name]: null });
    setData({ ...data, [name]: value });
  }

  const handleNext = () => {
    setErrors({});
    let tempErrors = {};

    Object.keys(data).forEach(name => {
      if (activeStep === 0 && name === 'email' && !REGEX_EMAIL.test(data[name])) {
        tempErrors = { ...tempErrors, [name]: 'Email is not valid'};
      }

      if (activeStep === 0 && (name === 'firstname' || name === 'lastname') && (data[name] === '')) {
        tempErrors = { ...tempErrors, [name]: `${name} is required`};
      }

      if(activeStep === 1 && (name ==='phone') && !REGEX_PHONE.test(data[name])) {
        tempErrors = { ...tempErrors, [name]: `Phone number is not valid`};
      }

      if(activeStep === 1 && (name === 'ProductInterest__c') && (data[name] === '')) {
        tempErrors = { ...tempErrors, [name]: `${name} is required`};
      }
    });

    setErrors(tempErrors);
    console.log('error', tempErrors);
    if (Object.keys(tempErrors).length === 0)
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleModal = () => {
    setOpen(true);
    setTimeout(() => {
      setOpen(false);
    }, 10000);
  }

  useEffect(() => {
    if(activeStep === steps.length) {
      setLoading(true);
      axios.post('https://login.salesforce.com/services/oauth2/token?'
        +'grant_type=password'
        +'&client_id=3MVG9Kip4IKAZQEXl.CBYyWAJ.hGnR5vp.T1JjD18UPAri6iZTlZxFqPfR5bJ2WEpSRsZxOsrIx.s4MZLi_Pg'
        +'&client_secret=2DDB1F12C6D4D7731267712AE0EB4B38CE948350EDD82AF240F3CDEB7771589A'
        +'&username=test@testAEM.com'
        +'&password=Mustafa1230ygDeqe4d0clQTOWDjcI5RROQ'
      ).then(function ({ data: responseData }) {
        console.log(responseData.access_token);
        const { firstname, lastname, email, phone } = data;
        console.log({
          firstname,
          lastname,
          email,
          'Phone': phone,
          'ProductInterest__c': data['ProductInterest__c'],
          'Company': 'abc'
        }, {
          headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${responseData.access_token}`
          }
        });
        return axios.post(`${responseData.instance_url}/services/data/v48.0/sobjects/Lead`, {
          firstname,
          lastname,
          email,
          'Phone': phone,
          'ProductInterest__c': data['ProductInterest__c'],
          'Company': 'abc'
        },
        {
          headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${responseData.access_token}`
          }
        }).then(res => {
          handleModal();
          setModalData({ status: 'Success', data: res })
        }).catch(err => {
          handleModal();
          setModalData({ status: 'Failure', data: err.response.data })
        }).finally(() => {
          setLoading(false);
        });
      })
    }
  }, [activeStep]);

  const getStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return (
          <Box p={4} display="flex" flexDirection="column">
          <TextField
            variant="outlined"
            name="firstname"
            placeholder="Enter your first name"
            value={data.firstname}
            onChange={handleChange}
            label="First Name"
            className={classes.inputs}
            helperText={errors.firstname}
            error={errors.firstname}
          />

          <TextField
            name="lastname"
            variant="outlined"
            placeholder="Enter your last name"
            onChange={handleChange}
            value={data.lastname}
            label="Last Name"
            className={classes.inputs}
            helperText={errors.lastname}
            error={errors.lastname}
          />

          <TextField
            name="email"
            variant="outlined"
            placeholder="Enter your email"
            onChange={handleChange}
            value={data.email}
            label="Email"
            className={classes.inputs}
            helperText={errors.email}
            error={errors.email}
          />
        </Box>
        )
      case 1:
        return (<Box p={4} display="flex" flexDirection="column">
          <TextField
            name="phone"
            type="tel"
            variant="outlined"
            fullWidth
            placeholder="Enter your phone number"
            onChange={handleChange}
            value={data.phone}
            label="Phone"
            className={classes.inputs}
            helperText={errors.phone}
            error={errors.phone}
          />

          <FormControl variant="filled" fullWidth className={classes.inputs}>
            <InputLabel htmlFor="filled-age-native-simple">How do you come to know about us?</InputLabel>
            <Select
              native
              value={data['ProductInterest__c']}
              onChange={handleChange}
              inputProps={{
                name: 'ProductInterest__c',
              }}
              error={errors['ProductInterest__c']}
            >
              <option aria-label="None" value="" />
              <option value="Google">Google</option>
              <option value="Fleetcor">Fleetcor</option>
              <option value="Friend">Friend</option>
            </Select>
            <FormHelperText style={{ color: 'red' }}>{errors['ProductInterest__c']}</FormHelperText>
          </FormControl>
        </Box>);
      default:
        return 'Unknown stepIndex';
    }
  }

  return (
    <div className={classes.root}>
      {loading && <LinearProgress />}
      {open && <CustomizedDialogs open={open} data={modaldata} />}
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div>
        {activeStep === steps.length ? (
          <div>
            <Typography className={classes.instructions}>Your data is submitted</Typography>
            <Button onClick={handleReset} disabled={loading}>Reset</Button>
          </div>
        ) : (
          <div>
            <Typography className={classes.instructions}>{getStepContent(activeStep)}</Typography>
            <div>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                className={classes.backButton}
              >
                Back
              </Button>
              <Button variant="contained" color="primary" onClick={handleNext} disabled={loading}>
                {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
