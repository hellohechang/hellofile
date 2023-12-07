const fs = require('fs');
// token加密
const jwt = require('jsonwebtoken');
const sharp = require('sharp');
// 接收上传文件
const formidable = require('formidable');
// 压缩文件
const compressing = require('compressing');
const _d = require('../data/data');
// 客户端ip获取
function getClientIp(req) {
  let ip = '';
  try {
    ip =
      req.headers['x-forwarded-for'] ||
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress ||
      '';
  } catch (error) {
    ip = '';
  }
  let reg =
    /((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/;
  ip = ip.match(reg);
  return ip ? ip[0] : '0.0.0.0';
}
function isImgFile(name) {
  return /(\.jpg|\.jpeg|\.png|\.ico|\.svg|\.webp|\.gif)$/gi.test(name);
}
// 获取扩展名
function getSuffix(str) {
  let idx = str.lastIndexOf('.'),
    a = '',
    b = '';
  if (idx < 0) {
    a = str;
  } else {
    a = str.slice(0, idx);
    b = str.slice(idx + 1);
  }
  return [a, b];
}
async function compressionImg(path, x = 400, y = 400, quality) {
  try {
    const inputBuf = await _readFile(path);
    const img = sharp(inputBuf);
    const meta = await img.metadata();
    const buf = await img
      .resize(x, y, { fit: 'inside' }) // 保持比例
      .png(
        ['gif', 'raw', 'tile'].includes(meta.format) || !quality
          ? {}
          : { quality }
      )
      .toBuffer();
    return Promise.resolve(buf);
  } catch (error) {
    return Promise.reject(error);
  }
}
// 用户密码二次加密
function encryption(str) {
  return str.slice(10, -10).split('').reverse().join('');
}
//处理返回的结果
function _send(res, options) {
  res.status(200);
  res.type('application/json');
  res.send(
    Object.assign(
      {
        code: 0,
        codeText: 'OK',
        data: null,
      },
      options
    )
  );
}
function _success(res, codeText = '操作成功', data = null) {
  _send(res, {
    data,
    codeText,
  });
}
function _nologin(res) {
  _send(res, {
    code: 2,
    codeText: `当前未登录，请登录后再操作`,
  });
}
function _nothing(res) {
  _send(res, {
    code: 3,
  });
}
function _err(res, codeText = '操作失败，请稍后再试', data = null) {
  _send(res, {
    code: 1,
    codeText,
  });
}
function paramErr(res, req) {
  _err(res, '参数错误');
  const mt = req.method.toLocaleLowerCase();
  let ct = '';
  if (mt == 'get') {
    ct = JSON.stringify(req.query);
  } else if (mt == 'post') {
    ct = JSON.stringify(req.body);
  }
  writelog(req, `[${req._pathUrl}] 参数错误[${ct}]`, true);
}
// 定时器
function _setTimeout(callback, time) {
  let timer = setTimeout(() => {
    clearTimeout(timer);
    timer = null;
    callback();
  }, time);
  return timer;
}
// 生成token
function jwten(id) {
  return jwt.sign(
    { exp: Math.floor(Date.now() / 1000) + 60 * 60 * 5, id },
    _d.tokenKey
  );
}
// 解密token
function jwtde(token) {
  try {
    let obj = jwt.verify(token, _d.tokenKey);
    return obj;
  } catch (error) {
    return {};
  }
}
//接收文件
function receiveFiles(req, path, filename) {
  return new Promise((resolve, reject) => {
    formidable({
      multiples: true,
      uploadDir: path, //上传路径
      keepExtensions: true, //包含原始文件的扩展名
      maxFileSize: 200 * 1024 * 1024, //限制上传文件的大小。
    }).parse(req, function (err, fields, files) {
      if (err) {
        reject();
      } else {
        let newPath = hdPath(`${path}/${files.file.newFilename}`),
          originalPath = hdPath(`${path}/${filename}`);
        fs.rename(newPath, originalPath, function (err) {
          if (err) {
            reject();
            return;
          }
          resolve();
        });
      }
    });
  });
}
// 合并切片
async function mergefile(count, from, to) {
  try {
    let list = await _readdir(from);
    if (list.length < count) {
      reject();
      return;
    }
    list.sort((a, b) => {
      a = a.split('_')[1];
      b = b.split('_')[1];
      return a - b;
    });
    for (let i = 0; i < list.length; i++) {
      const u = hdPath(`${from}/${list[i]}`);
      const f = await _readFile(u);
      await _appendFile(to, f);
      await delDir(u);
    }
    await delDir(from);
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
}
function nanoid() {
  return Date.now().toString(16) + Math.random().toString(16).slice(2);
}
// 读取目录文件
async function readMenu(path) {
  try {
    const list = await _readdir(path);
    let arr = [];
    for (let i = 0; i < list.length; i++) {
      const name = list[i];
      const f = hdPath(`${path}/${name}`);
      const s = await _stat(f);
      if (s.isDirectory()) {
        arr.push({
          type: 'dir',
          name,
          time: s.ctime.getTime(),
          size: 0,
        });
      } else if (s.isFile()) {
        arr.push({
          type: 'file',
          name,
          time: s.ctime.getTime(),
          size: s.size,
        });
      }
    }
    return Promise.resolve(arr);
  } catch (error) {
    await writelog(0, `[${error}]`, 1);
    return Promise.resolve([]);
  }
}
// 数组转路径
async function _hdPath(req, arr) {
  let path = _d.rootP;
  if (req._userInfo.id !== 'root') {
    path = `${_d.rootP}/helloUser/${req._userInfo.id}`;
    await _mkdir(path);
  }
  if (arr && arr.length > 0) {
    path += `/${arr.join('/')}`;
  }
  return hdPath(path);
}
function hdPath(path) {
  return path.replace(/(\/){2,}/g, '/');
}
// 记录日志
async function writelog(req, str, isErr) {
  str = str + '';
  if (str.trim() === '') return;
  const date = formatDate({ template: '{0}-{1}-{2} {3}:{4}' });
  if (req) {
    let { username, id } = req._userInfo;
    str = `[${date}]${username || id ? ' - ' : ''}${username || ''}${
      id ? `(${id})` : ''
    } - ${str} - from ${req._os}(${req._ip})\n`;
  } else {
    str = `[${date}] - ${str}\n`;
  }
  const dir = `${_d.rootP}/.helloData/log`;
  await _mkdir(dir);
  const hp = `${dir}/${isErr ? 'error' : 'hello'}.log`;
  await _appendFile(hp, str);
  const s = await _stat(hp);
  if (s.size > 5 * 1024 * 1024) {
    await _rename(
      hp,
      `${dir}/${formatDate({ template: '{0}{1}{2}{3}{4}{5}' })}${
        isErr ? '.error' : ''
      }.log`
    );
  }
}
function formatDate(opt = {}) {
  let { template = '{0}-{1}-{2} {3}:{4}:{5}', timestamp = Date.now() } = opt;
  let date = new Date(+timestamp);
  let year = date.getFullYear(),
    month = date.getMonth() + 1,
    day = date.getDate(),
    week = date.getDay(),
    hour = date.getHours(),
    minute = date.getMinutes(),
    second = date.getSeconds();
  let weekArr = ['日', '一', '二', '三', '四', '五', '六'],
    timeArr = [year, month, day, hour, minute, second, week];
  return template.replace(/\{(\d+)\}/g, function () {
    let key = arguments[1];
    if (key == 6) return weekArr[timeArr[key]];
    let val = timeArr[key] + '';
    if (val == 'undefined') return '';
    return val.length < 2 ? '0' + val : val;
  });
}
function _stat(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}
async function _delDir(path) {
  const recycleP = hdPath(_d.rootP + '/.helloRecycle');
  if (_d.recycle == 'n' || recycleP == path.slice(0, recycleP.length)) {
    return delDir(path);
  }
  await _mkdir(recycleP);
  let fname = path.split('/').pop();
  if (fs.existsSync(`${recycleP}/${fname}`)) {
    fname = getRandomName(fname);
  }
  return _rename(path, `${recycleP}/${fname}`);
}
function delDir(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, function (err, status) {
      if (err) {
        reject(err);
        return;
      }
      if (status.isDirectory()) {
        fs.readdir(path, function (err, file) {
          if (err) {
            reject(err);
            return;
          }
          let res = file.map((item) => delDir(`${path}/${item}`));
          Promise.all(res)
            .then(() => {
              fs.rmdir(path, (err) => {
                if (err) {
                  reject(err);
                  return;
                }
                resolve();
              });
            })
            .catch((err) => {
              reject(err);
            });
        });
      } else {
        fs.unlink(path, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      }
    });
  });
}
// 读取文件
function _readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}
//写入文件
function _writeFile(path, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}
//读取目录
function _readdir(path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, result) => {
      if (err) {
        resolve([]);
        return;
      }
      resolve(result);
    });
  });
}
//创建目录
function _mkdir(path) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, { recursive: true }, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}
//追加文件
function _appendFile(path, data) {
  return new Promise((resolve, reject) => {
    fs.appendFile(path, data, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}
//复制文件
function _hdCopy(p1, p2) {
  return new Promise((resolve, reject) => {
    fs.cp(p1, p2, { recursive: true }, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}
// 移动文件
function _rename(p1, p2) {
  return new Promise((resolve, reject) => {
    fs.rename(p1, p2, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}
// 检查文件是否文本文件
function isTextFile(filepath, length) {
  fd = fs.openSync(filepath, 'r');
  length = length || 1000;
  for (var i = 0; i < length; i++) {
    buf = new Buffer.alloc(1);
    var bytes = fs.readSync(fd, buf, 0, 1, i);
    char = buf.toString().charCodeAt();
    if (bytes === 0) {
      return true;
    } else if (bytes === 1 && char === 0) {
      return false;
    }
  }
  return true;
}
// 压缩文件
function compressFile(p1, p2) {
  return compressing.zip.compressFile(p1, p2);
}
// 压缩目录
function compressDir(p1, p2) {
  return compressing.zip.compressDir(p1, p2);
}
// 解压
function uncompress(p1, p2) {
  return compressing.zip.uncompress(p1, p2);
}
// 文件随机后缀
function getRandomName(str) {
  let r = '_' + Math.random().toString().slice(-6),
    arr = getSuffix(str);
  return arr[0] + r + `${arr[1] === '' ? '' : `.${arr[1]}`}`;
}
function isUserName(str) {
  let reg =
    /^[\u2E80-\u2FDF\u3040-\u318F\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FFF\uA960-\uA97F\uAC00-\uD7FF\w -]+$/g;
  return str && reg.test(str);
}
function validationValue(target, arr) {
  return arr.includes(target);
}
function validaString(target, min = 0) {
  return _type.isString(target) && target.length >= min;
}
const _type = (function () {
  const _obj = {
      isNumber: 'Number',
      isBoolean: 'Boolean',
      isString: 'String',
      isNull: 'Null',
      isUndefined: 'Undefined',
      isSymbol: 'Symbol',
      isObject: 'Object',
      isArray: 'Array',
      isRegExp: 'RegExp',
      isDate: 'Date',
      isFunction: 'Function',
      isWindow: 'Window',
    },
    _toString = _obj.toString,
    _type = {};
  for (let key in _obj) {
    if (!_obj.hasOwnProperty(key)) break;
    let reg = new RegExp('\\[object ' + _obj[key] + '\\]');
    _type[key] = function (val) {
      return reg.test(_toString.call(val));
    };
  }
  return _type;
})();
function isFileName(str) {
  let reg = /[\/\\\:\*\"\<\>\|\？]/g;
  return _type.isString(str) && str != '' && !reg.test(str);
}
module.exports = {
  validationValue,
  validaString,
  _type,
  _stat,
  _readFile,
  _writeFile,
  _readdir,
  _appendFile,
  _hdCopy,
  isUserName,
  isFileName,
  _mkdir,
  hdPath,
  getRandomName,
  compressFile,
  compressDir,
  uncompress,
  isTextFile,
  _rename,
  writelog,
  _hdPath,
  readMenu,
  getClientIp,
  paramErr,
  delDir,
  _delDir,
  getSuffix,
  encryption,
  _send,
  _success,
  _nologin,
  _nothing,
  _err,
  _setTimeout,
  jwten,
  jwtde,
  isImgFile,
  receiveFiles,
  compressionImg,
  mergefile,
  formatDate,
  nanoid,
};
