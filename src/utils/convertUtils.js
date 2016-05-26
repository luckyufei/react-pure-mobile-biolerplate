import {Map, fromJS} from 'immutable';
import applicationConfig from '../config';

/**
 * @typedef {Object} VersionInfo
 *
 * @description       Details: http://rdm.oa.com/ci_api/index.php/Home/Item/show?item_id=15
 *
 * @property {String} expId
 * @property {String} appId
 * @property {Number} pid
 * @property {String} pkgId
 * @property {String} title
 * @property {String} description
 * @property {Number} status
 * @property {String} creator
 * @property {String} createTime
 * @property {Number} updateTime
 * @property {String} shortId
 * @property {String} iconId
 * @property {String} iconUrl
 * @property {String} relationExpId
 * @property {PermissionInfo} permission
 * @property {PkgInfo} pkgInfo
 */

/**
 * @typedef {Object} PermissionInfo
 *
 * @property {Number} secret
 * @property {String} password
 * @property {Number} needLogin
 * @property {String} users
 * @property {String} groupName
 */


/**
 * @typedef {Object} PkgInfo
 *
 * @property {Number} pkgId
 * @property {Number} pkgPid
 * @property {Number} bundleId
 * @property {String} version
 * @property {String} versionCode
 * @property {Number} pkgSize
 * @property {Number} cerType
 * @property {Number} cerExpireTime
 * @property {String} udids
 */

/**
 * @typedef {Object} IpaInfo
 *
 * @property {String} CFBundleVersion
 * @property {String} CFBundleIdentifier
 * @property {String} CFBundleExecutable
 * @property {String} CFBundleDisplayName
 * @property {String} MinimumOSVersion
 * @property {String} cerName
 * @property {String} cerType
 * @property {String} iconName
 * @property {MobileprovisionInfo} mobileprovision
 */

/**
 * @typedef {Object} MobileprovisionInfo
 *
 * @property {Number} expirationDate
 * @property {Number} creationDate
 * @property {String} name
 * @property {String} teamName
 * @property {String} uuid
 * @property {String} appIdName
 * @property {String} teamIdentifier
 * @property {String} bundleId
 * @property {String} udids
 * @property {Number} type                  1表示企业证书、2表示开发证书、3表示公司正式发布证书；0表示未赋值，apk包的certype为0
 */

const chineseReg = /[\u3400-\u9FBF]/;
const messChineseReg = /[^\u4e00-\u9fa5\w\s]/;
const validLetterReg = /^[a-zA-Z0-9_]*$/;

function isEmpty(obj) {
  for (let i in obj) {
    return false;
  }
  return true;
}

/**
 * PkgReader返回的数据结构转为server需要的结构
 * @param pkgInfo
 * @param type
 * @returns {ApkInfo}
 */
export function readerPkgInfo2packageInfo(pkgInfo, type) {
  if (type === 'apk') {
    return formatApkInfo(pkgInfo);
  } else if (type === 'ipa') {
    return formatIpaInfo(pkgInfo);
  } else {
    throw new Error('Invalid type, expect apk/ipa.');
  }
}


function getValidBundleName(pkgInfo) {
  // 其中一个没有的话, 那只能用另外一个了
  if (!pkgInfo.CFBundleDisplayName) {
    return pkgInfo.CFBundleName;
  } else if (!pkgInfo.CFBundleName) {
    return pkgInfo.CFBundleDisplayName;
  }

  if (validLetterReg.test(pkgInfo.CFBundleDisplayName)) {
    return pkgInfo.CFBundleDisplayName;
  } else if (messChineseReg.test(pkgInfo.CFBundleDisplayName)) {
    return pkgInfo.CFBundleName;
  }

  return pkgInfo.CFBundleDisplayName;
}

/**
 *
 * @param pkgInfo
 * @return {IpaInfo}
 */
function formatIpaInfo(pkgInfo) {
  const stringSplitter = ';';

  const ipaInfo = {
    CFBundleVersion: pkgInfo.CFBundleVersion,
    CFBundleIdentifier: pkgInfo.CFBundleIdentifier,
    CFBundleExecutable: pkgInfo.CFBundleExecutable,
    CFBundleDisplayName: getValidBundleName(pkgInfo),
    MinimumOSVersion: pkgInfo.MinimumOSVersion,
    cerName: '',
    cerType: 0,
    iconName: ''
  };

  if (pkgInfo.mobileProvision) {
    ipaInfo.mobileprovision = {
      creationDate: new Date(pkgInfo.mobileProvision.CreationDate).getTime(),
      name: pkgInfo.mobileProvision.Name,
      teamName: pkgInfo.mobileProvision.TeamName,
      uuid: pkgInfo.mobileProvision.UUID,
      appIdName: pkgInfo.mobileProvision.AppIDName,
      teamIdentifier: pkgInfo.mobileProvision.TeamIdentifier ? pkgInfo.mobileProvision.TeamIdentifier.join(stringSplitter) : '',
      bundleId: pkgInfo.CFBundleIdentifier,
      udids: pkgInfo.mobileProvision.ProvisionedDevices ? pkgInfo.mobileProvision.ProvisionedDevices.join(stringSplitter) : ''
    };

    let type;

    // 判断是否有设备列表,有则表示是开发证书, 否则是发布证书; 另外如果支持所有设备, 则为企业证书
    if (pkgInfo.mobileProvision.ProvisionedDevices && pkgInfo.mobileProvision.ProvisionedDevices.length) {
      type = 2;
    } else {
      type = 3;
    }

    if (pkgInfo.mobileProvision.ProvisionsAllDevices === true) {
      type = 1;
    }

    ipaInfo.mobileprovision.type = type;

    let expirationDate;

    if (pkgInfo.mobileProvision.ExpirationDate) {
      expirationDate = new Date(pkgInfo.mobileProvision.ExpirationDate).getTime();
    } else if (pkgInfo.mobileProvision.CreationDate && pkgInfo.mobileProvision.TimeToLive) {
      let createDate = new Date(pkgInfo.mobileProvision.CreationDate);

      createDate.setDay(createDate.getDay() + pkgInfo.mobileProvision.TimeToLive);

      expirationDate = createDate.getTime();
    }

    ipaInfo.mobileprovision.expirationDate = expirationDate;

    ipaInfo.cerName = ipaInfo.mobileprovision.name;
    ipaInfo.cerType = ipaInfo.mobileprovision.type;
  }

  // 有指定icon
  if (pkgInfo.CFBundleIcons && pkgInfo.CFBundleIcons.CFBundlePrimaryIcon
    && pkgInfo.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles &&
    pkgInfo.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles.length) {
    // 是一个数组...额取最后一个吧
    ipaInfo.iconName = pkgInfo.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles[pkgInfo.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles.length - 1];
  } else {
    // 没有看看有没有默认的
    ipaInfo.iconName = '\.app/Icon.png';
  }

  return ipaInfo;
}

/**
 * 用pkgReader读出来的apkInfo, 转成server要的apkInfo
 * @param pkgInfo
 * @returns {ApkInfo}
 */
function formatApkInfo(pkgInfo) {
  const apkInfo = {
    versionCode: pkgInfo.versionCode,
    versionName: pkgInfo.versionName,
    packageName: pkgInfo.package,
    minSdkVersion: pkgInfo.usesSdk.minSdkVersion,
    usesPermissions: pkgInfo.usesPermissions ? pkgInfo.usesPermissions.map(permission => permission.name) : [],
    targetSdkVersion: pkgInfo.usesSdk.targetSdkVersion,
    applicationLable: pkgInfo.application.label,
    applicationIcons: {},
    applicationIcon: '',
    features: pkgInfo.usesFeatures ? pkgInfo.usesFeatures.map((feature) => feature.name) : []
  };

  // TODO: 有些app就那么一个,没那么多种适配
  if (pkgInfo.application.icon && pkgInfo.application.icon.splice) {
    const rulesMap = {
      'ldpi': 120,
      'mdpi': 160,
      'hdpi': 240,
      'xhdpi': 320
    };

    const resultMap = {};

    let maxDpiIcon = {
      dpi: 120,
      icon: ''
    };

    for (var i in rulesMap) {
      pkgInfo.application.icon.some((icon) => {
        if (icon.indexOf(i) > -1) {
          resultMap['application-icon-' + rulesMap[i]] = icon;
          return true;
        }
      });

      // 单独取出最大的
      if (resultMap['application-icon-' + rulesMap[i]] && rulesMap[i] >= maxDpiIcon.dpi) {
        maxDpiIcon = {
          dpi: rulesMap[i],
          icon: resultMap['application-icon-' + rulesMap[i]]
        };
      }
    }

    if (isEmpty(resultMap) || !maxDpiIcon.icon) {
      maxDpiIcon = {
        dpi: 120,
        icon: pkgInfo.application.icon[0] || ''
      };
      resultMap['applicataion-icon-120'] = maxDpiIcon.icon;
    }

    apkInfo.applicationIcon = maxDpiIcon.icon;
    apkInfo.applicationIcons = resultMap;
  } else {
    console.error('Unexpected icon type,', pkgInfo.application.icon);
  }

  // 可能就是一个字符串,不是数组
  if (apkInfo.applicationLable) {
    // 是数组, 走这个逻辑
    if (apkInfo.applicationLable.splice) {
      let applicationLable = apkInfo.applicationLable[0];

      apkInfo.applicationLable.some((label) => {
        if (chineseReg.test(label)) {
          applicationLable = label;
          return true;
        }
      });

      apkInfo.applicationLable = applicationLable || '';
    } else if (!(typeof apkInfo.applicationLable === 'string')) {
      // 不是数组,也不是字符串, 那不管了置空
      apkInfo.applicationLable = '';
    }
  } else {
    apkInfo.applicationLable = '';
  }

  return apkInfo;
}

/**
 * 从server要的packageInfo中读出apkInfo,并转为统一的pkgInfo数据结构
 *
 * @param {FileDetailInfo} packageInfo
 * @return {PkgInfo}
 */
function apkInfo2PkgInfo(packageInfo) {
  const apkInfo = packageInfo.packageInfo.apkInfo;
  return {
    pkgId: packageInfo.basicFile.id,
    pkgPid: 1,
    bundleId: apkInfo.packageName, // ?
    version: apkInfo.versionName,
    versionCode: apkInfo.versionCode,
    pkgSize: packageInfo.basicFile.size,
    cerType: '',
    cerExpireTime: '',
    udids: ''  // ?
  };
}

/**
 * 从server要的packageInfo中读出ipaInfo,并转为统一的pkgInfo数据结构
 *
 * @param {FileDetailInfo} packageInfo
 * @return {PkgInfo}
 */
function ipaInfo2PkgInfo(packageInfo) {
  const ipaInfo = packageInfo.packageInfo.ipaInfo;

  return {
    pkgId: packageInfo.basicFile.id,
    pkgPid: 2,
    bundleId: ipaInfo.CFBundleIdentifier, // ?
    version: ipaInfo.CFBundleVersion,
    versionCode: '',
    pkgSize: packageInfo.basicFile.size,
    cerType: ipaInfo.cerType,  // MobileprovisionPo.type
    cerExpireTime: ipaInfo.mobileprovision && ipaInfo.mobileprovision.expirationDate, // MobileprovisionPo.expirationDate
    udids: ipaInfo.mobileprovision && ipaInfo.mobileprovision.udids  // MobileprovisionPo里面的
  };
}

/**
 * 本地解析出包信息后, 为了展示versionHD, 把packageInfo转为versionInfo
 *
 * @param {FileDetailInfo} packageInfo
 * @return {VersionInfo}
 */
export function packageInfo2VersionInfo(packageInfo) {
  const isApk = !!packageInfo.packageInfo.apkInfo;

  const packageInfoKey = getPackageInfoKeyName(isApk ? 'apk' : 'ipa');

  const pkgInfo = (isApk ? apkInfo2PkgInfo : ipaInfo2PkgInfo)(packageInfo);

  let iconUrl = packageInfo.packageInfo[packageInfoKey][isApk ? 'applicationIcon' : 'iconName'];

  let title = packageInfo.packageInfo[packageInfoKey][isApk ? 'applicationLable' : 'CFBundleDisplayName'];

  return Map({
    pkgId: '',
    creator: '',
    iconId: '',
    title,
    iconUrl: iconUrl || applicationConfig.app.defaultIconUrl,
    pkgInfo
  });
}

export function localParsePkgInfo2VersionInfo(pkgInfo, extentions) {
  if (extentions) throw new Error('Invalid param extentions!!!!');

  const packageInfo = {
    productId: '',
    platformId: '',
    basicFile: {}
  };

  const packageInfoKey = getPackageInfoKeyName(extentions);

  packageInfo[packageInfoKey] = pkgInfo;

  return packageInfo2VersionInfo(pkgInfo);
}

function getPackageInfoKeyName(extentions) {
  return extentions === 'apk' ? 'apkInfo' : 'ipaInfo';
}

function getIconUrl() {

}

export function base64ToBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  var blob = new Blob(byteArrays, { type: contentType });
  return blob;
}

export function base64ImgToData(base64Img) {
  return base64Img.replace('data:image/png;base64,', '');
}

export function convertData(blob, type) {
  if (!blob || !(blob instanceof Blob) || !type) return Promise.reject();

  const supportType = ['arrayBuffer', 'dataUrl', 'binary', 'text'];

  if (supportType.indexOf(type) === -1) return Promise.reject();

  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    const removeListener = () => {
      fileReader.removeEventListener('load', handleOnload);
      fileReader.removeEventListener('error', handleError);
    };

    const handleOnload = (e) => {
      removeListener();
      resolve(e.target.result);
    };

    const handleError = (err) => {
      removeListener();
      reject(err);
    };

    fileReader.addEventListener('load', handleOnload);
    fileReader.addEventListener('error', handleError);

    switch (type) {
      case 'arrayBuffer':
        fileReader.readAsArrayBuffer(blob);
        break;
      case 'dataUrl':
        fileReader.readAsDataURL(blob);
        break;
      case 'text':
        fileReader.readAsText(blob);
        break;
      case 'binary':
      default:
        fileReader.readAsBinaryString(blob);
        break;
    }

  });
}

/**
 * 为了展示上传完成界面,将调取包信息的接口中的pkgInfo转为versionInfo
 *
 * @param {pkgInfo} packageInfo
 * @return {Map<VersionInfo>}
 */
export function packageInfo2Version(packageInfo) {
  console.log('converting packageInfo', packageInfo);
  return Map({
    expId: '',
    appId: packageInfo.appId,
    pid: packageInfo.pid,
    pkgId: packageInfo.pkgId,
    title: `${packageInfo.appName}${packageInfo.version || ''}${packageInfo.versionCode || ''}`,
    description: '',
    status: 1,
    creator: packageInfo.creator,
    createTime: Date.now(),
    updateTime: Date.now(),
    shortId: '',
    iconId: packageInfo.logoId,
    iconUrl: '',
    permission: {
      secret: 1,
      password: '',
      needLogin: -1,
      users: '',
      groupName: ''
    },
    pkgInfo: packageInfo
  });
}
