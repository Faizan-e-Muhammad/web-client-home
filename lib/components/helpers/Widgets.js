'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var React = require('react');

var _require = require('react-echarts'),
    Chart = _require.Chart,
    LineChart = _require.LineChart,
    BarChart = _require.BarChart;

var lineTheme = require('../chart/themes/default');
var horizontalBarTheme = require('../chart/themes/horizontal-bar');
var verticalBarTheme = require('../chart/themes/vertical-bar');

var _require2 = require('../../constants/HomeConstants'),
    IMAGES = _require2.IMAGES;

function defaultFormatter(mu) {
  return function (y) {
    return y + ' ' + mu;
  };
}

function StatWidget(props) {
  var highlight = props.highlight,
      _props$info = props.info,
      info = _props$info === undefined ? [] : _props$info,
      period = props.period,
      mu = props.mu;

  return React.createElement(
    'div',
    { style: { padding: 10 } },
    React.createElement(
      'div',
      { style: { float: 'left', width: '30%' } },
      React.createElement(
        'div',
        null,
        highlight && highlight.image ? React.createElement('img', {
          style: {
            height: props.height,
            maxHeight: 50,
            float: 'left'
          },
          src: IMAGES + '/' + highlight.image,
          alt: highlight.image
        }) : React.createElement('i', null),
        React.createElement(
          'h2',
          null,
          React.createElement(
            'span',
            null,
            highlight.text
          ),
          React.createElement(
            'span',
            { style: { fontSize: '0.5em', marginLeft: 5 } },
            highlight.mu
          )
        )
      )
    ),
    React.createElement(
      'div',
      { style: { float: 'left', width: '70%' } },
      React.createElement(
        'div',
        null,
        info.map(function (line, idx) {
          return React.createElement(
            'div',
            { key: idx },
            React.createElement('i', { className: 'fa fa-' + line.icon }),
            line.image ? React.createElement('img', { style: { maxHeight: 30, maxWidth: 30 }, src: IMAGES + '/' + line.image, alt: line.id }) : React.createElement('i', null),
            '\xA0',
            React.createElement(
              'span',
              null,
              line.text
            )
          );
        })
      )
    )
  );
}

function LineChartWidget(props) {
  var _props$chartData = props.chartData,
      chartData = _props$chartData === undefined ? [] : _props$chartData,
      chartCategories = props.chartCategories,
      chartFormatter = props.chartFormatter,
      chartColorFormatter = props.chartColorFormatter,
      mu = props.mu,
      width = props.width,
      height = props.height,
      legend = props.legend;

  var formatter = chartFormatter || defaultFormatter(mu);
  return React.createElement(LineChart, {
    height: height || 240,
    width: width,
    theme: lineTheme,
    legend: legend,
    title: '',
    subtitle: '',
    xAxis: {
      data: chartCategories,
      boundaryGap: true
    },
    yAxis: {
      min: 0,
      formatter: formatter
    },
    series: chartData.map(function (s) {
      return _extends({
        fill: 0.55,
        color: chartColorFormatter
      }, s);
    })
  });
}

function BarChartWidget(props) {
  var chartData = props.chartData,
      chartCategories = props.chartCategories,
      chartFormatter = props.chartFormatter,
      chartColorFormatter = props.chartColorFormatter,
      mu = props.mu,
      width = props.width,
      height = props.height,
      legend = props.legend;

  var formatter = chartFormatter || defaultFormatter(mu);
  return React.createElement(BarChart, {
    height: height || 240,
    width: width,
    theme: verticalBarTheme,
    legend: legend,
    xAxis: {
      data: chartCategories,
      boundaryGap: true
    },
    yAxis: {
      min: 0,
      formatter: formatter
    },
    series: chartData.map(function (s, idx) {
      return _extends({}, s, {
        boundaryGap: true,
        color: chartColorFormatter,
        label: {
          position: 'top'
        }
      });
    })
  });
}

function HorizontalBarChartWidget(props) {
  var chartData = props.chartData,
      chartCategories = props.chartCategories,
      chartFormatter = props.chartFormatter,
      chartColorFormatter = props.chartColorFormatter,
      mu = props.mu,
      width = props.width,
      height = props.height,
      legend = props.legend;

  var formatter = chartFormatter || defaultFormatter(mu);
  return React.createElement(BarChart, {
    height: height || 240,
    width: width,
    theme: horizontalBarTheme,
    legend: legend,
    horizontal: true,
    xAxis: {
      data: chartCategories,
      boundaryGap: true
    },
    yAxis: {
      min: 0,
      formatter: formatter
    },
    series: chartData.map(function (s) {
      return _extends({}, s, {
        boundaryGap: true,
        color: chartColorFormatter,
        label: {
          position: 'right'
        }
      });
    })
  });
}

function ChartWidget(props) {
  var chartType = props.chartType,
      rest = _objectWithoutProperties(props, ['chartType']);

  return React.createElement(
    'div',
    null,
    function () {
      if (chartType === 'bar' || chartType === 'vertical-bar') {
        return React.createElement(BarChartWidget, rest);
      } else if (chartType === 'horizontal-bar') {
        return React.createElement(HorizontalBarChartWidget, rest);
      }
      return React.createElement(LineChartWidget, rest);
    }()
  );
}

function DefaultWidgetByDisplay(props) {
  var display = props.display;

  if (display === 'stat') {
    return React.createElement(StatWidget, props);
  } else if (display === 'chart') {
    return React.createElement(ChartWidget, props);
  }
  return React.createElement('div', null);
}

function RankingWidget(props) {
  return React.createElement(
    'div',
    null,
    React.createElement(ChartWidget, _extends({}, props, {
      height: props.height - 30
    })),
    React.createElement(
      'div',
      { style: { padding: '0 10px' } },
      props.info.map(function (line, idx) {
        return React.createElement(
          'div',
          {
            key: idx,
            style: {
              float: 'left',
              width: (props.width - 20) / props.info.length,
              textAlign: 'center'
            }
          },
          line.image ? React.createElement('img', {
            style: { maxHeight: 30, maxWidth: 30 },
            src: IMAGES + '/' + line.image,
            alt: line.id
          }) : React.createElement('i', null),
          '\xA0',
          React.createElement(
            'span',
            null,
            line.text
          )
        );
      })
    )
  );
}
function LastShowerWidget(props) {
  return React.createElement(
    'div',
    null,
    React.createElement(ChartWidget, _extends({}, props, {
      height: props.height - 50
    })),
    React.createElement(
      'div',
      { style: { padding: '0 10px' } },
      React.createElement(
        'div',
        { style: { float: 'left', textAlign: 'center' } },
        React.createElement('img', { style: { height: 40, width: 40, float: 'left' }, src: IMAGES + '/' + props.highlight.image, alt: props.highlight.image }),
        React.createElement(
          'h2',
          { style: { float: 'left' } },
          React.createElement(
            'span',
            null,
            props.highlight.text
          ),
          React.createElement(
            'span',
            { style: { fontSize: '0.5em', marginLeft: 5 } },
            props.highlight.mu
          )
        )
      ),
      props.info.map(function (line, idx) {
        return React.createElement(
          'div',
          {
            key: idx,
            style: {
              float: 'left',
              marginTop: 10,
              width: Math.max((props.width - 150) / props.info.length, 50),
              textAlign: 'center'
            }
          },
          line.image ? React.createElement('img', {
            style: { maxHeight: 30, maxWidth: 30 },
            src: IMAGES + '/' + line.image,
            alt: line.id
          }) : React.createElement('i', null),
          '\xA0',
          React.createElement(
            'span',
            null,
            line.text
          )
        );
      })
    )
  );
}

function Widget(props) {
  var type = props.type;

  switch (type) {
    case 'ranking':
      return React.createElement(RankingWidget, props);
    case 'last':
      return React.createElement(LastShowerWidget, props);
    default:
      return React.createElement(DefaultWidgetByDisplay, props);
  }
}

module.exports = {
  StatWidget: StatWidget,
  ChartWidget: ChartWidget,
  Widget: Widget
};