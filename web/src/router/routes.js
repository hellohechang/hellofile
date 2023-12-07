// import router from '../router/index';
// import { _getData } from '../utils/utils';
export default [
  {
    path: '/',
    name: 'home',
    component: () => import('../page/Home.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../page/Login.vue'),
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../page/Admin.vue'),
    // beforeEnter: (to, form, next) => {
    //   let t = _getData('id')
    //   if (t === 'root') {
    //     next()
    //   } else {
    //     router.replace('/')
    //   }
    // }
  },
  {
    path: '/share/:id',
    name: 'share',
    component: () => import('../page/ShareFile.vue'),
  },
  {
    path: '/sharelist',
    name: 'sharelist',
    component: () => import('../page/ShareList.vue'),
  },
  {
    path: '/:catchAll(.*)',
    component: () => import('../page/NotFound.vue'),
  },
];
