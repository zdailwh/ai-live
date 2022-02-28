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
      if (params && params.createTime) {
        opts.createTime = params.createTime
      }
      if (params && params.userId) {
        opts.userId = params.userId
      }
      if (params && params.roleId) {
        opts.roleId = params.roleId
      }
      var res = await axios.get(`/api/admin/v1/userroles`, {
        params: opts
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.roleusers)
      return { status: 200, data: data }
    }
  },
  async createRoleUser (data) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.post(`/api/admin/v1/userroles`, data)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.roleuser)
      return { status: 200, data: data }
    }
  },
  async updateRoleUser (data) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.put(`/api/admin/v1/userroles/${data.id}`, {
        roleId: data.roleId
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.roleuser)
      return { status: 200, data: data }
    }
  },
  async deleteRoleUser (query) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.delete(`/api/admin/v1/userroles/${query.id}`)
      return res
    } else {
      return { status: 200 }
    }
  }
}
