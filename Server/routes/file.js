const express = require('express'),
  fs = require('fs'),
  route = express.Router();
const myconfig = require('../myconfig');
const { insertData, queryData, deleteData } = require('../sqlite');
const { _nologin, extName, _hdPath, readMenu, writelog, _err, isTextFile, _success, _hdDelete, compressDir, getRandomName, compressFile, uncompress, receiveFiles, mergefile, nanoid, _mkdir, isFileName, _readFile, _writeFile, _rename, _hdCopy, _readdir } = require('../utils');
// 获取分享
route.get('/getshare', async (req, res) => {
  try {
    let { id } = req.query;
    let arr = await queryData('share', 'id,uid,name,size', `WHERE id=?`, [id])
    if (arr.length === 0) {
      _err(res, '分享已被取消~')
      return
    }
    let obj = arr[0]
    let userinfo = await queryData('user', 'username', `WHERE id=?`, [obj.uid])
    if (userinfo.length > 0) {
      obj.username = userinfo[0].username
    }
    _success(res, 'ok', obj)
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
// 拦截器
route.use((req, res, next) => {
  if (req._userInfo.id) {
    next()
  } else {
    _nologin(res)
  }
})
//读取目录
route.get("/readdir", async (req, res) => {
  try {
    let { path = [] } = req.query;
    path = await _hdPath(req, path)
    _success(res, 'ok', await readMenu(path))
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
// 获取文件
route.post("/getfile", async (req, res) => {
  try {
    let { path } = req.body;
    let fpath = await _hdPath(req, path)
    if (!fs.existsSync(fpath)) {
      _err(res)
      return
    }
    if (isTextFile(fpath)) {//文本文件
      _success(res, 'ok', {
        type: 'text',
        data: (await _readFile(fpath, true)).toString()
      })
    } else {
      _success(res, 'ok', {
        type: 'other'
      })
    }
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
// 保存文件
route.post("/savefile", async (req, res) => {
  try {
    let { path, text = '' } = req.body;
    let fpath = await _hdPath(req, path)
    if (!fs.existsSync(fpath)) {
      _err(res)
      return
    }
    await _writeFile(fpath, text)
    writelog(req, `修改文本[${fpath}]`)
    _success(res)
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
//新建文件
route.post("/addfile", async (req, res) => {
  try {
    let { path, name } = req.body;
    if (!isFileName(name)) {
      _err(res)
      return
    }
    path.push(name)
    let fpath = await _hdPath(req, path)
    if (fs.existsSync(fpath)) {
      _err(res, '已存在重名文件~')
      return
    }
    await _writeFile(fpath, '')
    writelog(req, `新建文本[${fpath}]`)
    _success(res, 'ok', path)
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
//新建目录
route.post("/adddir", async (req, res) => {
  try {
    let { path, name } = req.body;
    if (!isFileName(name)) {
      _err(res)
      return
    }
    path.push(name)
    let fpath = await _hdPath(req, path)
    if (!name) {
      _err(res)
      return;
    }
    if (fs.existsSync(fpath)) {
      _err(res, '已存在重名文件~')
      return
    }
    await _mkdir(fpath)
    writelog(req, `新建目录[${fpath}]`)
    _success(res, 'ok', path)
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
//重命名
route.post("/rename", async (req, res) => {
  try {
    let { path, data, name } = req.body;
    if (data.length == 0 || !isFileName(name)) {
      _err(res)
      return
    }
    let fpath = await _hdPath(req, path);
    let p = `${fpath}/${name}`
    if (fs.existsSync(p)) {
      _err(res, '已存在重名文件~')
      return
    }
    await _rename(`${fpath}/${data[0].name}`, p)
    writelog(req, `重命名[${fpath}/${data[0].name}=>${p}]`)
    _success(res, 'ok')
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
//删除
route.post("/delete", async (req, res) => {
  try {
    let { path, data } = req.body;
    if (data.length == 0) {
      _err(res)
      return
    }
    let fpath = await _hdPath(req, path)
    let allp = data.map(item => {
      let p = `${fpath}/${item.name}`
      writelog(req, `删除${item.type == 'dir' ? '目录' : '文件'}[${p}]`)
      return _hdDelete(p)
    })
    await Promise.all(allp)
    _success(res, 'ok')
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
//复制
route.post("/copy", async (req, res) => {
  try {
    let { from, to, data } = req.body;
    from = await _hdPath(req, from)
    to = await _hdPath(req, to)
    // 相同目录下复制跳过
    if (from === to) {
      _success(res)
      return
    }
    // 判断被复制文件夹是否是复制到文件夹的父级文件夹
    if (data.some(item => {
      let p = `${from}/${item.name}`
      return item.type == 'dir' && p === to.slice(0, p.length)
    })) {
      _err(res)
      return
    }
    let allp = data.map(item => {
      let { name, type } = item;
      writelog(req, `复制${type == 'dir' ? '目录' : '文件'}[${from}/${name}=>${to}/${name}]`)
      return _hdCopy(`${from}/${name}`, `${to}/${name}`)
    });
    await Promise.all(allp)
    _success(res)
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
//移动
route.post("/move", async (req, res) => {
  try {
    let { from, to, data } = req.body;
    if (data.length == 0) {
      _err(res)
      return
    }
    from = await _hdPath(req, from)
    to = await _hdPath(req, to)
    // 相同目录下移动跳过
    if (from === to) {
      _success(res)
      return
    }
    // 判断被移动文件夹是否是移动到文件夹的父级文件夹
    if (data.some(item => {
      let p = `${from}/${item.name}`
      return item.type == 'dir' && p === to.slice(0, p.length)
    })) {
      _err(res)
      return
    }

    let allp = data.map(item => {
      let { type, name } = item;
      writelog(req, `移动${type == 'dir' ? '目录' : '文件'}[${from}/${name}=>${to}/${name}]`)
      return _rename(`${from}/${name}`, `${to}/${name}`)
    });
    await Promise.all(allp)
    _success(res)
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
//压缩
route.post("/zip", async (req, res) => {
  try {
    let { from, to, data } = req.body;
    from = await _hdPath(req, from)
    to = await _hdPath(req, to)
    if (data.some(item => {
      let p = `${from}/${item.name}`
      return item.type == 'dir' && p === to.slice(0, p.length)
    })) {
      _err(res)
      return
    }
    let tArr = await readMenu(to)
    if (data.length === 1) {//压缩
      let fname = data[0].name;
      fname = extName(fname)[0] += '.zip'
      if (tArr.some(y => y.name == fname)) {
        fname = getRandomName(fname);
      }
      if (data[0].type === 'dir') {
        await compressDir(`${from}/${data[0].name}`, `${to}/${fname}`)
        writelog(req, `压缩目录[${from}/${data[0].name}=>${to}/${fname}]`)
      } else {
        await compressFile(`${from}/${data[0].name}`, `${to}/${fname}`)
        writelog(req, `压缩文件[${from}/${data[0].name}=>${to}/${fname}]`)
      }
    } else {
      _err(res)
      return
    }
    _success(res, 'ok')
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
//解压缩
route.post("/unzip", async (req, res) => {
  try {
    let { from, to, data } = req.body;
    from = await _hdPath(req, from)
    to = await _hdPath(req, to)
    let tArr = await readMenu(to)
    if (data.length === 1) {
      let fname = extName(data[0].name)[0];
      if (tArr.some(y => y.name == fname)) {
        fname = getRandomName(fname);
        await uncompress(`${from}/${data[0].name}`, `${to}/${fname}`)
      } else {
        await uncompress(`${from}/${data[0].name}`, `${to}/`)
      }
      writelog(req, `解压缩[${from}/${data[0].name}=>${to}/${fname}]`)
    } else {
      _err(res)
      return
    }
    _success(res, 'ok')
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
// 上传
route.post("/upload", async (req, res) => {
  try {
    let { name, HASH } = req.query;
    let path = `${myconfig.uploadP}/${HASH}`;
    if (!isFileName(name)) {
      _err(res)
      return
    }
    await _mkdir(path)
    await receiveFiles(req, path, name)
    _success(res)
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
//合并文件
route.post('/mergefile', async (req, res) => {
  try {
    let { HASH, count, name, path } = req.body;
    let to = await _hdPath(req, path)
    if (!isFileName(name)) {
      _err(res)
      return
    }
    await _mkdir(to)
    await _hdDelete(`${to}/${name}`)
    await mergefile(count, `${myconfig.uploadP}/${HASH}`, `${to}/${name}`)
    writelog(req, `上传文件[${to}/${name}]`)
    _success(res)
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
// 断点续传
route.get('/breakpoint', async (req, res) => {
  try {
    let { HASH } = req.query,
      path = `${myconfig.uploadP}/${HASH}`,
      arr = await _readdir(path);
    _success(res, 'ok', arr)
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
// 分享文件
route.post('/share', async (req, res) => {
  try {
    let { path, data } = req.body,
      id = nanoid();
    path = await _hdPath(req, path);
    let { name, size } = data[0];
    await insertData('share', [{
      uid: req._userInfo.id,
      id,
      path,
      name,
      size
    }])
    writelog(req, `分享文件[${path}/${name}]`)
    _success(res)
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
// 获取分享列表
route.get('/share', async (req, res) => {
  try {
    let arr = await queryData('share', 'id,name', `WHERE uid=?`, [req._userInfo.id])
    _success(res, 'ok', arr)
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
// 删除分享
route.post('/deleteshare', async (req, res) => {
  try {
    let arr = req.body;
    await deleteData('share', `WHERE id IN (${new Array(arr.length).fill('?').join(',')}) AND uid=?`, [...arr, req._userInfo.id])
    writelog(req, `删除分享[${arr.join(',')}]`)
    _success(res)
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});

module.exports = route