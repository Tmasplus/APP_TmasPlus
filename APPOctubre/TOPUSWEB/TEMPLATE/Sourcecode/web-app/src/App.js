import React from "react";
import { BrowserRouter, Routes, Route, } from 'react-router-dom'
import LandingPage from "./views/LandingPage.js";
import LoginPage from "./views/LoginPage.js";
import PrivacyPolicy from "./views/PrivacyPolicy.js";
import AboutUs from "./views/AboutUs";
import AuthLoading from './views/AuthLoading';
import { Provider } from "react-redux";
import ProtectedRoute from './views/ProtectedRoute';
import MyProfile from './views/MyProfile';
import BookingHistory from './views/BookingHistory';
import Dashboard from './views/Dashboard';
import CarTypes from './views/CarTypes';
import AddBookings from './views/AddBookings';
import Promos from './views/Promos';
import Users from './views/Users';
import CustomerDetails from "views/CustomerDetails.js";
import Notifications from './views/Notifications';
import Settings from './views/Settings.js';
import Complain from "views/Complain.js";
import AddMoney from "./views/AddMoney";
import DebitMony from "./views/DebiteMoney"
import Withdraws from './views/Withdraws';
import AllReports from "./views/AllReports";
import { FirebaseProvider, store } from "common";
import { FirebaseConfig } from './config/FirebaseConfig';
import { GoogleMapApiConfig } from './config/GoogleMapApiConfig';
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ContactUs from "./views/ContactUs";
import UserWallet from "./views/UserWallet";
import CarsList from "./views/CarsList";
import { ThemeProvider } from '@mui/styles';
import { createTheme } from '@mui/material';
import { useJsApiLoader } from '@react-google-maps/api';
import TermCondition from "views/TermCondition.js";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { webClientId } from "config/ClientIds.js";
import { HelmetProvider } from "react-helmet-async";
import Sos from './views/Sos';
import DriverDetails from "views/DriverDetails.js";
import Error from "views/Error.js";
import BookingDetails from "views/BookingDetails.js";
import UserDocuments from "views/UserDocuments.js";
import AddNotifications from "views/AddNotifications.js";
import EditPromo from "views/EditPromo.js";
import EditCar from "views/EditCar.js";
import EditCarType from "views/EditCarType.js";
import EditUser from "views/EditUser.js";
import PaymentSettings from "views/PaymentSettings.js";
import Billing from "views/Billing.js";
import CompanyDashboard from "./views/CompanyDashboard";
import AddCompany from "./views/AddCompany.js";
import Quejas from "./views/Quejas";
import UdateCompany from "./views/UdateCompany.js"
import Contracts from "./views/Contracts.js";
import SubUsers from "./views/SubUsers.js"
import Employees from "./views/Employees.js"
import AddRiders from "views/AddRiders.js";
import CompanyInvoices from "./views/CompanyInvoices.js"
import BillingModule from "./views/BillingModule.js"
import IdReferal from "./views/IdReferal.js"
import ChatBot from "./views/ChatBot.js"

const libraries = ['geometry','drawing','places'];

i18n
.use(initReactI18next) 
.init({
    resources: {},
    fallbackLng: "en",
    ns: ["translations"],
    defaultNS: "translations",
    interpolation: {
        escapeValue: false
    }
});

function App() {

  useJsApiLoader({
    id: 'google-map',
    googleMapsApiKey: GoogleMapApiConfig + "&loading=async",
    libraries
  })

  const theme = createTheme()

  return (
    <HelmetProvider>
    <Provider store={store}>
      <FirebaseProvider config={FirebaseConfig}>
        <GoogleOAuthProvider clientId={webClientId}>
        <ThemeProvider theme={theme}>
          <AuthLoading>
           <BrowserRouter>
              <Routes>
              <Route path="/dashboard" element={<ProtectedRoute permit={"admin,fleetadmin"}><Dashboard /></ProtectedRoute>}/>
                <Route path="/bookings" element={<ProtectedRoute permit={"customer,admin,driver,fleetadmin,company"}><BookingHistory /></ProtectedRoute>}/>
                <Route path="/CompanyDashboard" element={<ProtectedRoute permit={"company,insurers"}><CompanyDashboard /></ProtectedRoute>} />
                <Route path="/bookings/bookingdetails/:id" element={<ProtectedRoute permit={"company,customer,admin,driver,fleetadmin"}><BookingDetails /></ProtectedRoute>}/>
                <Route path="/profile" element={<ProtectedRoute permit={"customer,admin,driver,fleetadmin,company"}><MyProfile /></ProtectedRoute>}/>
                <Route path="/cartypes" element={<ProtectedRoute permit={"admin"}><CarTypes /></ProtectedRoute>}/>
                <Route path="/cars" element={<ProtectedRoute permit={"admin,fleetadmin,driver"}><CarsList /></ProtectedRoute>}/>
                <Route path="/addbookings" element={<ProtectedRoute permit={"admin,fleetadmin,customer,company"}><AddBookings /></ProtectedRoute>}/>
                <Route path="/promos" element={<ProtectedRoute permit={"admin"}><Promos /></ProtectedRoute>}/>
                <Route path="/subUsers" element={<ProtectedRoute permit={"company"}><SubUsers /></ProtectedRoute>}/>
                <Route path="/users/:id" element={<ProtectedRoute permit={"admin,fleetadmin,company"}><Users /></ProtectedRoute>}/>
                <Route path="/users/customerdetails/:id" element={<ProtectedRoute permit={"admin,company"}><CustomerDetails/></ProtectedRoute>}  errorElement={<Error />} /> 
                <Route path="/users/driverdetails/:id" element={<ProtectedRoute permit={"admin,fleetadmin,insurers"}><DriverDetails /></ProtectedRoute>} errorElement={<Error />} />
                <Route path="/users/userdocuments/:rId/:id" element={<ProtectedRoute permit={"admin,company"}><UserDocuments/></ProtectedRoute>} />  
                <Route path="/notifications" element={<ProtectedRoute permit={"admin"}><Notifications /></ProtectedRoute>}/>
                <Route path="/addtowallet" element={<ProtectedRoute permit={"admin"}><AddMoney /></ProtectedRoute>}/>
                <Route path="/DebitWallet" element={<ProtectedRoute permit={"admin"}><DebitMony /></ProtectedRoute>}/>
                <Route path="/userwallet" element={<ProtectedRoute permit={"customer,driver"}><UserWallet /></ProtectedRoute>}/>
                <Route path="/withdraws" element={<ProtectedRoute permit={"admin"}><Withdraws /></ProtectedRoute>}/>
                <Route path="/sos" element={<ProtectedRoute permit={"admin"}><Sos /></ProtectedRoute>}/>
                <Route path="/Employees" element={<ProtectedRoute permit={"admin,company"}><Employees /></ProtectedRoute>}/>
                <Route path="/BillingModule" element={<ProtectedRoute permit={"admin"}><BillingModule /></ProtectedRoute>}/>
                <Route path="/complain" element={<ProtectedRoute permit={"admin"}><Complain /></ProtectedRoute>}/>
                <Route path="/Quejas" element={<ProtectedRoute permit={"admin,company"}><Quejas /></ProtectedRoute>}/>
                <Route path="contracts" element={<ProtectedRoute permit={"admin,driver"}><Contracts /></ProtectedRoute>} />
                <Route path="/allreports" element={<ProtectedRoute permit={"admin,fleetadmin"}><AllReports /></ProtectedRoute>}/>
                <Route path="/settings" element={<ProtectedRoute permit={"admin"}><Settings /></ProtectedRoute>}/>
                <Route path="/paymentsettings" element={<ProtectedRoute permit={"admin"}><PaymentSettings /></ProtectedRoute>}/>
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/term-condition" element={<TermCondition />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/users/edituser/:usertype" element={<ProtectedRoute permit={"admin,company"}><EditUser/></ProtectedRoute>}/>
                <Route path="/users/edituser/:usertype/:id" element={<ProtectedRoute permit={"admin,company"}><EditUser/></ProtectedRoute>}/>
                <Route path="/notifications/addnotifications" element={<ProtectedRoute permit={"admin"}><AddNotifications/></ProtectedRoute>}/>
                <Route path="/cars/editcar" element={<ProtectedRoute permit={"admin,fleetadmin,driver"}><EditCar/></ProtectedRoute>}/>
                <Route path="/cars/editcar/:id" element={<ProtectedRoute permit={"admin,fleetadmin,driver"}><EditCar/></ProtectedRoute>}/>
                <Route path="/promos/editpromo" element={<ProtectedRoute permit={"admin"}><EditPromo/></ProtectedRoute>}/>
                <Route path="/promos/editpromo/:id" element={<ProtectedRoute permit={"admin"}><EditPromo/></ProtectedRoute>}/>
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/cartypes/editcartype" element={<ProtectedRoute permit={"admin,fleetadmin,driver"} ><EditCarType/></ProtectedRoute>} />
                <Route path="/cartypes/editcartype/:id" element={<ProtectedRoute permit={"admin,fleetadmin,driver"}><EditCarType/></ProtectedRoute>}/>
                <Route path="/billing" element={<ProtectedRoute permit={"admin,company"}><Billing /></ProtectedRoute>} />
                <Route path="/companyInvoices" element={<ProtectedRoute permit={"admin"}><CompanyInvoices /></ProtectedRoute>} />
                <Route path="/users/AddCompany" element={<ProtectedRoute permit={"admin"}><AddCompany /></ProtectedRoute>} />
                <Route path="/users/companyupdate/:id" element={<ProtectedRoute permit={"admin,fleetadmin"}><UdateCompany/></ProtectedRoute>} errorElement={<Error/>}/> 
                <Route path="/users/addrider" element={<ProtectedRoute permit={"admin,company"}><AddRiders /></ProtectedRoute>} />
                <Route path="/idReferal" element={<ProtectedRoute permit={"admin"}><IdReferal /></ProtectedRoute>} />
                <Route path="/chatBot" element={<ProtectedRoute permit={"admin"}><ChatBot /></ProtectedRoute>} />

                <Route path="/*" element={<Error/>} />
                <Route path="/" element={<LandingPage />} />
              </Routes>
            </BrowserRouter>
          </AuthLoading>
        </ThemeProvider>
        </GoogleOAuthProvider>
      </FirebaseProvider>
    </Provider>
    </HelmetProvider>
  );
}

export default App;