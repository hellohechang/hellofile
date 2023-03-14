const fs = require('fs')
// token加密
const jwt = require('jsonwebtoken');
// 接收上传文件
const formidable = require('formidable')
// 压缩文件
const compressing = require('compressing')

const myconfig = require('./myconfig')

// 客户端ip获取
function getClientIp(req) {
  let ip = '';
  try {
    ip = req.headers["x-forwarded-for"] ||
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress ||
      "";
  } catch (error) {
    ip = '';
  }
  let reg = /((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/;
  ip = ip.match(reg);
  return ip ? ip[0] : '0.0.0.0';
}
// 格式化当前日期或时间戳日期
function newDate(templete, timestamp) {
  templete ? null : (templete = "{0}年{1}月{2}日 {3}时{4}分{5}秒 星期{6}");
  let currentDate = timestamp ? new Date(+timestamp) : new Date();
  let year = currentDate.getFullYear(),
    month = currentDate.getMonth() + 1,
    date = currentDate.getDate(),
    hour = currentDate.getHours(),
    minute = currentDate.getMinutes(),
    second = currentDate.getSeconds(),
    weekArr = ["日", "一", "二", "三", "四", "五", "六"],
    n_day = currentDate.getDay();
  let formattedDateString = `${year}-${month}-${date}-${hour}-${minute}-${second}-${n_day}`,
    timeArr = formattedDateString.match(/\d+/g);
  return templete.replace(/\{(\d+)\}/g, (...arg) => {
    if (arg[1] === "6") {
      return weekArr[timeArr[arg[1]]];
    } else {
      let time = timeArr[arg[1]] || "00";
      return time.length < 2 ? "0" + time : time;
    }
  });
}
// 获取扩展名
function extName(str) {
  let idx = str.lastIndexOf('.'),
    a = '',
    b = '';
  if (idx < 0) {
    a = str
  } else {
    a = str.slice(0, idx)
    b = str.slice(idx + 1)
  }
  return [a, b];
}
// 用户密码二次加密
function encryption(str) {
  return str.slice(10, -10).split('').reverse().join('');
}
//处理返回的结果
function _send(res, options) {
  res.status(200);
  res.type('application/json');
  res.send(Object.assign({
    code: 0,
    codeText: 'OK',
    data: null
  }, options));
}
function _success(res, codeText = "操作成功~", data = null) {
  _send(res, {
    data,
    codeText
  });
}
function _nologin(res) {
  _send(res, {
    code: 2,
    codeText: `当前未登录，请登录后再操作~`
  });
}
function _nothing(res) {
  _send(res, {
    code: 3,
  });
}
function _err(res, codeText = "操作失败，请稍后再试~", data = null) {
  _send(res, {
    code: 1,
    codeText
  });
}
// 定时器
function _setTimeout(callback, time) {
  let timer = setTimeout(() => {
    clearTimeout(timer)
    timer = null;
    callback()
  }, time);
  return timer;
}
// 生成token
function jwten(id) {
  return jwt.sign({ exp: Math.floor(Date.now() / 1000) + (60 * 60 * 5), id }, myconfig.tokenKey)
}
// 解密token
function jwtde(token) {
  try {
    let obj = jwt.verify(token, myconfig.tokenKey);
    return obj
  } catch (error) {
    return {}
  }
}
//接收文件
function receiveFiles(req, path, filename) {
  return new Promise((resolve, reject) => {
    formidable({
      multiples: true,
      uploadDir: path,//上传路径
      keepExtensions: true,//包含原始文件的扩展名
      maxFileSize: 200 * 1024 * 1024//限制上传文件的大小。
    }).parse(req, function (err, fields, files) {
      if (err) {
        reject();
      } else {
        let newPath = `${path}/${files.file.newFilename}`,
          originalPath = `${path}/${filename}`;
        fs.rename(newPath, originalPath, function (err) {
          if (err) {
            reject();
            return
          }
          resolve();
        })
      }
    })
  })
}
// 合并切片
function mergefile(count, from, to) {
  return new Promise(async (resolve, reject) => {
    if (fs.existsSync(from)) {
      let list = await _readdir(from);
      if (list.length < count) {
        reject()
        return;
      }
      list.sort((a, b) => {
        a = a.split('_')[1];
        b = b.split('_')[1];
        return a - b;
      });
      ~async function next(num) {
        if (num >= list.length) {
          await _hdDelete(from);
          resolve()
          return;
        }
        let u = `${from}/${list[num]}`
        let a = await _readFile(u, true)
        await _appendFile(to, a)
        await _hdDelete(u);
        num++
        next(num)
      }(0);
    } else {
      reject()
    }
  })
}
function nanoid() {
  return (+(Date.now() + Math.random().toFixed(5).slice(-5))).toString(16);
}
// 读取目录文件
function readMenu(path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, result) => {
      if (err) {
        resolve([]);
        return;
      }
      let arr = [];
      let arrp = result.map(item => {
        return new Promise((resolve, reject) => {
          fs.stat(`${path}/${item}`, (err, s) => {
            if (err) {
              resolve(s)
              return
            }
            if (s.isDirectory()) {
              obj = {
                type: 'dir',
                name: item,
                time: s.ctime.getTime(),
                size: 0
              }
              arr.push(obj)
            } else {
              obj = {
                type: 'file',
                name: item,
                time: s.ctime.getTime(),
                size: s.size
              }
              arr.push(obj)
            }
            resolve(s)
          })
        })
      });
      Promise.all(arrp).then(() => {
        resolve(arr)
      }).catch(err => {
        resolve([])
      })
    });
  })
}
// 数组转路径
async function _hdPath(req, arr) {
  let path = myconfig.rootP;
  if (req._userInfo.id !== 'root') {
    path = `${myconfig.userP}/${req._userInfo.id}`
    await _mkdir(path)
  }
  if (arr && arr.length > 0) {
    path += `/${arr.join('/')}`
  }
  return path.replace(/(\/)+/g, '/')
}
// 记录日志
function writelog(req, str) {
  str = `[${newDate("{0}-{1}-{2} {3}:{4}")}] - (${req._ip}) - ${str} - from ${req._os}\n`
  _appendFile('./hello.log', str)
}
// 删除目录
function _hdDelete(path) {
  if (!fs.existsSync(path)) return;
  return new Promise((resolve, reject) => {
    fs.stat(path, function (err, status) {
      if (status.isDirectory()) { //是文件夹
        fs.readdir(path, function (err, file) {
          let res = file.map((item) => _hdDelete(`${path}/${item}`));
          Promise.all(res).then(() => { //当所有的子文件都删除后就删除当前文件夹
            fs.rmdir(path, resolve);
          });
        });
      } else {
        fs.unlink(path, resolve);
      }
    });
  });
}
// 读取文件
function _readFile(path, y) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      if (y) {
        resolve(result);
      } else {
        resolve(JSON.parse(result));
      }
    });
  });
}
//写入文件
function _writeFile(path, data) {
  data !== null && typeof data === 'object' ? data = JSON.stringify
    (data) : null;
  typeof data !== 'string' ? data += '' : null;
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
    fs.cp(p1, p2, { recursive: true }, err => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })
}
// 移动文件
function _rename(p1, p2) {
  return new Promise((resolve, reject) => {
    fs.rename(p1, p2, err => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })
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
  return compressing.zip.compressFile(p1, p2)
}
// 压缩目录
function compressDir(p1, p2) {
  return compressing.zip.compressDir(p1, p2)
}
// 解压
function uncompress(p1, p2) {
  return compressing.zip.uncompress(p1, p2)
}
// 文件随机后缀
function getRandomName(str) {
  let r = '_' + Math.random().toString().slice(-6),
    arr = extName(str);
  return arr[0] + r + `${arr[1] === '' ? '' : `.${arr[1]}`}`
}
function isUserName(str) {
  let reg = /^[\u2E80-\u2FDF\u3040-\u318F\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FFF\uA960-\uA97F\uAC00-\uD7FF\w -]+$/g;
  return str && reg.test(str)
}
function isFileName(str) {
  let reg = /[\/\\\:\*\"\<\>\|\？]/g;
  return str && !reg.test(str)
}
module.exports = {
  _readFile,
  _writeFile,
  _readdir,
  _appendFile,
  _hdCopy,
  isUserName,
  isFileName,
  _mkdir,
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
  _hdDelete,
  newDate,
  extName,
  encryption,
  _send,
  _success,
  _nologin,
  _nothing,
  _err,
  _setTimeout,
  jwten,
  jwtde,
  receiveFiles,
  mergefile,
  nanoid,
}
