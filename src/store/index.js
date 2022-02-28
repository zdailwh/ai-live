import Vue from 'vue'
import Vuex from 'vuex'
import authentication from './modules/authentication'
import permission from './modules/permission'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    count: 0,
    facegroups: [],
    faces: [],
    faceTotal: 0,
    groupTotal: 0,
    hosturl: (window.localStorage && window.localStorage.getItem('KS_host')) || '182.92.115.19:8001',
    pageSpin: {
      spinning: false,
      tip: '加载中...'
    }
  },
  getters: {
    roles: state => state.authentication.roles,
    permission_routes: state => state.permission.routes,
    pageSpin: state => state.pageSpin
  },
  mutations: {
    increment (state) {
      state.count++
    },
    setFacegroups (state, list) {
      state.facegroups = list || []
    },
    setFaces (state, list) {
      state.faces = list || []
    },
    setFaceTotal (state, total) {
      state.faceTotal = total
    },
    setGroupTotal (state, total) {
      state.groupTotal = total
    },
    setHosturl (state, url) {
      state.hosturl = url
      var storage = window.localStorage
      storage.setItem('KS_host', url)
    },
    setPageSpin (state, param) {
      state.pageSpin = {
        spinning: param.spinning,
        tip: param.tip || '加载中...'
      }
    }
  },
  actions: {
    increment (context) {
      context.commit('increment')
    }
  },
  modules: {
    authentication,
    permission
  }
})

export default store
