const admin = require("firebase-admin");
const templateLib = require("./template");
const crypto = require("crypto");
const { log } = require("console");
const addToWallet = require("../../common").addToWallet;
const UpdateBooking = require("../../common/sharedFunctions").UpdateBooking;
//const config = require("../../config.json").paymentMethods.payulatam;
//const config = (await admin.database().ref('payment_settings/payulatam').once('value')).val();

const md5 = (x) => crypto.createHash("md5").update(x).digest("hex");

const keys = {
  checkoutUrl: 'https://checkout.payulatam.com/ppp-web-gateway-payu/',
  merchantId: 988665,
  apiKey: '1G8AXMDA5hd5yAE1UOz2sF3Gjg',
  accountId: 997084
};

module.exports.render_checkout = function (request, response) {
  const orderDetails = {
    order_id: request.body.order_id,
    email: request.body.email,
    amount: request.body.amount,
    currency: request.body.currency,
  };

  const transaction_unique_key = `${keys.apiKey}~${keys.merchantId}~${orderDetails.order_id}~${orderDetails.amount}~${orderDetails.currency}`;
  const signature = md5(transaction_unique_key);
  const refr = request.get("Referrer");
  const server_url = refr ? refr.includes("bookings") || refr.includes("userwallet") ? refr.substring(0, refr.length - (refr.includes("bookings") ? 8 : 10)) : refr : request.protocol + "://" + request.get("host") + "/";

  response.send(
    templateLib.getTemplate(
      keys,
      orderDetails,
      signature,
      server_url + "payulatam-process"
    )
  );
};


module.exports.process_checkout = function (request, response) {
  console.log("Transaction Body:", request.body);

  // Accediendo a los parámetros del cuerpo de la solicitud POST
  const { state_pol, reference_sale, transaction_id, value } = request.body;

  console.log("Transaction Details:");
  console.log("Transaction State:", state_pol);
  console.log("Reference Code:", reference_sale);
  console.log("Transaction ID:", transaction_id);
  console.log("Transaction Value:", value);

  if (state_pol === "4") { // Suponiendo que 4 es el código de estado para transacciones exitosas
    const order_id = reference_sale;
    const amount = value;

    // Verificar si la transacción ya fue procesada
    const transactionRef = admin.database().ref(`transactions/${transaction_id}`);
    transactionRef.once("value", snapshot => {
      if (snapshot.exists()) {
        // Transacción ya procesada, evitar duplicados
        console.log("Transaction already processed:", transaction_id);
        response.redirect("/success"); // Redireccionar a una página de éxito o manejar según sea necesario
      } else {
        // Procesar transacción si no existe
        admin.database().ref("bookings").child(order_id).once("value", snapshot => {
          if (snapshot.exists()) {
            const bookingData = snapshot.val();
            UpdateBooking(bookingData, order_id, transaction_id, "payulatam");

            // Registrar la transacción como procesada
            transactionRef.set({ processed: true });

            response.redirect(`/success?order_id=${order_id}&amount=${amount}&transaction_id=${transaction_id}`);
          } else {
            if (order_id.startsWith("wallet")) {
              const parts = order_id.split('-'); // Dividimos la cadena en partes utilizando el guión
              const idPart = parts[1]; // Obtenemos la parte entre los guiones

              addToWallet(idPart, amount, order_id, transaction_id);
              response.redirect(`/success?order_id=${order_id}&amount=${amount}&transaction_id=${transaction_id}`);
            } else if (order_id.startsWith("kms")) {
              const parts = order_id.split('-'); // Dividimos la cadena en partes utilizando el guión
              const idPart = parts[1]; // Obtenemos la parte entre los guiones

              addToWallet(idPart, amount, order_id, transaction_id);
              response.redirect(`/success?order_id=${order_id}&amount=${amount}&transaction_id=${transaction_id}`);
            } else if (order_id.startsWith("membership")) {
              const parts = order_id.split('-'); // Dividimos la cadena en partes utilizando el guión
              const idPart = parts[1]; // Obtenemos la parte entre los guiones

              addToWallet(idPart, amount, order_id, transaction_id);
              response.redirect(`/success?order_id=${order_id}&amount=${amount}&transaction_id=${transaction_id}`);
            } else {
              response.redirect("/cancel");
            }
          }
        }).catch(error => {
          console.error("Database operation failed:", error);
          response.status(500).send("Internal Server Error");
        });
      }
    });
  } else {
    // Manejar otros estados de transacción
    console.log(`Transaction state ${state_pol} not handled`);
    response.redirect("/cancel");
  }
};

/*
module.exports.process_checkout = function (request, response) {
  console.log("Transaction Body:", request.body);
  // Accediendo a los parámetros del cuerpo de la solicitud POST

  const { transactionState, referenceCode, transactionId, TX_VALUE } = request.body;

  console.log("Transaction Details:");
  console.log("Transaction State:", request.body.state_pol);
  console.log("Reference Code:", request.body.reference_sale);
  console.log("Transaction ID:", request.body.transaction_id);
  console.log("Transaction Value:", request.body.value);

  if (request.body.state_pol === "6") {
    // Assuming 4 is the state code for successful transactions
    const order_id = request.body.reference_sale;
    const amount = request.body.value;

    admin.database().ref("bookings").child(order_id).once("value", (snapshot) => {
        if (snapshot.exists()) {
          const bookingData = snapshot.val();
          UpdateBooking(bookingData, order_id, request.body.transaction_id, "payulatam");
          response.redirect(
            `/success?order_id=${order_id}&amount=${amount}&transaction_id=${request.body.transaction_id}`
          );
        } else {
          if (order_id.startsWith("wallet")) {
            const parts = order_id.split('-'); // Dividimos la cadena en partes utilizando el guión
            const idPart = parts[1]; // Obtenemos la parte entre los guiones

            addToWallet(idPart, amount, order_id, request.body.transaction_id);
            response.redirect(
              `/success?order_id=${order_id}&amount=${amount}&transaction_id=${request.body.transaction_id}`
            );
          } else {
            response.redirect("/cancel");
          }
        }

      })
      .catch((error) => {
        console.error("Database operation failed:", error);
        response.status(500).send("Internal Server Error");
      });
  } else {
    // Handle other transaction states accordingly
    console.log(`Transaction state ${request.body.state_pol} not handled`);
    response.redirect("/cancel");
  }
};*/