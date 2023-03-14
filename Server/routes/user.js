const express = require('express'),
  route = express.Router();

let myconfig = require('../myconfig'),
  landingerr = {};
const { insertData, updateData, runSqlite, deleteData, queryData } = require('../sqlite')
const { writelog, encryption, nanoid, jwten, _success, _err, _nologin, _setTimeout, _mkdir, isUserName, _readFile, _appendFile, _writeFile } = require('../utils');

queryData('user', 'id').then(() => { }).catch(async () => {
  try {
    await runSqlite(`CREATE TABLE user (
      id       TEXT PRIMARY KEY
                    UNIQUE
                    NOT NULL,
      username TEXT,
      password TEXT
      )`)
    await runSqlite(`CREATE TABLE share (
      id   TEXT PRIMARY KEY
                UNIQUE
                NOT NULL,
      uid  TEXT,
      size  TEXT,
      path TEXT,
      name TEXT
      )`)
    await insertData('user', [{
      username: 'admin',
      id: 'root',
      password: '90089e402b00',
    }])
  } catch (error) {
    let str = `[${newDate("{0}-{1}-{2} {3}:{4}")}] - ${error}\n`
    await _appendFile('./hello.log', str)
  }
})

// 获取注册状态
route.get('/isregister', async (req, res) => {
  try {
    _success(res, 'ok', (await _readFile('./config.json')).registerstate)
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
})
//注册
route.post("/register", async (req, res) => {
  try {
    let { username, password } = req.body;
    if ((await _readFile('./config.json')).registerstate === 'n') {
      _err(res)
      return
    }
    if (!isUserName(username)) {
      _err(res)
      return
    }
    let id = nanoid();
    await insertData('user', [{
      id,
      username,
      password: encryption(password)
    }])
    await _mkdir(`${myconfig.userP}/${id}`)
    let token = jwten(id);
    res.cookie("token", token, { maxAge: 1000 * 60 * 60 * 2, httpOnly: true })
    writelog(req, `注册账号[${id}]`)
    _success(res, '注册账号成功~', { username, id });
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
//登录
route.post("/login", async (req, res) => {
  try {
    let { username, password } = req.body,
      _ip = req._ip;
    if (!isUserName(username)) {
      _err(res)
      return
    }
    if (!landingerr.hasOwnProperty(_ip) || landingerr[_ip] < 3) {
      let userinfo = await queryData('user', '*', `WHERE username=? AND password=?`, [username, encryption(password)])
      if (userinfo.length > 0) {
        let token = jwten(userinfo[0].id);
        res.cookie("token", token, { maxAge: 1000 * 60 * 60 * 2, httpOnly: true })
        writelog(req, `登录账号[${userinfo[0].id}]`)
        _success(res, '登录成功~', { username, id: userinfo[0].id });
        if (landingerr.hasOwnProperty(_ip)) delete landingerr[_ip];
        return
      }
      _err(res, '用户名或密码错误~');
      landingerr.hasOwnProperty(_ip) ? landingerr[_ip]++ : landingerr[_ip] = 1;
      if (landingerr[_ip] === 3) {
        _setTimeout(() => {
          delete landingerr[_ip];
        }, 1000 * 60 * 10);
      }
    } else {
      _err(res, '密码错误多次，请10分钟后再试~');
    }
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
//设置注册状态
route.post('/isregister', async (req, res) => {
  try {
    if (req._userInfo.id !== 'root') {
      _err('没有权限操作~')
      return
    }
    let a = await _readFile('./config.json')
    a.registerstate = a.registerstate == 'y' ? 'n' : 'y';
    await _writeFile('./config.json', a)
    writelog(req, `${a.registerstate === 'y' ? '开放' : '关闭'}注册`)
    _success(res, 'ok', a.registerstate)
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
})
//退出
route.post("/logout", async (req, res) => {
  try {
    res.clearCookie('token')
    writelog(req, `退出登录[${req._userInfo.id}]`)
    _success(res)
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
//修改用户名
route.post("/changeuser", async (req, res) => {
  try {
    let { username } = req.body;
    if (!isUserName(username)) {
      _err(res)
      return
    }
    if (username.length > 20) {
      _err(res, '用户名过长~')
      return
    }
    await updateData('user', { username }, `WHERE id=?`, [req._userInfo.id])
    writelog(req, `修改用户名[${req._userInfo.id}]`)
    _success(res)
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
// 修改密码
route.post("/changepd", async (req, res) => {
  try {
    let { password, oldpassword } = req.body;
    if (encryption(oldpassword) !== req._userInfo.password) {
      _err(res, '原密码错误，请重新输入~')
      return
    }
    password = encryption(password);
    await updateData('user', { password }, `WHERE id=?`, [req._userInfo.id])
    writelog(req, `修改密码[${req._userInfo.id}]`)
    _success(res, '修改密码成功~')
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
// 删除账号
route.post("/delete", async (req, res) => {
  try {
    if (req._userInfo.id === 'root') {
      _err(res, '没有权限操作~')
      return
    }
    await deleteData('user', `WHERE id=?`, [req._userInfo.id])
    await deleteData('share', `WHERE uid=?`, [req._userInfo.id])
    res.clearCookie('token')
    writelog(req, `删除账号[${req._userInfo.id}]`)
    _success(res, '删除账号成功~')
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
// 获取用户列表
route.get("/root/userlist", async (req, res) => {
  try {
    if (req._userInfo.id !== 'root') {
      _err(res, '没有权限操作~')
      return
    }
    let arr = await queryData('user', '*')
    _success(res, 'ok', arr)
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
// 重置密码
route.post("/root/repass", async (req, res) => {
  try {
    if (req._userInfo.id !== 'root') {
      _err(res, '没有权限操作~')
      return
    }
    let { id } = req.body;
    await updateData('user', { password: '90089e402b00' }, `WHERE id=?`, [id])
    writelog(req, `重置密码[${id}]`)
    _success(res, '密码重置成功~')
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
// 删除账号
route.post("/root/delete", async (req, res) => {
  try {
    let { id } = req.body;
    if (req._userInfo.id !== 'root' || id === 'root') {
      _err(res, '没有权限操作~')
      return
    }
    await deleteData('user', `WHERE id=?`, [id])
    writelog(req, `删除账号[${id}]`)
    _success(res, '删除账号成功~')
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
//搜索日志
route.get("/root/logsearch", async (req, res) => {
  try {
    if (req._userInfo.id !== 'root') {
      _err(res, '没有权限操作~')
      return
    }
    let { page, context, showpage = 50 } = req.query,
      arr = [];
    arr = (await _readFile('./hello.log', true)).toString().split('\n')
    arr.pop()
    arr.reverse();
    if (context) {
      arr = arr.filter(item => item.toLowerCase().includes(context.toLowerCase()))
    }

    let pagenum = Math.ceil(arr.length / showpage);
    page > pagenum ? page = pagenum : (page <= 0 ? page = 1 : null);
    let arr1 = arr.slice(showpage * (page - 1), showpage * page);
    _success(res, 'ok', {
      total: arr.length,
      totalPage: pagenum,
      pageNo: page,
      data: arr1
    });
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});
// 清空日志
route.post("/root/logclear", async (req, res) => {
  try {
    if (req._userInfo.id !== 'root') {
      _err(res, '没有权限操作~')
      return
    }
    await _writeFile('./hello.log', '')
    writelog(req, "清空日志");
    _success(res);
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`)
    _err(res)
  }
});

module.exports = route