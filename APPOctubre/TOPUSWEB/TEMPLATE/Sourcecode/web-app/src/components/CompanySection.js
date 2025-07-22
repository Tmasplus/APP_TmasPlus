import React from 'react';
import { Grid, Typography, Box, Button } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import useStyles from '../styles/styles';
import { useTranslation } from "react-i18next";
import CarCrashOutlinedIcon from '@mui/icons-material/CarCrashOutlined';
import Empresarial from '../assets/img/Empresarial.png';

const CompanySection = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const sectionItems1 = [
    {
      id: 1,
      icon: <CarCrashOutlinedIcon style={{ color: 'red', fontSize: '30px', marginRight: 8 }} />,
      sentence1: t('pruduct_section_heading_3'),
      sentence: t('product_section_3'),
    },
    {
      id: 2,
      icon: <VerifiedIcon style={{ color: 'red', fontSize: '30px', marginRight: 8 }} />,
      sentence1: t('Marco legal y seguros'),
      sentence: t('Contarás con la tranquilidad de viajar protegido, con conductores y usuarios verificados'),
    },
  ];
  const handleOpenGmailClick = () => {
    const destinatario = 'procesos@treascorp.co'; // Reemplaza con la dirección de email a la que deseas enviar el correo
    const emailSubject = encodeURIComponent('Solicitud de registro a TREASAPP EMPRESARIAL');
    const emailBody = encodeURIComponent(`Gracias por preferirnos. Envíanos estos datos para iniciar tu proceso de registro:
  
  Razón social: 
  NIT: 
  Email administrador: 
  Nombre contacto empresa:
  Celular de contacto:

  Adjuntar cámara y comercio no mayor a 60 días
  RUT actualizado 
  Cédula de representante legal 
  
  Pronto nos comunicaremos contigo para que agendemos una cita y previamente te haremos llegar el contrato base y el formato de SARLAFT. 
  `);

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(destinatario)}&su=${emailSubject}&body=${emailBody}`;
    window.open(gmailUrl, '_blank');
  };
  return (
    <div>


      <Box sx={{ flexGrow: 1, minHeight: '350px', backgroundImage: `url(${Empresarial})`, backgroundSize: 'cover' }}>
        <Typography variant="h3" fontWeight={400} style={{ color: 'black', textAlign: 'center', padding: 35 }}>{t('Soluciones tecnológicas para Empresas / Hoteles')}</Typography>


        <Grid container className={classes.sectionGridContainer}>
          {sectionItems1.map((item, key) => {
            return (
              <Box
                key={key}
                xs={12}
                md={3.5}
                minHeight={150}

                className={classes.sectionGridItem1}
              >
                <div style={{ display: 'flex' }}>
                  {item.icon}
                  <div>
                    <Typography variant="h5" style={{ color: 'black', fontWeight: 'bold' }}>{item.sentence1}</Typography>
                    <Typography style={{ color: 'black' }} className={classes.aboutUsSubtitle}>{item.sentence}</Typography>
                  </div>
                </div>


              </Box>
            )
          })}


        </Grid>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px' }}  >
          <Button
            variant="contained"
            color="error"
            sx={{ width: '250px', fontSize: '16px', marginTop: 3 }}
            onClick={handleOpenGmailClick}
          >
            {'Enviar Registro'}
          </Button>
        </div>
      </Box>
    </div>
  );
};

export default CompanySection;