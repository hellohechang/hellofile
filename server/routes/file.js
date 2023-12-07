const express = require('express'),
  fs = require('fs'),
  route = express.Router();
const _d = require('../data/data');
const { insertData, queryData, deleteData } = require('../utils/sqlite');
const {
  _nologin,
  getSuffix,
  _hdPath,
  readMenu,
  writelog,
  _err,
  isTextFile,
  _success,
  compressDir,
  getRandomName,
  compressFile,
  uncompress,
  receiveFiles,
  mergefile,
  nanoid,
  _mkdir,
  isFileName,
  _readFile,
  _writeFile,
  _rename,
  _hdCopy,
  _readdir,
  validaString,
  paramErr,
  _type,
  _stat,
  validationValue,
  _delDir,
  hdPath,
} = require('../utils/utils');
// 获取分享
route.get('/getshare', async (req, res) => {
  try {
    let { id } = req.query;
    if (!validaString(id, 1)) {
      paramErr(res, req);
      return;
    }
    let arr = await queryData(
      'getshare',
      'username,id,uid,name,size',
      `WHERE id=?`,
      [id]
    );
    if (arr.length === 0) {
      _err(res, '分享已被取消');
      return;
    }
    _success(res, 'ok', arr[0]);
  } catch (error) {
    await writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
// 拦截器
route.use((req, res, next) => {
  if (req._userInfo.id) {
    next();
  } else {
    _nologin(res);
  }
});
//读取目录
route.get('/readdir', async (req, res) => {
  try {
    let { path = [] } = req.query;
    if (!_type.isArray(path)) {
      paramErr(res, req);
      return;
    }
    if (path.length > 0) {
      if (!path.every((item) => validaString(item, 1))) {
        paramErr(res, req);
        return;
      }
    }
    path = await _hdPath(req, path);
    _success(res, 'ok', await readMenu(path));
  } catch (error) {
    await writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
// 获取文件
route.post('/getfile', async (req, res) => {
  try {
    let { path } = req.body;
    if (
      !_type.isArray(path) ||
      path.length == 0 ||
      !path.every((item) => validaString(item, 1))
    ) {
      paramErr(res, req);
      return;
    }
    let fpath = await _hdPath(req, path);
    const stat = await _stat(fpath);
    if (!stat.isFile()) {
      _err(res, '没有找到文件');
      return;
    }
    if (isTextFile(fpath)) {
      //文本文件
      _success(res, 'ok', {
        type: 'text',
        data: (await _readFile(fpath)).toString(),
      });
    } else {
      _success(res, 'ok', {
        type: 'other',
      });
    }
  } catch (error) {
    await writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
// 保存文件
route.post('/savefile', async (req, res) => {
  try {
    let { path, text = '' } = req.body;
    if (
      !_type.isArray(path) ||
      path.length == 0 ||
      !path.every((item) => validaString(item, 1)) ||
      !validaString(text)
    ) {
      paramErr(res, req);
      return;
    }
    let fpath = await _hdPath(req, path);
    if (!fs.existsSync(fpath)) {
      _err(res);
      return;
    }
    await _writeFile(fpath, text);
    await writelog(req, `修改文本[${fpath}]`);
    _success(res);
  } catch (error) {
    await writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
//新建文件
route.post('/addfile', async (req, res) => {
  try {
    let { path, name } = req.body;
    if (!_type.isArray(path) || !isFileName(name)) {
      paramErr(res, req);
      return;
    }
    if (path.length > 0) {
      if (!path.every((item) => validaString(item, 1))) {
        paramErr(res, req);
        return;
      }
    }
    path.push(name);
    let fpath = await _hdPath(req, path);
    if (fs.existsSync(fpath)) {
      _err(res, '已存在重名文件');
      return;
    }
    await _writeFile(fpath, '');
    await writelog(req, `新建文本[${fpath}]`);
    _success(res, 'ok', path);
  } catch (error) {
    await writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
//新建目录
route.post('/adddir', async (req, res) => {
  try {
    let { path, name } = req.body;
    if (!_type.isArray(path) || !isFileName(name)) {
      paramErr(res, req);
      return;
    }
    if (path.length > 0) {
      if (!path.every((item) => validaString(item, 1))) {
        paramErr(res, req);
        return;
      }
    }
    path.push(name);
    let fpath = await _hdPath(req, path);
    if (fs.existsSync(fpath)) {
      _err(res, '已存在重名文件');
      return;
    }
    await _mkdir(fpath);
    await writelog(req, `新建目录[${fpath}]`);
    _success(res, 'ok', path);
  } catch (error) {
    await writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
//重命名
route.post('/rename', async (req, res) => {
  try {
    let { path, data, name } = req.body;
    if (
      !_type.isArray(path) ||
      !_type.isArray(data) ||
      data.length != 1 ||
      !data.every(
        (item) => _type.isObject(item) && validaString(item.name, 1)
      ) ||
      !isFileName(name)
    ) {
      paramErr(res, req);
      return;
    }
    if (path.length > 0) {
      if (!path.every((item) => validaString(item, 1))) {
        paramErr(res, req);
        return;
      }
    }
    let dir = await _hdPath(req, path);
    let p = hdPath(`${dir}/${data[0].name}`),
      t = hdPath(`${dir}/${name}`);
    if (fs.existsSync(t)) {
      _err(res, '已存在重名文件');
      return;
    }
    await _rename(p, t);
    await writelog(req, `重命名[${p}=>${t}]`);
    _success(res, 'ok');
  } catch (error) {
    await writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
//删除
route.post('/delete', async (req, res) => {
  try {
    let { path, data } = req.body;
    if (
      !_type.isArray(path) ||
      !_type.isArray(data) ||
      data.length == 0 ||
      !data.every(
        (item) =>
          _type.isObject(item) &&
          validaString(item.name, 1) &&
          validationValue(item.type, ['dir', 'file'])
      )
    ) {
      paramErr(res, req);
      return;
    }
    if (path.length > 0) {
      if (!path.every((item) => validaString(item, 1))) {
        paramErr(res, req);
        return;
      }
    }
    let fpath = await _hdPath(req, path);
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      let p = hdPath(`${fpath}/${item.name}`);
      await _delDir(p);
      await writelog(req, `删除${item.type == 'dir' ? '目录' : '文件'}[${p}]`);
    }
    _success(res, 'ok');
  } catch (error) {
    await writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
//复制
route.post('/copy', async (req, res) => {
  try {
    let { from, to, data } = req.body;
    if (
      !_type.isArray(from) ||
      !_type.isArray(to) ||
      !_type.isArray(data) ||
      data.length == 0 ||
      !data.every(
        (item) =>
          _type.isObject(item) &&
          validaString(item.name, 1) &&
          validationValue(item.type, ['dir', 'file'])
      )
    ) {
      paramErr(res, req);
      return;
    }
    if (from.length > 0) {
      if (!from.every((item) => validaString(item, 1))) {
        paramErr(res, req);
        return;
      }
    }
    if (to.length > 0) {
      if (!to.every((item) => validaString(item, 1))) {
        paramErr(res, req);
        return;
      }
    }
    from = await _hdPath(req, from);
    to = await _hdPath(req, to);
    // 相同目录下复制跳过
    if (from === to) {
      _success(res);
      return;
    }
    // 判断被复制文件夹是否是复制到文件夹的父级文件夹
    if (
      data.some((item) => {
        let p = hdPath(`${from}/${item.name}`);
        return item.type == 'dir' && p === to.slice(0, p.length);
      })
    ) {
      _err(res);
      return;
    }
    for (let i = 0; i < data.length; i++) {
      const { name, type } = data[i];
      const f = hdPath(`${from}/${name}`),
        t = hdPath(`${to}/${name}`);
      await _hdCopy(f, t);
      await writelog(req, `复制${type == 'dir' ? '目录' : '文件'}[${f}=>${t}]`);
    }
    _success(res);
  } catch (error) {
    await writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
//移动
route.post('/move', async (req, res) => {
  try {
    let { from, to, data } = req.body;
    if (
      !_type.isArray(from) ||
      !_type.isArray(to) ||
      !_type.isArray(data) ||
      data.length == 0 ||
      !data.every(
        (item) =>
          _type.isObject(item) &&
          validaString(item.name, 1) &&
          validationValue(item.type, ['dir', 'file'])
      )
    ) {
      paramErr(res, req);
      return;
    }
    if (from.length > 0) {
      if (!from.every((item) => validaString(item, 1))) {
        paramErr(res, req);
        return;
      }
    }
    if (to.length > 0) {
      if (!to.every((item) => validaString(item, 1))) {
        paramErr(res, req);
        return;
      }
    }
    from = await _hdPath(req, from);
    to = await _hdPath(req, to);
    // 相同目录下移动跳过
    if (from === to) {
      _success(res);
      return;
    }
    // 判断被移动文件夹是否是移动到文件夹的父级文件夹
    if (
      data.some((item) => {
        let p = hdPath(`${from}/${item.name}`);
        return item.type == 'dir' && p === to.slice(0, p.length);
      })
    ) {
      _err(res);
      return;
    }
    for (let i = 0; i < data.length; i++) {
      let { type, name } = data[i];
      const f = hdPath(`${from}/${name}`),
        t = hdPath(`${to}/${name}`);
      await _rename(f, t);
      await writelog(req, `移动${type == 'dir' ? '目录' : '文件'}[${f}=>${t}]`);
    }
    _success(res);
  } catch (error) {
    await writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
//压缩
route.post('/zip', async (req, res) => {
  try {
    let { from, to, data } = req.body;
    if (
      !_type.isArray(from) ||
      !_type.isArray(to) ||
      !_type.isArray(data) ||
      data.length != 1 ||
      !data.every(
        (item) =>
          _type.isObject(item) &&
          validaString(item.name, 1) &&
          validationValue(item.type, ['dir', 'file'])
      )
    ) {
      paramErr(res, req);
      return;
    }
    if (from.length > 0) {
      if (!from.every((item) => validaString(item, 1))) {
        paramErr(res, req);
        return;
      }
    }
    if (to.length > 0) {
      if (!to.every((item) => validaString(item, 1))) {
        paramErr(res, req);
        return;
      }
    }
    from = await _hdPath(req, from);
    to = await _hdPath(req, to);
    if (
      data.some((item) => {
        let p = hdPath(`${from}/${item.name}`);
        return item.type == 'dir' && p === to.slice(0, p.length);
      })
    ) {
      _err(res);
      return;
    }
    let tArr = await readMenu(to);
    //压缩
    let fname = data[0].name;
    fname = getSuffix(fname)[0] += '.zip';
    if (tArr.some((y) => y.name == fname)) {
      fname = getRandomName(fname);
    }
    const f = hdPath(`${from}/${data[0].name}`),
      t = hdPath(`${to}/${fname}`);
    if (data[0].type === 'dir') {
      await compressDir(f, t);
      await writelog(req, `压缩目录[${f}=>${t}]`);
    } else {
      await compressFile(f, t);
      await writelog(req, `压缩文件[${f}=>${t}]`);
    }
    _success(res, 'ok');
  } catch (error) {
    await writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
//解压缩
route.post('/unzip', async (req, res) => {
  try {
    let { from, to, data } = req.body;
    if (
      !_type.isArray(from) ||
      !_type.isArray(to) ||
      !_type.isArray(data) ||
      data.length != 1 ||
      !data.every(
        (item) =>
          _type.isObject(item) &&
          validaString(item.name, 1) &&
          validationValue(item.type, ['dir', 'file'])
      )
    ) {
      paramErr(res, req);
      return;
    }
    if (from.length > 0) {
      if (!from.every((item) => validaString(item, 1))) {
        paramErr(res, req);
        return;
      }
    }
    if (to.length > 0) {
      if (!to.every((item) => validaString(item, 1))) {
        paramErr(res, req);
        return;
      }
    }
    from = await _hdPath(req, from);
    to = await _hdPath(req, to);
    let tArr = await readMenu(to);
    let fname = getSuffix(data[0].name)[0];
    let f = hdPath(`${from}/${data[0].name}`),
      t = hdPath(`${to}/${fname}`);
    if (tArr.some((y) => y.name == fname)) {
      fname = getRandomName(fname);
      t = hdPath(`${to}/${fname}`);
      await uncompress(f, t);
    } else {
      await uncompress(f, hdPath(`${to}/`));
    }
    await writelog(req, `解压缩[${f}=>${t}]`);
    _success(res, 'ok');
  } catch (error) {
    await writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
// 上传
route.post('/upload', async (req, res) => {
  try {
    let { name, HASH } = req.query;
    if (!isFileName(name) || !isFileName(HASH)) {
      paramErr(res, req);
      return;
    }
    let path = hdPath(`${_d.rootP}/.helloTem/${HASH}`);
    await _mkdir(path);
    await receiveFiles(req, path, name);
    _success(res);
  } catch (error) {
    await writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
//合并文件
route.post('/mergefile', async (req, res) => {
  try {
    let { HASH, count, name, path } = req.body;
    count = +count;
    if (
      !_type.isArray(path) ||
      !isFileName(name) ||
      !isFileName(HASH) ||
      isNaN(count) ||
      count < 1
    ) {
      paramErr(res, req);
      return;
    }
    if (path.length > 0) {
      if (!path.every((item) => validaString(item, 1))) {
        paramErr(res, req);
        return;
      }
    }
    let to = await _hdPath(req, path);
    await _mkdir(to);
    const t = hdPath(`${to}/${name}`);
    await _delDir(t).catch((err) => {});
    await mergefile(count, hdPath(`${_d.rootP}/.helloTem/${HASH}`), t);
    await writelog(req, `上传文件[${t}]`);
    _success(res);
  } catch (error) {
    await writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
// 断点续传
route.get('/breakpoint', async (req, res) => {
  try {
    let { HASH } = req.query;
    if (!isFileName(HASH)) {
      paramErr(res, req);
      return;
    }
    let path = hdPath(`${_d.rootP}/.helloTem/${HASH}`),
      arr = await _readdir(path);
    _success(res, 'ok', arr);
  } catch (error) {
    await writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
// 分享文件
route.post('/share', async (req, res) => {
  try {
    let { path, data } = req.body;
    if (
      !_type.isArray(path) ||
      !_type.isArray(data) ||
      data.length != 1 ||
      !data.every(
        (item) =>
          _type.isObject(item) &&
          validaString(item.name, 1) &&
          validationValue(item.type, ['file'])
      )
    ) {
      paramErr(res, req);
      return;
    }
    if (path.length > 0) {
      if (!path.every((item) => validaString(item, 1))) {
        paramErr(res, req);
        return;
      }
    }
    let id = nanoid();
    path = await _hdPath(req, path);
    let { name, size } = data[0];
    await insertData('share', [
      {
        uid: req._userInfo.id,
        id,
        path,
        name,
        size,
      },
    ]);
    await writelog(req, `分享文件[${hdPath(`${path}/${name}`)}]`);
    _success(res);
  } catch (error) {
    await writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
// 获取分享列表
route.get('/share', async (req, res) => {
  try {
    let arr = await queryData('share', 'id,name', `WHERE uid=?`, [
      req._userInfo.id,
    ]);
    _success(res, 'ok', arr);
  } catch (error) {
    await writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
// 删除分享
route.post('/deleteshare', async (req, res) => {
  try {
    let arr = req.body;
    if (
      !_type.isArray(arr) ||
      arr.length == 0 ||
      !arr.every((item) => validaString(item, 1))
    ) {
      paramErr(res, req);
      return;
    }
    await deleteData(
      'share',
      `WHERE id IN (${new Array(arr.length).fill('?').join(',')}) AND uid=?`,
      [...arr, req._userInfo.id]
    );
    await writelog(req, `删除分享[${arr.join(',')}]`);
    _success(res);
  } catch (error) {
    await writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});

module.exports = route;
