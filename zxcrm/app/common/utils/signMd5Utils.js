//签名密钥串(前后端要一致，正式发布请自行修改)
const signatureSecret = "dd05f1c54d63749eda95f9fa6d49v442a";

// MD5 加密 - 使用 uniapp 兼容的方式
let md5 = null;
try {
  // 尝试使用 crypto-js（uniapp 兼容）
  const CryptoJS = require('crypto-js');
  md5 = function(str) {
    return CryptoJS.MD5(str).toString().toUpperCase();
  };
} catch (e) {
  // 如果 crypto-js 不可用，提示安装
  console.error('crypto-js not found. Please install: npm install crypto-js');
  md5 = function(str) {
    console.error('MD5 function not available. Please install crypto-js in the app directory.');
    throw new Error('MD5 function not available. Please run: cd app && npm install crypto-js');
  };
}

export default class signMd5Utils {
  /**
   * json参数升序
   * @param jsonObj 发送参数
   */
  static sortAsc(jsonObj) {
    let arr = [];
    let num = 0;
    for (let i in jsonObj) {
      arr[num] = i;
      num++;
    }
    let sortArr = arr.sort();
    let sortObj = {};
    for (let i in sortArr) {
      sortObj[sortArr[i]] = jsonObj[sortArr[i]];
    }
    return sortObj;
  }

  /**
   * @param url 请求的url,应该包含请求参数(url的?后面的参数)
   * @param requestParams 请求参数(POST的JSON参数)
   * @returns {string} 获取签名
   */
  static getSign(url, requestParams) {
    let urlParams = this.parseQueryString(url);
    let jsonObj = this.mergeObject(urlParams, requestParams || {});
    let requestBody = this.sortAsc(jsonObj);
    return md5(JSON.stringify(requestBody) + signatureSecret).toUpperCase();
  }

  /**
   * @param url 请求的url
   * @returns {{}} 将url中请求参数组装成json对象(url的?后面的参数)
   */
  static parseQueryString(url) {
    let urlReg = /^[^\?]+\?([\w\W]+)$/,
      paramReg = /([^&=]+)=([\w\W]*?)(&|$|#)/g,
      urlArray = urlReg.exec(url),
      result = {};

    let lastpathVariable = url.substring(url.lastIndexOf('/') + 1);
    if (lastpathVariable.includes(",")) {
      if (lastpathVariable.includes("?")) {
        lastpathVariable = lastpathVariable.substring(0, lastpathVariable.indexOf("?"));
      }
      result["x-path-variable"] = decodeURIComponent(lastpathVariable);
    }
    if (urlArray && urlArray[1]) {
      let paramString = urlArray[1], paramResult;
      while ((paramResult = paramReg.exec(paramString)) != null) {
        if (this.myIsNaN(paramResult[2])) {
          paramResult[2] = paramResult[2].toString()
        }
        result[paramResult[1]] = paramResult[2];
      }
    }
    return result;
  }

  /**
   * @returns {*} 将两个对象合并成一个
   */
  static mergeObject(objectOne, objectTwo) {
    if (objectTwo && Object.keys(objectTwo).length > 0) {
      for (let key in objectTwo) {
        if (objectTwo.hasOwnProperty(key) === true) {
          if (this.myIsNaN(objectTwo[key])) {
            objectTwo[key] = objectTwo[key].toString()
          }
          objectOne[key] = objectTwo[key];
        }
      }
    }
    return objectOne;
  }

  static urlEncode(param, key, encode) {
    if (param == null) return '';
    let paramStr = '';
    let t = typeof (param);
    if (t == 'string' || t == 'number' || t == 'boolean') {
      paramStr += '&' + key + '=' + ((encode == null || encode) ? encodeURIComponent(param) : param);
    } else {
      for (let i in param) {
        let k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
        paramStr += this.urlEncode(param[i], k, encode);
      }
    }
    return paramStr;
  };

  /**
   * 接口签名用 生成header中的时间戳
   * @returns {number}
   */
  static getTimestamp() {
    return new Date().getTime()
  }

  static myIsNaN(value) {
    return typeof value === 'number' && !isNaN(value);
  }
}
