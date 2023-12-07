const express = require('express'),
  fs = require('fs'),
  route = express.Router();
const { writelog, _err, _stat, _success, hdPath } = require('../utils/utils');
const { queryData } = require('../utils/sqlite');

route.get('*', async (req, res) => {
  try {
    let { i } = req.query;
    let id = '';
    if (i) {
      id = i;
    } else {
      id = req.url.split('/')[1];
    }

    let arr = await queryData('share', '*', `WHERE id=?`, [id]);
    if (arr.length === 0) {
      _err(res, '分享已关闭');
      return;
    }
    let obj = arr[0];
    let path = hdPath(`${obj.path}/${obj.name}`);
    path = decodeURI(path);
    if (!fs.existsSync(path)) {
      _err(res, '没有找到文件');
      return;
    }
    const stat = await _stat(path);
    if (!stat.isFile()) {
      _err(res, '没有找到文件');
      return;
    }
    if (i) {
      _success(res);
    } else {
      res.sendFile(path);
    }
  } catch (error) {
    await writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
module.exports = route;
