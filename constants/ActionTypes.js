var keyMirror = require('keymirror');

module.exports = keyMirror({
  LOCALE_CHANGE : null,
  LOCALE_REQUEST_MESSAGES: null,
  LOCALE_RECEIVED_MESSAGES: null,
  
  USER_REQUESTED_LOGIN: null,
  USER_RECEIVED_LOGIN: null,
  USER_REQUESTED_LOGOUT: null,
  USER_RECEIVED_LOGOUT: null,
  USER_PROFILE_REFRESH : null,
  USER_PROFILE_UPDATE: null,
  USER_SESSION_SET_CSRF: null,

  DEVICE_RECEIVED_SESSION_SEARCH: null,
  DEVICE_REQUESTED_SESSION_SEARCH: null,
  DEVICE_RECEIVED_SESSION: null,
  DEVICE_REQUESTED_SESSION: null,

  QUERY_REQUEST_START: null,
  QUERY_REQUEST_END: null,
  
  HISTORY_SET_COMPARISON: null,
  HISTORY_SET_TIME: null,
  HISTORY_SET_ACTIVE_DEVICE: null,
  HISTORY_SET_ACTIVE_DEVICE_TYPE: null,
  HISTORY_RESET_ACTIVE_DEVICE: null,
  HISTORY_SET_SESSIONS: null,
  HISTORY_SET_COMPARISON_SESSIONS: null,
  HISTORY_SET_SESSION: null,
  HISTORY_SET_ACTIVE_SESSION_INDEX: null,
  HISTORY_RESET_ACTIVE_SESSION_INDEX: null,
  HISTORY_INCREASE_ACTIVE_SESSION_INDEX: null,
  HISTORY_DECREASE_ACTIVE_SESSION_INDEX: null,
  HISTORY_SET_FILTER: null,
  HISTORY_SET_TIME_FILTER: null,
  HISTORY_SET_SESSION_FILTER: null,
  HISTORY_SET_DATA_SYNCED: null,
  HISTORY_SET_DATA_UNSYNCED: null,

  DASHBOARD_SWITCH_MODE:null,
  DASHBOARD_SET_LAST_SESSION: null,
  DASHBOARD_ADD_INFOBOX: null,
  DASHBOARD_REMOVE_INFOBOX: null,
  DASHBOARD_UPDATE_INFOBOX: null,
  DASHBOARD_REMOVE_LAYOUT: null,
  DASHBOARD_APPEND_LAYOUT: null,
  DASHBOARD_UPDATE_LAYOUT: null,

});

