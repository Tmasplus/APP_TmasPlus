import React, { useState, useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface AutocompleteInputProps {
  onSelect: (address: string, lat: number, lng: number) => void;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ onSelect }) => {
  const [address, setAddress] = useState("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: "TU_API_KEY_DE_GOOGLE_MAPS",
      libraries: ["places"],
    });

    loader.load().then(() => {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    });
  }, []);

  const iniciarSession = () => {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
      console.log("Token de sesión iniciado:", sessionTokenRef.current);
    }
  };

  const manejarCambio = debounce((valor: string) => {
    iniciarSession();
    if (autocompleteServiceRef.current && valor.length > 3 && sessionTokenRef.current) {
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: valor,
          componentRestrictions: { country: "co" },
          sessionToken: sessionTokenRef.current,
        },
        (predicciones) => {
          setPredictions(predicciones || []);
        }
      );
    } else {
      setPredictions([]);
    }
  }, 300);

  const manejarSeleccionPrediccion = (prediccion: google.maps.places.AutocompletePrediction) => {
    setAddress(prediccion.description);
    setPredictions([]);

    if (!sessionTokenRef.current) {
      console.error("El token de sesión es nulo. No se puede continuar con getDetails.");
      return;
    }

    const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
    placesService.getDetails(
      {
        placeId: prediccion.place_id!,
        fields: ["geometry", "formatted_address"],
        sessionToken: sessionTokenRef.current,
      },
      (lugar, estado) => {
        if (estado === window.google.maps.places.PlacesServiceStatus.OK && lugar?.geometry) {
          const lat = lugar.geometry.location.lat();
          const lng = lugar.geometry.location.lng();
          onSelect(prediccion.description, lat, lng);
        } else {
          console.error("Error al obtener los detalles del lugar:", estado);
        }
        // Invalidar el token después de obtener los detalles
        sessionTokenRef.current = null;
      }
    );
  };

  return (
    <div>
      <input
        type="text"
        value={address}
        onChange={(e) => {
          setAddress(e.target.value);
          manejarCambio(e.target.value);
        }}
        placeholder="Escribe una dirección"
        className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
      />
      {predictions.length > 0 && (
        <ul className="absolute bg-white border border-gray-300 rounded-md shadow-lg">
          {predictions.map((prediccion) => (
            <li
              key={prediccion.place_id}
              onClick={() => manejarSeleccionPrediccion(prediccion)}
              className="p-2 cursor-pointer hover:bg-gray-100"
            >
              {prediccion.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export default AutocompleteInput;
