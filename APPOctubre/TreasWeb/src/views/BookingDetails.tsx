import React, { useState } from 'react';
import { getDatabase, ref, query, orderByChild, startAt, endAt, get } from 'firebase/database';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Booking } from '../types';
import { Page, Text, View, Document, StyleSheet, Image, PDFDownloadLink } from '@react-pdf/renderer';
import Logo from '../assets/LogoNegroRojo1024x1024.png';
import RsmR1 from '../assets/rsmR1.png';
import RsmR2 from '../assets/rsmR2.png';
import RsmR3 from '../assets/rsmR3.png';
import moment from 'moment';
const BookingDetails: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  const placeholderImage = '/src/assets/1.png';  // Update this path to your placeholder image

  const searchBookingByReference = async (searchQuery: string) => {
    setLoading(true);
    const db = getDatabase();
    const bookingRef = query(ref(db, 'bookings'), orderByChild('reference'), startAt(searchQuery), endAt(searchQuery + "\uf8ff"));

    const snapshot = await get(bookingRef);
    const data = snapshot.val();

    if (data) {
      const bookingArray = Object.keys(data).map((key) => ({
        ...data[key],
        uid: key,
      }));

      setBooking(bookingArray[0]); // Assuming we want the first match
    } else {
      setBooking(null);
    }

    setLoading(false);
  };

  const handleSearch = () => {
    searchBookingByReference(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const roundPrice = (price) => {
    const remainder = price % 50;
    if (remainder > 0) {
      return price - remainder + 50;
    }
    return price;
  };

  const printSummary = () => {
    window.print();
  };
  const Section = ({ image, children, reverse }) => (
    <View style={[styles.section, reverse && styles.sectionReverse]}>
      <Image src={image} style={styles.image} />
      <View style={styles.textContainer}>{children}</View>
    </View>
  );
  const MyDocument = ({ booking }) => (
    <Document>
      <Page style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={Logo} style={styles.logo} />
          <Text style={styles.title}>Gracias por usar nuestros Servicios</Text>
        </View>
  
       
  
        {/* Datos del Recorrido */}
        <Section image={RsmR3} reverse={false}>
          <Text style={styles.subTitle}>Datos del Recorrido</Text>
          <Text>
            <Text style={styles.bold}>Fecha del Servicio:</Text>{' '}
            {moment(booking?.tripdate).format('lll')}
          </Text>
          <Text>
            <Text style={styles.bold}>Dirección de Origen:</Text>{' '}
            {booking?.pickupAddress}
          </Text>
          <Text>
            <Text style={styles.bold}>Dirección del Destino:</Text>{' '}
            {booking?.dropAddress}
          </Text>
          <Text>
            <Text style={styles.bold}>Tipo de Vehículo:</Text> {booking?.carType}
          </Text>
          <Text>
            <Text style={styles.bold}>Tipo de Servicio:</Text> {booking?.tripType}
          </Text>
          <Text>
            <Text style={styles.bold}>Hora de Inicio del Viaje:</Text>{' '}
            {booking?.trip_start_time}
          </Text>
          <Text>
            <Text style={styles.bold}>Hora de Finalización del Viaje:</Text>{' '}
            {booking?.trip_end_time}
          </Text>
        </Section>
  
        {/* Detalles del Servicio */}
        <Section image={RsmR2} reverse={true}>
          <Text style={styles.subTitle}>Detalles del Servicio</Text>
          <Text>
            <Text style={styles.bold}>Cód. de Servicio:</Text> {booking?.id}
          </Text>
          <Text>
            <Text style={styles.bold}>Kilómetros:</Text> {booking?.distance} Km
          </Text>
          <Text>
            <Text style={styles.bold}>Tiempo Total en Segundos:</Text>{' '}
            {booking?.total_trip_time}
          </Text>
          {booking?.payment_mode === 'corp' && (
            <>
              <Text style={styles.highlightSubTitle}>
                Detalle de Cobro Tecnológico
              </Text>
              <Text>
                <Text style={styles.boldHighlight}>Hosting Tecnológico:</Text>{' '}
                {booking?.Technological_Hosting}
              </Text>
              <Text>
                <Text style={styles.bold}>Base de Impuestos:</Text> $
                {booking?.Base_de_IVA}
              </Text>
              <Text>
                <Text style={styles.bold}>IVA:</Text> {booking?.Iva} COP
              </Text>
              <Text style={styles.total}>
                <Text style={styles.bold}>Total a Pagar:</Text> $
                {booking?.payment_mode === 'corp'
                  ? roundPrice(Number(booking?.cost_corp))
                  : roundPrice(Number(booking?.trip_cost))}
              </Text>
            </>
          )}
          <Text>
            <Text style={styles.bold}>Ingreso Total para Conductor:</Text> $
            { roundPrice(Number(booking?.trip_cost))}
          </Text>
        </Section>
  
        {/* Información del Conductor */}
        <Section image={RsmR1} reverse={false}>
          <Text style={styles.subTitle}>Datos del Conductor</Text>
          <Text>
            <Text style={styles.bold}>Conductor:</Text> {booking?.driver_name}
          </Text>
          <Text>
            <Text style={styles.bold}>Marca Vehículo:</Text> {booking?.vehicleMake}
          </Text>
          <Text>
            <Text style={styles.bold}>Placas:</Text> {booking?.vehicle_number}
          </Text>
          <Text>
            <Text style={styles.bold}>Tipo de Vehículo:</Text> {booking?.carType}
          </Text>
        </Section>
  
        {/* Invitación */}
        <View style={styles.section}>
          <Text style={styles.invitation}>
            Invita a tus amigos y familiares, descarga nuestra aplicación en la tienda
            oficial de tu dispositivo TREASAPP. ¡Movilízate sin recargos adicionales
            por Demanda ni recargos al aeropuerto!
          </Text>
        </View>
      </Page>
    </Document>
  );
  const copyToClipboard = () => {
    if (booking) {
        const isCashPayment = booking?.payment_mode === "cash";
        const valorEstimado = isCashPayment
            ? `${roundPrice(Number(booking.trip_cost))}-${roundPrice(Number(booking.trip_cost)) + 7000}`
            : `${roundPrice(Number(booking.cost_corp))}-${roundPrice(Number(booking.cost_corp)) + 7000}`;
        
        const valorLabel = isCashPayment ? "Valor Estimado" : "Costo Empresarial";

        const bookingInfo = `
            Buenas Tardes, Sr(a). ${booking.customer_name}
            Te confirmo, estos son los datos del conductor y vehículo que te recogerá el día ${new Date(booking.tripdate).toLocaleString()} ya confirmado:

            Datos del Servicio
            ---------------------
            Fecha del Servicio: ${new Date(booking.tripdate).toLocaleString()}
            Dirección de Origen: ${booking.pickupAddress}
            Dirección de Destino: ${booking.dropAddress}
            Nombre del cliente: ${booking.customer_name}
            Conductor Asignado: ${booking.driver_name}
            Contacto del conductor: ${booking.driver_contact}
            Tipo de Servicio: ${booking.carType}
            *Cod. Seg:* ${booking.otp}
            ${valorLabel}: ${valorEstimado}
            Distancia Estimada: ${booking.distance} Km
            Placa del vehículo: ${booking.vehicle_number}
            Marca: ${booking.vehicleMake}
            Modelo Del Vehiculo: ${booking.vehicleModel}
            Color del Vehículo: ${booking.vehicleColor}
            Modo de pago: ${isCashPayment ? "Efectivo" : "Empresarial"}
        
            Recuerda que tu conductor estará el día ${new Date(booking.tripdate).toLocaleString()} más o menos listo para atender tu servicio, por favor si requieres espera alguna, por favor ponerte en contacto con tu conductor Indicarle de dicha espera y por favor compartir tu código de seguridad y así que nuestra TREASAPP contabilice la espera y el recorrido de tu servicio. Si quieres seguir tu servicio en nuestra TREASAPP solo debes descargarla según tu sistema operativo e ingresar con tu Email registrado y solicita *"Olvide mi contraseña"*:
            
            Android: https://play.google.com/store/apps/details?id=com.treasapp.treas22
            IOS: https://apps.apple.com/app/treasapp/id6456222848
        `;

        navigator.clipboard.writeText(bookingInfo)
            .then(() => alert('Información copiada al portapapeles'))
            .catch(err => alert('Error al copiar la información'));
    }
};


  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <header className="sticky top-0 bg-slate-50 z-10 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-black">Resumen del Servicio</h1>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Referencia de reserva..."
              className="p-2 rounded bg-white text-black placeholder:text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              onClick={handleSearch}
              className="bg-red-700 text-white py-2 px-4 rounded-lg shadow-2xl hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-900 focus:ring-opacity-50 transition duration-300 ease-in-out"
            >
              Buscar
            </button>
          </div>
        </div>
      </header>
      <div>
        {loading ? (
          <div className="text-center text-xl">Cargando...</div>
        ) : (
          booking && (
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-center mb-8">
                <img src="/src/assets/logoNegro.png" alt="Logo" className="mx-auto mb-4 w-48 h-48 rounded-full shadow-lg " />  {/* Update this path to your logo */}
                <h2 className="text-2xl font-bold mb-2">Gracias por usar nuestros Servicios</h2>
                <p>Usuario: {booking.customer_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <img src={booking.customer_image || placeholderImage} alt="Customer" className=" shadow-lg w-48 h-48 rounded-full" />
                  <div>
                    <strong>Cód. de Servicio:</strong> {booking.reference}
                  </div>
                  <div>
                    <strong>Distancia:</strong> {booking.distance} Km
                  </div>
                  <div>
                    <strong>Tiempo total en segundos:</strong> {booking.total_trip_time}
                  </div>
                  <div>
                    <strong>Ingreso total para conductor:</strong> ${booking.driver_share}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Datos del Recorrido</h3>
                  <div>
                    <strong>Fecha del Servicio:</strong> {new Date(booking.tripdate).toLocaleString()}
                  </div>
                  <div>
                    <strong>Dirección de Origen:</strong> {booking.pickupAddress}
                  </div>
                  <div>
                    <strong>Dirección del destino:</strong> {booking.dropAddress}
                  </div>
                  <div>
                    <strong>Tipo de Servicio:</strong> {booking.carType}
                  </div>
                  <div>
                    <strong>Hora de inicio del viaje:</strong> {booking.trip_start_time}
                  </div>
                  <div>
                    <strong>Hora de finalización del viaje:</strong> {booking.trip_end_time}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 mt-8">
                <div className="space-y-4">
                  <img src={booking.driver_image || placeholderImage} alt="Driver" className=" shadow-lg w-48 h-48 rounded-full" />
                  <div>
                    <strong>Conductor:</strong> {booking.driver_name}
                  </div>
                  <div>
                    <strong>Marca Vehículo:</strong> {booking.carType}
                  </div>
                  <div>
                    <strong>Placas:</strong> {booking.vehicle_number}
                  </div>
                  <div>
                    <strong>Tipo de Servicio:</strong> {booking.carType}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Confirmación del Servicio</h3>
                  <div>
                    <strong>Fecha del Servicio:</strong> {new Date(booking.tripdate).toLocaleString()}
                  </div>
                  <div>
                    <strong>Dirección de Origen:</strong> {booking.pickupAddress}
                  </div>
                  <div>
                    <strong>Dirección del destino:</strong> {booking.dropAddress}
                  </div>
                  <div>
                    <strong>Nombre del cliente:</strong> {booking.customer_name}
                  </div>
                  <div>
                    <strong>Conductor Asignado:</strong> {booking.driver_name}
                  </div>
                  <div>
                    <strong>Contacto del conductor:</strong> {booking.driver_contact}
                  </div>
                  <div>
                    <strong>Valor Estimado:</strong> ${roundPrice(Number(booking?.trip_cost))}
                  </div>
                </div>
              </div>
              <div className="text-center mt-8">
              <PDFDownloadLink
          document={<MyDocument booking={booking} />}
          fileName={`Resumen del Servicio - ${booking.reference}.pdf`}
          className="bg-red_treas hover:bg-red-700 text-white px-4 py-2 rounded-full mt-4"
        >
          {({ loading }) => (loading ? 'Generando PDF...' : 'Descargar PDF')}
        </PDFDownloadLink>
              </div>
            </div>
          )
        )}
        {loading ? (
          <div className="text-center text-xl">Cargando...</div>
        ) : (
          booking && (
            <div className="bg-white p-8 rounded-lg shadow-lg mt-10">
              <div className="text-center mb-8">
                <img src="/src/assets/logoNegro.png" alt="Logo" className="mx-auto mb-4 w-48 h-48 rounded-full " />  {/* Update this path to your logo */}
                <h1 className="text-2xl font-bold mb-2">Confirmación del Servicio</h1>
                <p>Buenas Tardes, Sr(a). {booking.customer_name}</p>
                <p>Te confirmo, estos son los datos del conductor y vehículo que te recogerá el día {new Date(booking.tripdate).toLocaleString()} ya confirmado:</p>
              </div>

              <div className="mb-4">
                <h2 className="text-xl font-bold">Datos del Servicio</h2>
                <p><strong>Fecha del Servicio:</strong> {new Date(booking.tripdate).toLocaleString()}</p>
                <p><strong>Dirección de Origen:</strong> {booking.pickupAddress}</p>
                <p><strong>Dirección de Destino:</strong> {booking.dropAddress}</p>
                <p><strong>Nombre del cliente:</strong> {booking.customer_name}</p>
                <p><strong>Conductor Asignado:</strong> {booking.driver_name}</p>
                <p><strong>Contacto del conductor:</strong> {booking.driver_contact}</p>
                <p><strong>Tipo de Servicio:</strong> {booking.carType}</p>
                <p><strong>*Cod. Seg:*</strong> {booking.otp}</p>
                {booking?.payment_mode === "cash" ? (
                  <p><strong>Valor Estimado:</strong> ${roundPrice(Number(booking.trip_cost))}-${roundPrice(Number(booking.trip_cost)) + 7000}</p>
                ) : (
                  <p><strong>Costo Empresarial:</strong> ${roundPrice(Number(booking.cost_corp))}-${roundPrice(Number(booking.cost_corp)) + 7000}</p>
                )}
                <p><strong>Distancia Estimada:</strong> {booking.distance} Km</p>
                <p><strong>Placa del vehículo:</strong> {booking.vehicle_number}</p>
                <p><strong>Marca:</strong> {booking.vehicleMake}</p>
                <p><strong>Modelo Del Vehiculo:</strong> {booking.vehicleModel}</p>



                <p><strong>Color del Vehiculo</strong> {booking.vehicleColor}</p>

                <p><strong>Modo de pago:</strong> Efectivo</p>
              </div>

              <div className="mb-4">
                <p>Recuerda que tu conductor estará el día {new Date(booking.tripdate).toLocaleString()} más o menos listo para atender tu servicio, por favor si requieres espera alguna, por favor ponerte en contacto con tu conductor Indicarle de dicha espera y por favor compartir tu código de seguridad y así que nuestra TREASAPP contabilice la espera y el recorrido de tu servicio. Si quieres seguir tu servicio en nuestra TREASAPP solo debes descargarla según tu sistema operativo e ingresar con tu Email registrado y solicita *"Olvide mi contraseña"*:</p>
                <p><a href="https://play.google.com/store/apps/details?id=com.treasapp.treas22" className="text-blue-600">Android</a>: https://play.google.com/store/apps/details?id=com.treasapp.treas22</p>
                <p><a href="https://apps.apple.com/app/treasapp/id6456222848" className="text-blue-600">IOS</a>: https://apps.apple.com/app/treasapp/id6456222848</p>
              </div>

              <div className="flex justify-end space-x-4 mt-4">
                <button
                  onClick={copyToClipboard}
                  className="bg-red-700 text-white py-2 px-4 rounded-lg shadow-2xl hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-900 focus:ring-opacity-50 transition duration-300 ease-in-out"
                >
                  COPIAR CONFIRMACIÓN
                </button>
                <button
                  onClick={printSummary}
                  className="bg-red-700 text-white py-2 px-4 rounded-lg shadow-2xl hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-900 focus:ring-opacity-50 transition duration-300 ease-in-out"
                >
                  ENVIAR POR EMAIL CONFIRMACIÓN
                </button>
              </div>
            </div>
          )
        )}
        {!loading && !booking && (
          <div className="text-center text-gray-500">No se encontraron reservas con esa referencia.</div>
        )}
      </div>
    </div>
  );
};

export default BookingDetails;
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    lineHeight: 1.5,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: '#F20505',
    fontWeight: 'bold',
  },
  highlightSubTitle: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
    color: '#ea969d',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sectionReverse: {
    flexDirection: 'row-reverse',
  },
  image: {
    width: 150,
    height: 150,
    marginRight: 10,
    marginLeft: 10,
  },
  imageLarge: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  textContainer: {
    flex: 1,
  },
  bold: {
    fontWeight: 'bold',
  },
  boldHighlight: {
    fontWeight: 'bold',
    color: '#ea969d',
  },
  total: {
    color: '#F20505',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  textCenter: {
    textAlign: 'center',
  },
  invitation: {
    textAlign: 'center',
    color: '#000',
    fontWeight: 'bold',
  },
});
