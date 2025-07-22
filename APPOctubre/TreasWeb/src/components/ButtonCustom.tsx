import React, { useState } from "react";
import styled from "styled-components";

const ButtonCustom = ({ confirmBooking }) => {
  const [isClicked, setIsClicked] = useState(false);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsClicked(true);
    confirmBooking(event); // Pasa el evento al manejador

    // Reinicia el botón después de 3 segundos
    setTimeout(() => {
      setIsClicked(false);
    }, 3000);
  };

  return (
    <StyledWrapper>
      <button className={`carbutton ${isClicked ? "clicked" : ""}`} onClick={handleClick}>
        <svg
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
          className="car"
        >
          <path d="M355.975 292.25a24.82 24.82 0 1 0 24.82-24.81 24.84 24.84 0 0 0-24.82 24.81zm-253-24.81a24.81 24.81 0 1 1-24.82 24.81 24.84 24.84 0 0 1 24.81-24.81zm-76.67-71.52h67.25l-13.61 49.28 92-50.28h57.36l1.26 34.68 32 14.76 11.74-14.44h15.62l3.16 16c137.56-13 192.61 29.17 192.61 29.17s-7.52 5-25.93 8.39c-3.88 3.31-3.66 14.44-3.66 14.44h24.2v16h-52v-27.48c-1.84.07-4.45.41-7.06.47a40.81 40.81 0 1 0-77.25 23h-204.24a40.81 40.81 0 1 0-77.61-17.67c0 1.24.06 2.46.17 3.67h-36z" />
        </svg>
        <div className="caption">SOLICITAR</div>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .carbutton {
    width: 220px; /* Botón un poco más grande */
    height: 50px; /* Reducir la altura para hacerlo más delgado */
    padding: 10px; /* Reducir el padding vertical */
    background: #F20505; /* Color rojo */
    display: flex;
    align-items: center;
    justify-content: space-between; /* Alinea el SVG y el texto a los lados */
    position: relative;
    transition: 0.2s ease-in-out;
border-radius: 16px;

    overflow: hidden;
  }

  .carbutton:hover {
    background: #cc0000; /* Color rojo más oscuro para el hover */
  }

  .caption {
    color: #e8e8e8;
    font-size: 16px;
    margin-left: 10px;
    transition: 0.2s;
  }

  .car {
    fill: #e8e8e8;
    width: 40px; /* SVG más grande */
    height: 40px;
    margin-right: 10px;
    transition: 0.2s ease-in-out;
    transform: translateX(0); /* Posición inicial del coche */
  }

  .carbutton.clicked .car {
    transform: translateX(150px); /* Mover el coche a la derecha cuando se hace clic */
  }

  .carbutton.clicked .caption {
    opacity: 0%; /* Ocultar el texto cuando el coche se mueve */
  }

  .carbutton:hover .car {
    opacity: 1;
  }
`;


export default ButtonCustom;
