import React, { useState } from 'react';
import { Card, CardContent, Typography, Avatar, Grid, IconButton, TextField, Button } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { api } from 'common';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Employees = () => {
    const { updateProfile } = api;
    const auth = useSelector(state => state.auth);
    const dispatch = useDispatch();

    const [editMode, setEditMode] = useState(false);
    const [editedFields, setEditedFields] = useState({});
    const [editingSubuserId, setEditingSubuserId] = useState(null);

    const handleEdit = (subuserId) => {
        setEditMode(true);
        setEditingSubuserId(subuserId);
    };

    const handleSave = () => {
        // Verifica si auth.profile.subusers es un objeto y tiene al menos un elemento
        if (typeof auth.profile.subusers !== 'object' || Object.keys(auth.profile.subusers).length === 0) {
            console.error('auth.profile.subusers is either not an object or is empty');
            return;
        }

        const updatedSubusers = Object.keys(auth.profile.subusers).map(subuserId => {
            const subuser = auth.profile.subusers[subuserId];
            if (subuser.id === editingSubuserId) {
                // Actualiza los campos del subusuario según el estado editedFields
                return {
                    ...subuser,
                    Name: editedFields.Name || subuser.Name,
                    email: editedFields.email || subuser.email,
                    password: editedFields.password || subuser.password
                };
            } else {
                return subuser;
            }
        });

        // Llama a la función de actualización del perfil con los subusuarios actualizados
        dispatch(updateProfile({
            ...auth.profile,
            subusers: updatedSubusers.reduce((acc, subuser) => {
                acc[subuser.id] = subuser;
                return acc;
            }, {}),
        }));

        // Restablece el estado de editedFields, editMode y editingUserId después de guardar los cambios
        setEditedFields({});
        setEditMode(false);
        setEditingSubuserId(null);
    };



    const handleDelete = (subuserId) => {
        const updatedSubusers = auth.profile.subusers.filter(subuser => subuser.id !== subuserId);
        dispatch(updateProfile({
            ...auth.profile,
            subusers: updatedSubusers,
        }));
    };

    const handleChange = (fieldName, value) => {
        setEditedFields(prevState => ({
            ...prevState,
            [fieldName]: value
        }));
    };

    return (
        <div style={{
            height: '100vh',
            width: '100%',
            backgroundImage: `url(https://firebasestorage.googleapis.com/v0/b/treasupdate.appspot.com/o/foundWebTemporal.jpg?alt=media&token=00f6bc40-0a36-4994-98c2-57676a229025)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}>
            
            <Grid container spacing={3}>
                {Object.values(auth.profile.subusers).map((subuser, index) => (
                    <Grid item xs={6} sm={6} md={4} key={index}>
                        <Card  >
                            <CardContent >
                                <Avatar style={{ width: 100, height: 100, margin: 10 }} src={subuser.profile_image ? subuser.profile_image : require("./../assets/img/profilePic.png").default} />
                                <Typography variant="h5" component="div">
                                    {editMode && editingSubuserId === subuser.id ? (
                                        <>
                                            <TextField
                                                value={editedFields.Name || subuser.Name}
                                                onChange={(e) => handleChange('Name', e.target.value)}
                                                label='Nombre'
                                            />

                                        </>
                                    ) : (
                                        `${'Nombre: ' + subuser.Name}`
                                    )}
                                </Typography>
                                <Typography variant="body2">
                                    {editMode && editingSubuserId === subuser.id ? (
                                        <TextField
                                            value={editedFields.email || subuser.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            label='Email'
                                        />
                                    ) : (
                                        'Email: ' + subuser.email
                                    )}
                                </Typography>
                                <Typography variant="body2">
                                    {editMode && editingSubuserId === subuser.id ? (
                                        <TextField
                                            value={editedFields.password || subuser.password}
                                            onChange={(e) => handleChange('password', e.target.value)}
                                            label='Contraseña'
                                        />
                                    ) : (
                                        'Contraseña: ' + subuser.password
                                    )}
                                </Typography>
                                <Typography variant="body2">
                                    {subuser.InTurn ? "En turno" : "Fuera de turno"}
                                </Typography>
                                {editMode && editingSubuserId === subuser.id ? (
                                    <Button onClick={handleSave}>Guardar</Button>
                                ) : (
                                    <IconButton onClick={() => handleEdit(subuser.id)}>
                                        <EditIcon />
                                    </IconButton>
                                )}
                                <IconButton onClick={() => handleDelete(subuser.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
}

export default Employees;
