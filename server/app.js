const express = require('express');

const app = express();

const os = require('os');

const fs = require('fs');

const bodyParser = require('body-parser');

const cookieParser = require('cookie-parser');

// 处理history模式
const history = require('connect-history-api-fallback');
// 获取访问设备信息
const UAParser = require('ua-parser-js');
app.use(history());
app.use(cookieParser());
//设置bodyParser
app.use(bodyParser.json({ limit: '50mb', parameterLimit: 1000000 }));
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    parameterLimit: 1000000,
    extended: false,
  })
);
let { jwtde, getClientIp, _err, writelog } = require('./utils/utils');
let { queryData } = require('./utils/sqlite');
const _d = require('./data/data');
const tokenP = `${_d.rootP}/.helloData/tokenKey`;
if (fs.existsSync(tokenP)) {
  const token = fs.readFileSync(tokenP).toString();
  if (_d.tokenKey != token) {
    _d.tokenKey = token;
  }
}
app.use(express.static('./dist'));
//token拦截
let ipobj = {};
app.use(async (req, res, next) => {
  try {
    req._userInfo = {};
    let _token = req.cookies.token; //读取token
    let obj = jwtde(_token); //解密token
    let userinfo = await queryData('user', '*', `WHERE id = ?`, [obj.id]);
    if (userinfo.length > 0) {
      req._userInfo = userinfo[0];
    }
    req._ip = getClientIp(req);
    req._pathUrl = req.url.split('?')[0];
    let _clientConfig = new UAParser(req.headers['user-agent']).getResult(); //获取访问设备信息
    req._os =
      (_clientConfig.os.name || 'other') +
      (_clientConfig.device.vendor
        ? `(${_clientConfig.device.vendor || ''} ${
            _clientConfig.device.model || ''
          })`
        : '');
    if (!req._userInfo.id) {
      if (!ipobj[req._ip]) {
        ipobj[req._ip] = 'y';
        writelog(req, `[${req.headers['user-agent']}]`);
      }
    }
    next();
  } catch (error) {
    writelog(req, `[app.use] ${error}`, true);
    _err(res);
  }
});
setInterval(() => {
  ipobj = {};
}, 1000 * 60 * 60 * 24);
app.use('/api/user', require('./routes/user'));
app.use('/api/file', require('./routes/file'));
app.use('/api/getfile', require('./routes/getfile'));
app.use('/api/sharefile', require('./routes/sharefile'));
app.listen(_d.port, () => {
  let arr = getLocahost().map(
    (item) => `http://${item}${_d.port == 80 ? '' : `:${_d.port}`}`
  );
  console.log(`服务开启成功，访问地址为：\n${arr.join('\n')}`);
});
function getLocahost() {
  let obj = os.networkInterfaces();
  let arr = [];
  Object.keys(obj).forEach((item) => {
    let value = obj[item];
    if (Object.prototype.toString.call(value).slice(8, -1) === 'Array') {
      arr = [
        ...arr,
        ...value
          .filter((item) => item.family == 'IPv4')
          .map((item) => item.address),
      ];
    }
  });
  return arr;
}
