import { createRouter, createWebHistory } from 'vue-router';

import routes from './routes';
import { _getData } from '../utils/utils';

const router = createRouter({
  history: createWebHistory(),
  routes,
});
// 路由守卫
router.beforeEach((to, from, next) => {
  let t = _getData('id');
  if (t) {
    if (to.name == 'login') {
      router.replace('/');
    } else {
      if (to.name == 'log' || to.name == 'admin') {
        if (t == 'root') {
          next();
        } else {
          router.replace('/');
        }
      } else {
        next();
      }
    }
  } else {
    if (to.name == 'login' || to.name == 'share') {
      next();
    } else {
      router.replace('/login');
    }
  }
});

export default router;
