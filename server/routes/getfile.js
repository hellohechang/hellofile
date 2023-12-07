const express = require('express'),
  fs = require('fs'),
  route = express.Router();
const {
  _nologin,
  writelog,
  _err,
  _stat,
  hdPath,
  isImgFile,
  getSuffix,
  _mkdir,
  compressionImg,
  _writeFile,
} = require('../utils/utils');
const _d = require('../data/data');
// 拦截器
route.use((req, res, next) => {
  if (req._userInfo.id) {
    next();
  } else {
    _nologin(res);
  }
});
route.get('*', async (req, res) => {
  try {
    let path = _d.rootP,
      id = req._userInfo.id;
    if (id !== 'root') {
      path = `${_d.rootP}/helloUser/${id}`;
    }
    const { t } = req.query;
    let url = decodeURI(req.url)
      .replace(/(\?|\#).*$/, '')
      .replace(/\/+$/, '');
    const pArr = url.split('/');
    path += url;
    path = hdPath(path);
    if (!fs.existsSync(path)) {
      _err(res, '没有找到文件');
      return;
    }
    const stat = await _stat(path);
    if (!stat.isFile()) {
      _err(res, '没有找到文件');
      return;
    }
    const filename = pArr[pArr.length - 1];
    try {
      if (isImgFile(filename) && stat.size > 200 * 1024 && t) {
        const name = getSuffix(filename)[0] + '.png';
        const thumbP = `${_d.rootP}/.helloData/thumb`;
        const tp = `${thumbP}/${name}`;
        if (!fs.existsSync(tp)) {
          await _mkdir(thumbP);
          const buf = await compressionImg(path, 400, 400, 20);
          await _writeFile(tp, buf);
        }
        path = tp;
      }
    } catch (error) {}
    res.sendFile(path);
  } catch (error) {
    await writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});

module.exports = route;
