const utils = require('./libs/utils');

exports.getLastTimeStr = (time, friendly) => {
  if (friendly) {
    return utils.MillisecondToDate(time);
  } else {
    return utils.fmtDate(new Date(time), 'yyyy-MM-dd hh:mm');
  }
};

exports.getTabStr = (tab, good, top) => {
  let str = '';
  if (top) {
    str = '置顶';
  } else if (good) {
    str = '精华';
  } else {
    switch (tab) {
      case 'share':
        str = '分享';
        break;
      case 'ask':
        str = '问答';
        break;
      case 'job':
        str = '招聘';
        break;
      default:
        str = '暂无';
        break;
    }
  }
  return str;
};

exports.getTabClassName = (tab, good, top) => {
  let className = '';
  if (top) {
    className = 'top';
  } else if (good) {
    className = 'good';
  } else {
    switch (tab) {
      case 'share':
        className = 'share';
        break;
      case 'ask':
        className = 'ask';
        break;
      case 'job':
        className = 'job';
        break;
      default:
        className = 'default';
        break;
    }
  }
  return className;
};