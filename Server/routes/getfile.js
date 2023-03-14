const express = require('express'),
  fs = require('fs'),
  route = express.Router();
const { _nologin, writelog, _err } = require('../utils');
const myconfig = require('../myconfig')
// 拦截器
route.use((req, res, next) => {
  if (req._userInfo.id) {
    next()
  } else {
    _nologin(res)
  }
})
route.get('*', async (req, res) => {
  try {
    let path = myconfig.rootP
    if (req._userInfo.id !== 'root') {
      path = `${myconfig.userP}/${req._userInfo.id}`
    }
    path += req.url;
    path = path.replace(/(\/)+/g, '/')
    path = decodeURI(path)
    if (!fs.existsSync(path)) {
      _err(res, '没有找到文件~')
      return
    }
    res.sendFile(path)
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
})

module.exports = route