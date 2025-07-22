import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route ,useNavigate} from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import { useDispatch } from "react-redux";
import { fetchCarTypes } from "./actions/carTypesActions";
import { fetchUsers } from "./actions/userActions";


import LoginPage from './views/LoginPage';
import HomePage from './views/HomePage';
import BookingCorp from './views/BookingCorp';
import BookingHistory from './views/BookingHistory';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import { FirebaseProvider } from './common/configFirebase';
import Dashboard from './views/Dashboard';
import BookingDetails from './views/BookingDetails';
import UsersPage from './views/UsersPage';
import { fetchTolls } from "./actions/tollsActions";
import ProfilePage from "./views/ProfilePage";
import { fetchPromos } from "./actions/offersActions";
import TreasOffers from "./views/TreasOffers";
import BilligModule from "./views/BillingModule";
import AddBooking from "./views/AddBooking";
import OfficialsView from './views/OfficialsView'
import ShiftChanger from "./views/ShiftChanger";
import ComplaintsView from "./views/ComplaintsView";
import NotificationsPage from "./views/NotificationsPage";
import { fetchLanguages } from "./slices/languageSlice";
import { useSelector } from "react-redux";
import RedirectIfCompany from './components/RedirectIfCompany'; // Importar el nuevo componente

import { fetchCancelReasons } from './slices/cancelReasonsSlice';
import SettingsView from "./views/SettingsView";
import ContractsView from "./views/ContractsView";
import TollsPage from "./views/TollsPage";
import { RootState } from './store/store';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchTolls());
    dispatch(fetchCancelReasons());
    dispatch(fetchLanguages());


  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCarTypes());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPromos());
  }, [dispatch]);

  return (
    <FirebaseProvider>
      <BrowserRouter>

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            } />
            <Route path="/home" element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            } />
            <Route path="/bookingCorp" element={
              <PrivateRoute>
                <BookingCorp />
              </PrivateRoute>
            } />
            <Route path="/bookingHistory" element={
              <PrivateRoute>
                <BookingHistory />
              </PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/bookingdetails" element={
              <PrivateRoute>
                <BookingDetails />
              </PrivateRoute>
            } />
            <Route path="/users/*" element={
              <PrivateRoute>
                <UsersPage />
              </PrivateRoute>
            } />
            <Route path="/userporfile" element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } />
            <Route path="/treasoffers" element={
              <PrivateRoute>
                <TreasOffers />
              </PrivateRoute>
            } />
            <Route path="/billingmodule" element={
              <PrivateRoute>
                <BilligModule />
              </PrivateRoute>
            } />
            <Route path="/addbooking" element={
              <PrivateRoute>
                <AddBooking />
              </PrivateRoute>
            } />
            <Route path="/officialview" element={
              <PrivateRoute>
                <OfficialsView />
              </PrivateRoute>
            } />
            <Route path="/shiftchanger" element={
              <PrivateRoute>
                <ShiftChanger />
              </PrivateRoute>
            } />
            <Route path="/complaints" element={
              <PrivateRoute>
                <ComplaintsView />
              </PrivateRoute>
            } />
            <Route path="/contracts" element={
              <PrivateRoute>
                <ContractsView />
              </PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute>
                <SettingsView />
              </PrivateRoute>
            } />
            <Route path="/tolls" element={
              <PrivateRoute>
                <TollsPage />
              </PrivateRoute>
            } />
             <Route path="/notifications" element={
              <PrivateRoute>
                <NotificationsPage/>
              </PrivateRoute>
            } />
          </Route>
          <Route path="*" element={<RedirectIfCompany />} />

        </Routes>
      </BrowserRouter>
    </FirebaseProvider>
  );
}

export default App;
