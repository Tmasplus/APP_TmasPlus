import {
    FETCH_REPORT_INCIDENTS,
    FETCH_REPORT_INCIDENTS_SUCCESS,
    FETCH_REPORT_INCIDENTS_FAILED,
    EDIT_REPORT_INCIDENT
  } from "../store/types";
  import { firebase } from '../config/configureFirebase';
  import store from '../store/store';
  import { onValue, set } from "firebase/database";
  
  export const fetchReportIncidents = () => (dispatch) => {
  
    const {
      reportIncidenceRef
    } = firebase;
  
    dispatch({
      type: FETCH_REPORT_INCIDENTS,
      payload: null,
    });
    onValue(reportIncidenceRef, (snapshot) => {
      if (snapshot.val()) {
        let data = snapshot.val();
        let arr = [];
        for(let i=0;i<data.length;i++){
          arr.push(data[i].label);
        }
        dispatch({
          type: FETCH_REPORT_INCIDENTS_SUCCESS,
          payload: {
            simple:arr,
            complex:snapshot.val()
          }
        });
      } else {
        dispatch({
          type: FETCH_REPORT_INCIDENTS_FAILED,
          payload: store.getState().languagedata.defaultLanguage.no_cancel_reason,
        });
      }
    });
  };
  
  export const editReportIncidents = (reasons, method) => (dispatch) => {
    const {
      reportIncidenceRef
    } = firebase;
  
    dispatch({
      type: EDIT_REPORT_INCIDENT,
      payload: method
    });
    set(reportIncidenceRef, reasons);
  }
  
  