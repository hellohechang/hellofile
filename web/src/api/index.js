import req from './ajax';

//是否登录
export const isLoginReq = (params) => req.get('/user/islogin', { params });

// 登录
export const loginReq = (data) => req.post('/user/login', data);

// 注册
export const registerReq = (data) => req.post('/user/register', data);

// 停止注册
export const isregisterReq = (data) => req.post('/user/isregister', data);

export const getisregisterReq = (params) =>
  req.get('/user/isregister', { params });

// 退出
export const logoutReq = () => req.post('/user/logout');

// 修改密码
export const changepdReq = (data) => req.post('/user/changepd', data);

// 修改用户名
export const changeuserReq = (data) => req.post('/user/changeuser', data);

// 删除账号
export const deleteUserReq = (data) => req.post('/user/delete', data);

// 获取用户列表
export const userlistReq = (params) =>
  req.get('/user/root/userlist', { params });

// token
export const updatetokenReq = () => req.get('/user/root/updatetoken');

// 回收站
export const recycleReq = () => req.get('/user/root/recycle');

// 重置密码
export const repassReq = (data) => req.post('/user/root/repass', data);

// 删除账号
export const rdeleteReq = (data) => req.post('/user/root/delete', data);

//获取文件列表
export const readDirReq = (params) => req.get('/file/readdir', { params });

//打开文件
export const getFileReq = (data) => req.post('/file/getfile', data);

//保存文件
export const savefileReq = (data) => req.post('/file/savefile', data);

//新建文件夹
export const adddirReq = (data) => req.post('/file/adddir', data);

//新建文件
export const addfileReq = (data) => req.post('/file/addfile', data);

//复制文件
export const copyReq = (data) => req.post('/file/copy', data);

//复制文件
export const moveReq = (data) => req.post('/file/move', data);

//重命名
export const renameReq = (data) => req.post('/file/rename', data);

//删除
export const deleteReq = (data) => req.post('/file/delete', data);

//压缩
export const zipReq = (data) => req.post('/file/zip', data);

//解压缩
export const unzipReq = (data) => req.post('/file/unzip', data);

// 上传
export const uploadReq = (data) => {
  const config = {
    headers: { 'Content-Type': 'multipart/form-data' },
    // timeout: 0
  };
  let { file, name, HASH } = data;
  return req.post(`/file/upload?name=${name}&HASH=${HASH}`, file, config);
};

//断点续传
export const breakpointReq = (params) =>
  req.get('/file/breakpoint', { params });

//合并切片
export const mergefileReq = (data) => req.post('/file/mergefile', data);

//分享文件
export const shareReq = (data) => req.post('/file/share', data);

//获取分享列表
export const getShareReq = (params) => req.get('/file/share', { params });

//取消分享
export const deleteShareReq = (data) => req.post('/file/deleteshare', data);

// 获取分享
export const getShareInfoReq = (params) =>
  req.get('/file/getshare', { params });

// 分享文件是否存在和获取分享文件
export const getSharefileReq = (params) => req.get('/sharefile', { params });
