const functions = require('firebase-functions');
const xenditcheckout = require('./checkout');

exports.link = functions.https.onRequest(xenditcheckout.render_checkout);
exports.process = functions.https.onRequest(xenditcheckout.process_checkout);