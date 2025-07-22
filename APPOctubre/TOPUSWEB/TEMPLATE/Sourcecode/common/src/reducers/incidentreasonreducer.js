
import {
    FETCH_REPORT_INCIDENTS,
    FETCH_REPORT_INCIDENTS_SUCCESS,
    FETCH_REPORT_INCIDENTS_FAILED,
    EDIT_REPORT_INCIDENT
} from "../store/types"

const INITIAL_STATE = {
    simple: [],
    complex: [],
    loading: false,
    error: {
        flag: false,
        msg: null
    }
}

export const incidentreasonreducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case FETCH_REPORT_INCIDENTS:
            return {
                ...state,
                loading: true
            };
        case FETCH_REPORT_INCIDENTS_SUCCESS:
            return {
                ...state,
                simple: action.payload.simple,
                complex: action.payload.complex,
                loading: false
            };

        case FETCH_REPORT_INCIDENTS_FAILED:
            return {
                ...state,
                simple: [],
                complex: [],
                loading: false,
                error: {
                    flag: true,
                    msg: action.payload
                }
            };
        case EDIT_REPORT_INCIDENT:
            return state;
        default:
            return state;

    }
}