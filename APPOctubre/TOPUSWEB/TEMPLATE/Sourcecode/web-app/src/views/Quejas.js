import React, { useState, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import {
    Container,
    TextField,
    Button,
} from '@mui/material';
import { useDispatch, useSelector } from "react-redux";
import { api } from 'common';
import { colors } from '../components/Theme/WebTheme';
import { Typography } from 'antd';

const useStyles = makeStyles((theme) => ({
    mainContainer: {
        marginTop: theme.spacing(4),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    formContainer: {
        width: '100%',
        maxWidth: 600,
        marginBottom: theme.spacing(2),
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        borderRadius: "8px",
    },
    formContainer2: {
        padding: theme.spacing(2, 4, 3),
    },
    submitButton: {
        margin: 0,
        width: '100%',
        height: 40,
        borderRadius: "30px",
        backgroundColor: colors.RED_TREAS,
        color: '#FFF',
    },
    complainItem: {
        marginBottom: theme.spacing(2),
        padding: theme.spacing(2),
        borderRadius: theme.spacing(1),
        boxShadow: theme.shadows[2],
    },
}));

export default function Complain() {
    const {
        editComplain
    } = api;
    const [state, setState] = useState({
        subject: '',
        body: '',
    });
    const classes = useStyles();
    const dispatch = useDispatch();
    const auth = useSelector((state) => state.auth);
    const complaindata = useSelector(state => state.complaindata.list);
    const [/*data*/, setData] = useState();



    useEffect(() => {
        if (complaindata && auth) {
            let arr = [];
            let uid = auth.profile.uid;
            for (let i = 0; i < complaindata.length; i++) {
                if (complaindata[i].uid === uid) {
                    arr.push(complaindata[i])
                }
            }
            setData(arr);
        } else {
            setData([]);
        }
    }, [complaindata, auth]);

    const handleChange = (event) => {
        setState({ ...state, [event.target.name]: event.target.value });
    };

    const handleSubmit = () => {
        if (auth.profile.mobile || auth.profile.email) {
            if (state.subject && state.body) {
                const obj = {
                    ...state,
                    uid: auth.profile.uid,
                    complainDate: new Date().getTime(),
                    firstName: auth.profile.firstName || '',
                    lastName: auth.profile.lastName || '',
                    email: auth.profile.email || '',
                    mobile: auth.profile.mobile || '',
                    role: auth.profile.usertype || '',
                };
                dispatch(editComplain(obj, "Add"));
                setState({
                    subject: '',
                    body: '',
                });
            } else {
                console.error('Missing details error');
            }
        } else {
            console.error('Email or phone not available');
        }
    };


    return (
        <Container className={classes.mainContainer}>
            <div className={classes.formContainer}>



                <div className={classes.formContainer2}>

                    <Typography variant="h1" gutterBottom>
                        Reporte de Quejas
                    </Typography>

                    <TextField
                        error
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="subject"
                        label="Asunto"
                        name="subject"
                        value={state.subject}
                        onChange={handleChange}
                    />
                    <TextField
                        error
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="body"
                        label="Escribe algo...."
                        name="body"
                        multiline
                        rows={4}
                        value={state.body}
                        onChange={handleChange}
                    />
                    <Button
                        variant="contained"
                        fullWidth
                        className={classes.submitButton}
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
                </div>
            </div>

        </Container>
    );
}
