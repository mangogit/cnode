'use strict';

import _ from 'lodash';
import Timeago from 'timeago.js';

let getCheck = {
  checkEmail(val) {
    var filter = /^([a-zA-Z0-9_\\.\\-])+\\@(([a-zA-Z0-9\\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (filter.test(val)) {
      return true;
    } else {
      return false;
    }
  },
  checkPhone(val) {
    var filter = /^1\d{10}$/;
    if (filter.test(val)) {
      return true;
    } else {
      return false;
    }
  }
};

const fetchUsers = (text) => {
  if (!text) {
    return [];
  }
  var ignoreRegexs = [
    /```.+？```/g,
    /^```[\s\S]+?^```/gm,
    /`[\s\S]+?`/g,
    /^.*/gm,
    /\b\S*?@[^\s]*?\..+?\b/g,
    /\[@.+?\\]\(\/.+?\)/g
  ];
  ignoreRegexs.forEach((ignoreRegexs) => {
    text = text.replace(ignoreRegexs, '');
  });

  var results = text.match(/@[a-zA-Z0-9\-_]+\b/igm);
  var names = [];
  if (results) {
    for (var i = 0, l = results.length; i < l; i++) {
      var s = results[i];
      s = s.slice(1);
      names.push(s);
    }
  }
  names = _.uniq(names);
  return names;
};

const linkUsers = (text) => {
  var users = fetchUsers(text);
  for (var i = 0, l = users.length; i < l; i++) {
    var name = users[i];
    text = text.replace(new RegExp('@' + name + '\\b(?!\\])', 'g'), '[@' + name + '](/user/' + name + ')');
  }
  return text;
};

const fmtDate = (date, fmt) => {
  var o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    'S': date.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    }
  }
  return fmt;
};

const MillisecondToDate = (time) => {
  var str = '';
  if (time !== null && time !== '') {
    let timeagoInstance = new Timeago();
    str = timeagoInstance.format(time, 'zh_CN');
  }
  return str;
};

exports.getLastTimeStr = (time, friendly) => {
  if (friendly) {
    return MillisecondToDate(time);
  } else {
    return fmtDate(new Date(time), 'yyyy-MM-dd hh:mm');
  }
};
exports.getTabInfo = (tab, good, top, isClass) => {
  let str = '';
  let className = '';
  if (top) {
    str = '置顶';
    className = 'top';
  } else if (good) {
    str = '精华';
    className = 'good';
  } else {
    switch (tab) {
      case 'share':
        str = '分享';
        className = 'share';
        break;
      case 'ask':
        str = '问答';
        className = 'ask';
        break;
      case 'job':
        str = '招聘';
        className = 'job';
        break;
      default:
        str = '暂无';
        className = 'default';
        break;
    }
  }
  return isClass ? className : str;
};

exports.throttle = (fn, wait, mustRun) => {
  let timeout;
  let startTime = new Date();
  return function() {
    let context = this;
    let args = arguments;
    let curTime = new Date();
    clearTimeout(timeout);
    if (curTime - startTime >= mustRun) {
      fn.apply(context, args);
      startTime = curTime;
    } else {
      timeout = setTimeout(fn, wait);
    }
  };
};

exports.linkUsers = linkUsers;
exports.fetchUsers = fetchUsers;
exports.getCheck = getCheck;
exports.fmtDate = fmtDate;
exports.MillisecondToDate = MillisecondToDate;

