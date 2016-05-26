import {EXCEPTION_TYPE_LIST} from 'utils/constants'
import moment from 'moment'

//根据level，关键字，是否ide格式处理log
export function handleLog(lines, logLevel, keyWord, isIde) {
  //获得每行level数组,level最低是0(verbose)
  let levels = lines.map(line => {
    let words = line.split(/\s+/);
    if (words.length >= 5) {
      switch (words[4]) {
        case "V":
          return {
            line,
            level: 0
          };
        case "D":
          return {
            line,
            level: 1
          };
        case "I":
          return {
            line,
            level: 2
          };
        case "W":
          return {
            line,
            level: 3
          };
        case "E":
          return {
            line,
            level: 4
          };
        default:
          return {
            line,
            level: 0
          };
      }
    } else {
      return {
        line,
        level: 0
      };
    }
  });

  //根据logLevel筛选log
  let curLevel = 0;
  switch (logLevel) {
    case "verbose":
      curLevel = 0;
      break;
    case "debug":
      curLevel = 1;
      break;
    case "info":
      curLevel = 2;
      break;
    case "warn":
      curLevel = 3;
      break;
    case "error":
      curLevel = 4;
      break;
    default:
      curLevel = 0;
  }

  //处理keyword
  if (keyWord) {
    keyWord = keyWord.toLowerCase().trim();
  } else {
    keyWord = '';
  }

  levels = levels.filter(level => {
    let filterLevel = true;
    if (isIde) {
      filterLevel = level.level >= curLevel;
    } else {
      filterLevel = level.level == curLevel;
    }
    let filterKeyword = true;
    if (keyWord.length > 0 && level.line.toLowerCase().indexOf(keyWord) == -1) {
      filterKeyword = false;
    }
    return filterKeyword && filterLevel;
  });
  return levels;
}

/**
 *  判断当前路由是否是异常处理的路由
 */
export function isExceptionRoute(exceptionType) {
  return Object.keys(EXCEPTION_TYPE_LIST).indexOf(exceptionType) !== -1;
}

/**
 * 获取crash/anr/error三种异常的类型
 * @param {string} pathname
 */
export function getExceptionType(pathname) {
  if (!pathname) return '';
  let matches = pathname.match(/(crash|anr|error)\/apps\/\w+/i);
  if (!matches) return '';
  return matches[1];
}

/**
 * 从路由的pathname中获取到对应异常类型列表
 */
export function getExceptionTypeList(pathname) {
  let exceptionType = getExceptionType(pathname);
  return exceptionType ? EXCEPTION_TYPE_LIST[exceptionType] : [];
}

export function loadScript(src, cb) {
  let _loading = window._loading || [];
  !window._loading && (window._loading = _loading);
  // TODO 处理多次加载同一个js的情况

  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', src);
  script.addEventListener('load', function handler() {
    cb && cb();
    script.removeEventListener('load', handler);
  });
  document.head.appendChild(script);
}

//判断是否是空对象
export function isEmptyObject(value) {
  return Object.keys(value).length === 0;
}

/**
 * 改变日期字符串的格式
 * @param {string} dateStr
 * @return {string}
 */
export function convertDateFormat(dateStr, srcFormat, destFormat) {
  return moment(dateStr, srcFormat).format(destFormat);
}

//数字加千分号,也适合小数
export function formatNum(num) {
  if (num) {
    var parts = num.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }
}

/**
 * 给所有的事件监听器添加阻止冒泡和默认行为的逻辑
 */
export function noopEventHandler(handler, event) {
  event.stopPropagation();
  event.preventDefault();
  handle(event);
}

/**
 * 是否是超级管理员
 */
export function isSuperAdmin(newUserId) {
  return ~"71199,25681,49448,69139,9147,6777,49516,36632,35658,21811,4734,9424,73642".split(',').indexOf(newUserId);
}

/*
 *
 */

export function getBrowser() {
  var u = navigator.userAgent, app = navigator.appVersion;
  var browse = {//移动终端浏览器版本信息
    trident: u.indexOf("Trident") > -1, //IE内核
    presto: u.indexOf("Presto") > -1, //opera内核
    webKit: u.indexOf("AppleWebKit") > -1, //苹果、谷歌内核
    gecko: u.indexOf("Gecko") > -1 && u.indexOf("KHTML") == -1, //火狐内核
    mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
    ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
    android: u.indexOf("Android") > -1 || u.indexOf("Linux") > -1, //android终端或者uc浏览器
    iPhone: u.indexOf("iPhone") > -1, //是否为iPhone或者QQHD浏览器
    iPad: u.indexOf("iPad") > -1, //是否iPad
    webApp: u.indexOf("Safari") == -1 //是否web应该程序，没有头部与底部
  };
  return browse;
}

/*
 *
 */
export function getPcExploer() {
  var explorer = navigator.userAgent, browse;
  if (explorer.indexOf("MSIE") >= 0) {
    browse = "ie";
  } else if (explorer.indexOf("Firefox") >= 0) {
    browse = "Firefox";
  } else if (explorer.indexOf("Chrome") >= 0) {
    browse = "Chrome";
  } else if (explorer.indexOf("Opera") >= 0) {
    browse = "Opera";
  } else if (explorer.indexOf("Safari") >= 0) {
    browse = "Safari";
  } else if (explorer.indexOf("Netscape") >= 0) {
    browse = "Netscape";
  }
  return browse;
}

/*
 *
 */
export function isWeixin() {
  return /micromessenger(\/[\d\.]+)*/.test(navigator.userAgent.toLowerCase());
}

export function isQQ() {
  var ua = navigator.userAgent.toLowerCase();
  return (/qzone\//.test(ua) || /qq\/(\/[\d\.]+)*/.test(ua));
}

/*
*获取网络
 */
export function getNetStatus() {
  var net = "";
  if (isWeixin()) {//微信下直接获取ua下的网络状态,wifi 2/3g
    var ua = navigator.userAgent.toLowerCase();
    var uaArr = ua.split(' ');//空格拆开
    var netArr = uaArr[uaArr.length - 1];
    net = netArr.split('/')[1];
  }
  return net;
}

export function getChannelId() {
  var channelId = "";
  var mobileInfo = getBrowser();
  if (!mobileInfo['mobile']) {//PC端，获取浏览器内核
    channelId = "PC_" + getPcExploer();
  } else {//移动端，把mobileInfo里面的为true的全部塞过去
    for (var k in mobileInfo) {
      if (mobileInfo[k]) {
        channelId += k + '_';
      }
    }
    channelId = channelId.substring(0, channelId.length - 1);//去掉最后一个_
  }
  return channelId;
}

export function clearString(s){ 
    var pattern = new RegExp("[�`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）&;|{}【】‘；：”“'。，、？]") 
    var rs = ""; 
    for (var i = 0; i < s.length; i++) { 
        rs = rs+s.substr(i, 1).replace(pattern, ''); 
    } 
    return rs;  
} 