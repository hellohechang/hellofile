const express = require('express'),
  fs = require('fs'),
  route = express.Router();
const { writelog, _err, _success } = require('../utils');
const { queryData } = require('../sqlite');

route.get('*', async (req, res) => {
  try {
    let { i } = req.query;
    let id = '';
    if (i) {
      id = i
    } else {
      id = req.url.split('/')[1];
    }

    let arr = await queryData('share', "*", `WHERE id=?`, [id])
    if (arr.length === 0) {
      _err(res, '分享已关闭~')
      return
    }
    let obj = arr[0];
    let path = `${obj.path}/${obj.name}`
    path = decodeURI(path)
    if (!fs.existsSync(path)) {
      _err(res, '没有找到文件~')
      return
    }
    if (i) {
      _success(res)
    } else {
      res.sendFile(path)
    }
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
})
module.exports = route