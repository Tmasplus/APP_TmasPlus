import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, Grid, Modal, TextField, Card, CardContent } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { api } from 'common';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

const SubUsers = () => {
    const { updateProfile, signOff } = api;
    const auth = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEmployeeName, setNewEmployeeName] = useState('');
    const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
    const [newEmployeePassword, setNewEmployeePassword] = useState('');
    const navigate = useNavigate();
    const subusers = auth.profile.subusers ?? {};
    const [turnStarted, setTurnStarted] = useState(false); // Estado para controlar si se inició el turno

    useEffect(() => {

        const inTurnSubuser = Object.values(auth.profile.subusers).find(subuser => subuser.InTurn);
        if (inTurnSubuser) {
            setSelectedEmployee(inTurnSubuser.Name);
            setTurnStarted(true);
        }
    }, [auth.profile.subusers]);

    const LogOut = () => {
        dispatch(signOff());
    };

    const startCountdown = () => {
        let secondsRemaining = 8 * 60 * 60; // 8 horas en segundos

        const countdownInterval = setInterval(() => {
            secondsRemaining--;

            if (secondsRemaining <= 0) {
                clearInterval(countdownInterval);
                LogOut(); // Cerrar sesión automáticamente
            }
        }, 1000); // Actualizar cada segundo
    };


    const handleStartTurn = () => {
        const selectedSubuser = Object.values(auth.profile.subusers).find(subuser => subuser.Name === selectedEmployee);

        const currentTime = new Date();
        const shiftTime = currentTime.toLocaleTimeString();

        const updatedSubusers = Object.values(auth.profile.subusers).map(subuser => ({
            ...subuser,
            InTurn: subuser.id === selectedSubuser.id,
        }));

        dispatch(updateProfile({
            ...auth.profile,
            subusers: updatedSubusers,

        }));

        setTurnStarted(true);

        notification.success({
            message: 'Turno iniciado',
            description: `Turno iniciado para ${selectedEmployee} a las ${shiftTime}`,
            placement: 'bottomRight',
        });
        startCountdown()
    };

    const handleCancelTurn = () => {
        const activeSubuser = Object.values(auth.profile.subusers).find(subuser => subuser.InTurn);

        const updatedSubusers = Object.values(auth.profile.subusers).map(subuser => ({
            ...subuser,
            InTurn: subuser.id === activeSubuser.id ? false : subuser.InTurn,
        }));

        dispatch(updateProfile({
            ...auth.profile,
            subusers: updatedSubusers,
        }));
        LogOut();
    };

    const handleCreate = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const generateUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (char) {
            // Genera un número aleatorio entre 0 y 15
            const randomNumber = Math.floor(Math.random() * 16);
            // Define el valor del carácter de reemplazo según el valor de 'char'
            const replacementChar = char === 'x' ? randomNumber : (randomNumber & 0x3 || 0x8);
            // Convierte el valor a hexadecimal y lo devuelve
            return replacementChar.toString(16);
        });
    };
    
    const handleCreateEmployee = () => {
        const uid = generateUID();
        const newEmployee = {
            id: uid,
            Name: newEmployeeName,
            email: newEmployeeEmail,
            password: newEmployeePassword,
            InTurn: false
        };
        dispatch(updateProfile({
            ...auth.profile,
            subusers: {
                ...auth.profile.subusers,
                [uid]: newEmployee
            }
        }));
        handleCloseModal();
    };


    const handleValidatePassword = () => {
        const selectedSubuser = Object.values(auth.profile.subusers).find(subuser => subuser.Name === selectedEmployee);

        // Verificar si la contraseña ingresada coincide con la contraseña del empleado seleccionado
        if (selectedSubuser.password === newEmployeePassword) {
            handleStartTurn(); // Iniciar el turno si la contraseña es correcta
        } else {
            // Mostrar una notificación o mensaje de error si la contraseña no coincide
            notification.error({
                message: 'Error',
                description: 'La contraseña ingresada no es válida',
                placement: 'bottomRight',
            });
        }
    };


    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundImage: 'url(https://source.unsplash.com/random?city+street+night)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {Object.keys(subusers).length === 0 ? ( // Verifica si subusers está vacío
                <Box sx={{ width: '400px', p: 4, boxShadow: 1, borderRadius: 2, bgcolor: 'background.paper' }}>
                    <Typography variant="h5" gutterBottom align="center" color="error">
                        Bienvenido a {auth.profile.bussinesName}
                    </Typography>
                    <Typography variant="body1" gutterBottom align="center" color="error">
                        No hay subusuarios registrados en esta empresa.
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ width: '400px', p: 4, boxShadow: 1, borderRadius: 2, bgcolor: 'background.paper' }}>
                    <Typography variant="h5" gutterBottom align="center" color="error">
                        Iniciar Turno en {auth.profile.bussinesName}
                    </Typography>
                    <FormControl fullWidth sx={{ mt: 2 }} color="error">
                        <InputLabel id="employee-label">Empleado</InputLabel>
                        <Select
                            labelId="employee-label"
                            id="employee-select"
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                        >
                            {Object.values(auth.profile.subusers).map((subuser, index) => (
                                <MenuItem key={index} value={subuser.Name}>
                                    {subuser.Name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mt: 3 }} color="error">
                        <InputLabel id="start-time-label">Contraseña</InputLabel>
                        <TextField
                            id="employee-password"
                            type="password"
                            value={newEmployeePassword}
                            onChange={(e) => setNewEmployeePassword(e.target.value)}
                        />
                    </FormControl>
                    <Box sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Button variant="contained" fullWidth color="error" onClick={handleValidatePassword}>
                                    Iniciar Turno
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button variant="outlined" fullWidth color="error" onClick={handleCancelTurn} >
                                    Cerrar Turno
                                </Button>
                            </Grid>
                        </Grid>

                    </Box>

                    {auth.profile.AccessSubUsers && (
                        <Box sx={{ mt: 3 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Button variant="contained" fullWidth color="error" onClick={handleCreate}>
                                        Crear Empleados
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {selectedEmployee && turnStarted && (
                        <Box sx={{ mt: 3 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Empleado Activo
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedEmployee}
                                    </Typography>
                                    <Button variant="contained" fullWidth color="error" onClick={() => navigate('/bookings')}>
                                        Reservas
                                    </Button>
                                </CardContent>
                            </Card>
                        </Box>
                    )}

                </Box>
            )}


            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                aria-labelledby="create-employee-modal"
                aria-describedby="create-employee-form"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        border: '2px solid #000',
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Typography id="create-employee-modal" variant="h6" gutterBottom align="center">
                        Crear Empleado
                    </Typography>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <TextField
                            id="new-employee-name"
                            label="Nombre"
                            value={newEmployeeName}
                            onChange={(e) => setNewEmployeeName(e.target.value)}
                        />
                    </FormControl>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <TextField
                            id="new-employee-email"
                            label="Email"
                            value={newEmployeeEmail}
                            onChange={(e) => setNewEmployeeEmail(e.target.value)}
                        />
                    </FormControl>

                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <TextField
                            id="new-employee-password"
                            label="Contraseña"
                            type="password"
                            value={newEmployeePassword}
                            onChange={(e) => setNewEmployeePassword(e.target.value)}
                        />
                    </FormControl>

                    <Box sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Button variant="contained" fullWidth color="error" onClick={handleCreateEmployee}>
                                    Crear
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button variant="outlined" fullWidth color="error" onClick={handleCloseModal}>
                                    Cancelar
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}

export default SubUsers;
