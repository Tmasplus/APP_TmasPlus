/*eslint no-loop-func: "off"*/
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const rgf = require('regularusedfunctions');
const RequestPushMsg = require('./common').RequestPushMsg;
const addToWallet = require('./common').addToWallet;
const deductFromWallet = require('./common').deductFromWallet;
const getDistance = require('./common').getDistance;
const config = require('./config.json');
const addEstimate = require('./common/sharedFunctions').addEstimate;
const translate = require('@iamtraction/google-translate');
const appcat = require('./appcat.js');
const ApiKey = require('./config.json');
const { log } = require('firebase-functions/logger');
const { parse } = require('json2csv');


admin.initializeApp();

var methods = [
    "braintree",
    "culqi",
    "flutterwave",
    "liqpay",
    "mercadopago",
    "payfast",
    "paypal",
    "paystack",
    "paytm",
    "payulatam",
    "securepay",
    "stripe",
    "squareup",
    "wipay",
    "razorpay",
    "paymongo",
    "test",
    "daviplata"
];

for (let i = 0; i < methods.length; i++) {
    exports[methods[i]] = require(`./providers/${methods[i]}`);
}

exports.get_providers = functions.https.onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    admin.database().ref('/payment_settings').once("value", (psettings) => {
        if (psettings.val()) {
            let arr = [];
            let obj = psettings.val();
            let pms = Object.keys(obj);
            for (let i = 0; i < pms.length; i++) {
                if (obj[pms[i]].active) {
                    arr.push({
                        name: pms[i],
                        link: '/' + pms[i] + '-link'
                    })
                }
            }
            response.send(arr);
        } else {
            response.send([]);
        }
    });
});

exports.googleapi = functions.https.onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    let settingdata = await admin.database().ref('settings').once("value");
    let settings = settingdata.val();
    let json = await rgf.apiCallGoogle(request, settings, config);
    response.send(json);
});

exports.success = functions.https.onRequest(async (request, response) => {
    const language = Object.values((await admin.database().ref("languages").orderByChild("default").equalTo(true).once('value')).val())[0].keyValuePairs;
    var amount_line = request.query.amount ? `<h3>${language.payment_of}<strong>${request.query.amount}</strong>${language.was_successful}</h3>` : '';
    var order_line = request.query.order_id ? `<h5>${language.order_no}${request.query.order_id}</h5>` : '';
    var transaction_line = request.query.transaction_id ? `<h6>${language.transaction_id}${request.query.transaction_id}</h6>` : '';
    response.status(200).send(`
        <!DOCTYPE HTML>
        <html>
        <head> 
            <meta name='viewport' content='width=device-width, initial-scale=1.0'> 
            <title>${language.success_payment}</title> 
            <style> 
                body { font-family: Verdana, Geneva, Tahoma, sans-serif; } 
                h3, h6, h4 { margin: 0px; } 
                .container { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; padding: 60px 0; } 
                .contentDiv { padding: 40px; box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.3); border-radius: 10px; width: 70%; margin: 0px auto; text-align: center; } 
                .contentDiv img { width: 140px; display: block; margin: 0px auto; margin-bottom: 10px; } 
                .contentDiv h3 { font-size: 22px; } 
                .contentDiv h6 { font-size: 13px; margin: 5px 0; } 
                .contentDiv h4 { font-size: 16px; } 
            </style>
        </head>
        <body> 
            <div class='container'>
                <div class='contentDiv'> 
                    <img src='https://cdn.pixabay.com/photo/2012/05/07/02/13/accept-47587_960_720.png' alt='Icon'> 
                    ${amount_line}
                    ${order_line}
                    ${transaction_line}
                    <h4>${language.payment_thanks}</h4>
                </div>
            </div>
            <script type="text/JavaScript">setTimeout("location.href = '${request.query.order_id && request.query.order_id.startsWith('wallet') ? "/userwallet" : "/bookings"}';",5000);</script>
        </body>
        </html>
    `);
});

exports.cancel = functions.https.onRequest(async (request, response) => {
    const language = Object.values((await admin.database().ref("languages").orderByChild("default").equalTo(true).once('value')).val())[0].keyValuePairs;
    response.send(`
        <!DOCTYPE HTML>
        <html>
        <head> 
            <meta name='viewport' content='width=device-width, initial-scale=1.0'> 
            <title>${language.payment_cancelled}</title> 
            <style> 
                body { font-family: Verdana, Geneva, Tahoma, sans-serif; } 
                .container { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; padding: 60px 0; } 
                .contentDiv { padding: 40px; box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.3); border-radius: 10px; width: 70%; margin: 0px auto; text-align: center; } 
                .contentDiv img { width: 140px; display: block; margin: 0px auto; margin-bottom: 10px; } 
                h3, h6, h4 { margin: 0px; } .contentDiv h3 { font-size: 22px; } 
                .contentDiv h6 { font-size: 13px; margin: 5px 0; } 
                .contentDiv h4 { font-size: 16px; } 
            </style>
        </head>
        <body> 
            <div class='container'> 
                <div class='contentDiv'> 
                    <img src='https://cdn.pixabay.com/photo/2012/05/07/02/13/cancel-47588_960_720.png' alt='Icon'> 
                    <h3>${language.payment_fail}</h3> 
                    <h4>${language.try_again}</h4>
                </div> 
            </div>
            <script type="text/JavaScript">setTimeout("location.href = '/bookings';",5000);</script>
        </body>
        </html>
    `);
});

exports.updateBooking = functions.database.ref('/bookings/{bookingId}')
    .onUpdate(async (change, context) => {
        let oldrow = change.before.val();
        let booking = change.after.val();
        const langSnap = await admin.database().ref("languages").orderByChild("default").equalTo(true).once('value');
        const language = Object.values(langSnap.val())[0].keyValuePairs;
        booking.key = context.params.bookingId;
        if (!booking.bookLater && oldrow.status === 'PAYMENT_PENDING' && booking.status === 'NEW') {
            admin.database().ref('/users').orderByChild("queue").equalTo(false).once("value", (ddata) => {
                let drivers = ddata.val();
                if (drivers) {
                    admin.database().ref("settings").once("value", async settingsdata => {
                        let settings = settingsdata.val();
                        const langSnap = await admin.database().ref("languages").orderByChild("default").equalTo(true).once('value');
                        const language = Object.values(langSnap.val())[0].keyValuePairs;
                        for (let dkey in drivers) {
                            let driver = drivers[dkey];
                            driver.key = dkey;
                            admin.database().ref("locations/" + dkey).once("value", driverlocdata => {
                                let location = driverlocdata.val();
                                if (driver.usertype === 'driver' && driver.approved === true && driver.driverActiveStatus === true && location && ((driver.carApproved === true && settings.carType_required) || !settings.carType_required) && ((driver.term === true && settings.term_required) || !settings.term_required) && ((driver.licenseImage && settings.license_image_required) || !settings.license_image_required)) {
                                    let originalDistance = getDistance(booking.pickup.lat, booking.pickup.lng, location.lat, location.lng);
                                    if (settings.convert_to_mile) {
                                        originalDistance = originalDistance / 1.609344;
                                    }
                                    if (originalDistance <= settings.driverRadius && ((driver.carType === booking.carType && settings.carType_required) || !settings.carType_required) && settings.autoDispatch) {
                                        admin.database().ref('bookings/' + booking.key + '/requestedDrivers/' + driver.key).set(true);
                                        if (driver.pushToken) {
                                            RequestPushMsg(
                                                driver.pushToken,
                                                {
                                                    title: language.notification_title,
                                                    msg: language.new_booking_notification,
                                                    screen: 'DriverTrips',
                                                    channelId: settings.CarHornRepeat ? 'bookings-repeat' : 'bookings',
                                                }
                                            );
                                        }
                                    }

                                } else {
                                    return false;
                                }
                                return true;
                            });
                        }
                    })
                } else {
                    return false;
                }
                return true;
            });
        }
        if (oldrow.status !== booking.status && booking.status === 'CANCELLED') {
            if (booking.customer_paid && parseFloat(booking.customer_paid) > 0 && booking.payment_mode !== 'cash') {
                addToWallet(booking.customer, parseFloat(booking.customer_paid), "Admin Credit", null);
            }
            if (booking.booking_from_web && booking.payment_mode !== 'cash' && appcat && appcat === "bidcab") {
                addToWallet(booking.customer, parseFloat(booking.payableAmount), "Admin Credit", null)
            }
            if (oldrow.status === 'ACCEPTED' && booking.cancelledBy === 'customer') {
                admin.database().ref("tracking/" + booking.key).orderByChild("status").equalTo("ACCEPTED").once("value", (sdata) => {
                    let items = sdata.val();
                    if (items) {
                        let accTime;
                        for (let skey in items) {
                            accTime = new Date(items[skey].at);
                            break;
                        }
                        let date1 = new Date();
                        let date2 = new Date(accTime);
                        let diffTime = date1 - date2;
                        let diffMins = diffTime / (1000 * 60);
                        admin.database().ref("cartypes").once("value", async (cardata) => {
                            const cars = cardata.val();
                            let cancelSlab = null;
                            for (let ckey in cars) {
                                if (booking.carType === cars[ckey].name) {
                                    cancelSlab = cars[ckey].cancelSlab;
                                }
                            }
                            let deductValue = 0;
                            if (cancelSlab) {
                                for (let i = 0; i < cancelSlab.length; i++) {
                                    if (diffMins > parseFloat(cancelSlab[i].minsDelayed)) {
                                        deductValue = cancelSlab[i].amount;
                                    }
                                }
                            }
                            if (deductValue > 0) {
                                await admin.database().ref("bookings/" + booking.key + "/cancellationFee").set(deductValue);
                                deductFromWallet(booking.customer, deductValue, 'Cancellation Fee');
                                addToWallet(booking.driver, deductValue, "Cancellation Fee", null);
                            }
                        })

                    }
                })
            }
        }
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
                        <html>
                        <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Document</title>
                <style>
                    body{
                        background-color: #009CA36,
                        margin: 0,
                        padding: 0
                    }
                    h1,h2,h3,h4,h5,h6{
                        margin: 0;
                        padding: 0;
                    }
                    .heading{
                        font-size: 20px;
                        margin-bottom: 08px;
                    }
                    table{
                        background-color: #fff;
                        width: 100%;
                        border-collapse: collapse;
                    }
                    table thead tr{
                        border: 1px solid #111;
                        background-color: #f2f2f2;
                    }
                    table td {
                        vertical-align: middle !important;
                        text-align: center;
                    }
                    table th, table td {
                        padding-top: 08px;
                        padding-bottom: 08px;
                    }
                    .table-bordered{
                        box-shadow: 0px 0px 5px 0.5px gray;
                    }
                    .table-bordered td, .table-bordered th {
                        border: 0px solid #dee2e6;
                    }
                    .text-left{
                        text-align: start;
                    }
                </style>
            
                        </head>
                        <body style="font-family: Arial">
                        <div style="margin-top: 10px; padding-top: 10px">
                            <div
                                style="
                                border-bottom: 2px solid #F20505;
                                display: flex;
                                justify-content: space-between;
                                "
                                >
                                <div>
                                    <h1 style="color: black; margin: 0px">${settings.appName} </h1>
                                    <p style="color: grey">Gracias por viajar con nosotros, ${booking.customer_name}</p>
                                    <p style="color: red">${language.email_msg}</p>
                                </div>
                                <div
                                    style="
                                    display: flex;
                                    flex-direction: column;
                                    justify-content: space-between;
                                    "
                                    >
                                    <div id="dateField"; style="color: red">${language.booking_date_time} : ${formattedTripDate}</div>
                                    <img
                                    style="width:80px;height:60px;"
                                    src="https://cdn.pixabay.com/photo/2022/01/23/18/20/car-6961567_640.png"
                                    />
                                </div>
                            </div>
                            <div>
                                <div>
                                    <table >
                                        <tbody>
                                            <tr>
                                                <td colspan="3" class="text-left">${language.booking_id}</td>
                                                <td id="subtotal">${booking.reference} </td>
                                            </tr>
                                            <tr>
                                                <td colspan="3" class="text-left">${language.booking_date_time}</td>
                                                <td id="subtotal"> ${formattedBookingDate} ${bookinghours}:${bookingmin} </td>
                                            </tr>
                                            <tr>
                                                <td colspan="3" class="text-left">${language.pickup_location}</td>
                                                <td id="subtotal">${booking.pickupAddress} </td>
                                            </tr>
                                            <tr>
                                                <td colspan="3" class="text-left">${language.drop_location}</td>
                                                <td id="subtotal">${booking.dropAddress} </td>
                                            </tr>
                                            <tr>
                                                <td colspan="3" class="text-left">${language.trip_date_time}</td>
                                                <td id="subtotal">${formattedTripDate} ${triphours}:${tripmin}</td>
                                            </tr>
                                            <tr>
                                                <td colspan="3" class="text-left">${language.driver_name}</td>
                                                <td id="subtotal">${booking.driver_name}</td>
                                            </tr>
                                            <tr>
                                                <td colspan="3" class="text-left">${language.car_type}</td>
                                                <td id="subtotal">${booking.carType}</td>
                                            </tr>
                                            <tr>
                                                <td colspan="3" class="text-left">${language.payment_mode}</td>
                                                <td id="subtotal">${booking.payment_mode}</td>
                                            </tr>
                                            <tr>
                                                <td colspan="3" class="text-left">${language.distance}</td>
                                                <td id="subtotal">${booking.distance}${settings.convert_to_mile ? language.mile : language.km}</td>
                                            </tr>
                                            <tr>
                                                <td colspan="3" class="text-left">${language.Discounts}</td>
                                                <td>${booking.discount_amount ? booking.discount_amount : 0}</td>
                                            </tr>
                                            <tr>
                                                <td colspan="3" class="text-left">${language.total}</td>
                                                <td>${booking.trip_cost}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
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
        if (booking.payment_mode === 'wallet' &&
            (
                (oldrow.status === 'PAYMENT_PENDING' && booking.status === 'NEW' && booking.prepaid) ||
                (oldrow.status === 'PENDING' && booking.status === 'PAID' && !booking.prepaid) ||
                (oldrow.status === 'REACHED' && booking.status === 'COMPLETE' && !booking.prepaid) ||
                (oldrow.status === 'NEW' && booking.status === 'ACCEPTED' && booking.prepaid && !(booking.customer_paid && parseFloat(booking.customer_paid) >= 0)) ||
                (oldrow.status === 'NEW' && booking.status === 'ACCEPTED' && oldrow.selectedBid && !booking.selectedBid && booking.prepaid)
            )
        ) {
            const snapshot = await admin.database().ref("users/" + booking.customer).once('value');
            let profile = snapshot.val();
            const settingdata = await admin.database().ref('settings').once("value");
            let settings = settingdata.val();
            let walletBal = parseFloat(profile.walletBalance) - parseFloat(parseFloat(booking.trip_cost) - parseFloat(booking.discount));
            let tDate = new Date();
            let details = {
                type: 'Debit',
                amount: parseFloat(parseFloat(booking.trip_cost) - parseFloat(booking.discount)),
                date: tDate.getTime(),
                txRef: booking.id
            }
            await admin.database().ref("users/" + booking.customer).update({ walletBalance: parseFloat(parseFloat(walletBal).toFixed(settings.decimal)) })
            await admin.database().ref("walletHistory/" + booking.customer).push(details);
            const langSnap = await admin.database().ref("languages").orderByChild("default").equalTo(true).once('value');
            const language = Object.values(langSnap.val())[0].keyValuePairs;
            if (profile.pushToken) {
                RequestPushMsg(
                    profile.pushToken,
                    {
                        title: language.notification_title,
                        msg: language.wallet_updated,
                        screen: 'Wallet',
                        ios: profile.userPlatform === "IOS" ? true : false
                    }
                );
            }
        }
        if ((oldrow.status === 'REACHED' && booking.status === 'PAID') ||
            (oldrow.status === 'PENDING' && booking.status === 'PAID') ||
            (oldrow.status === 'PENDING' && booking.status === 'COMPLETE') ||
            (oldrow.status === 'REACHED' && booking.status === 'COMPLETE')
        ) {
            const snapshotDriver = await admin.database().ref("users/" + booking.driver).once('value');
            let profileDriver = snapshotDriver.val();
            const settingdata = await admin.database().ref('settings').once("value");
            let settings = settingdata.val();
            let driverWalletBal = parseFloat(profileDriver.walletBalance);
            if (booking.payment_mode === 'cash' && booking.cashPaymentAmount && parseFloat(booking.cashPaymentAmount) > 0) {
                let details = {
                    type: 'Debit',
                    amount: booking.cashPaymentAmount,
                    date: new Date().getTime(),
                    txRef: booking.id
                }
                await admin.database().ref("walletHistory/" + booking.driver).push(details);
                driverWalletBal = driverWalletBal - parseFloat(booking.cashPaymentAmount);
            }
            if (booking.payment_mode === 'corp' && booking.trip_cost && parseFloat(booking.trip_cost) > 0) {
                let details = {
                    type: 'Debit',
                    amount: booking.trip_cost,
                    date: new Date().getTime(),
                    txRef: booking.id
                }
                await admin.database().ref("walletHistory/" + booking.driver).push(details);
                driverWalletBal = driverWalletBal - parseFloat(booking.trip_cost);
            }

            if (booking.fleetadmin && booking.fleetadmin.length > 0 && booking.fleetCommission && booking.fleetCommission > 0) {
                const snapshotFleet = await admin.database().ref("users/" + booking.fleetadmin).once('value');
                let profileFleet = snapshotFleet.val();
                let fleetWalletBal = parseFloat(profileFleet.walletBalance);
                fleetWalletBal = fleetWalletBal + parseFloat(booking.fleetCommission);
                let detailsFleet = {
                    type: 'Credit',
                    amount: booking.fleetCommission,
                    date: new Date().getTime(),
                    txRef: booking.id
                }
                await admin.database().ref("walletHistory/" + booking.fleetadmin).push(detailsFleet);
                await admin.database().ref("users/" + booking.fleetadmin).update({ walletBalance: parseFloat(parseFloat(fleetWalletBal).toFixed(settings.decimal)) })
            }
            driverWalletBal = driverWalletBal + parseFloat(booking.driver_share);
            let driverDetails = {
                type: 'Credit',
                amount: booking.driver_share,
                date: new Date().getTime(),
                txRef: booking.id
            }
            // await admin.database().ref("users/" + booking.driver).update({walletBalance: parseFloat(parseFloat(driverWalletBal).toFixed(settings.decimal))})
            await admin.database().ref("walletHistory/" + booking.driver).push(driverDetails);
            const langSnap = await admin.database().ref("languages").orderByChild("default").equalTo(true).once('value');
            const language = Object.values(langSnap.val())[0].keyValuePairs;
            if (profileDriver.pushToken) {
                RequestPushMsg(
                    profileDriver.pushToken,
                    {
                        title: language.notification_title,
                        msg: language.wallet_updated,
                        screen: 'Wallet',
                        ios: profileDriver.userPlatform === "IOS" ? true : false
                    }
                );
            }
        }
    });

exports.withdrawCreate = functions.database.ref('/withdraws/{wid}')
    .onCreate(async (snapshot, context) => {
        let wid = context.params.wid;
        let withdrawInfo = snapshot.val();
        let uid = withdrawInfo.uid;
        let amount = withdrawInfo.amount;

        const userData = await admin.database().ref("users/" + uid).once('value');
        let profile = userData.val();
        const settingdata = await admin.database().ref('settings').once("value");
        let settings = settingdata.val();
        let walletBal = parseFloat(profile.walletBalance) - parseFloat(amount);

        let tDate = new Date();
        let details = {
            type: 'Withdraw',
            amount: amount,
            date: tDate.getTime(),
            txRef: tDate.getTime().toString(),
            transaction_id: wid
        }
        await admin.database().ref("users/" + uid).update({ walletBalance: parseFloat(parseFloat(walletBal).toFixed(settings.decimal)) })
        await admin.database().ref("walletHistory/" + uid).push(details);
        const langSnap = await admin.database().ref("languages").orderByChild("default").equalTo(true).once('value');
        const language = Object.values(langSnap.val())[0].keyValuePairs;
        if (profile.pushToken) {
            RequestPushMsg(
                profile.pushToken,
                {
                    title: language.notification_title,
                    msg: language.wallet_updated,
                    screen: 'Wallet',
                    ios: profile.userPlatform === "IOS" ? true : false
                }
            );
        }

    });

exports.bookingScheduler = functions.pubsub.schedule('Every minute').onRun((context) => {
    admin.database().ref('/locations').once("value", snapshot => {
        let list = snapshot.val();
        if (list) {
            admin.database().ref('/users').orderByChild("queue").equalTo(false).once("value", (ddata) => {
                let drivers = ddata.val();
                if (drivers) {
                    for (let key in drivers) {
                        if (list[key]) {
                            let entry = list[key];
                            let date1 = new Date();
                            let date2 = new Date(entry.createTimeStamp);
                            let diffTime = date1 - date2;
                            let diffMins = diffTime / (1000 * 60);
                            if (diffMins > 60) { // Cambio aquí: verificar si han pasado más de 60 minutos
                                admin.database().ref('/users/' + key + '/driverActiveStatus').set(false);
                                admin.database().ref('/locations/' + key).remove();
                            }
                        }
                    }
                }
            });
        }
    });

    admin.database().ref('/bookings').orderByChild("status").equalTo('NEW').once("value", (snapshot) => {
        let bookings = snapshot.val();
        if (bookings) {
            for (let key in bookings) {
                let booking = bookings[key];
                booking.key = key;
                let date1 = new Date();
                let date2 = new Date(booking.tripdate);
                let diffTime = date2 - date1;
                let diffMins = diffTime / (1000 * 60);
                if ((diffMins > 0 && diffMins < 15 && booking.bookLater && !booking.requestedDrivers) || diffMins < -5) {
                    admin.database().ref('/users').orderByChild("queue").equalTo(false).once("value", (ddata) => {
                        let drivers = ddata.val();
                        if (drivers) {
                            admin.database().ref("settings").once("value", async settingsdata => {
                                let settings = settingsdata.val();
                                const langSnap = await admin.database().ref("languages").orderByChild("default").equalTo(true).once('value');
                                const language = Object.values(langSnap.val())[0].keyValuePairs;
                                for (let dkey in drivers) {
                                    let driver = drivers[dkey];
                                    driver.key = dkey;
                                    if (!(booking.requestedDrivers && booking.requestedDrivers[dkey])) {
                                        admin.database().ref("locations/" + dkey).once("value", driverlocdata => {
                                            let location = driverlocdata.val();
                                            if (driver.usertype === 'driver' && driver.approved === true && driver.driverActiveStatus === true && location && ((driver.carApproved === true && settings.carType_required) || !settings.carType_required) && ((driver.term === true && settings.term_required) || !settings.term_required) && ((driver.licenseImage && settings.license_image_required) || !settings.license_image_required)) {
                                                let originalDistance = getDistance(booking.pickup.lat, booking.pickup.lng, location.lat, location.lng);
                                                if (settings.convert_to_mile) {
                                                    originalDistance = originalDistance / 1.609344;
                                                }
                                                if (originalDistance <= settings.driverRadius && ((driver.carType === booking.carType && settings.carType_required) || !settings.carType_required) && settings.autoDispatch) {
                                                    admin.database().ref('bookings/' + booking.key + '/requestedDrivers/' + driver.key).set(true);
                                                    addEstimate(booking.key, driver.key, originalDistance, booking.deliveryWithBid);
                                                    if (driver.pushToken) {
                                                        RequestPushMsg(
                                                            driver.pushToken,
                                                            {
                                                                title: language.notification_title,
                                                                msg: language.new_booking_notification,
                                                                screen: 'DriverTrips',
                                                                channelId: settings.CarHornRepeat ? 'bookings-repeat' : 'bookings',
                                                                //ios: driver.userPlatform === "IOS"? true: false
                                                            }
                                                        );
                                                    }
                                                    return true;
                                                }
                                                return true;
                                            } else {
                                                return false;
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            return false;
                        }
                        return true;
                    });
                }
                if (diffMins < -30) {
                    admin.database().ref("bookings/" + booking.key + "/requestedDrivers").remove();
                    admin.database().ref('bookings/' + booking.key).update({
                        status: 'CANCELLED',
                        reason: 'RIDE AUTO CANCELLED. NO RESPONSE',
                        cancelledBy: 'admin'
                    });
                    return true;
                }
            }
        }
        else {
            return false;
        }
        return true;
    });
});



exports.userDelete = functions.database.ref('/users/{uid}')
    .onDelete((snapshot, context) => {
        let uid = context.params.uid;
        return admin.auth().deleteUser(uid);
    });

exports.userCreate = functions.database.ref('/users/{uid}')
    .onCreate((snapshot, context) => {
        let uid = context.params.uid;
        let userInfo = snapshot.val();
        let userCred = { uid: uid };
        if (userInfo.mobile) {
            userCred['phoneNumber'] = userInfo.mobile;
        }
        if (userInfo.email) {
            userCred['email'] = userInfo.email;
        }
        admin.auth().getUser(uid)
            .then((userRecord) => {
                return true;
            })
            .catch((error) => {
                if (uid === 'admin0001') userCred['password'] = 'Admin@123';
                admin.auth().createUser(userCred)
            });
    });

exports.send_notification = functions.https.onRequest(async (request, response) => {
    console.log("Request received for notification:", request);

    // Obtener los ajustes de la base de datos Firebase
    try {
        const settingData = await admin.database().ref('settings').once("value");
        const settings = settingData.val();
        const allowedOrigins = ['https://' + config.firebaseProjectId + '.web.app', settings.CompanyWebsite];

        // Verificar el origen para CORS
        const origin = request.headers.origin;
        if (allowedOrigins.includes(origin)) {
            response.set("Access-Control-Allow-Origin", origin);
        }
        response.set("Access-Control-Allow-Headers", "Content-Type");

        // Verificar el token proporcionado en el cuerpo de la solicitud
        if (request.body.token === 'token_error' || request.body.token === 'web') {
            response.send({ error: 'Invalid token specified: ' + request.body.token });
        } else {
            const message = {
                to: request.body.token, // Token del dispositivo destino
                notification: {
                    title: request.body.title,
                    body: request.body.msg
                },
                data: {
                    screen: request.body.screen,
                    params: request.body.params
                },
                android: {
                    priority: "high"
                },
                apns: {
                    headers: {
                        'apns-priority': '10'
                    }
                },
                channelId: request.body.channelId, // Asegúrate de que el channelId esté definido para Android 8.0+
                ios: request.body.ios
            };

            // Intentar enviar la notificación
            try {
                const responseData = await admin.messaging().send(message);
                response.send({ success: true, data: responseData });
            } catch (error) {
                console.error("Error sending notification:", error);
                response.status(500).send({ error: 'Failed to send notification', details: error.message });
            }
        }
    } catch (error) {
        console.error("Error accessing settings or processing request:", error);
        response.status(500).send({ error: 'Server error', details: error.message });
    }
});

exports.check_user_exists = functions.https.onRequest(async (request, response) => {
    let settingdata = await admin.database().ref('settings').once("value");
    let settings = settingdata.val();
    const allowedOrigins = ['https://' + config.firebaseProjectId + '.web.app', settings.CompanyWebsite];
    const origin = request.headers.origin;
    if (allowedOrigins.includes(origin)) {
        response.set("Access-Control-Allow-Origin", origin);
    }
    response.set("Access-Control-Allow-Headers", "Content-Type");
    let arr = [];
    const user = await rgf.validateBasicAuth(request.headers.authorization, config);
    if (user) {
        if (request.body.email || request.body.mobile) {
            if (request.body.email) {
                arr.push({ email: request.body.email });
            }
            if (request.body.mobile) {
                arr.push({ phoneNumber: request.body.mobile });
            }
            try {
                admin
                    .auth()
                    .getUsers(arr)
                    .then((getUsersResult) => {
                        response.send({ users: getUsersResult.users });
                        return true;
                    })
                    .catch((error) => {
                        response.send({ error: error });
                    });
            } catch (error) {
                response.send({ error: error });
            }
        } else {
            response.send({ error: "Email or Mobile not found." });
        }
    } else {
        response.send({ error: 'Unauthorized api call' });
    }
});


exports.validate_referrer = functions.https.onRequest(async (request, response) => {
    let referralId = request.body.referralId;
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const snapshot = await admin.database().ref("users").once('value');
    let value = snapshot.val();
    if (value) {
        let arr = Object.keys(value);
        let key;
        for (let i = 0; i < arr.length; i++) {
            if (value[arr[i]].referralId === referralId) {
                key = arr[i];
            }
        }
        response.send({ uid: key });
    } else {
        response.send({ uid: null });
    }
});

exports.user_signup = functions.https.onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    let userDetails = request.body.regData;
    let settingdata = await admin.database().ref('settings').once("value");
    let settings = settingdata.val();
    try {
        const regData = await rgf.valSignupData(config, userDetails, settings);
        if (regData.error) {
            response.send(regData);
        } else {
            let userRecord = await admin.auth().createUser({
                email: userDetails.email,
                phoneNumber: userDetails.mobile,
                password: userDetails.password,
                emailVerified: true
            });
            if (userRecord && userRecord.uid) {
                await admin.database().ref('users/' + userRecord.uid).set(regData);
                if (userDetails.signupViaReferral && settings.bonus > 0) {
                    await addToWallet(userDetails.signupViaReferral, settings.bonus, "Admin Credit", null);
                    await addToWallet(userRecord.uid, settings.bonus, "Admin Credit", null);
                }
                response.send({ uid: userRecord.uid });
            } else {
                response.send({ error: "User Not Created" });
            }
        }
    } catch (error) {
        response.send({ error: "User Not Created" });
    }
});

exports.update_user_email = functions.https.onRequest(async (request, response) => {
    let settingdata = await admin.database().ref('settings').once("value");
    let settings = settingdata.val();
    const allowedOrigins = ['https://' + config.firebaseProjectId + '.web.app', settings.CompanyWebsite];
    const origin = request.headers.origin;
    if (allowedOrigins.includes(origin)) {
        response.set("Access-Control-Allow-Origin", origin);
    }
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const user = await rgf.validateBasicAuth(request.headers.authorization, config);
    if (user) {
        const uid = request.body.uid;
        const email = request.body.email;
        if (email) {
            admin.auth().updateUser(uid, {
                email: email,
                emailVerified: true
            })
                .then((userRecord) => {
                    let updateData = { uid: uid, email: email };
                    if (request.body.firstName) {
                        updateData['firstName'] = request.body.firstName;
                    }
                    if (request.body.lastName) {
                        updateData['lastName'] = request.body.lastName;
                    }
                    admin.database().ref("users/" + uid).update(updateData);
                    response.send({ success: true, user: userRecord });
                    return true;
                })
                .catch((error) => {
                    response.send({ error: "Error updating user" });
                });
        } else {
            response.send({ error: "Request email not found" });
        }
    } else {
        response.send({ error: 'Unauthorized api call' });
    }
});

exports.gettranslation = functions.https.onRequest((request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    translate(request.query.str, { from: request.query.from, to: request.query.to })
        .then(res => {
            response.send({ text: res.text })
            return true;
        }).catch(err => {
            response.send({ error: err.toString() })
            return false;
        });
});

exports.getservertime = functions.https.onRequest((request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    response.send({ time: new Date().getTime() })
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
            <html>
            <head><style>table, th, td { border: 1px solid black;}</style></head>
            <body>
            <div class="w3-container">
                <h4>Hi, this is a test email.</h4>
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

exports.check_auth_exists = functions.https.onRequest(async (request, response) => {
    let settingdata = await admin.database().ref('settings').once("value");
    let settings = settingdata.val();
    const allowedOrigins = ['https://' + config.firebaseProjectId + '.web.app', settings.CompanyWebsite];
    const origin = request.headers.origin;
    if (allowedOrigins.includes(origin)) {
        response.set("Access-Control-Allow-Origin", origin);
    }
    response.set("Access-Control-Allow-Headers", "Content-Type");
    let data = JSON.parse(request.body.data);
    const userData = await rgf.formatUserProfile(request, config, data);
    if (userData.uid) {
        admin.database().ref('users/' + userData.uid).set(userData);
    }
    response.send(userData)
});


exports.request_mobile_otp = functions.https.onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const mobile = request.body.mobile;
    const timestamp = new Date().getTime();
    const otp = Math.floor(100000 + Math.random() * 900000);
    const langSnap = await admin.database().ref("languages").orderByChild("default").equalTo(true).once('value');
    const language = Object.values(langSnap.val())[0].keyValuePairs;
    if (language) {
        try {
            const mobileList = await admin.database().ref("/otp_auth_requests").orderByChild("mobile").equalTo(mobile).once('value');
            const listData = mobileList.val();
            const info = Object.keys(listData ? listData : {});
            if (info) {
                for (let i = 0; i < info.length; i++) {
                    if (listData[info[i]].mobile === mobile) {
                        admin.database().ref(`/otp_auth_requests/${info[i]}`).remove();
                    }
                }
            }
        } catch (error) {
            //Ignore if no previous record.
        }

        let smsConfigData = await admin.database().ref('smsConfig').once("value");
        let smsConfig = smsConfigData.val();

        const data = {
            mobile: mobile,
            dated: timestamp,
            otp: otp
        };
        let resMsg = await rgf.callMsgApi(config, smsConfig, data);
        console.log(resMsg);
        await admin.database().ref(`/otp_auth_requests`).push(data);
        response.send({ "success": true })

    } else {
        response.send({ error: "Setup error" });
    }
});

exports.verify_mobile_otp = functions.https.onRequest(async (request, response) => {
    let settingdata = await admin.database().ref('settings').once("value");
    let settings = settingdata.val();
    const allowedOrigins = ['https://' + config.firebaseProjectId + '.web.app', settings.CompanyWebsite];
    const origin = request.headers.origin;
    if (allowedOrigins.includes(origin)) {
        response.set("Access-Control-Allow-Origin", origin);
    }
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const mobile = request.body.mobile;
    const otp = request.body.otp;
    const mobileList = await admin.database().ref("/otp_auth_requests").orderByChild("mobile").equalTo(mobile).once('value');
    const listData = mobileList.val();
    if (listData) {
        let check = await rgf.otpCheck(config, mobile, listData);
        if (check.errorStr) {
            await admin.database().ref(`/otp_auth_requests/${check.key}`).remove();
            response.send({ error: check.errorStr });
        } else {
            if (check.data.mobile) {
                if (parseInt(check.data.otp) === parseInt(otp)) {
                    let userRecord;
                    try {
                        userRecord = await admin.auth().getUserByPhoneNumber(mobile);
                    } catch (error) {
                        userRecord = await admin.auth().createUser({
                            phoneNumber: mobile
                        });
                    }
                    try {
                        const customToken = await admin.auth().createCustomToken(userRecord.uid);
                        response.send({ token: customToken });
                    } catch (error) {
                        console.log(error);
                        response.send({ error: "Error creating custom token" });
                    }
                } else {
                    check.data['count'] = check.data.count ? check.data.count + 1 : 1;
                    await admin.database().ref(`/otp_auth_requests/${check.key}`).update(check.data);
                    response.send({ error: "OTP mismatch" });
                }
            } else {
                response.send({ error: "Request mobile not found" });
            }
        }
    } else {
        response.send({ error: "Request mobile not found" });
    }
});

exports.update_auth_mobile = functions.https.onRequest(async (request, response) => {
    let settingdata = await admin.database().ref('settings').once("value");
    let settings = settingdata.val();
    const allowedOrigins = ['https://' + config.firebaseProjectId + '.web.app', settings.CompanyWebsite];
    const origin = request.headers.origin;
    if (allowedOrigins.includes(origin)) {
        response.set("Access-Control-Allow-Origin", origin);
    }
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const uid = request.body.uid;
    const mobile = request.body.mobile;
    const otp = request.body.otp;
    const mobileList = await admin.database().ref("/otp_auth_requests").orderByChild("mobile").equalTo(mobile).once('value');
    const listData = mobileList.val();
    if (listData) {
        let check = await rgf.otpCheck(config, mobile, listData);
        if (check.errorStr) {
            await admin.database().ref(`/otp_auth_requests/${check.key}`).remove();
            response.send({ error: check.errorStr });
        } else {
            if (check.data.mobile) {
                if (parseInt(check.data.otp) === parseInt(otp)) {
                    admin.auth().updateUser(uid, {
                        phoneNumber: mobile
                    })
                        .then((userRecord) => {
                            response.send({ success: true, user: userRecord });
                            return true;
                        })
                        .catch((error) => {
                            response.send({ error: "Error updating user" });
                        });
                } else {
                    check.data['count'] = check.data.count ? check.data.count + 1 : 1;
                    await admin.database().ref(`/otp_auth_requests/${check.key}`).update(check.data);
                    response.send({ error: "OTP mismatch" });
                }
            } else {
                response.send({ error: "Request mobile not found" });
            }
        }
    } else {
        response.send({ error: "Request mobile not found" });
    }
});
exports.createUser = functions.https.onRequest((request, response) => {
    if (request.method === 'POST') {
        const { email, password, phoneNumber, usertype, firstName, lastName, docType, verifyId, city } = request.body;

        admin.auth().createUser({
            email: email,
            password: password,
            phoneNumber: phoneNumber,
        })
            .then(userRecord => {
                console.log('Successfully created new user:', userRecord.uid);
                const usersRef = admin.database().ref('users');
                // Asegúrate de retornar esta promesa
                return usersRef.child(userRecord.uid).set({
                    email: email,
                    mobile: phoneNumber,
                    usertype: usertype,
                    approved: true,
                    firstName: firstName,
                    lastName: lastName,
                    pushToken: "init",
                    signupViaReferral: "",
                    walletBalance: 0,
                    docType: docType,
                    verifyId: verifyId,
                    city: city,
                    createdAt:getCurrentTimestamp(),
                    referralId:generateRefereralId(firstName,lastName)
                });
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
exports.sendEmail = functions.https.onRequest((request, response) => {
    if (request.method !== 'POST') {
        return response.status(405).send('Method Not Allowed');
    }

    const { pickup, drop, email, typeVehicle, payment_mode, dateService, typeBuy, nameandSecondname , mobile} = request.body;

    if (!email) {
        // Aquí manejas el flujo cuando el email está vacío
        return response.status(400).send('Email is required.');
    }

    let typeVehicles = "";
    switch(typeVehicle) {
        case "1":
            typeVehicles = "TREAS-E";
            break;
        case "2":
            typeVehicles = "TREAS-X";
            break;
        case "3":
            typeVehicles = "TREAS-T";
            break;
        case "4":
            typeVehicles = "TREAS-VAN";
            break;
        default:
            typeVehicles = "Unknown vehicle type";
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'gerenciageneral@solucionestreas.com',
            pass: 'G3r3nciaTr3as2024*'
        }
    });

    let mailText = `*Lugar de inicio del servicio:* ${pickup} \n*Punto final del servicio:* ${drop}\n*Email del usuario:* ${email} \n*Tipo de Vehículo:* ${typeVehicles} \n*Tipo de servicio:* ${payment_mode} \n*Fecha y hora de inicio del viaje:* ${dateService} \n*Método de pago:* ${typeBuy}`;
    
    if (nameandSecondname) {
        mailText = `\n\n*Atención:* El usuario ${nameandSecondname}. \n necesita asistencia el correo de el usuario es: ${email}. \n Con numero de telefono : ${mobile}`;
    }

    const mailOptions = {
        from: 'gerenciageneral@solucionestreas.com',
        to: "procesos@treascorp.co",
        subject: 'Detalles del viaje',
        text: mailText
    };

    transporter.sendMail(mailOptions)
        .then(info => {
            console.log('Email sent: ' + info.response);
            response.status(200).send('Email sent successfully');
            return null;
        })
        .catch(error => {
            console.error('Error:', error);
            response.status(500).send({ error: error.message });
            return null;
        });
});
exports.createBooking = functions.https.onRequest(async (req, res) => {
    try {
        const { email, pickup, drop, carType, bookLater, payment_mode, tripType ,dateService,hourService} = req.body;
        const drops = drop;
        // Validar que se proporcionen todos los campos necesarios
        if (!email || !pickup || !drop || !carType) {
            return res.status(400).json({ error: 'Email, pickup, drop, and carType are required.' });
        }
        const { uid, customerImage, customerName, customerToken ,customerContact} = await getUserDetailsByEmail(email);
        // Obtener las coordenadas para las ubicaciones de recogida y entrega
        const { coords, distance, dropCords, durationMinutes, pickupCords,durationMinutestimestap } = await getCoordinatesAndDistance(pickup, drop);
        console.log(coords);
        const roundedDistance = parseAndRoundDistance(distance);

        // Obtener el tipo de coche y la imagen
        const { carImage, convenienceFee, convenience_fee_types ,min_fare ,rate_per_hour,rate_per_unit_distance} = await getCarTypeAndImage(carType);
        const otp = generateOTP();  // Generate OTP
        const tripUrban = generateTripUrban(roundedDistance)
        const bookingData = {
            roundedDistance: parseAndRoundDistance(distance),  // Ya lo calculas como 'roundedDistance'
            durationMinutes: durationMinutes,  // Tiempo estimado en minutos, necesitarás convertirlo a segundos si es necesario dentro de `getPrice`
            carType: {convenienceFee ,convenience_fee_types , min_fare ,rate_per_hour,rate_per_unit_distance},  // Tipo de carro
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
            customer_contact:customerContact,
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
            estimate:costEstimate.estimateFare,
            trip_cost:costEstimate.estimateFare,
            convenience_fees: costEstimate.convenienceFees,
            tripdate:bookingDateTimestamp
        });

        // Devolver una respuesta exitosa con el ID de la reserva y las coordenadas
        res.status(201).json({
            message: 'Booking created successfully',
            bookingId: bookingId,
            coordinates: coords,
            carType: carType,
            carImage: carImage,
            refBooking:refBooking

        });
    } catch (error) {
        console.error('Error creating booking:', error.message);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});


exports.consultLocation = functions.https.onRequest(async (req, res) => {
    console.log('log', req.body);  // Para debuguear y ver qué se está recibiendo en el cuerpo de la solicitud

    if (!req.body.location) {
        return res.status(400).send('No address provided');
    }

    const address = req.body.location;
    try {
        const coordinates = await getCoordinates(address);

        if (coordinates) {
            console.log(coordinates);  // Opcional: loguear las coordenadas para verificar los datos
            res.send(coordinates);
        } else {
            res.status(404).send('Direccion no encontrada');
        }
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        res.status(500).send('Internal Server Error');
    }
});
exports.driverPayment = functions.https.onRequest(async (request, response) => {
    if (request.method === 'GET') {
        try {
            const bookingsRef = admin.database().ref('/bookings');
            const tollsRef = admin.database().ref('/tolls');
            const usersRef = admin.database().ref('/users');

            const snapshot = await bookingsRef.orderByChild('status').equalTo('COMPLETE').once('value');
            const tollsSnapshot = await tollsRef.once('value');

            if (snapshot.exists() && tollsSnapshot.exists()) {
                const bookings = snapshot.val();
                const tolls = tollsSnapshot.val();

                const filteredBookings = Object.keys(bookings).reduce((acc, key) => {
                    const booking = bookings[key];
                    if (booking.companyInvoices !== 'Facturado' && booking.payment_mode === 'corp' && booking.companyInvoices !== 'Facturado/Pagado') {
                        acc[key] = booking;
                    }
                    return acc;
                }, {});

                const enrichedBookings = await Promise.all(Object.keys(filteredBookings).map(async key => {
                    const booking = filteredBookings[key];
                    let driverInfo = { name: "Unknown", contact: "Unknown" };

                    if (booking.driver) {
                        const driverSnapshot = await usersRef.child(booking.driver).once('value');
                        if (driverSnapshot.exists()) {
                            const driverData = driverSnapshot.val();
                            driverInfo.name = driverData.firstName || "Unknown";
                            driverInfo.contact = driverData.bankAccount || "Unknown";
                            driverInfo.verifyId = driverData.verifyId;
                            driverInfo.lastName = driverData.lastName || "Unknown";
                        }
                    }

                    // Aquí podrías agregar la lógica para calcular peajes si es necesario

                    return {
                        Tipo_de_Identificacion: 1,
                        Numero_de_Identificacion: driverInfo.verifyId,
                        Nombre: driverInfo.name,
                        Apellido: driverInfo.lastName,
                        Codigo_del_Banco: 51,
                        Tipo_de_Producto_o_Servico: 'DP',
                        Numero_de_Producto_o_Servicio: driverInfo.contact,
                        Valor_del_pago_o_de_la_recarga: booking.trip_cost,
                        Reference_ID: booking.reference
                    };
                }));

                const fields = ['Tipo_de_Identificacion', 'Numero_de_Identificacion', 'Nombre', 'Apellido', 'Codigo_del_Banco', 'Tipo_de_Producto_o_Servico', 'Numero_de_Producto_o_Servicio', 'Valor_del_pago_o_de_la_recarga','Reference_ID'];
                const csv = parse(enrichedBookings, { fields });

                const updatePromises = Object.keys(filteredBookings).map(key => {
                    console.log(`Updating booking ${key} to 'Facturado/Pagado'`);
                    return bookingsRef.child(key).update({ companyInvoices: "Facturado/Pagado" })
                        .then(() => console.log(`Booking ${key} updated successfully`))
                        .catch(error => console.error(`Failed to update booking ${key}:`, error));
                });
                
                await Promise.all(updatePromises);

                response.setHeader('Content-Type', 'text/csv');
                response.attachment('Report.csv');
                response.status(200).send(csv);
            } else {
                response.status(404).send('No bookings found.');
            }
        } catch (error) {
            console.error('Failed to retrieve or convert bookings:', error);
            response.status(500).send('Error processing data');
        }
    } else {
        response.status(405).send('Method Not Allowed');
    }
});


function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }
  
  function distanceBetweenCoords(lat1, lon1, lat2, lon2) {
    var earthRadiusKm = 6371;
  
    var dLat = degreesToRadians(lat2-lat1);
    var dLon = degreesToRadians(lon2-lon1);
  
    lat1 = degreesToRadians(lat1);
    lat2 = degreesToRadians(lat2);
  
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return earthRadiusKm * c;
  }
  
  function isTollOnRoute(tollCoords, bookingCoords) {
    if (!tollCoords || !bookingCoords) return false;

    const coords = tollCoords.split(',');
    if (coords.length !== 2) return false; // Ensure there are exactly two parts: latitude and longitude

    const [tollLat, tollLng] = coords.map(Number);
    const { latitude, longitude } = bookingCoords;

    // Haversine distance calculation
    function haversineDistance(lat1, lon1, lat2, lon2) {
        function toRad(x) {
            return x * Math.PI / 180;
        }

        const R = 6371; // Earth's radius in km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    const distance = haversineDistance(latitude, longitude, tollLat, tollLng);
    return distance <= 10; // Adjust the threshold as necessary
}


async function getCoordinates(address) {
    const apiKey = ApiKey.googleApiKeys.server; // Asegúrate de que esta clave está correctamente configurada.

    // URL for geocoding request
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const response = await fetch(geocodeUrl);
        const data = await response.json();

        if (data.status !== 'OK') {
            throw new Error(`Geocoding failed: ${data.status}`);
        }

        const coordinates = {
            latitude: data.results[0].geometry.location.lat,
            longitude: data.results[0].geometry.location.lng
        };
        console.log(coordinates)

        return coordinates;

    } catch (error) {
        console.error("Error fetching coordinates:", error);
        throw error;
    }
}

function parseDateToTimestamp(dateService, hourService) {
    const [time, period] = hourService.split(',');
    let [hours, minutes] = time.split(':');

    // Convertir horas a formato 24 horas si es necesario
    hours = parseInt(hours);
    if (period.trim().toUpperCase() === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period.trim().toUpperCase() === 'AM' && hours === 12) {
        hours = 0; // Medianoche debe ser 00
    }

    // Reemplazar '/' por '-' en la fecha y reordenar a formato YYYY-MM-DD
    const [day, month, year] = dateService.split('/');
    const correctDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes}:00`;

    // Crear un objeto de fecha especificando que es hora local
    const date = new Date(correctDate + " GMT-0500"); // Añadir el offset de Colombia directamente

    return date.getTime();  // Devuelve el timestamp
}



function getPrice(bookingData) {
    const settingsRef = admin.database().ref('settings');
    const { roundedDistance, durationMinutes, carType, booking_from_web, booking_from_chat, booking_type_admin } = bookingData;
    console.log("Booking data:", bookingData);

    return settingsRef.once('value').then((settingsSnapshot) => {
        let settings = settingsSnapshot.val();
        console.log("Settings loaded:", durationMinutes);

        let { totalCost, grandTotal, convenience_fees } = FareCalculator(
            roundedDistance,
            durationMinutes * 60,
            carType, // Ensuring carType is properly structured before passing
            {},
            settings.decimal
        );

        console.log("Calculation results:", {totalCost, grandTotal});

        if (roundedDistance > settings.distanceIntermunicipal) {
            grandTotal *= 2;
        } else if (roundedDistance < 25) {
            console.log("Short distance adjustment applied");
        }

        return {
            fareCost: parseFloat(totalCost.toFixed(settings.decimal)),
            estimateFare: parseFloat(grandTotal.toFixed(settings.decimal)),
            estimateTime: (durationMinutes * 60) / 60,  // Convert and return in minutes
            convenienceFees: parseFloat(convenience_fees.toFixed(settings.decimal)),
            driverShare: (grandTotal - convenience_fees.toFixed(settings.decimal)    ),
            additionalDetails: {
                bookingFromWeb: booking_from_web,
                bookingFromChat: booking_from_chat,
                bookingTypeAdmin: booking_type_admin
            }
        };
    }).catch((error) => {
        console.error("Error in getPrice function:", error);
        return { error: error.message };
    });
}


const FareCalculator = (distance, time, rateDetails, instructionData, decimal) => {
    // Convertir y validar todos los valores numéricos
    distance = parseFloat(distance);
    time = parseFloat(time);
    const ratePerUnitDistance = parseFloat(rateDetails.rate_per_unit_distance);
    const ratePerHour = parseFloat(rateDetails.rate_per_hour);
    const baseFare = parseFloat(rateDetails.base_fare || 0);
    const minFare = parseFloat(rateDetails.min_fare);
    const convenienceFees = parseFloat(rateDetails.convenienceFee);
    decimal = parseInt(decimal, 10);

    console.log("Valores numéricos verificados:", {distance, time, ratePerUnitDistance, ratePerHour, baseFare, minFare, convenienceFees});

    let baseCalculated = (ratePerUnitDistance * distance) + (ratePerHour * (time / 3600));
    if (baseFare > 0) {
        baseCalculated += baseFare;
    }

    let total = baseCalculated > parseFloat(rateDetails.min_fare) ? baseCalculated : parseFloat(rateDetails.min_fare);
    let convenienceFee = 0;

    if (rateDetails.convenience_fee_type === 'flat') {
        convenienceFee = convenienceFees;
    } else  {
        convenienceFee = (total * convenienceFees / 100);
    }

    let grand = total + convenienceFee;
    console.log("Calculations:", {baseCalculated, total, convenienceFee, grand});

    return {
        totalCost: parseFloat(total.toFixed(decimal)),
        grandTotal: parseFloat(grand.toFixed(decimal)),
        convenience_fees: parseFloat(convenienceFee.toFixed(decimal))
    };
}


function generateTripUrban(roundedDistance) {
    try {
        // Verifica si roundedDistance es nulo
        if (roundedDistance === null) {
            throw new Error("roundedDistance no puede ser null");
        }

        let tripUrban = ""; // Usar 'let' permite modificar tripUrban más adelante
        if (roundedDistance >= 25) {
            tripUrban = "Intermunicipal";
        } else {
            tripUrban = "Urbano";
        }
        return tripUrban;
    } catch (error) {
        // Manejar el error, por ejemplo, registrando el error y retornando un valor por defecto o un mensaje
        console.error("Error: " + error.message);
        return "Error en la entrada de datos"; // Puedes elegir retornar lo que consideres apropiado en caso de error
    }
}

function generateReference() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomLetters = '';
    for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        randomLetters += letters[randomIndex];
    }
    return `Gigi-${randomLetters}`;
}
function generateRefereralId(firstName, lastName) {
    // Extrae la primera letra de cada nombre y conviértela a mayúscula
    const firstInitial = firstName[0].toUpperCase();
    const lastInitial = lastName[0].toUpperCase();

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomLetters = '';
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        randomLetters += letters[randomIndex];
    }
    // Concatena las iniciales al principio del ID generado
    return `GIREF-${firstInitial}${lastInitial}${randomLetters}`;
}

function generateOTP() {
    // Generate a random number between 0 and 99999, then pad with zeros to ensure it's always 5 digits
    const otp = Math.floor(Math.random() * 100000);  // Generates a number from 0 to 99999
    return otp.toString().padStart(5, '0');  // Ensures the OTP is 5 digits
}

function parseDurationToMinutes(duration) {
    console.log("Parsing duration:", duration);  // Log the input for debugging

    const units = {
        day: 1440,      // 1 day = 1440 minutes
        days: 1440,
        hour: 60,       // 1 hour = 60 minutes
        hours: 60,
        hr: 60,         // 1 hour = 60 minutes (abbreviation)
        hrs: 60,        // multiple hours (abbreviation)
        minute: 1,      // 1 minute = 1 minute
        minutes: 1,
        min: 1,         // 1 minute = 1 minute (abbreviation)
        mins: 1         // multiple minutes (abbreviation)
    };

    const regex = /(\d+)\s*(day|days|hour|hours|hr|hrs|minute|minutes|min|mins)\b/i;
    const match = duration.match(regex);

    if (match) {
        const value = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();
        return value * (units[unit] || 0);
    }

    return 0; // Default to 0 if parsing fails
}


async function getCarTypeAndImage(carType) {
    const carTypesRef = admin.database().ref('cartypes');
    const carTypesSnapshot = await carTypesRef.once('value');
    const carTypes = carTypesSnapshot.val();
    let carImage = "";
    let convenienceFee = 0; // Inicializar como 0 por defecto
    let convenience_fee_types = "";


    for (const key in carTypes) {
        if (carTypes[key].name === carType) {
            carImage = carTypes[key].image || "";
            convenienceFee = carTypes[key].convenience_fees || 0; // Asegurar que siempre haya un valor,
            convenience_fee_types = carTypes[key].convenience_fee_type || 0
            min_fare = carTypes[key].min_fare|| 0
            rate_per_hour=carTypes[key].rate_per_hour|| 0
            rate_per_unit_distance = carTypes[key].rate_per_unit_distance|| 0
            break;
        }
    }

    if (!carImage) {
        throw new Error('Car type not found or does not have an associated image.');
    }

    return { carType, carImage, convenienceFee, convenience_fee_types ,min_fare ,rate_per_hour,rate_per_unit_distance};
}

function getCurrentTimestamp() {
    return Date.now(); // Retorna el timestamp actual
}
async function getCoordinatesAndDistance(pickup, drop) {
    const apiKey = ApiKey.googleApiKeys.server;

    // URLs for geocoding requests
    const pickupUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(pickup)}&key=${apiKey}`;
    const dropUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(drop)}&key=${apiKey}`;

    try {
        const [pickupResponse, dropResponse] = await Promise.all([
            fetch(pickupUrl).then(response => response.json()),
            fetch(dropUrl).then(response => response.json())
        ]);

        if (pickupResponse.status !== 'OK' || dropResponse.status !== 'OK') {
            throw new Error(`Geocoding failed: ${pickupResponse.status}, ${dropResponse.status}`);
        }

        const pickupCoordinates = {
            latitude: pickupResponse.results[0].geometry.location.lat,
            longitude: pickupResponse.results[0].geometry.location.lng
        }; 
        const dropCoordinates = {
            latitude: dropResponse.results[0].geometry.location.lat,
            longitude: dropResponse.results[0].geometry.location.lng
        };

        const distanceMatrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickupCoordinates.latitude},${pickupCoordinates.longitude}&destinations=${dropCoordinates.latitude},${dropCoordinates.longitude}&key=${apiKey}`;

        const distanceResponse = await fetch(distanceMatrixUrl);
        const distanceResult = await distanceResponse.json();

        if (distanceResult.status !== 'OK') {
            throw new Error(`Distance Matrix failed: ${distanceResult.status}`);
        }

        const distance = distanceResult.rows[0].elements[0].distance.text;
        const durationText = distanceResult.rows[0].elements[0].duration.text;
        const durationMinutes = parseDurationToMinutes(durationText); 
        const durationMinutestimestap = parseDurationToHHMMSS(durationText); // Convert the duration to minutes
        

        return {
            coords: [pickupCoordinates, dropCoordinates],
            distance: distance,
            durationMinutes: durationMinutes,  // Return duration in minutes
            dropCords: dropCoordinates,
            pickupCords: pickupCoordinates,
            durationMinutestimestap:durationMinutestimestap
            
        };

    } catch (error) {
        console.error("Error fetching coordinates and distance:", error);
        throw error;
    }
}


function parseDurationToHHMMSS(duration) {
    const units = {
        day: 1440,
        days: 1440,
        hour: 60,
        hours: 60,
        hr: 60,
        hrs: 60,
        minute: 1,
        minutes: 1,
        min: 1,
        mins: 1
    };

    const regex = /(\d+)\s*(day|days|hour|hours|hr|hrs|minute|minutes|min|mins)\b/i;
    const match = duration.match(regex);

    if (match) {
        const value = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();
        const totalMinutes = value * (units[unit] || 0);
        const totalSeconds = totalMinutes * 60;

        // Convert total seconds to HH:MM:SS
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return {
            formattedTime: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
            totalSeconds: totalSeconds
        };
    }

    return { formattedTime: "00:00:00", totalSeconds: 0 };
}
async function getUserDetailsByEmail(email) {
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;

        // Acceder a la base de datos para obtener más información del usuario
        const userRef = admin.database().ref(`users/${uid}`);
        const snapshot = await userRef.once('value');
        const userData = snapshot.val() || {};

        // Extraer datos específicos o usar valores predeterminados
        const customerImage = userData.profile_image || "";
        const customerName = userData.firstName + ' ' + userData.lastName || "No name";

        const customerToken = userData.customer_token || "No Token Available";
        const customerContact = userData.mobile || "No mobile Available";

        return { uid, customerImage, customerName, customerToken ,customerContact};
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;  // Propagar el error para manejarlo adecuadamente
    }
}
function parseAndRoundDistance(distance) {
    // Replace commas with dots if the number uses comma as decimal separator
    const numericPart = distance.replace(',', '.').split(' ')[0];
    // Convert to float and round it
    return Math.round(parseFloat(numericPart));
}




