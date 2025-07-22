import React from 'react';
import moment from 'moment/min/moment-with-locales';
import { colors } from "../components/Theme/WebTheme";
import {
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Grid,
} from '@mui/material';
import { useTranslation } from "react-i18next";
import OtherPerson from 'components/OtherPerson';
import { Tag } from 'antd'

export const calcEst = false;
export const showEst = true;
export const optionsRequired = false;
export const FONT_FAMILY =  '"Roboto", "Helvetica", "Arial", sans-serif';


export const MAIN_COLOR = colors.TAXIPRIMARY;
export const SECONDORY_COLOR = colors.TAXISECONDORY;

export const bookingHistoryColumns = (role, settings, t, isRTL) => [
  { title: t('booking_ref'), field: 'reference' },
  {
    title: 'Reserva WEB/APP/CHAT', field: 'booking_from_web',
    render: rowData => (
      <span>
        {rowData.booking_from_chat ? (
          <Tag color="#FF5B5B">{t('CHAT')}</Tag>
        ) : rowData.booking_from_web ? (
          <Tag color="red">{t('WEB')}</Tag>
        ) : (
          <Tag color="#a1a3a6">{t('APP')}</Tag>
        )}
      </span>
    ),
  },
  {
    title: t('Reserva Programada'), field: 'bookLater',
    render: rowData => (
      <span>
        {rowData.bookLater ? (
          <Tag color="red">{t('Programado')}</Tag>
        ) : (
          <Tag color="#a1a3a6">{t('Inmediato')}</Tag>
        )}
      </span>
    ),
  },
  {
    title: t('Tipo de viaje'),
    field: 'tripUrban',

  },
  { title: t('booking_date'), field: 'bookingDate', render: rowData => rowData.bookingDate ? moment(rowData.bookingDate).format('lll') : null },

  { title: t('trip_start_date'), field: 'tripdate', render: rowData => rowData.tripdate ? moment(rowData.tripdate).format('lll') : null },
  { title: t('trip_start_time'), field: 'tripdate', render: rowData => rowData.trip_start_time },

  
  { title: t('trip_end_time'), field: 'trip_end_time' },
  {
    title: t('car_type'), field: 'carType',
    render: (rowData) => {
      if (role === 'insurers') {
        return rowData.carType.includes('TREAS') ? rowData.carType : 'TREAS-X';
      } else {
        return rowData.carType;
      }
    },
  },
  { title: t('pickup_address'), field: 'pickupAddress', hidden: true, },
  { title: t('drop_address'), field: 'dropAddress', hidden: true, },
  { title: t('Tipo de Recorrido'), field: t('tripType') },
  {title: 'Habitación', field: 'rooms', hidden: role === 'admin' ? true : false },
  { title: t('customer_name'), field: 'customer_name' },
  { title: t('assign_driver'), field: 'driver_name' },
  { title: t('vehicle_no'), field: 'vehicle_number' },
  { title: t('vehicle_make'), field: 'vehicleMake' },
  { title: t('Color de Vehículo'), hidden: role === 'company' ? true : false, field: 'vehicleColor', },
  {
    title: t('booking_status_web'), field: 'status',
    render: rowData =>
      <div
        style={{ backgroundColor: rowData.status === "CANCELLED" ? '#4f0000' : rowData.status === 'STARTED' ? 'white' : rowData.status === "COMPLETE" ? colors.GREEN : rowData.status === "ACCEPTED" ? '#FF5B5B' :'#a1a3a6', color:  rowData.status === 'STARTED' ?  "#F20505" : 'white', padding: 7, borderRadius: "15px", fontWeight: "bold", width: "150px", margin: 'auto' }}
      >{t(rowData.status)}</div>,
  },
  { title: t('otp'), field: 'otp' },
  {
    title: t('trip_cost'),
    hidden:role === 'company' ? true : false, field: 'trip_cost',
    field: 'trip_cost',
    render: (rowData) =>
      rowData.trip_cost
        ? settings.swipe_symbol
          ? rowData.trip_cost + " " + settings.symbol
          : settings.symbol + " " + rowData.trip_cost
        : settings.swipe_symbol
          ? "0 " + settings.symbol
          : settings.symbol + " 0",
  },
  { title: t('total_time'), field: 'total_trip_time' },
  { title: t('distance'), field: 'distance' },
  {
    title: t('payment_mode'),
    field: 'payment_mode',
    render: rowData => {
      if (role === 'company' && rowData.payment_mode === 'corp') {
        return t('Empresarial');
      } else {
        switch (rowData.payment_mode) {
          case 'cash':
            return t('Efectivo');
          case 'corp':
            return t('Empresarial');
          case 'wallet':
            return t('Billetera');
          case 'card':
            return t('Tarjeta');
          case 'Daviplata':
            return t('Daviplata');
          default:
            return rowData.payment_mode;
        }
      }
    },
  },
  {
    title: t('Customer_paid'), field: 'customer_paid', hidden: role === 'company' ? true : false,
    render: (rowData) =>
      rowData.customer_paid
        ? settings.swipe_symbol
          ? rowData.customer_paid + " " + settings.symbol
          : settings.symbol + " " + rowData.customer_paid
        : settings.swipe_symbol
          ? "0 " + settings.symbol
          : settings.symbol + " 0",
  },

  //-------------------------- Empresa -------------------------------------------------------------------//
  {
    title: 'El cliente pago Empresarial', field: 'cost_corp',
    render: (rowData) =>
      rowData.cost_corp
        ? settings.swipe_symbol
          ? rowData.cost_corp + " " + settings.symbol
          : settings.symbol + " " + rowData.cost_corp
        : settings.swipe_symbol
          ? "0 " + settings.symbol
          : settings.symbol + " 0",
  },
  {
    title: 'Comision Hotel', field: 'comicomisionCorpsion',
    render: (rowData) =>
      rowData.comicomisionCorpsion
        ? settings.swipe_symbol
          ? rowData.comicomisionCorpsion + " " + settings.symbol
          : settings.symbol + " " + rowData.comicomisionCorpsion
        : settings.swipe_symbol
          ? "0 " + settings.symbol
          : settings.symbol + " 0",
  },
  {
    title: 'Hosting Tecnológico',
    field: 'Technological_Hosting',
  },
  { title: 'Base impuestos', field: 'Base_de_IVA' },
  { title: 'IVA', field: 'Iva' },
  { title: 'Empresas', field: 'bussinesName', hidden: role === 'company' ? true : false, },
  {
    title: 'Paquetes de pólizas', field: 'PolicyPackage',
    render: (rowData) => {
      if (rowData.payment_mode === 'corp') {
        return settings.swipe_symbol ? "800 " + settings.symbol : settings.symbol + " 800";
      } else {
        return settings.swipe_symbol ? "0 " + settings.symbol : settings.symbol + " 0";
      }
    }
  },
  {
    title: 'Ganancias TREAS', field: 'ProfitsTreas',
    render: (rowData) =>
      rowData.ProfitsTreas
        ? settings.swipe_symbol
          ? rowData.ProfitsTreas + " " + settings.symbol
          : settings.symbol + " " + rowData.ProfitsTreas
        : settings.swipe_symbol
          ? "0 " + settings.symbol
          : settings.symbol + " 0",
    hidden: role === 'company' ? true : false,
  },



  //-------------------------- Empresa -------------------------------------------------------------------//


  {
    title: t('trip_cost_driver_share'),  field: 'driver_share',
    render: (rowData) =>
      rowData.trip_cost
        ? settings.swipe_symbol
          ? rowData.trip_cost + " " + settings.symbol
          : settings.symbol + " " + rowData.trip_cost
        : settings.swipe_symbol
          ? "0 " + settings.symbol
          : settings.symbol + " 0",
  },
  {
    title: t('convenience_fee'), hidden: role === 'company' ? true : false, field: 'convenience_fees',
    render: (rowData) =>
      rowData.convenience_fees
        ? settings.swipe_symbol
          ? rowData.convenience_fees + " " + settings.symbol
          : settings.symbol + " " + rowData.convenience_fees
        : settings.swipe_symbol
          ? "0 " + settings.symbol
          : settings.symbol + " 0",
  },
];

export const BookingModalBody = (props) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir();
  const { classes, handleChange, auth, profileData, instructionData, otherPerson, setOtherPerson } = props;
  return (
    <span>
      {auth.profile.usertype === 'customer' && !auth.profile.firstName ?
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            margin="normal"
            required={auth.profile.firstName ? false : true}
            fullWidth
            id="firstName"
            label={t('firstname')}
            name="firstName"
            autoComplete="firstName"
            onChange={handleChange}
            value={profileData.firstName}
            autoFocus
            className={isRTL === 'rtl' ? classes.inputRtl : classes.textField}
            style={{ direction: isRTL === 'rtl' ? 'rtl' : 'ltr' }}
          />
        </Grid>
        : null}
      {auth.profile.usertype === 'customer' && !auth.profile.lastName ?
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            margin="normal"
            required={auth.profile.lastName ? false : true}
            fullWidth
            id="lastName"
            label={t('lastname')}
            name="lastName"
            autoComplete="lastName"
            onChange={handleChange}
            value={profileData.lastName}
            className={isRTL === 'rtl' ? classes.inputRtl : classes.textField}
            style={{ direction: isRTL === 'rtl' ? 'rtl' : 'ltr' }}
          />
        </Grid>
        : null}
      {auth.profile.usertype === 'customer' && !auth.profile.email ?
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            margin="normal"
            required={auth.profile.email ? false : true}
            fullWidth
            id="email"
            label={t('email')}
            name="email"
            autoComplete="email"
            onChange={handleChange}
            value={profileData.email}
            className={isRTL === 'rtl' ? classes.inputRtl : classes.textField}
            style={{ direction: isRTL === 'rtl' ? 'rtl' : 'ltr' }}
          />
        </Grid>
        : null}
      <OtherPerson
        classes={classes}
        otherPerson={otherPerson}
        handleChange={handleChange}
        setOtherPerson={setOtherPerson}
        instructionData={instructionData}
      />
      <Typography component="h2" variant="h5" style={{ marginTop: 15, color: '#000' }}>
        {t('estimate_fare_text')}
      </Typography>
    </span>
  )
}

export const validateBookingObj = (t, bookingObject, instructionData) => {
  delete bookingObject.driverEstimates;
  return { bookingObject };
}

export const PanicSettings = (props) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir();
  const { classes, data, handleTextChange } = props;
  return (
    <span>
      <Typography component="h1" variant="h5" style={{ marginTop: '15px', textAlign: isRTL === 'rtl' ? 'right' : 'left' }}>
        {t('panic_num')}
      </Typography>
      <TextField
        variant="outlined"
        margin="normal"
        fullWidth
        id="panic"
        label={t('panic_num')}
        className={isRTL === "rtl" ? [classes.rootRtl_1, classes.right] : classes.textField}
        name="panic"
        autoComplete="panic"
        onChange={handleTextChange}
        value={data.panic}
      />
    </span>
  )
}

export const DispatchSettings = (props) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir();
  const { autoDispatch, onChange } = props;
  return (
    <FormControlLabel
      style={{ flexDirection: isRTL === 'rtl' ? 'row-reverse' : 'row' }}
      control={
        <Switch
          checked={autoDispatch}
          onChange={onChange}
          name="autoDispatch"
          color="primary"
        />
      }
      label={t('auto_dispatch')}
    />
  )
}

export const BookingImageSettings = (props) => {
  return null;
}

export const carTypeColumns = (t, isRTL, onClick) => [
  { title: t('name'), field: 'name', },
  {
    title: t('image'), field: 'image',
    initialEditValue: 'https://cdn.pixabay.com/photo/2012/04/15/22/09/car-35502__480.png',
    render: rowData => rowData.image ? <button onClick={() => { onClick(rowData) }}><img alt='CarImage' src={rowData.image} style={{ width: 50 }} /></button> : null
  },
  { title: t('base_fare'), field: 'base_fare', type: 'numeric', initialEditValue: 0 },
  { title: t('rate_per_unit_distance'), field: 'rate_per_unit_distance', type: 'numeric', initialEditValue: 0 },
  { title: t('rate_per_hour'), field: 'rate_per_hour', type: 'numeric', initialEditValue: 0 },
  { title: t('min_fare'), field: 'min_fare', type: 'numeric', initialEditValue: 0 },
  { title: t('convenience_fee'), field: 'convenience_fees', type: 'numeric', initialEditValue: 0 },
  {
    title: t('convenience_fee_type'),
    field: 'convenience_fee_type',
    lookup: { flat: t('flat'), percentage: t('percentage') },
  },
  {
    title: t('fleet_admin_comission'), field: 'fleet_admin_fee', type: 'numeric',
    initialEditValue: 0
  },
  { title: t('extra_info'), field: 'extra_info', },
  { title: t('position'), field: 'pos', type: 'numeric', defaultSort: 'asc' }
];

export const acceptBid = (selectedBooking, selectedBidder) => {
  return null;
}

export const BidModal = (props) => {
  return null
}

export const downloadCsv = (data, fileName) => {
  const finalFileName = fileName.endsWith(".csv") ? fileName : `${fileName}.csv`;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([data], { type: "text/csv" }));
  a.setAttribute("download", finalFileName);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export const DeliveryFlow = (props) => {
  return null
}