import { createRouter, createWebHistory } from "vue-router"

import routes from './routes'
import { _getData } from "../utils/utils"

const router = createRouter({
  history: createWebHistory(),
  routes
})
// 路由守卫
router.beforeEach((to, from, next) => {
  let t = _getData('id')
  if (!t && to.name != 'login' && to.name != 'share') {
    router.replace('/login')
  } else {
    next()
  }
})


export default router