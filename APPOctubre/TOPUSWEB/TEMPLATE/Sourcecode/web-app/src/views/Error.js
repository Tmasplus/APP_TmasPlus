import React from "react";
import { Link } from "react-router-dom";
import errorImg from "../assets/img/errorPage.png";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  errorStyle: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    flexDirection: "column",
  },
  contentStyle: {
    display: "flex",
    alignItems: "center",
  },
  imageStyle: {
    width: "200px",
    height: "200px",
    objectFit: "scale-down",
    marginRight: "20px",
  },
  messageContainerStyle: {
    borderLeft: "thick double #333",
    padding: "20px",
  },
  headingStyle: {
    fontSize: "36px",
    color: "#333",
  },
  messageStyle: {
    fontSize: "18px",
    color: "#555",
    margin: "20px 0",
  },
  linkStyle: {
    color: "#1E5BF7",
    textDecoration: "none",
    fontWeight: "bold",
  },
}));

const Error = () => {
  const classes = useStyles();
  return (
    <div className={classes.errorStyle}>
      <div className={classes.contentStyle}>
        <img src={errorImg} className={classes.imageStyle} alt="Error" />
        <div className={classes.messageContainerStyle}>
          <h1 className={classes.headingStyle}>Pagina no encontrada</h1>
          <p className={classes.messageStyle}>
           TREAS te informa que esta página no se encuentra disponible estamos trabajando para restablecer el servicio lo más pronto posible, si requieres asistencia escríbenos a nuestro WhatsApp +57 3118841054  
          </p>
          <Link to="/" className={classes.linkStyle}>
           Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Error;
