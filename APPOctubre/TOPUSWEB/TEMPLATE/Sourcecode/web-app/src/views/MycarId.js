import React, { useState, useEffect, useRef } from "react";
import Container from "@mui/material/Container";
import { makeStyles } from '@mui/styles';
import carnet from '../assets/img/cardidrider.png'
import { api } from "common";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import {
    Typography,
    Box,
    Button
} from "@mui/material";
import AttachEmailIcon from '@mui/icons-material/AttachEmail';
import PersonIcon from '@mui/icons-material/Person';
import CallIcon from '@mui/icons-material/Call';
import OfflineShareIcon from '@mui/icons-material/OfflineShare';
import BadgeIcon from '@mui/icons-material/Badge';
import html2pdf from 'html2pdf.js';

const useStyles = makeStyles((theme) => ({
    mainContainer: {
        marginTop: theme.spacing(4),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    formContainer: {
        backgroundImage: `url(${carnet})`,
        width: '100%',
        height: 1170,
        maxWidth: 600,
        marginBottom: theme.spacing(2),
        border: '2px solid #F20505',
        boxShadow: theme.shadows[5],
        borderRadius: "8px",
        backgroundSize: 'cover',
    },


}));

const MycarId = () => {
    const { id } = useParams();
    const { fetchUsersOnce } = api;
    const classes = useStyles();
    const dispatch = useDispatch();
    const staticusers = useSelector((state) => state.usersdata.staticusers);
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const loaded = useRef(false);


    useEffect(() => {
        dispatch(fetchUsersOnce());
    }, [dispatch, fetchUsersOnce]);

    useEffect(() => {
        if (staticusers) {
            const user = staticusers.filter(
                (user) => user.id === id.toString() && user.usertype === "customer"
            )[0];
            if (!user) {
                navigate("/404");
            }
            setData(user);
        } else {
            setData([]);
        }
        loaded.current = true;
    }, [staticusers, id, navigate]);




    const handleDownloadPDF = () => {
        const element = document.getElementById('summary'); // Elemento que se convertirá a PDF
        const opt = {
            margin: 1,
            filename: 'carnet.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'legal', orientation: 'portrait' } // Cambiamos el formato a 'legal'
        };
        html2pdf().set(opt).from(element).save(); // Convierte el elemento a PDF y lo descarga
    };



    return (
        <Container className={classes.mainContainer}>
            <div className={classes.formContainer} id="summary">
                <div style={{ marginTop: 320, marginLeft: 300 }}>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <img
                            src={data.profile_image}
                            alt="Profile"
                            style={{
                                width: 200,
                                height: 200,
                                borderRadius: "99px",
                            }}
                        />
                    </div>
                </div>


                <div style={{ width: '100%', display: 'flex', margin: 30, alignItems: 'flex-start', flexDirection: 'column', marginLeft: 60 }} >
                    <Typography
                        style={{
                            color: "black",
                            textAlign: "center",
                            fontSize: 22,
                            fontWeight: "bold",
                        }}
                    >
                        <PersonIcon /> {'  '}
                        {data?.firstName + ' ' + data?.lastName}
                    </Typography>


                    <Typography
                        style={{
                            color: "black",
                            textAlign: "center",
                            fontSize: 22,
                            fontWeight: "bold",
                        }}
                    ><AttachEmailIcon /> {'  '}
                        {data?.email}
                    </Typography>

                    <Typography
                        style={{
                            color: "black",
                            textAlign: "center",
                            fontSize: 22,
                            fontWeight: "bold",
                        }}
                    ><CallIcon /> {' '}
                        {data?.mobile}
                    </Typography>
                    <Typography
                        style={{
                            color: "black",
                            textAlign: "center",
                            fontSize: 22,
                            fontWeight: "bold",
                        }}
                    ><OfflineShareIcon /> {' '}
                        {data?.referralId}
                    </Typography>

                    <Typography
                        style={{
                            color: "black",
                            textAlign: "center",
                            fontSize: 22,
                            fontWeight: "bold",
                        }}
                    > <BadgeIcon /> {' '}
                        {data?.docType + '-' + data?.verifyId}
                    </Typography>




                </div>
            </div>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button variant="contained" color="error" onClick={handleDownloadPDF}>
                    Descargar carnet
                </Button>
            </Box>
        </Container>
    );
}

export default MycarId;
