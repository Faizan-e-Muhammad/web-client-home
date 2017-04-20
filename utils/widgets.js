const moment = require('moment');

const { STATIC_RECOMMENDATIONS, STATBOX_DISPLAYS, PERIODS, BASE64, IMAGES } = require('../constants/HomeConstants');

const { getFriendlyDuration, getEnergyClass, getMetricMu, waterIQToNumeral, numeralToWaterIQ } = require('./general');
const { getChartMeterData, getChartAmphiroData, getChartMeterCategories, getChartMeterCategoryLabels, getChartAmphiroCategories, getChartPriceBrackets, colorFormatterSingle } = require('./chart');
const { getTimeByPeriod } = require('./time');
const { getDeviceTypeByKey, getDeviceNameByKey, getDeviceKeysByType } = require('./device');
const { reduceMetric, getShowerById, getSessionsCount, prepareBreakdownSessions } = require('./sessions');
const { stripTags } = require('./messages');

const tip = function (widget, intl) {
  const { tips } = widget;
  const currTip = Array.isArray(tips) && tips.length > 0 && tips[0];
  if (!Array.isArray(tips) || tips.length === 0 || !currTip) {
    return {
      ...widget,
      highlight: {},
      info: [{
        text: intl.formatMessage({ id: 'widget.no-tips' }),
      }],
      notificationType: 'RECOMMENDATION_STATIC',
      linkTo: 'notifications',
    };
  }
  const description = String(stripTags(currTip).description);
  const text = description.substring(0, String(description).indexOf('.', 120));
  return {
    ...widget,
    highlight: {
      image: `${BASE64}${currTip.imageEncoded}`,
    },
    info: [{
      text: `${text}...`,
    }],
    notificationType: 'RECOMMENDATION_STATIC',
    notificationId: currTip.id,
    linkTo: 'notifications',
  };
};

const amphiroLastShower = function (widget, intl) {
  const { data = [], devices, device, showerId, metric, timestamp } = widget;

  const lastSession = getShowerById(data.find(d => d.deviceKey === device), showerId);
  const measurements = lastSession ? lastSession.measurements : [];
  const chartCategories = Array.isArray(measurements) ? measurements.map(m => moment(m.timestamp).format('hh:mm:ss')) : [];
  const chartData = [{
    name: getDeviceNameByKey(devices, device) || '', 
    data: Array.isArray(measurements) ? measurements.map(m => m ? m[metric] : null) : [],
  }];
  const mu = getMetricMu(metric);

  return {
    ...widget,
    icon: `${IMAGES}/shower.svg`,
    more: intl.formatMessage({ id: 'widget.explore-last-shower' }),
    chartCategories,
    timeDisplay: intl.formatRelative(timestamp),
    chartData,
    highlight: {
      image: `${IMAGES}/volume.svg`,
      text: lastSession ? lastSession[metric] : null,
      mu,
    },
    info: lastSession ? [
      {
        image: `${IMAGES}/energy.svg`,
        text: `${Math.round(lastSession.energy / 10) / 100} ${getMetricMu('energy')}`,
      },
      {
        image: `${IMAGES}/timer-on.svg`,
        text: getFriendlyDuration(lastSession.duration),
      },
      {
        image: `${IMAGES}/temperature.svg`,
        text: `${lastSession.temperature} ${getMetricMu('temperature')}`,
      }
    ] : [],
    mode: 'stats',
    mu,
    clearComparisons: true,
  };
};

const amphiroMembersRanking = function (widget, intl) {
  const { devices, device, metric, data = [] } = widget;
  
  const periods = PERIODS.AMPHIRO;
  const membersData = data.map(m => ({ 
    ...m, 
    average: reduceMetric(devices, m.sessions, metric, true),
    showers: m.sessions.reduce((p, c) => p + c.sessions.length, 0),
  }))
  .filter(x => x.showers > 0)
  .sort((a, b) => a.average - b.average)
  .filter((x, i) => i < 5);
  
  const chartCategories = membersData.map(m => m.name); 
  const chartData = [{
    name: intl.formatMessage({ id: 'widget.shower-average' }),
    data: membersData.map(x => x.average),
  }];
  const mu = getMetricMu(metric);
  const chartColors = ['#7AD3AB', '#abaecc', '#2d3480', '#808285', '#CD4D3E'];

  const chartColorFormatter = colorFormatterSingle(chartColors);

  return {
    ...widget,
    icon: `${IMAGES}/goals.svg`,
    more: intl.formatMessage({ id: 'widget.explore-comparisons' }),
    periods,
    chartCategories,
    chartData,
    legend: false,
    chartColorFormatter,
    chartType: 'bar',
    mode: 'stats',
    mu,
    info: membersData.map((m, i) => ({
      image: `${IMAGES}/rank-${i + 1}.svg`,
    })),
    data: null,
    memberFilter: membersData.length > 0 ? membersData[0].index : null,
    comparisons: membersData.filter((x, i) => i > 0).map(x => String(x.index)),
  };
};

// TODO: split into two functions for amphiro / swm
const amphiroOrMeterTotal = function (widget, intl) {
  const { data = [], period, devices, deviceType, metric, previous } = widget;
  
  const time = widget.time ? widget.time : getTimeByPeriod(period);
  const device = getDeviceKeysByType(devices, deviceType);
  const periods = deviceType === 'AMPHIRO' ? 
    PERIODS.AMPHIRO.filter(p => p.id !== 'all') 
    : 
    PERIODS.METER.filter(p => p.id !== 'custom');

  const reduced = reduceMetric(devices, data, metric);
  const previousReduced = reduceMetric(devices, previous, metric);

  const mu = getMetricMu(metric);
  const better = reduced < previousReduced;
  const comparePercentage = previousReduced === 0 ?
    null
    :
    Math.round((Math.abs(reduced - previousReduced) / previousReduced) * 100);
    
  const chartCategories = deviceType === 'AMPHIRO' ?
    getChartAmphiroCategories(period)
    :
    getChartMeterCategoryLabels(getChartMeterCategories(time), time.granularity, period, intl);

  const chartData = Array.isArray(data) ? data.map((devData) => {
    const sessions = devData.sessions 
    .map(session => ({
      ...session,
      duration: Math.round(100 * (session.duration / 60)) / 100,
      energy: Math.round(session.energy / 10) / 100,
    }));
    
    return {
      name: deviceType === 'METER' ? intl.formatMessage({ id: 'devices.meter' }) : getDeviceNameByKey(devices, devData.deviceKey), 
      data: deviceType === 'METER' ? 
        getChartMeterData(sessions, 
                          getChartMeterCategories(time),
                          time,
                          metric
                         )
        : 
          getChartAmphiroData(sessions, 
                              getChartAmphiroCategories(period),
                              metric
                             ),
    };
  }) : [];
  const hasComparison = better != null && comparePercentage != null;
  const str = better ? 'better' : 'worse';
  return {
    ...widget,
    icon: `${IMAGES}/${metric}.svg`,
    more: deviceType === 'AMPHIRO' ? intl.formatMessage({ id: 'widget.explore-showers' }) : intl.formatMessage({ id: 'widget.explore-swm' }),
    time,
    periods,
    highlight: {
      text: reduced,
      mu,
    },
    mu,
    info: [
      {
        image: better ? `${IMAGES}/better.svg` : `${IMAGES}/worse.svg`,
        text: intl.formatMessage({ 
          id: `comparisons.${str}`, 
        }, {
          percent: comparePercentage, 
          period, 
        }),
        display: hasComparison,
      },
      {
        text: intl.formatMessage({ id: 'comparisons.no-data' }),
        display: !hasComparison,
      }
    ].filter(i => i.display),
    chartCategories,
    chartData,
    mode: 'stats',
    clearComparisons: true,
  };
};

const amphiroEnergyEfficiency = function (widget, intl) {
  const { data = [], period, devices, deviceType, metric, previous } = widget;

  if (metric !== 'energy') {
    console.error('only energy efficiency supported');
  } else if (deviceType !== 'AMPHIRO') {
    console.error('only amphiro energy efficiency supported');
  }
  const device = getDeviceKeysByType(devices, deviceType);
  const periods = PERIODS.AMPHIRO.filter(p => p.id !== 'all');

  const reduced = reduceMetric(devices, data, metric);
  const previousReduced = reduceMetric(devices, previous, metric);
  
  const better = reduced < previousReduced;

  const comparePercentage = previousReduced === 0 ? 
    null 
    : 
    Math.round((Math.abs(reduced - previousReduced) / previousReduced) * 100);
 
  const showers = getSessionsCount(devices, data);
  const highlight = (showers === 0 || reduced === 0) ? null : getEnergyClass(reduced / showers);
  const hasComparison = better != null && comparePercentage != null;
  const str = better ? 'better' : 'worse';
  return {
    ...widget,
    icon: `${IMAGES}/energy.svg`,
    periods,
    highlight: {
      text: highlight,
      mu: '',
    },
    info: [
      {
        image: better ? `${IMAGES}/better.svg` : `${IMAGES}/worse.svg`,
        text: intl.formatMessage({ 
          id: `comparisons.${str}`,
        }, { 
          percent: comparePercentage, 
          period, 
        }),
        display: hasComparison,
      },
      {
        text: intl.formatMessage({ id: 'comparisons.no-data' }),
        display: !hasComparison,
      }
    ].filter(i => i.display),
    mode: 'stats',
    clearComparisons: true,
  };
};

const meterForecast = function (widget, intl) {
  const { data = [], forecastData, period, periodIndex, deviceType, metric, previous } = widget;
  
  if (deviceType !== 'METER') {
    console.error('only meter forecast supported');
  }
  const time = widget.time ? widget.time : getTimeByPeriod(period, periodIndex);
  const periods = []; 

  const chartColors = ['#2d3480', '#abaecc', '#7AD3AB', '#CD4D3E'];

  const mu = getMetricMu(metric);
  const xCategories = getChartMeterCategories(time);
  const xCategoryLabels = getChartMeterCategoryLabels(xCategories, time.granularity, period, intl);
  
  const chartData = data.map(devData => ({ 
      name: intl.formatMessage({ id: 'widget.consumption' }), 
      data: getChartMeterData(devData.sessions, 
                              xCategories,
                              time,
                              metric
                             ),
    }));

  const forecastChartData = Array.isArray(forecastData) ? [{
    name: intl.formatMessage({ id: 'history.forecast' }),
    data: getChartMeterData(forecastData,
                            xCategories, 
                            time,
                            metric
                           ),
    lineType: 'dashed',
    color: '#2d3480',
    fill: 0.1,
    symbol: 'emptyRectangle',
  }]
  : [];

  return {
    ...widget,
    chartType: 'line',
    timeDisplay: moment(time.startDate).year(),
    time,
    periods,
    chartCategories: xCategoryLabels,
    chartData: [...chartData, ...forecastChartData],
    mu,
    mode: 'forecasting',
    clearComparisons: true,
  };
};

const meterPricing = function (widget, intl) {
  const { data = [], period, deviceType, metric, brackets } = widget;
  
  if (deviceType !== 'METER') {
    console.error('only meter pricing supported');
  } else if (period !== 'month') {
    console.error('only monthly pricing supported');
  }
  const time = widget.time ? widget.time : getTimeByPeriod(period);
  const periods = [];

  const mu = getMetricMu(metric);
  const xCategories = getChartMeterCategories(time);
  const xCategoryLabels = getChartMeterCategoryLabels(xCategories, time.granularity, period, intl);

  const priceBrackets = getChartPriceBrackets(xCategories, brackets, intl);

  const chartData = data.map(devData => ({ 
      name: intl.formatMessage({ id: `history.${metric}` }), 
      data: getChartMeterData(devData.sessions, 
                              xCategories,
                              time,
                              metric
                             ),
    }));

  return {
    ...widget,
    icon: `${IMAGES}/money-navy.svg`,
    chartType: 'line',
    timeDisplay: intl.formatDate(time.startDate, { month: 'long' }),
    time,
    periods,
    chartCategories: xCategoryLabels,
    chartData: [...chartData, ...priceBrackets],
    mu,
    mode: 'pricing',
    clearComparisons: true,
  };
};

const meterBreakdown = function (widget, intl) {
  const { data = [], period, devices, deviceType, metric, breakdown = [] } = widget;
  
  if (deviceType !== 'METER') {
    console.error('only meter breakdown makes sense');
  }

  const periods = PERIODS.METER.filter(p => p.id === 'month' || p.id === 'year');

  const reduced = reduceMetric(devices, data, metric);
  
  const time = widget.time ? widget.time : getTimeByPeriod(period);

  const sessions = prepareBreakdownSessions(devices,
                                            data,
                                            metric,
                                            breakdown,
                                            null,
                                            time.startDate,
                                            time.granularity,
                                            intl
                                           );

  const chartColors = ['#abaecc', '#8185b2', '#575d99', '#2d3480'];
  const chartColorFormatter = colorFormatterSingle(chartColors);
  const chartCategories = sessions.map(x => intl.formatMessage({ id: `breakdown.${x.id}` }).split(' ').join('\n'));
  const chartData = [{
    name: intl.formatMessage({ id: `history.${metric}` }),
    data: sessions.map(x => x[metric]),
  }];
  
  const mu = getMetricMu(metric);

  return {
    ...widget,
    icon: `${IMAGES}/stats-side.svg`,
    time,
    periods,
    chartType: 'horizontal-bar',
    chartCategories,
    chartColorFormatter,
    chartData,
    mu,
    clearComparisons: true,
    mode: 'stats',
  };
};

const meterComparison = function (widget, intl) {
  const { data, period, periodIndex, deviceType, metric, comparisons } = widget;
  
  if (deviceType !== 'METER') {
    console.error('only meter comparison supported');
    return {};
  }

  const time = widget.time ? widget.time : getTimeByPeriod(period, periodIndex);
  const periods = [];
  const chartColors = ['#f5dbd8', '#ebb7b1', '#a3d4f4', '#2d3480'];
  const chartColorFormatter = colorFormatterSingle(chartColors);

  const chartCategories = Array.isArray(comparisons) ? 
    comparisons.map(comparison => intl.formatMessage({ id: `comparisons.${comparison.id}` })) 
    : []; 

  const chartData = [{ 
    name: 'Comparison', 
    data: Array.isArray(comparisons) ? 
      comparisons.map(comparison => comparison.sessions.reduce((p, c) => c ? p + c[metric] : p, 0) : null) 
      : [],
  }];

  const mu = 'lt';
 
  return {
    ...widget,
    icon: `${IMAGES}/stats-side.svg`,
    timeDisplay: intl.formatDate(time.startDate, { month: 'long' }),
    time,
    periods,
    chartType: 'horizontal-bar',
    chartCategories,
    chartColorFormatter,
    chartData,
    mu,
    mode: 'stats',
    comparisonData: Array.isArray(comparisons) ? comparisons.filter(c => c.id !== 'user') : [], 
  };
};

const waterIQ = function (widget, intl) {
  const { data, period, periodIndex, deviceType, metric } = widget;
  
  if (deviceType !== 'METER') {
    console.error('only meter supported for water iq');
    return {};
  }

  const time = widget.time ? widget.time : getTimeByPeriod(period, periodIndex);
  const periods = [];
  
  const current = Array.isArray(data) && data.length > 0 && data.find(s => s.timestamp === time.startDate);

  const hasWaterIQ = current !== false && current != null;
  
  const best = hasWaterIQ ? data.reduce((p, c) => c.user < p.user ? c : p, data[0]) : {};
  const worst = hasWaterIQ ? data.reduce((p, c) => c.user > p.user ? c : p, data[0]) : {};

  const highlight = hasWaterIQ ? null : '-';
  const highlightImg = hasWaterIQ ? `${IMAGES}/energy-${current.user}.svg` : null;

  const chartColors = ['#f5dbd8', '#ebb7b1', '#a3d4f4', '#2d3480'];
  const chartColorFormatter = colorFormatterSingle(chartColors);
  const comparisons = ['similar', 'nearest', 'all', 'user']; 
  const chartCategories = Array.isArray(comparisons) ? comparisons.map(comparison => intl.formatMessage({ id: `comparisons.${comparison}` })) : []; 

  const chartData = [{ 
    name: intl.formatMessage({ id: 'history.wateriq' }), 
    data: Array.isArray(comparisons) ? 
      comparisons.map(comparison => current ? waterIQToNumeral(current[comparison]) : 0) 
      : [],
  }];
  return {
    ...widget,
    icon: `${IMAGES}/stats-side.svg`,
    timeDisplay: intl.formatDate(time.startDate, { month: 'long' }),
    //time,
    periods,
    info: [
      {
        image: `${IMAGES}/better.svg`,
        text: intl.formatMessage({
          id: 'comparisons.wateriq-best',
        }, {
          value: best.user,
          month: intl.formatDate(best.timestamp, { month: 'long' }),
        }),
        display: hasWaterIQ,
      },
      {
        image: `${IMAGES}/worse.svg`,
        text: intl.formatMessage({
          id: 'comparisons.wateriq-worst',
        }, {
          value: worst.user,
          month: intl.formatDate(worst.timestamp, { month: 'long' }),
        }),
        display: hasWaterIQ,
      },
      {
        text: intl.formatMessage({ id: 'comparisons.wateriq-no-data' }),
        display: !hasWaterIQ,
      }
    ].filter(i => i.display),
    chartType: 'horizontal-bar',
    chartColorFormatter,
    chartCategories,
    chartData,
    chartFormatter: y => numeralToWaterIQ(y),
    highlight: {
      text: highlight,
      image: highlightImg,
    },
    mode: 'wateriq',
    period: 'year',
    comparisonData: widget.display === 'chart' ? comparisons.map(c => ({ id: c, sessions: [] })) : [],
    time: getTimeByPeriod('year'),
  };
};

const budget = function (widget, intl) {
  const { data, period, devices, deviceType, metric, previous } = widget;
  
  if (deviceType !== 'METER') {
    console.error('only meter comparison supported');
  }

  const periods = PERIODS.METER.filter(p => p.id !== 'custom');
  const reduced = data ? reduceMetric(devices, data, metric) : 0;
  const mu = getMetricMu(metric);
  
  // dummy data based on real user data
  // TODO: static
  const consumed = reduced;

  const remaining = Math.round(reduced * 0.35);
  const percent = `${Math.round((consumed / (consumed + remaining)) * 100)}%`;
  //percent = isNaN(percent) ? '' : `${percent}%`;

  const chartData = [{
    name: percent, 
    data: [{
      value: consumed, 
      name: 'consumed', 
      color: '#2D3580',
    }, {
      value: remaining, 
      name: 'remaining', 
      color: '#D0EAFA',
    },
    ],
  }];

  const chartColors = ['#2d3480', '#abaecc'];
  return {
    ...widget,
    highlight: {
      text: reduced,
      mu,
    },
    chartData,
    chartColors,
  };
};

const meterCommon = function (widget, intl) {
  const { data = [], period, devices, deviceType, metric, common, commonData } = widget;
  
  if (!common) {
    return {
      ...widget,
      error: intl.formatMessage({ id: 'commons.empty' }),
    };
  }
  const time = widget.time ? widget.time : getTimeByPeriod(period);
  const periods = PERIODS.METER.filter(p => p.id !== 'custom' && p.id !== 'day');

  const reduced = reduceMetric(devices, data, metric);
  const mu = getMetricMu(metric);

  const xCategories = getChartMeterCategories(time);
  const chartCategories = getChartMeterCategoryLabels(xCategories, time.granularity, period, intl);

  
  const chartData = data.map(devData => ({ 
      name: intl.formatMessage({ id: 'common.me' }), 
      data: getChartMeterData(devData.sessions, 
                              xCategories,
                              time,
                              metric
                             ),
    }));

  
  const commonChartData = Array.isArray(commonData) ? [{
    name: common.name,
    data: getChartMeterData(commonData,
                            xCategories, 
                            time,
                            metric
                           ),
    fill: 0.1,
    symbol: 'emptyRectangle',
  }]
  : [];

  return {
    ...widget,
    icon: `${BASE64}${common.image}`,
    more: intl.formatMessage({ id: 'widget.explore-common' }),
    chartType: 'line',
    time,
    periods,
    chartCategories: chartCategories,
    chartData: [...chartData, ...commonChartData],
    mu,
    linkTo: 'commons',
  };
};

const prepareWidget = function (widget, intl) {
  switch (widget.type) {
    case 'tip': 
      return tip(widget, intl);
    case 'last': 
      return amphiroLastShower(widget, intl);
    case 'ranking': 
      return amphiroMembersRanking(widget, intl);
    case 'total':
      return amphiroOrMeterTotal(widget, intl); 
    case 'efficiency':
      return amphiroEnergyEfficiency(widget, intl); 
    case 'forecast':
      return meterForecast(widget, intl); 
    case 'pricing':
      return meterPricing(widget, intl); 
    case 'breakdown':
      return meterBreakdown(widget, intl);  
    case 'comparison':
      return meterComparison(widget, intl);
    case 'budget':
      return budget(widget, intl);
    case 'wateriq': 
      return waterIQ(widget, intl);
    case 'commons':
      return meterCommon(widget, intl);
    default:
      return widget;
  }
};

module.exports = prepareWidget;
