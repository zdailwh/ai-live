import api from '../../api'
import { getToken, setToken, removeToken } from '../../utils/auth'
import { resetRouter } from '@/router'
import Cookies from 'js-cookie'

const state = {
  token: null,
  info: getToken() ? JSON.parse(getToken()) : {},
  roles: []
}

const mutations = {
  SET_INFO: (state, info) => {
    state.info = info
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  setRole ({ commit }, roles) {
    return new Promise(resolve => {
      commit('SET_ROLES', roles)
      resolve()
    })
  },
  // user login
  login ({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      api.login({ username: username.trim(), password: password }).then(response => {
        if (response.data.code === 0) {
          const item = response.data.data
          item.user.role = item.role
          commit('SET_INFO', item.user)
          commit('SET_TOKEN', JSON.stringify(item.user))
          setToken(JSON.stringify(item.user))
          Cookies.set('ailive-isVisitor', item.user.level === 2)
        }
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout ({ commit, state }) {
    return new Promise((resolve, reject) => {
      api.logout().then((response) => {
        if (response.data.code === 0) {
          commit('SET_INFO', {})
          commit('SET_TOKEN', null)
          removeToken()
          resetRouter()
        }
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken ({ commit }) {
    return new Promise(resolve => {
      commit('SET_INFO', {})
      commit('SET_TOKEN', null)
      removeToken()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
