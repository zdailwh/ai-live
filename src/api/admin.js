import axios from 'axios'

const mock = require('../mock')

function timeout (ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

export default {
  async fetchList (params) {
    if (process.env.NODE_ENV === 'production') {
      var opts = {}
      if (params && params.page_size) {
        opts.page_size = params.page_size
      }
      if (params && params.page_no) {
        opts.page_no = params.page_no - 1
      }
      if (params && params.username) {
        opts.username = params.username
      }
      if (params && params.createTime) {
        opts.createTime = params.createTime
      }
      var res = await axios.get(`/api/admin/v1/users`, {
        params: opts
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.users)
      return { status: 200, data: data }
    }
  },
  async getAllUsers () {
    if (process.env.NODE_ENV === 'production') {
      var params = {}
      params.orderby = 'id'
      var res = await axios.get(`/api/admin/v1/users`, {
        params
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.users)
      return { status: 200, data: data }
    }
  },
  async getUserRole (query) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.get(`/api/admin/v1/users/${query.id}/role`)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.user)
      return { status: 200, data: data }
    }
  },
  async actived (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.put(`/api/admin/v1/users/${params.id}/actived`)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.user)
      return { status: 200, data: data }
    }
  },
  async inactived (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.put(`/api/admin/v1/users/${params.id}/inactived`)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.user)
      return { status: 200, data: data }
    }
  },
  async createUser (data) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.post(`/api/admin/v1/users`, data)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.user)
      return { status: 200, data: data }
    }
  },
  async updateUser (data) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.put(`/api/admin/v1/users/${data.id}`, {
        mobile: data.mobile || ''
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.user)
      return { status: 200, data: data }
    }
  },
  async deleteUser (query) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.delete(`/api/admin/v1/users/${query.id}`)
      return res
    } else {
      return { status: 200 }
    }
  },
  async updatePwd (data) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.put(`/api/admin/v1/users/changepassword`, {
        old: data.old,
        new: data.new
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.user)
      return { status: 200, data: data }
    }
  },
  async resetPwd (data) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.put(`/api/admin/v1/users/${data.id}/resetpassword`, {
        password: data.password
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.user)
      return { status: 200, data: data }
    }
  }
}
