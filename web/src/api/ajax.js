import axios from 'axios';
//引入router
import { _delData, _err, _loadingBar } from '../utils/utils';
import router from '../router/index';
window.hostUrl = window.location.href.match(/^(https?:\/\/)([^\/\#\?]+)/)[0];
window.baseURL = '/api';
// 创建axios实例
let req = axios.create({
  baseURL: window.baseURL,
  // timeout: 10000
});
req.defaults.withCredentials = true;
// 请求拦截
req.interceptors.request.use(
  (config) => {
    _loadingBar.start();
    // 携带token
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// 响应拦截
req.interceptors.response.use(
  (res) => {
    _loadingBar.end();
    //相应成功做的事情
    if (res.data.code == 1) {
      _err(res.data.codeText);
    } else if (res.data.code == 2) {
      _delData('id');
      router.replace('/login'); //未登录跳转到登录页
    }
    return res.data;
  },
  () => {
    _err('请求失败');
    _loadingBar.end();
  }
);
export default req;
