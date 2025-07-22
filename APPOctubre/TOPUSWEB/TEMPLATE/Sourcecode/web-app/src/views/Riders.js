import React, { useState, useEffect, useRef } from "react";
import { downloadCsv } from "../common/sharedFunctions";
import MaterialTable from "material-table";
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { api } from "common";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { colors } from "../components/Theme/WebTheme";
import { Typography } from "@mui/material";
import AlertDialog from "../components/AlertDialog";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Switch from "@mui/material/Switch";
import moment from 'moment/min/moment-with-locales';
import { MAIN_COLOR, SECONDORY_COLOR } from "../common/sharedFunctions"
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@material-ui/core/Tooltip';
import { getUserVerification } from "../common/topus-integration";
import { notification } from 'antd';


export default function Users() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir();
  const {
    editUser,
    deleteUser,
    fetchUsersOnce,
  } = api;
  const settings = useSelector((state) => state.settingsdata.settings);
  const [data, setData] = useState([]);
  const [sortedData, SetSortedData] = useState([]);
  const staticusers = useSelector((state) => state.usersdata.staticusers);
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const loaded = useRef(false);
  const [role] = useState(null);

  useEffect(() => {
    dispatch(fetchUsersOnce());
  }, [dispatch, fetchUsersOnce]);

  useEffect(() => {
    if (staticusers) {
      setData(
        staticusers.filter(
          (user) =>
            user.usertype === "customer" &&
            ((user.company === auth.profile.uid &&
              auth.profile.usertype === "company") ||
              auth.profile.usertype === "admin")
        )
      );
    } else {
      setData([]);
    }
    loaded.current = true;
  }, [staticusers, auth.profile]);



  useEffect(() => {
    if (data) {
      SetSortedData(data.sort((a, b) => (moment(b.createdAt) - moment(a.createdAt))))
    }
  }, [data, sortedData])

  const columns = [
    { title: t('createdAt'), field: 'createdAt', editable: 'never', defaultSort: 'desc', render: rowData => rowData.createdAt ? moment(rowData.createdAt).format('lll') : null },
    { title: t("first_name"), field: "firstName" },
    { title: t("last_name"), field: "lastName" },
    {
      title: "Ciudad",
      field: "city",
      editable: "onAdd",
      render: (rowData) =>
        settings.AllowCriticalEditsAdmin ? rowData.city : t("hidden_demo"),
      headerStyle: { textAlign: "center" },
    },
    { title: 'Tipo de documento', field: 'docType', initialEditValue: "CC" },
    {
      title: 'N° Documento',
      field: 'verifyId',
      editable: "onAdd",
      render: (rowData) =>
        settings.AllowCriticalEditsAdmin ? rowData.verifyId : t("hidden_demo"),
    },
    {
      title: t("mobile"),
      field: "mobile",
      editable: "onAdd",
      render: (rowData) =>
        settings.AllowCriticalEditsAdmin ? rowData.mobile : t("hidden_demo"),
    },
    {
      title: t("email"),
      field: "email",
      editable: "onAdd",
      render: (rowData) =>
        settings.AllowCriticalEditsAdmin ? rowData.email : t("hidden_demo"),
    },
    {
      title: t("Billetera"),
      field: "walletBalance",
      editable: "onAdd",
      render: (rowData) =>
        settings.AllowCriticalEditsAdmin ? rowData.walletBalance : t("hidden_demo"),
      headerStyle: { textAlign: "center" },
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
    {
      title: t('referralId'),
      field: 'referralId',
    },
    {
      title: t('signup_via_referral'),
      field: 'signupViaReferral',
      hidden: role === 'company' ? true : false,
    },

    {
      title: 'Empresas',
      field: 'bussinesName',

    },
    {
      title: 'Funcionario',
      field: 'officialGuest',
      hidden: role === 'admin' ? true : false,
      render: rowData => rowData.officialGuest ? 'Funcionario' : 'Huésped'
    },
    {
      title: "Cantidad de documentos",
      field: "documentsCount",
      hidden: role === 'company' ? true : false,
      render: (rowData) => {
        const requiredFields = [
          "verifyIdImage",
        ];

        let count = 0;
        for (const field of requiredFields) {
          count += rowData[field] ? 1 : 0;
        }

        return (
          <Tooltip title={`${count.toString()} de 7 documentos`}>
            <span>{count.toString()}</span>
          </Tooltip>
        );
      },
    },
    {
      title: t("account_approve"),
      field: "approved",
      type: "boolean",
      hidden: role === 'company' ? true : false,
      editable: role === 'admin' ? true : false,
      render: (rowData) => (
        <Switch
          checked={rowData.approved}
          onChange={() => handelApproved(rowData)}
          color="error"
        />
      ),
    },

    {
      title: t("Bloqueado"),
      field: "blocked",
      type: "boolean",
      initialEditValue: true,
      hidden: role === 'company' ? true : false,
      editable: role === 'admin' ? true : false,
      render: (rowData) => (
        <Switch
          checked={rowData.blocked}
          onChange={() => handleBlocked(rowData)}
          color="error"
        />
      ),
    },


    {
      title: 'Usuario Empresarial',
      field: "userempresa",
      type: "boolean",
      render: (rowData) => (
        <Switch
          checked={rowData.userempresa}
          onChange={() => handelEmpresarial(rowData)}
          color="error"
        />
      ),
    },
  ];


  const [selectedRow, setSelectedRow] = useState(null);

  const [commonAlert, setCommonAlert] = useState({ open: false, msg: "" });

  const handleCommonAlertClose = (e) => {
    e.preventDefault();
    setCommonAlert({ open: false, msg: "" });
  };
  const handelApproved = (rowData) => {
    const updatedUser = { ...rowData, approved: !rowData.approved };

    dispatch(editUser(updatedUser.id, updatedUser));
    dispatch(fetchUsersOnce());
    return updatedUser;
  };

  const handleBlocked = (rowData) => {
    const updatedUser = { ...rowData, blocked: !rowData.blocked };

    dispatch(editUser(updatedUser.id, updatedUser));
    dispatch(fetchUsersOnce());
    return updatedUser;

  }

  const handelEmpresarial = (rowData) => {
    const updatedUser = { ...rowData, userempresa: !rowData.userempresa };

    if (!updatedUser.userempresa) {
      delete updatedUser.company
    }


    dispatch(editUser(updatedUser.id, updatedUser));
    dispatch(fetchUsersOnce());
    return updatedUser;
  }

  const verifyUserInTopus = async (data) => {
    notification.info({
      message: 'Consulta de antecedentes en proceso',
      description: 'Su cuenta esta siendo verificada. Este proceso puede demorar unos minutos.',
      duration: 1.0,
      placement: 'bottomRight',
    });
    return await getUserVerification({
        'doc_type': data.docType,
        'identification': data.verifyId,
        'name': data.firstName,
    })
}



  const HandleTopus = async (rowData) => {

    notification.info({
      message: 'Consulta de antecedentes en proceso',
      description: 'Su cuenta esta siendo verificada. Este proceso puede demorar unos minutos.',
      duration: 1.0,
      placement: 'bottomRight',
    });
    
    let userData = {
        verifyId: rowData.verifyId ? rowData.verifyId : null,
        docType: rowData.docType ? rowData.docType : null,
        city: rowData.city ? rowData.city : null,
        addres: rowData.addres ? rowData.addres : null,
        bankAccount: rowData.bankAccount ? rowData.bankAccount : null,
        reviewed: false,
        updateAt: new Date().getTime()

    }
    if ((userData.docType && userData?.verifyId) && (auth.profile?.verifyId !== userData?.verifyId)) {
        try {
            const dateRequest = new Date().getTime();
            const results = await verifyUserInTopus(userData);
            const actualSecurityData = auth?.profile?.securityData || [];
            dispatch(editUser({
                securityData: [{
                    date: dateRequest,
                    verifyId: userData.verifyId,
                    firstName: auth?.profile.firstName,
                    lastName: auth?.profile.lastName,
                    docType: userData.docType,
                    antecedents: results,
                }, ...actualSecurityData],
                verifyId: userData.verifyId,
                docType: userData.docType,
            }));
            const hasAntecedents = results.some(result => {
                if (result?.entidad === 'policia') {
                    return result?.respuesta?.mensaje.trim().toLowerCase() !== 'NO TIENE ASUNTOS PENDIENTES CON LAS AUTORIDADES JUDICIALES'
                } else if (result?.entidad === 'simit') {
                    return result?.respuesta?.Simit.trim().toLowerCase() !== 'El ciudadano no presenta multas ni comparendos en el Simit.'
                } else if (result?.entidad === 'contraloria') {
                    return result?.respuesta?.Resultado.trim().toLowerCase() !== 'NO SE ENCUENTRA REPORTADO COMO RESPONSABLE FISCAL'
                } else if (result?.entidad === 'ofac') {
                    return !result?.respuesta?.archivo_respuesta.trim().toLowerCase().includes('No registra en la OFAC.')
                } else if (result?.entidad === 'interpol') {
                    return result?.respuesta?.Resultado.trim().toLowerCase() !== 'La persona NO presenta cargos ante el Interpol.'
                } else if (result?.entidad === 'ONU') {
                    return result?.respuesta?.Resultado.trim().toLowerCase() !== 'La persona NO registra en la ONU :'
                } else {
                    return false;
                }
            })
            if (hasAntecedents) {
                notification.info({
                  message: 'Consulta de antecedentes',
                  description: 'Su cuenta ha sido aprobada. ¡Bienvenido a TREASAPP!',
                  duration: 1.0,
                  placement: 'bottomRight',
                });
              
                dispatch(editUser({ blocked: false }))
                return;
            } else {
                // Si no hay antecedentes, la cuenta está aprobada
              //  Alert.alert('Consulta de antecedentes', 'Su cuenta no fue aprobada, por favor comuniquese con soporte, para resolver su caso.');
                notification.info({
                  message: 'Consulta de antecedentes',
                  description: 'Su cuenta no fue aprobada, por favor comuniquese con soporte, para resolver su caso.',
                  duration: 1.0,
                  placement: 'bottomRight',
                });
               
                dispatch(editUser({ blocked: true }))
            }
        } catch (error) {
            notification.info({
              message:  error.message,
              description:  'Ha ocurrido un error en la consulta de antecedentes, intentelo de nuevo',
              duration: 1.0,
              placement: 'bottomRight',
            });
           
            return;
        }
    }

   
    if ((auth.profile.usertype == 'driver' && settings.bank_fields) || (auth.profile.usertype == 'customer' && settings.bank_fields && settings.RiderWithDraw) && rowData.bankAccount && rowData.bankAccount.length &&
        rowData.bankCode && rowData.bankCode.length &&
        rowData.bankName && rowData.bankName.length) {
        userData.reviewed = false;
        userData.bankCode = rowData.bankCode;
        userData.bankName = rowData.bankName;
        userData.docType = rowData.docType;
        userData.city = rowData.city;
        userData.addres = rowData.addres;
        userData.bankAccount = rowData.bankAccount;
        userData.verifyId = rowData.verifyId;
    }
    dispatch(editUser(userData));
}


  return !loaded.current ? (
    <CircularLoading />
  ) : (
    <div>
      <MaterialTable
        title={t("riders_title")}
        columns={columns}
        style={{
          direction: isRTL === "rtl" ? "rtl" : "ltr",
          borderRadius: "8px",
          boxShadow: `0px 2px 5px ${SECONDORY_COLOR}`,
          border: "1px solid rgba(224, 224, 224, 1)",
          padding: "20px",
        }}
        data={sortedData}
        onRowClick={(evt, selectedRow) =>
          setSelectedRow(selectedRow.tableData.id)
        }
        options={{
          pageSize: 10,
          pageSizeOptions: [10, 15, 20],
          exportCsv: (columns, data) => {
            let hArray = [];
            const headerRow = columns.map((col) => {
              if (typeof col.title === "object") {
                return col.title.props.text;
              }
              hArray.push(col.field);
              return col.title;
            });
            const dataRows = data.map(({ tableData, ...row }) => {
              row.createdAt =
                new Date(row.createdAt).toLocaleDateString() +
                " " +
                new Date(row.createdAt).toLocaleTimeString();
              let dArr = [];
              for (let i = 0; i < hArray.length; i++) {
                dArr.push(row[hArray[i]]);
              }
              return Object.values(dArr);
            });
            const { exportDelimiter } = ",";
            const delimiter = exportDelimiter ? exportDelimiter : ",";
            const csvContent = [headerRow, ...dataRows]
              .map((e) => e.join(delimiter))
              .join("\n");
            const csvFileName = "download.csv";
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
            addTooltip: t("add"),
            deleteTooltip: t("delete"),
            editTooltip: t("edit"),
            emptyDataSourceMessage: t("blank_message"),
            editRow: {
              deleteText: t("delete_message"),
              cancelTooltip: t("cancel"),
              saveTooltip: t("save"),
            },
          },
          toolbar: {
            searchPlaceholder: t("search"),
            exportTitle: t("export"),
          },
          header: {
            actions: t("actions"),
          },
          pagination: {
            labelDisplayedRows: "{from}-{to} " + t("of") + " {count}",
            firstTooltip: t("first_page_tooltip"),
            previousTooltip: t("previous_page_tooltip"),
            nextTooltip: t("next_page_tooltip"),
            lastTooltip: t("last_page_tooltip"),
          },
        }}
        editable={{
          onRowDelete: (oldData) =>
            settings.AllowCriticalEditsAdmin
              ? new Promise((resolve) => {
                setTimeout(() => {
                  resolve();
                  dispatch(deleteUser(oldData.id));
                  dispatch(fetchUsersOnce());
                }, 600);
              })
              : new Promise((resolve) => {
                setTimeout(() => {
                  resolve();
                  alert(t("demo_mode"));
                }, 600);
              }),
        }}
        actions={[
          {
            icon: "add",
            tooltip: t("add_customer"),
            isFreeAction: true,
            onClick: (event) => {
              if (!auth.profile.usertype === 'company') {
                navigate("/users/edituser/customer")
              } else {
                navigate("/users/addrider")
              }
            },
          },
          (rowData) => ({
            tooltip: t("edit"),
            icon: () => (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginRight: 0
                }}
              >
                <EditIcon />
              </div>
            ),
            onClick: (event, rowData) => {
              navigate(`/users/edituser/customer/${rowData.id}`)
            }
          }),
          {
            icon: "info",
            tooltip: t("profile_page_subtitle"),
            onClick: (event, rowData) => {
              navigate(`/users/customerdetails/${rowData.id}`);

            },
          },

          (rowData) => ({
            icon: () => (
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", padding: 10, backgroundColor: MAIN_COLOR, borderRadius: 5, boxShadow: "0px 3px 5px 0px #B4B4B3" }}>

                <Typography style={{ color: colors.LandingPage_Background }}>
                  {t("documents")}
                </Typography>
              </div>
            ),
            tooltip: t('documents'),
            onClick: () => navigate(`/users/userdocuments/${id}/${rowData.id}`)
          }),

          (rowData) => ({
            icon: () => (
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", padding: 10, backgroundColor: '#f20505', borderRadius: 5, boxShadow: "0px 3px 5px 0px #B4B4B3" }}>

                <Typography style={{ color: colors.LandingPage_Background }}>
                  {t("Estudio de seguridad")}
                </Typography>
              </div>
            ),
            tooltip: t('Estudio de seguridad'),
            onClick: () => HandleTopus 
          }),
        ]}
      />

      <AlertDialog open={commonAlert.open} onClose={handleCommonAlertClose}>
        {commonAlert.msg}
      </AlertDialog>
    </div>
  );
}
