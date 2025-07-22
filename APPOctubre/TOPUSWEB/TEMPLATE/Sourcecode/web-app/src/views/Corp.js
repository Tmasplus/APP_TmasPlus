import React, { useState, useEffect, useRef } from 'react';
import { downloadCsv } from '../common/sharedFunctions';
import MaterialTable from "material-table";
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { api } from 'common';
import { useTranslation } from "react-i18next";
import moment from 'moment/min/moment-with-locales';
import { colors } from '../components/Theme/WebTheme';
import Switch from "@mui/material/Switch";
import { useNavigate } from 'react-router-dom';
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { SECONDORY_COLOR } from "../common/sharedFunctions";

export default function Users() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir();
  const settings = useSelector(state => state.settingsdata.settings);
  const navigate = useNavigate();
  const {
    editUser,
    deleteUser,
    fetchUsersOnce
  } = api;
  const [data, setData] = useState([]);
  const [sortedData, SetSortedData] = useState([]);
  const staticusers = useSelector(state => state.usersdata.staticusers);
  const dispatch = useDispatch();
  const loaded = useRef(false);

  useEffect(() => {
    dispatch(fetchUsersOnce());
  }, [dispatch, fetchUsersOnce]);

  useEffect(() => {
    if (staticusers) {
      setData(staticusers.filter(user => user.usertype === 'company'));
    } else {
      setData([]);
    }
    loaded.current = true;
  }, [staticusers]);


  useEffect(() => {
    if (data) {
      SetSortedData(data.sort((a, b) => (moment(b.createdAt) - moment(a.createdAt))))
    }
  }, [data])

  const columns = [
    { title: t('createdAt'), field: 'createdAt', editable: 'never', defaultSort: 'desc', render: rowData => rowData.createdAt ? moment(rowData.createdAt).format('lll') : null },
    { title: t('Uid'), field: 'id', },
    { title: t('Razón Social'), field: 'bussinesName', initialEditValue: '', },
    { title: t('Número de Identificación Tributaria.'), field: 'NIT', initialEditValue: '', },
    { title: t('Tipo de Documento'), field: 'NITType', initialEditValue: 'NIT', editable: 'never', },
    { title: t('mobile'), field: 'mobile', editable: 'onAdd', render: rowData => settings.AllowCriticalEditsAdmin ? rowData.mobile : "Hidden for Demo" },
    {
      title: t('email'),
      field: 'email',
      editable: 'onAdd', render: rowData => settings.AllowCriticalEditsAdmin ? rowData.email : "Hidden for Demo", headerStyle: { textAlign: 'center' }
    },
    {
      title: t("profile_image"),
      field: "profile_image",
      render: (rowData) =>
        rowData.profile_image ? (
          <img
            alt="Profile"
            src={rowData.profile_image}
            style={{ width: 40, height: 40, borderRadius: "50%" }}
          />
        ) : (
          <AccountCircleIcon sx={{ fontSize: 40 }} />
        ),
      editable: "never",
    },

    { title: t('comisión'), field: 'commission', type: 'numeric', initialEditValue: 38 },
    { title: 'Metodo de pago', field: 'businessPayment', type: 'numeric', initialEditValue: 0, },
    {
      title: t("account_approve"),
      field: "approved",
      type: "boolean",
      render: (rowData) => (
        <Switch
          color="error"
          checked={rowData.approved}
          onChange={() => handelApproved(rowData)}
        />
      ),
    },
    {
      title: t("Crear sub usuarios"),
      field: "AccessSubUsers",
      type: "boolean",
      render: (rowData) => (
        <Switch
          color="error"
          checked={rowData.AccessSubUsers}
          onChange={() => handelAccessSubUsers(rowData)}
        />
      ),
    },
    { title: 'Hotel/Empresa', field: 'organizations' }

  ];


  const [selectedRow, setSelectedRow] = useState(null);
  const handelApproved = (rowData) => {
    const updatedUser = { ...rowData, approved: !rowData.approved };

    dispatch(editUser(updatedUser.id, updatedUser));
    dispatch(fetchUsersOnce());
    return updatedUser;
  };



  /*
    const handelAccessSubUsers = (rowData) => {
      const updatedUser = { ...rowData, AccessSubUsers: !rowData.AccessSubUsers };
      dispatch(editUser(updatedUser.id, updatedUser));
      dispatch(fetchUsersOnce());
      return updatedUser;
    }*/



  const handelAccessSubUsers = (rowData) => {
    // Creamos un nuevo array de subusuarios con los datos predeterminados
    const defaultSubuser = {
      InTurn: false,
      Name: "user 1",
      email: "user1@treascorp.co"
    };

    // Si el usuario ya tiene una lista de subusuarios, agregamos el nuevo subusuario predeterminado
    const updatedSubusers = rowData.subusers ? [...rowData.subusers, defaultSubuser] : [defaultSubuser];

    // Creamos una copia del usuario actualizado con la lista de subusuarios actualizada
    const updatedUser = { ...rowData, AccessSubUsers: !rowData.AccessSubUsers, subusers: updatedSubusers };

    // Actualizamos el usuario en la base de datos y refrescamos la lista de usuarios
    dispatch(editUser(updatedUser.id, updatedUser));
    dispatch(fetchUsersOnce());

    return updatedUser;
  }


  return (
    !loaded.current ? <CircularLoading /> :
      <MaterialTable
        title={t('Administrador de Empresas')}
        columns={columns}
        style={{
          direction: isRTL === "rtl" ? "rtl" : "ltr",
          borderRadius: "8px",
          boxShadow: `0px 2px 5px ${SECONDORY_COLOR}`,
          padding: "20px",
        }}
        data={sortedData}

        onRowClick={((evt, selectedRow) => setSelectedRow(selectedRow.tableData.id))}
        options={{
          pageSize: 10,
          pageSizeOptions: [10, 15, 20],
          exportCsv: (columns, data) => {
            let hArray = [];
            const headerRow = columns.map(col => {
              if (typeof col.title === 'object') {
                return col.title.props.text;
              }
              hArray.push(col.field);
              return col.title;
            });
            const dataRows = data.map(({ tableData, ...row }) => {
              row.createdAt = new Date(row.createdAt).toLocaleDateString() + ' ' + new Date(row.createdAt).toLocaleTimeString()
              let dArr = [];
              for (let i = 0; i < hArray.length; i++) {
                dArr.push(row[hArray[i]]);
              }
              return Object.values(dArr);
            })
            const { exportDelimiter } = ",";
            const delimiter = exportDelimiter ? exportDelimiter : ",";
            const csvContent = [headerRow, ...dataRows].map(e => e.join(delimiter)).join("\n");
            const csvFileName = 'download.csv';
            downloadCsv(csvContent, csvFileName);
          },
          exportButton: {
            csv: settings.AllowCriticalEditsAdmin,
            pdf: false,
          },
          maxColumnSort: "all_columns",
          rowStyle: (rowData) => ({
            backgroundColor: selectedRow === rowData.tableData.id ? "#F5F5F5" : "white",
            border: "1px solid rgba(224, 224, 224, 1)",
          }),
          editable: {
            backgroundColor: colors.Header_Text,
            fontSize: "0.8em",
            fontWeight: "bold ",
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          },
          headerStyle: {
            color: colors.Black,
            position: "sticky",
            top: "0px",
            backgroundColor: SECONDORY_COLOR,
            textAlign: "center",
            fontSize: "0.8em",
            fontWeight: "bold ",
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            border: "1px solid rgba(224, 224, 224, 1)",
          },
          cellStyle: {
            border: "1px solid rgba(224, 224, 224, 1)",
            textAlign: "center",
          },
          actionsColumnIndex: -1,
        }}
        localization={{
          body: {
            addTooltip: (t('add')),
            deleteTooltip: (t('delete')),
            editTooltip: (t('edit')),
            emptyDataSourceMessage: (
              (t('blank_message'))
            ),
            editRow: {
              deleteText: (t('delete_message')),
              cancelTooltip: (t('cancel')),
              saveTooltip: (t('save'))
            },
          },
          toolbar: {
            searchPlaceholder: (t('search')),
            exportTitle: (t('export')),
          },
          header: {
            actions: (t('actions'))
          },
          pagination: {
            labelDisplayedRows: ('{from}-{to} ' + (t('of')) + ' {count}'),
            firstTooltip: (t('first_page_tooltip')),
            previousTooltip: (t('previous_page_tooltip')),
            nextTooltip: (t('next_page_tooltip')),
            lastTooltip: (t('last_page_tooltip'))
          },
        }}
        editable={{
          onRowDelete: oldData =>
            settings.AllowCriticalEditsAdmin ?
              new Promise(resolve => {
                setTimeout(() => {
                  resolve();
                  dispatch(deleteUser(oldData.id));
                  dispatch(fetchUsersOnce());
                }, 600);
              })
              :
              new Promise(resolve => {
                setTimeout(() => {
                  resolve();
                  alert(t('demo_mode'));
                }, 600);
              })
          ,


        }}

        actions={[
          {
            icon: 'add',
            tooltip: t("Añadir Empresa"),
            isFreeAction: true,
            onClick: (event) => navigate("/users/AddCompany")
          },
          {
            icon: 'edit',
            tooltip: t("edit"),
            onClick: (event, rowData) => navigate(`/users/companyupdate/${rowData.id}`)
          },


        ]}
      />
  );
}
