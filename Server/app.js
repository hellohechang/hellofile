const express = require('express');

const app = express()

const bodyParser = require('body-parser')

const cookieParser = require('cookie-parser')

// 处理history模式
const history = require('connect-history-api-fallback');

// const cors = require('cors')

// 获取访问设备信息
const UAParser = require("ua-parser-js");

app.use(cookieParser())

let myconfig = require('./myconfig')

let {
  jwtde,
  getClientIp,
  _err,
  writelog
} = require('./utils')
let { queryData } = require('./sqlite')


app.listen(myconfig.port, () => {
  console.log(`服务启动成功，端口： ${myconfig.port}`);
})
// app.use(cors({
//   origin: myconfig.AllowOrigin,
//   credentials: true //允许携带cookie
// }))

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'http://localhost:5173')
//   res.header('Access-Control-Allow-Credentials', true)
//   res.header('Access-Control-Allow-Headers', 'Authorization,X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method')
//   res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, PUT, DELETE')
//   res.header('Allow', 'GET, POST, PATCH, OPTIONS, PUT, DELETE')
//   next();
// });



//设置bodyParser
app.use(bodyParser.json({ limit: "50mb", parameterLimit: 1000000 }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    parameterLimit: 1000000,
    extended: false,
  })
);

//token拦截
let ipobj = {};
app.use(async (req, res, next) => {
  try {
    req._userInfo = {}
    let _token = req.cookies.token;//读取token
    let obj = jwtde(_token);//解密token
    let userinfo = await queryData('user', '*', `WHERE id = ?`, [obj.id]);
    if (userinfo.length > 0) {
      req._userInfo = userinfo[0]
    }
    req._ip = getClientIp(req);
    req._pathUrl = req.url.split('?')[0];
    let _clientConfig = new UAParser(req.headers['user-agent']).getResult();//获取访问设备信息
    req._os = (_clientConfig.os.name || 'other') + (_clientConfig.device.vendor ? `(${_clientConfig.device.vendor || ''} ${_clientConfig.device.model || ''})` : '');
    if (!req._userInfo.id) {
      if (!ipobj[req._ip]) {
        ipobj[req._ip] = 'y'
        writelog(req, `[${req.headers['user-agent']}]`)
      }
    }
    next()
  } catch (error) {
    writelog(req, `[app.use] ${error}`)
    _err(res)
  }
});
setInterval(() => {
  ipobj = {}
}, 1000 * 60 * 60 * 24);
app.use(history());

app.use('/user', require('./routes/user'))
app.use('/file', require('./routes/file'))
app.use('/getfile', require('./routes/getfile'))
app.use('/sharefile', require('./routes/sharefile'))


app.use(express.static('./dist'))