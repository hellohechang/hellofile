const express = require('express'),
  route = express.Router();

let landingerr = {};
const _d = require('../data/data');
const {
  insertData,
  updateData,
  runSqlite,
  deleteData,
  queryData,
} = require('../utils/sqlite');
const {
  writelog,
  encryption,
  nanoid,
  jwten,
  _success,
  _err,
  _nologin,
  _setTimeout,
  _mkdir,
  isUserName,
  validaString,
  paramErr,
  hdPath,
  _writeFile,
} = require('../utils/utils');

queryData('user', 'id')
  .then(() => {})
  .catch(async () => {
    try {
      await runSqlite(`CREATE TABLE user (
      id       TEXT PRIMARY KEY
                    UNIQUE
                    NOT NULL,
      username TEXT NOT NULL,
      password TEXT NOT NULL
  );
  `);
      await runSqlite(`CREATE TABLE share (
      id   TEXT PRIMARY KEY
                UNIQUE
                NOT NULL,
      uid  TEXT NOT NULL,
      size TEXT NOT NULL,
      path TEXT NOT NULL,
      name TEXT NOT NULL
  );
  `);
      await runSqlite(`CREATE TRIGGER deluser AFTER DELETE 
    ON user
    BEGIN
       DELETE from share where uid=old.id;
    END;`);
      await runSqlite(`CREATE VIEW getshare AS
    SELECT u.username,
           s.id,
           s.uid,
           s.size,
           s.path,
           s.name
      FROM user AS u,
           share AS s
     WHERE u.id = s.uid;`);
      await insertData('user', [
        {
          username: 'admin',
          id: 'root',
          password: '90089e402b00',
        },
      ]);
    } catch (error) {
      await writelog(0, `[${error}]`, 1);
    }
  });

// 获取注册状态
route.get('/isregister', async (req, res) => {
  try {
    _success(res, 'ok', _d.registerstate);
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
//注册
route.post('/register', async (req, res) => {
  try {
    let { username, password } = req.body;
    if (_d.registerstate === 'n') {
      _err(res);
      return;
    }
    if (
      !validaString(username, 1) ||
      !isUserName(username) ||
      !validaString(password, 1)
    ) {
      paramErr(res, req);
      return;
    }
    if (username.length > 20) {
      _err(res, '用户名过长');
      return;
    }
    let id = nanoid();
    await insertData('user', [
      {
        id,
        username,
        password: encryption(password),
      },
    ]);
    await _mkdir(hdPath(`${_d.rootP}/helloUser/${id}`));
    let token = jwten(id);
    res.cookie('token', token, { maxAge: 1000 * 60 * 60 * 2, httpOnly: true });
    writelog(req, `注册账号[${id}]`);
    _success(res, '注册账号成功', { username, id });
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
//登录
route.post('/login', async (req, res) => {
  try {
    let { username, password } = req.body,
      _ip = req._ip;
    if (
      !validaString(username, 1) ||
      !isUserName(username) ||
      !validaString(password, 1)
    ) {
      paramErr(res, req);
      return;
    }
    if (!landingerr.hasOwnProperty(_ip) || landingerr[_ip] < 3) {
      let userinfo = await queryData(
        'user',
        '*',
        `WHERE username=? AND password=?`,
        [username, encryption(password)]
      );
      if (userinfo.length > 0) {
        let token = jwten(userinfo[0].id);
        res.cookie('token', token, {
          maxAge: 1000 * 60 * 60 * 5,
          httpOnly: true,
        });
        writelog(req, `登录账号[${userinfo[0].id}]`);
        _success(res, '登录成功', { username, id: userinfo[0].id });
        if (landingerr.hasOwnProperty(_ip)) delete landingerr[_ip];
        return;
      }
      _err(res, '用户名或密码错误');
      landingerr.hasOwnProperty(_ip)
        ? landingerr[_ip]++
        : (landingerr[_ip] = 1);
      if (landingerr[_ip] === 3) {
        _setTimeout(() => {
          delete landingerr[_ip];
        }, 1000 * 60 * 10);
      }
    } else {
      _err(res, '密码错误多次，请10分钟后再试');
    }
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`, true);
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
//设置注册状态
route.post('/isregister', async (req, res) => {
  try {
    if (req._userInfo.id !== 'root') {
      _err('没有权限操作');
      return;
    }
    _d.registerstate = _d.registerstate == 'y' ? 'n' : 'y';
    writelog(req, `${_d.registerstate === 'y' ? '开放' : '关闭'}注册`);
    _success(res, 'ok', _d.registerstate);
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
//退出
route.post('/logout', async (req, res) => {
  try {
    res.clearCookie('token');
    writelog(req, `退出登录[${req._userInfo.id}]`);
    _success(res);
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
//修改用户名
route.post('/changeuser', async (req, res) => {
  try {
    let { username } = req.body;
    if (!validaString(username, 1) || !isUserName(username)) {
      paramErr(res, req);
      return;
    }
    if (username.length > 20) {
      _err(res, '用户名过长');
      return;
    }
    await updateData('user', { username }, `WHERE id=?`, [req._userInfo.id]);
    writelog(req, `修改用户名[${req._userInfo.id}]`);
    _success(res);
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
// 修改密码
route.post('/changepd', async (req, res) => {
  try {
    let { password, oldpassword } = req.body;
    if (!validaString(oldpassword, 1) || !validaString(password, 1)) {
      paramErr(res, req);
      return;
    }
    if (encryption(oldpassword) !== req._userInfo.password) {
      _err(res, '原密码错误，请重新输入');
      return;
    }
    password = encryption(password);
    await updateData('user', { password }, `WHERE id=?`, [req._userInfo.id]);
    writelog(req, `修改密码[${req._userInfo.id}]`);
    _success(res, '修改密码成功');
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
// 删除账号
route.post('/delete', async (req, res) => {
  try {
    if (req._userInfo.id === 'root') {
      _err(res, '没有权限操作');
      return;
    }
    await deleteData('user', `WHERE id=?`, [req._userInfo.id]);
    res.clearCookie('token');
    writelog(req, `删除账号[${req._userInfo.id}]`);
    _success(res, '删除账号成功');
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
// 获取用户列表
route.get('/root/userlist', async (req, res) => {
  try {
    if (req._userInfo.id !== 'root') {
      _err(res, '没有权限操作');
      return;
    }
    let arr = await queryData('user', '*');
    _success(res, 'ok', {
      userlist: arr,
      recyclestate: _d.recycle,
      registerstate: _d.registerstate,
    });
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
// 重置密码
route.post('/root/repass', async (req, res) => {
  try {
    if (req._userInfo.id !== 'root') {
      _err(res, '没有权限操作');
      return;
    }
    let { id } = req.body;
    if (!validaString(id, 1)) {
      paramErr(res, req);
      return;
    }
    await updateData('user', { password: '90089e402b00' }, `WHERE id=?`, [id]);
    writelog(req, `重置密码[${id}]`);
    _success(res, '密码重置成功');
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
// 删除账号
route.post('/root/delete', async (req, res) => {
  try {
    let { id } = req.body;
    if (!validaString(id, 1)) {
      paramErr(res, req);
      return;
    }
    if (req._userInfo.id !== 'root' || id === 'root') {
      _err(res, '没有权限操作');
      return;
    }
    await deleteData('user', `WHERE id=?`, [id]);
    writelog(req, `删除账号[${id}]`);
    _success(res, '删除账号成功');
  } catch (error) {
    writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
route.get('/root/updatetoken', async (req, res) => {
  try {
    if (req._userInfo.id !== 'root') {
      _err(res, '没有权限操作');
      return;
    }
    _d.tokenKey = nanoid();
    const tokenP = `${_d.rootP}/.helloData/tokenKey`;
    await _mkdir(`${_d.rootP}/.helloData`);
    await _writeFile(tokenP, _d.tokenKey);
    writelog(req, `更新tokenKey成功`);
    _success(res, '更新tokenKey成功');
  } catch (error) {
    await writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
route.get('/root/recycle', async (req, res) => {
  try {
    if (req._userInfo.id !== 'root') {
      _err(res, '没有权限操作');
      return;
    }
    _d.recycle = _d.recycle == 'y' ? 'n' : 'y';
    writelog(req, _d.recycle == 'y' ? '开启回收站' : '关闭回收站');
    _success(res, 'ok', _d.recycle);
  } catch (error) {
    await writelog(req, `[${req._pathUrl}] ${error}`, true);
    _err(res);
  }
});
module.exports = route;
