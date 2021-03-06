'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var ReactGA = require('react-ga');

var Actions = require('../actions/LocaleActions');

var setLocale = function setLocale(locale) {
  ReactGA.event({
    category: 'locale',
    action: 'changed',
    label: locale.toString()
  });
  return Actions.setLocale(locale);
};

module.exports = _extends({}, Actions, {
  setLocale: setLocale
});