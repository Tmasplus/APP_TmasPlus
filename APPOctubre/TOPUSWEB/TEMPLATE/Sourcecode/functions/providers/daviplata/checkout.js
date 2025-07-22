const functions = require('firebase-functions');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

const cert = fs.readFileSync(path.resolve(__dirname, 'certs/prod/cert_dummy_lab_v2.crt'), 'utf8');
const key = fs.readFileSync(path.resolve(__dirname, 'certs/prod/cert_dummy_lab_key_v2.pem'), 'utf8');

const clientID = "hRNfvBpmnYGWyaYGLGHIgFXLSu7H3HDCfLSbN89lWGvI4ear";
const clientSecret = "NJbckrfCqLArTgaRA9AclnWXTqcp3ohM1dk3YLcqqEooCoZALyKY6cYi0D2wTWlg";
const scope = 'daviplata';

const httpsAgent = new https.Agent({
    cert: cert,
    key: key,
    rejectUnauthorized: false
});

module.exports.oauthDaviplata = functions.https.onRequest(async (req, res) => {
    try {
        const response = await axios.post('https://apislab.daviplata.com/oauth2Provider/type1/v1/token', `grant_type=client_credentials&client_id=${clientID}&client_secret=${clientSecret}&scope=${scope}`, {
            httpsAgent: httpsAgent,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error details:", error.response ? error.response.data : error.message);
        res.status(500).json({
            code: 500,
            messageError: 'Ha ocurrido un error de autenticación'
        });
    }
});

module.exports.buyTransactionDaviplata = functions.https.onRequest(async (req, res) => {
    try {
        const response = await axios.post('https://apislab.daviplata.com/daviplata/v1/compra', {
            valor: req.body.buyValue,
            numeroIdentificacion: req.body.identificationNumber,
            tipoDocumento: req.body.documentType
        }, {
            httpsAgent: httpsAgent,
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + req.body.accessToken,
                'Content-Type': 'application/json',
                'x-ibm-client-id': clientID
            }
        });
        if (response.data.codigoError) {
            return res.status(400).json({
                messageError: response.data.mensajeError || 'Ha ocurrido un error en el pago',
                code: response.data.codigoError || '400'
            });
        }
        res.json(response.data);
    } catch (error) {
        res.json({
            messageError: error.response.data.errorMessage || 'Ha ocurrido un error en el pago',
            code: error.data.httpCode || '500'
        });
    }
});

module.exports.readOtpDaviplata = functions.https.onRequest(async (req, res) => {
    try {
        const response = await axios.post('https://apislab.daviplata.com/otpSec/v1/read', {
            typeDocument: req.body.documentType,
            numberDocument: req.body.identificationNumber,
            notificationType: "API_DAVIPLATA"
        }, {
            httpsAgent: httpsAgent,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-ibm-client-id': clientID
            }
        });
        if (response.data.errorCode) {
            return res.status(400).json({
                messageError: response.data.errorMessage || 'Ha ocurrido un error en la lectura del OTP',
                code: response.data.errorCode || '400'
            });
        }
        res.json(response.data);
    } catch (error) {
        res.json({
            messageError: error.response.data.errorMessage || 'Error en lectura de OTP',
            code: error.data.httpCode || '500'
        });
    }
});

module.exports.confirmBuyDaviplata = functions.https.onRequest(async (req, res) => {
    const generateRandomCode = () => {
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += Math.floor(Math.random() * 10).toString();
        }
        return Number(code);
    };

    const idTransactionNumber = generateRandomCode();

    try {
        const response = await axios.post('https://apislab.daviplata.com/daviplata/v1/confirmarCompra', {
            otp: req.body.otp,
            idSessionToken: req.body.idSessionToken,
            idComercio: "0010203040",
            idTerminal: "ESB10934",
            idTransaccion: idTransactionNumber
        }, {
            httpsAgent: httpsAgent,
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + req.body.accessToken,
                'Content-Type': 'application/json',
                'x-ibm-client-id': clientID
            }
        });
        if (response.data.codigoError) {
            return res.status(400).json({
                messageError: response.data.mensajeError || 'Ha ocurrido un error en el pago',
                code: response.data.codigoError || '400'
            });
        }
        res.json(response.data);
    } catch (error) {
        res.json({
            messageError: error.response.data.errorMessage || 'Error de confirmación del pago',
            code: error.data.httpCode || '500'
        });
    }
});