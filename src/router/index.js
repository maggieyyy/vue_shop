import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import User from '../components/user/User.vue'
import Roles from '../components/right/Roles.vue'
import Rights from '../components/right/Rights.vue'
import Categories from '../components/goods/Categories.vue'
import Goods from '../components/goods/Goods.vue'
import Params from '../components/goods/Params.vue'
import Orders from '../components/orders/Orders.vue'
import Reports from '../components/reports/Reports.vue'
import AddGoods from '../components/goods/Add.vue'
import EditGoods from '../components/goods/Edit.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: User },
      { path: '/roles', component: Roles },
      { path: '/rights', component: Rights },
      { path: '/categories', component: Categories },
      { path: '/goods', component: Goods },
      { path: '/params', component: Params },
      { path: '/orders', component: Orders },
      { path: '/reports', component: Reports },
      { path: '/goods/add', component: AddGoods },
      { path: '/goods/edit', component: EditGoods }]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径，from 从哪里访问，next是一个函数 next()放行，next('/login')强制跳转
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (tokenStr === null || tokenStr.length === 0) return next('/login')
  next()
})

export default router
