// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import VueLazyload from 'vue-lazyload'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.less'

import './styles/reset.css'

import { getToken } from './utils/auth'

import moment from 'moment'
import 'moment/locale/zh-cn'

moment.locale('zh-cn')

Vue.use(Antd)
Vue.use(VueLazyload, {
  error: 'static/error.png', // 这个是请求失败后显示的图片
  loading: 'static/loading.gif', // 这个是加载的loading过渡效果
  try: 2 // 这个是加载图片数量
})

Vue.config.productionTip = false

const whiteList = ['/login']
router.beforeEach(async (to, from, next) => {
  // set page title
  document.title = to.meta.title

  // determine whether the user has logged in
  const hasToken = getToken()

  if (hasToken) {
    store.commit('authentication/SET_TOKEN', hasToken)
    var currUser = JSON.parse(hasToken)
    if (currUser.initialPwd === 0 && to.path !== '/updatePwdFirst') {
      // 初次登陆 去修改密码
      next('/updatePwdFirst')
    } else {
      if (to.path === '/login') {
        // if is logged in, redirect to the home page
        next({ path: '/' })
      } else {
        // determine whether the user has obtained his permission roles through getInfo
        const hasRoles = store.getters.roles && store.getters.roles.length > 0
        if (hasRoles) {
          if (to.name === null) {
            // 找不到路由 跳转到默认页面
            next(`/my/admin/edit`)
          } else {
            next()
          }
        } else {
          try {
            var roles = []
            if (parseInt(currUser.level) === 5) {
              roles = ['admin']
            } else {
              roles = ['editor']
            }
            await store.dispatch('authentication/setRole', roles)

            const menuArr = (currUser.role && currUser.role.menu) || ''
            const menus = menuArr.split(',').map(item => {
              if (item.indexOf('_') !== -1) {
                return item.substr(0, item.indexOf('_'))
              } else {
                return item
              }
            })
            const accessRoutes = await store.dispatch('permission/generateRoutesByMenu', { roles: roles, perms: menus })
            // const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
            router.addRoutes(accessRoutes)
            next({ ...to, replace: true })
          } catch (error) {
            // remove token and go to login page to re-login
            await store.dispatch('authentication/resetToken')
            next(`/login?redirect=${to.path}`)
          }
        }
      }
    }
  } else {
    /* has no token */
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
    }
  }
})
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
