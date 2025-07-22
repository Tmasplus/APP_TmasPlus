const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const logger = require("firebase-functions/logger");
const nodemailer = require('nodemailer');

admin.initializeApp();
const db = admin.database(); // Cambiar a Realtime Database

// Obtener la clave de la API de Google Maps desde las variables de entorno
const GOOGLE_MAPS_API_KEY = 'AIzaSyDdkvNeB_M3yf_elrPagGAb8kKMARn4oIU'

// Función para compartir la ubicación de un conductor
exports.shareDriverLocation = functions.https.onRequest(async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).send({ error: 'bookingId inválido.' });
  }

  try {
    const bookingSnapshot = await db.ref(`bookings/${bookingId}`).once('value');

    if (!bookingSnapshot.exists()) {
      return res.status(404).send({ error: 'Reserva no encontrada.' });
    }

    const bookingData = bookingSnapshot.val();
    const driverId = bookingData.driver;

    // Obtener la ubicación del conductor desde la colección de usuarios
    const driverSnapshot = await db.ref(`users/${driverId}`).once('value');

    if (!driverSnapshot.exists()) {
      return res.status(404).send({ error: 'Conductor no encontrado.' });
    }

    const driverData = driverSnapshot.val();
    const driverLocation = driverData.location; // Asegúrate de que este campo sea correcto

    return res.status(200).send({
      message: 'Ubicación del conductor obtenida con éxito',
      location: driverLocation,
    });
  } catch (error) {
    logger.error('Error retrieving driver location:', error);
    return res.status(500).send({ error: 'Error al obtener la ubicación del conductor.' });
  }
});

// Función para buscar un usuario en la base de datos de Firebase
exports.getUserByPhone = functions.https.onRequest(async (req, res) => {
  const phoneNumber = req.query.phone; // Obtener el número de teléfono de la consulta

  if (!phoneNumber) {
    return res.status(400).send("Número de teléfono es requerido");
  }

  try {
    const usersRef = db.ref("users"); // Referencia a la colección de usuarios
    const snapshot = await usersRef.once("value"); // Obtener todos los usuarios

    let foundUser = null;

    snapshot.forEach((childSnapshot) => {
      const userData = childSnapshot.val();
      if (userData.mobile === phoneNumber) {
        foundUser = { id: childSnapshot.key, mobile: userData.mobile, name: userData.name };
      }
    });

    if (!foundUser) {
      return res.status(404).send("Usuario no encontrado");
    }

    return res.status(200).json(foundUser);
  } catch (error) {
    return res.status(500).send("Error interno del servidor");
  }
});

// Función para escuchar nuevas reservas
exports.listenForNewBookings = functions.database.ref('/bookings/{bookingId}')
  .onCreate(async (snapshot, context) => {
    const booking = snapshot.val();
    const bookingId = context.params.bookingId;

    console.log(`Nueva reserva detectada: ${bookingId}`);
    console.log('Detalles de la reserva:', booking);

    try {
      // Obtener la ciudad del origen del servicio desde la dirección de origen (pickupAddress)
      const originCity = await getCityFromAddress(booking.pickupAddress);
      console.log(`Ciudad de origen obtenida de la dirección de origen (pickupAddress): ${originCity}`);

      if (!originCity) {
        console.log('No se pudo determinar la ciudad de origen. Terminando la función.');
        return;
      }

      // Obtener todos los conductores de la base de datos
      const driversSnapshot = await admin.database().ref('/users').orderByChild('usertype').equalTo('driver').once('value');
      const drivers = driversSnapshot.val();

      if (!drivers) {
        console.log('No se encontraron conductores en la base de datos.');
        return;
      }

      console.log('Número de conductores obtenidos:', Object.keys(drivers).length);

      const pushTokens = [];

      for (let driverId in drivers) {
        const driver = drivers[driverId];
        console.log(`Evaluando conductor: ${driverId}, ciudad del conductor: ${driver.city}`);

        // Comparar la ciudad del conductor con la ciudad de origen de la reserva
        if (driver.city && driver.city.toLowerCase() === originCity.toLowerCase()) {
          console.log(`El conductor ${driverId} está en la misma ciudad que el origen de la reserva.`);

          if (driver.pushToken) {
            console.log(`Agregando token de notificación para el conductor ${driverId}.`);
            pushTokens.push(driver.pushToken);
          } else {
            console.log(`El conductor ${driverId} no tiene token de notificación.`);
          }
        } else {
          console.log(`El conductor ${driverId} no está en la misma ciudad (${driver.city}) que el origen de la reserva (${originCity}).`);
        }
      }

      if (pushTokens.length > 0) {
        console.log(`Enviando notificación a ${pushTokens.length} conductores.`);
        const notificationData = {
          tokens: pushTokens,
          title: "Nueva Reserva",
          body: `Tienes una nueva reserva`,
        };
        await axios.post('https://us-central1-treasupdate.cloudfunctions.net/sendNotification', notificationData);
        console.log('Notificación enviada con éxito.');
      } else {
        console.log('No se encontraron conductores con tokens de notificación en la ciudad de origen.');
      }
    } catch (error) {
      console.error('Error enviando notificaciones a los conductores:', error);
    }
  });

const getCityFromAddress = async (address) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const components = response.data.results[0].address_components;

      // Buscar la ciudad en los componentes con varios tipos
      const cityComponent = components.find(component =>
        component.types.includes('locality') ||
        component.types.includes('administrative_area_level_2') ||
        component.types.includes('sublocality')
      );

      if (cityComponent) {
        console.log(`Ciudad obtenida del componente de dirección: ${cityComponent.long_name}`);
        return cityComponent.long_name;
      } else {
        console.log('No se encontró una ciudad en los componentes de dirección.');
      }
    } else {
      console.log('La API de geocodificación no devolvió resultados válidos para la dirección proporcionada.');
    }
  } catch (error) {
    console.error('Error fetching city from address:', error);
  }
  return '';
};

///------------------------------------------------------------------------  create booking ------------------------------------------------------------------------------------------------------------------------------

exports.createBooking = functions.https.onRequest(async (req, res) => {
  try {
    const { email, pickup, drop, carType, bookLater, payment_mode, tripType, dateService, hourService } = req.body;
    const drops = drop;
    // Validar que se proporcionen todos los campos necesarios
    if (!email || !pickup || !drop || !carType) {
      return res.status(400).json({ error: 'Email, pickup, drop, and carType are required.' });
    }
    const { uid, customerImage, customerName, customerToken, customerContact } = await getUserDetailsByEmail(email);
    // Obtener las coordenadas para las ubicaciones de recogida y entrega
    const { coords, distance, dropCords, durationMinutes, pickupCords, durationMinutestimestap } = await getCoordinatesAndDistance(pickup, drop);
    console.log(coords);
    const roundedDistance = parseAndRoundDistance(distance);

    // Obtener el tipo de coche y la imagen
    const { carImage, convenienceFee, convenience_fee_types, min_fare, rate_per_hour, rate_per_unit_distance } = await getCarTypeAndImage(carType);
    const otp = generateOTP();  // Generate OTP
    const tripUrban = generateTripUrban(roundedDistance)
    const bookingData = {
      roundedDistance: parseAndRoundDistance(distance),  // Ya lo calculas como 'roundedDistance'
      durationMinutes: durationMinutes,  // Tiempo estimado en minutos, necesitarás convertirlo a segundos si es necesario dentro de `getPrice`
      carType: { convenienceFee, convenience_fee_types, min_fare, rate_per_hour, rate_per_unit_distance },  // Tipo de carro
      booking_from_web: false,  // Si se reserva desde la web
      booking_from_chat: true,  // Si se reserva desde el chat
      booking_type_admin: true  // Si es un tipo de reserva administrativa
    };
    const bookingDateTimestamp = bookLater ? parseDateToTimestamp(dateService, hourService) : getCurrentTimestamp();
    console.log(bookLater)
    const costEstimate = await getPrice(bookingData);
    const tripDateTimestamp = parseDateToTimestamp(dateService, hourService);
    const refBooking = generateReference()
    // Crear un UID único para la reserva y guardar la reserva en la base de datos
    const bookingRef = admin.database().ref('bookings').push();
    const bookingId = bookingRef.key;
    await bookingRef.set({
      customer_email: email,


      coords: coords,
      booking_from_web: false,//ya esta
      booking_from_chat: true,//a esta
      booking_type_admin: true,//ya esta
      bussinesName: "",
      carImage: carImage,
      carType: carType,
      bookingDate: getCurrentTimestamp(),//ya esta
      commission_rate: convenienceFee,// Guardar el timestamp de la creación
      bookLater: bookLater, // ya esta
      commission_type: convenience_fee_types,
      company: "",

      cost_corp: "",
      customer: uid,
      customer_image: customerImage,
      customer_name: customerName,
      customer_token: customerToken,
      customer_contact: customerContact,
      deliveryInstructions: "",
      distance: roundedDistance,
      driver_share: "en dev",
      drop: {
        add: drop,
        lat: dropCords.latitude,
        lng: dropCords.longitude
      },

      estimateDistance: roundedDistance,
      estimateTime: durationMinutestimestap.totalSeconds,
      fleet_admin_comission: 0,
      optionIndex: 0,
      optionSelected: "",
      otherPerson: "",
      otherPersonPhone: "",
      otp: otp,
      parcelTypeSelected: "",
      payment_mode: payment_mode,
      pickUpInstructions: "",
      pickup: {
        add: pickup,
        lat: pickupCords.latitude,
        lng: pickupCords.longitude
      },

      status: "NEW",
      requestedDrivers: {},
      tripType: tripType,
      reference: refBooking,
      tripUrban: tripUrban,
      estimate: costEstimate.estimateFare,
      trip_cost: costEstimate.estimateFare,
      convenience_fees: costEstimate.convenienceFees,
      tripdate: bookingDateTimestamp
    });

    // Devolver una respuesta exitosa con el ID de la reserva y las coordenadas
    res.status(201).json({
      message: 'Booking created successfully',
      bookingId: bookingId,
      coordinates: coords,
      carType: carType,
      carImage: carImage,
      refBooking: refBooking

    });
  } catch (error) {
    console.error('Error creating booking:', error.message);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});


exports.createUser = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    if (request.method === 'POST') {
      const { email, password, phoneNumber } = request.body;

      admin.auth().createUser({
        email: email,
        password: password,
        phoneNumber: phoneNumber,
      })
        .then(userRecord => {
          console.log('Successfully created new user:', userRecord.uid);
          const usersRef = admin.database().ref('users');

          // Agrega el uid al objeto del request body
          const userData = { ...request.body, uid: userRecord.uid };

          // Guarda el objeto completo en la base de datos
          return usersRef.child(userRecord.uid).set(userData);
        })
        .then(() => {
          response.status(201).send('User created and added to database successfully.');
          return null; // Agrega un retorno nulo para cumplir con las reglas de Firebase Functions
        })
        .catch(error => {
          console.error('Error creating new user:', error);
          response.status(500).send({ error: error.message });
          return null; // Agrega un retorno nulo aquí también
        });
    } else {
      response.status(405).send('Method Not Allowed');
      return null; // Asegúrate de devolver algo incluso en el caso de método no permitido
    }
  });
});

exports.getUserByPhone = functions.https.onRequest(async (req, res) => {
  const phoneNumber = req.query.phone; // Obtener el número de teléfono de la consulta

  if (!phoneNumber) {
    return res.status(400).send("Número de teléfono es requerido");
  }

  try {
    const usersRef = db.ref("users"); // Referencia a la colección de usuarios
    const snapshot = await usersRef.once("value"); // Obtener todos los usuarios

    let foundUser = null;

    snapshot.forEach((childSnapshot) => {
      const userData = childSnapshot.val();
      if (userData.mobile === phoneNumber) {
        foundUser = { id: childSnapshot.key, mobile: userData.mobile, name: userData.name };
      }
    });

    if (!foundUser) {
      return res.status(404).send("Usuario no encontrado");
    }

    return res.status(200).json(foundUser);
  } catch (error) {
    return res.status(500).send("Error interno del servidor");
  }
});


exports.getUserVerification = functions.runWith({
  timeoutSeconds: 540, // Tiempo de espera máximo de 9 minutos
  memory: '1GB' // Memoria asignada
}).https.onRequest(async (req, res) => {
  cors(req, res, async () => {

    try {
      console.log('Iniciando getUserVerification');
      const data = req.body;
      console.log('Datos recibidos:', data);

      const dataRequest = {
        token: TOKEN_BUSSINESS,
        id_process: HISTORIC_USER_ID_PROCESS,
        ...data
      }
      console.log('Datos de solicitud:', dataRequest);

      const dataUser = transformToFormData(dataRequest);
      console.log('Datos de usuario transformados:', dataUser);

      console.log('Obteniendo token...');
      const responseToken = await getTokenRequest(dataUser);
      const resultResponseToken = await responseToken.json();
      console.log('Respuesta de token:', resultResponseToken);

      if (isNaN(Number(resultResponseToken.result))) {
        console.error('Error en la consulta:', resultResponseToken);
        throw new Error('Ha ocurrido un error en la consulta, verifique los datos ingresados');
      } else {
        console.log('Token obtenido correctamente. Esperando 2 minutos...');
        await new Promise(resolve => setTimeout(resolve, 1000 * 60 * 2)); // Espera de 2 minutos
        console.log('Espera finalizada. Procediendo con la consulta de datos...');

        const processRequest = {
          token: TOKEN_BUSSINESS,
          id_request: resultResponseToken && resultResponseToken.result // Verificación tradicional
        }
        console.log('Datos de solicitud de proceso:', processRequest);

        const processData = transformToFormData(processRequest);
        console.log('Datos de proceso transformados:', processData);

        console.log('Obteniendo datos de usuario...');
        const responseData = await getUserData(processData, data.uid);
        console.log('Respuesta de datos de usuario:', responseData);
        const resultResponseData = await responseData.json();
        console.log('Respuesta de datos de usuario:', resultResponseData);

        if (!Array.isArray(resultResponseData.result)) {
          console.error('Error en la consulta de datos:', resultResponseData);
          throw new Error('Ha ocurrido un error en la consulta de los datos, intente nuevamente');
        } else {
          // Procesar cada objeto del arreglo para subir las imágenes
          const processedResults = await Promise.all(resultResponseData.result.map(async (item) => {
            if (item.archivo_evidencia) {
              try {
                const storagePath = await uploadImageToStorage(item.archivo_evidencia, data.uid);
                // Opcional: Puedes agregar la ruta de Storage al objeto si lo deseas
                return { ...item, archivo_evidencia_storage: storagePath };
              } catch (error) {
                // Manejar errores de subida sin interrumpir todo el proceso
                return { ...item, archivo_evidencia_storage: null, error: error.message };
              }
            }
            return item;
          }));

          console.log('Todas las imágenes procesadas y subidas.');

          res.status(200).send(processedResults);
        }
      }
    } catch (error) {
      console.error('Error en getUserVerification:', error);
      res.status(500).send({ error: error.message });
    }
  });
});







exports.updateBooking = functions.database.ref('/bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    let booking = change.after.val();
    booking.key = context.params.bookingId;
    if (booking.status === 'COMPLETE') {
      const language = Object.values((await admin.database().ref("languages").orderByChild("default").equalTo(true).once('value')).val())[0].keyValuePairs;
      let detailsData = await admin.database().ref("smtpdata").once("value");
      let details = detailsData.val();
      let settingdata = await admin.database().ref('settings').once("value");
      let settings = settingdata.val();
      if (details) {
        try {
          var transporter = nodemailer.createTransport(details.smtpDetails);
          var createdAtDate = new Date(booking.tripdate);
          var triphours = new Date(booking.tripdate).getHours();
          var tripmin = new Date(booking.tripdate).getMinutes();
          var formattedTripDate = createdAtDate.toLocaleDateString();

          var createdAtBookingDate = new Date(booking.bookingDate);
          var bookinghours = new Date(booking.bookingDate).getHours();
          var bookingmin = new Date(booking.bookingDate).getMinutes();
          var formattedBookingDate = createdAtBookingDate.toLocaleDateString();
          let html = `
                      <!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Documento Mejorado</title>
<style>
    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f6f9;
        margin: 0;
        padding: 20px;
        color: #333;
    }

    h1, h2, h3, h4, h5, h6 {
        margin: 0;
        padding: 0;
    }

    .container {
        max-width: 900px;
        margin: 0 auto;
        background-color: #ffffff;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        padding: 20px;
        overflow: hidden;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #f20505;
        padding-bottom: 15px;
        margin-bottom: 20px;
    }

    .header h1 {
        font-size: 28px;
        color: #333;
    }

    .header p {
        margin: 5px 0;
        font-size: 14px;
        color: #555;
    }

    .header img {
        width: 80px;
        height: 60px;
    }

    .date-info {
        color: #ff5e57;
        font-size: 14px;
    }

    table {
        width: 100%;
        background-color: #ffffff;
        border-collapse: collapse;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        margin-top: 20px;
        border-radius: 8px;
        overflow: hidden;
    }

    table thead tr {
        background-color: #f2f2f2;
        text-transform: uppercase;
        font-size: 12px;
        color: #888;
    }

    table th, table td {
        padding: 12px 15px;
        text-align: left;
        font-size: 14px;
        color: #333;
    }

    table tbody tr {
        border-bottom: 1px solid #eee;
    }

    table tbody tr:last-child {
        border-bottom: none;
    }

    table td {
        vertical-align: middle;
    }

    table th {
        font-weight: 600;
    }

    .subtotal {
        font-weight: 600;
        color: #ff5e57;
    }

    /* Efecto hover */
    table tbody tr:hover {
        background-color: #f9f9f9;
    }

    /* Botón */
    .btn-primary {
        display: inline-block;
        padding: 10px 20px;
        background-color: #009ca3;
        color: #fff;
        text-transform: uppercase;
        text-align: center;
        border-radius: 5px;
        margin-top: 20px;
        text-decoration: none;
        transition: background-color 0.3s ease;
    }

    .btn-primary:hover {
        background-color: #007e8a;
    }

</style>
</head>
<body>

<div class="container">
    <div class="header">
        <div>
            <h1>${settings.appName}</h1>
            <p>Gracias por viajar con nosotros, ${booking.customer_name}</p>
            <p style="color: #f20505;">${language.email_msg}</p>
        </div>
        <div class="date-info">
            ${language.booking_date_time}: ${formattedTripDate}
            <img src="https://cdn.pixabay.com/photo/2022/01/23/18/20/car-6961567_640.png" alt="Car Image" />
        </div>
    </div>

    <table>
        <tbody>
            <tr>
                <td colspan="3">${language.booking_id}</td>
                <td class="subtotal">${booking.reference}</td>
            </tr>
            <tr>
                <td colspan="3">${language.booking_date_time}</td>
                <td class="subtotal">${formattedBookingDate} ${bookinghours}:${bookingmin}</td>
            </tr>
            <tr>
                <td colspan="3">${language.pickup_location}</td>
                <td>${booking.pickupAddress}</td>
            </tr>
            <tr>
                <td colspan="3">${language.drop_location}</td>
                <td>${booking.dropAddress}</td>
            </tr>
            <tr>
                <td colspan="3">${language.trip_date_time}</td>
                <td>${formattedTripDate} ${triphours}:${tripmin}</td>
            </tr>
            <tr>
                <td colspan="3">${language.driver_name}</td>
                <td>${booking.driver_name}</td>
            </tr>
            <tr>
                <td colspan="3">${language.car_type}</td>
                <td>${booking.carType}</td>
            </tr>
            <tr>
                <td colspan="3">${language.payment_mode}</td>
                <td>${booking.payment_mode}</td>
            </tr>
            <tr>
                <td colspan="3">${language.distance}</td>
                <td>${booking.distance}${settings.convert_to_mile ? language.mile : language.km}</td>
            </tr>
            <tr>
                <td colspan="3">${language.Discounts}</td>
                <td>${booking.discount_amount ? booking.discount_amount : 0}</td>
            </tr>
            <tr>
                <td colspan="3">${language.total}</td>
                <td class="subtotal">${booking.trip_cost}</td>
            </tr>
        </tbody>
    </table>

    <a href="#" class="btn-primary">Ver detalles del viaje</a>
</div>

</body>
</html>`;
          transporter.sendMail({
            from: details.fromEmail,
            to: booking.customer_email,
            subject: language.ride_details_page_title,
            html: html,
          }).then(res => console.log('successfully sent that mail')).catch(err => console.log(err));
        } catch (error) {
          console.log(error.toString());
        }
      }
    }

  });


  exports.checksmtpdetails = functions.https.onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");

    try {
        const smtpDetails = request.body.smtpDetails;
        const fromEmail = request.body.fromEmail;

        var transporter = nodemailer.createTransport(request.body.smtpDetails);

        const mailOptions = {
            from: fromEmail,
            to: fromEmail,
            subject: "Test Mail",
            text: "Hi, this is a test email.",
            html: `
          <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Mejorado</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f6f9;
            margin: 0;
            padding: 20px;
            color: #333;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            padding: 20px;
        }

        h4 {
            color: #009ca3;
            font-size: 24px;
            margin-bottom: 20px;
            font-weight: 600;
            text-align: center;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        table, th, td {
            border: 1px solid #ddd;
        }

        th, td {
            padding: 12px;
            text-align: left;
        }

        th {
            background-color: #009ca3;
            color: #fff;
            text-transform: uppercase;
            font-size: 14px;
        }

        td {
            font-size: 14px;
            color: #333;
        }

        /* Efecto hover en las filas */
        table tbody tr:hover {
            background-color: #f1f1f1;
        }

        /* Estilos responsivos */
        @media (max-width: 600px) {
            .container {
                padding: 10px;
            }

            table, th, td {
                font-size: 12px;
            }

            h4 {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>

<div class="container">
    <h4>¡Hola! Este es un correo de prueba.</h4>
    
    <table>
        <thead>
            <tr>
                <th>Columna 1</th>
                <th>Columna 2</th>
                <th>Columna 3</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Dato 1</td>
                <td>Dato 2</td>
                <td>Dato 3</td>
            </tr>
            <tr>
                <td>Dato 4</td>
                <td>Dato 5</td>
                <td>Dato 6</td>
            </tr>
        </tbody>
    </table>
</div>

</body>
</html>`,
        };

        transporter.sendMail(mailOptions)
            .then((res) => {
                admin.database().ref("smtpdata").set({
                    fromEmail: fromEmail,
                    smtpDetails: smtpDetails
                })
                response.send({ success: true })
                return true;
            })
            .catch((error) => {
                response.send({ error: error.toString() })
            });
    } catch (error) {
        response.send({ error: error.toString() })
    }
});
