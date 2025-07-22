const functions = require('firebase-functions');
const oauthDaviplata = require('./checkout')
const buyTransactionDaviplata = require('./checkout')

exports.oauthDaviplata = functions.https.onRequest(oauthDaviplata.oauthDaviplata)
exports.buyTransactionDaviplata = functions.https.onRequest(buyTransactionDaviplata.buyTransactionDaviplata)
exports.readOtpDaviplata =functions.https.onRequest(oauthDaviplata.readOtpDaviplata)
exports.confirmBuyDaviplata =functions.https.onRequest(oauthDaviplata.confirmBuyDaviplata)