import config from '../config';
export LogicError from './logicError';

export const SHOW_ALL = "SHOW_ALL";
export const SHOW_COMPLETED = "SHOW_COMPLETED";
export const SHOW_ACTIVE = "SHOW_ACTIVE";

// 消息提示自动消失时间
export const autoDismiss = 4;
/**
 * 时间选项
 */
export const DATE_OPTIONS = {//所有上报时间
  options: [
    { label: '所有时间', value: 'all' },
    { label: '最近1小时', value: 'last_1_hour' },
    { label: '昨天', value: 'last_1_day' },
    { label: '今天', value: 'today' },
    { label: '最近2天', value: 'last_2_day' },
    { label: '最近7天', value: 'last_7_day' },
    { label: '最近2周', value: 'last_2_week' },
    { label: '最近一个月', value: 'last_1_month' },
    { label: '自定义时间段', value: 'autoDate' }
  ]
};

export const STATUS_OPTIONS = {//所有状态
  options: [
    { label: '所有状态', value: 'all' },
    { label: '激活中', value: '1' },
    { label: '已关闭', value: '-1' },
    { label: '审核中', value: '-3' }
  ]
};


export const DATE_VALUE = {
  '最近1小时': 'last_1_hour',
  '昨天': 'last_1_day',
  '今天': 'today',
  '最近1天': 'last_1_day',
  '最近2天': 'last_2_day',
  '最近7天': 'last_7_day',
  '最近2周': 'last_2_week',
  '最近1月': 'last_1_month'
};

export const YYYY_MM_DD = "YYYY-MM-DD";
export const YYYYMMDD = "YYYYMMDD";
export const YYYY_MM_DD_HH_MM_SS = "YYYY-MM-DD HH:mm:ss";


/**
 * 版本状态
 */
export const STATUS_CLOSED = -1; // 已关闭
export const STATUS_ACTIVE = 1; // 激活中
export const STATUS_AUDIT = -3; // 待审核


export const ERRNO_PWD_REQUIRED = "ERRNO_PWD_REQUIRED";
export const ERRNO_DOWNLOAD_NOPERMISSION = "ERRNO_DOWNLOAD_NOPERMISSION";

export const NET_TYPE_OPTIONS = [
  { label: '全部', value: null },
  { label: '未知', value: '0' },
  { label: 'wifi', value: '1' },
  { label: '2G', value: '2' },
  { label: '3G', value: '3' },
  { label: '4G', value: '4' },
]

/**
 * 需要传进来当前页面的url, 以及版本的信息, 返回分享到qq的链接
 *
 * @param url
 * @param version
 */
export function getShareQQUrl(url, version) {
  const versionMap = version.toJS();

  let iconUrl = getIconUrl(versionMap.iconId, versionMap.iconUrl);

  if (iconUrl.indexOf('http') === -1) iconUrl = `${location.protocol}//${location.host}${iconUrl}`;

  const params = {
    // 获取URL，可加上来自分享到QQ标识，方便统计
    url: url,
    // 分享理由(风格应模拟用户对话),支持多分享语随机展现（使用|分隔）
    desc: '',
    // 分享标题(可选)
    title: versionMap.title,
    // 分享摘要(可选)
    summary: versionMap.description ? 'Bugly-内测邀请您一起来体验' : versionMap.description,
    // 分享图片(可选)
    pics: iconUrl,
    // 视频地址(可选)
    flash: '',
    // 分享来源(可选) 如：QQ分享
    site: 'Bugly-内测',
    style: '201',
    width: 32,
    height: 32
  };

  const basePath = config.app.shareQQBasePath;
  const paramsArr = [];

  for (let key in params) {
    paramsArr.push(`${key}=${encodeURIComponent(params[key])}`);
  }

  return `${basePath}?${paramsArr.join('&')}`;
}

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

//检查数组中是否包含某一个值,用法如contains(["foo", "bar"], "baz"); // => false
export function isContains(arr, value) {
  const contains = (() =>
    Array.prototype.includes
      ? (arr, value) => arr.includes(value)
      : (arr, value) => arr.some(el => el === value))();
  return contains(arr, value)
}


//数字加千分号,也适合小数
export function formatNum(num) {
  if (num) {
    var parts = num.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  } else {
    return '0';
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

export function clearString(s) {
  var pattern = new RegExp("[�`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）&;|{}【】‘；：”“'。，、？]")
  var rs = "";
  for (var i = 0; i < s.length; i++) {
    rs = rs + s.substr(i, 1).replace(pattern, '');
  }
  return rs;
}

/**
 * 通过dateType获取中文的option信息
 */
export function getDateOption(dateType) {
  if (!dateType) return '所有时间';
  switch (dateType) {
    case 'today':
      return '今天';
    case 'last_1_hour':
      return '最近1小时';
    case 'last_1_day':
      return '最近1天';
    case 'last_2_day':
      return '最近2天';
    case 'last_7_day':
      return '最近7天';
    case 'last_2_week':
      return '最近2周';
    case 'last_1_month':
      return '最近一月';
    case 'custom':
      return '自定义时间段';
    default:
      return '所有时间';
  }
}


//计算两个日期的之间的长度，输入格式必须为YYYY-MM-DD
export function getDateDiff(startDate, endDate) {
  let sd = new Date(startDate);
  let ed = new Date(endDate);
  return (ed - sd) / (24 * 3600 * 1000);
}

export function getCertTypeStr(certType) {
  switch (certType) {
    case 1:
      return "企业证书";
    case 2:
      return "开发证书";
    case 3:
      return "发布证书";
    case 0:
    default:
      return '无证书';
  }
}

export function getPkgSizeStr(pkgSize) {
  let suffix = "byte";
  let prefix = pkgSize / 1024;
  if (prefix < 1) {
    return pkgSize + suffix;
  }
  suffix = "KB";
  if (prefix / 1024 < 1) {
    return prefix.toFixed(2) + suffix;
  }
  prefix = prefix / 1024;

  suffix = "MB";
  if (prefix / 1024 < 1) {
    return prefix.toFixed(2) + suffix;
  }
  prefix = prefix / 1024;

  suffix = 'GB';
  if (prefix / 1024 < 1) {
    return prefix.toFixed(2) + suffix;
  }

  return pkgSize + "byte";
}

/**
 * 版本是否待审核中
 */
export function isVersionWaitAudit(status) {
  return status == -3;
}

export function isVersionClose(status) {
  return status == -1;
}

export function getDownloadUrl(shortId) {
  if (__SERVER__) {
    return `${global.baseUrl}/${shortId}`;
  }
  return `${location.protocol}//${location.host}/${shortId}`;
}

export function getQRCodeUrl(shortId, size = 8, margin = 0) {
  return `/api/qr?size=${size}&data=${encodeURIComponent(getDownloadUrl(shortId))}&margin=${margin}`;
}

export function didNotDownloadPermission(downloadInfo) {
  return downloadInfo.get('errorCode') === ERRNO_DOWNLOAD_NOPERMISSION;
}

export function didDownloadRequiredPwd(downloadInfo) {
  return downloadInfo.get('errorCode') === ERRNO_PWD_REQUIRED;
}