'use strict';

var React = require('react');
var bs = require('react-bootstrap');

var MainSection = require('../../../layout/MainSection');

var _require = require('../../../layout/Sidebars'),
    SidebarLeft = _require.SidebarLeft,
    SidebarRight = _require.SidebarRight;

var Confirm = require('../../../helpers/ConfirmModal');

var _require2 = require('../../../../utils/general'),
    getActiveKey = _require2.getActiveKey;

var _require3 = require('../../../../constants/HomeConstants'),
    MAIN_MENU = _require3.MAIN_MENU;

function MembersSettings(props) {
  var _t = props._t,
      confirm = props.confirm,
      children = props.children,
      routes = props.routes,
      actions = props.actions;
  var clickConfirm = actions.clickConfirmMember,
      resetConfirm = actions.resetConfirm,
      goTo = actions.goTo;


  var MEMBERS_MENU = MAIN_MENU.find(function (item) {
    return item.name === 'settings';
  }).children.find(function (item) {
    return item.name === 'members';
  }).children;

  var activeKey = getActiveKey(routes, 3);

  return React.createElement(
    MainSection,
    { id: 'section.members' },
    React.createElement(
      'div',
      { className: 'section-row-container' },
      React.createElement(
        SidebarRight,
        null,
        React.createElement(
          bs.Tabs,
          {
            position: 'left',
            tabWidth: 50,
            activeKey: activeKey,
            onSelect: function onSelect(val) {
              goTo(MEMBERS_MENU.find(function (item) {
                return item.name === val;
              }).route);
            }
          },
          MEMBERS_MENU.map(function (m) {
            return React.createElement(bs.Tab, {
              key: m.name,
              eventKey: m.name,
              title: _t(m.title)
            });
          })
        )
      ),
      React.createElement(
        'div',
        { style: { margin: 20, height: '100%', width: '100%' } },
        React.cloneElement(children, props)
      ),
      React.createElement(Confirm, {
        show: confirm.item !== null && confirm.mode !== null,
        confirmation: confirm,
        message: confirm.item && confirm.mode ? _t('forms.confirm', {
          action: String(_t('forms.' + confirm.mode)).toLowerCase(),
          item: confirm.item.name
        }) : '',
        onConfirm: clickConfirm,
        onClose: resetConfirm
      })
    )
  );
}

module.exports = MembersSettings;