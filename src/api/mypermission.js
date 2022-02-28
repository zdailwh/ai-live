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
      if (params && params.name) {
        opts.name = params.name
      }
      var res = await axios.get(`/api/admin/v1/permissions`, {
        params: opts
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.permissions)
      return { status: 200, data: data }
    }
  },
  async getAllPermissions () {
    if (process.env.NODE_ENV === 'production') {
      var params = {}
      params.orderby = 'id'
      var res = await axios.get(`/api/admin/v1/permissions`, {
        params
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.permission)
      return { status: 200, data: data }
    }
  },
  async createPermission (data) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.post(`/api/admin/v1/permissions`, data)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.permission)
      return { status: 200, data: data }
    }
  },
  async updatePermission (data) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.put(`/api/admin/v1/permissions/${data.id}`, {
        name: data.name,
        info: data.info
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.permission)
      return { status: 200, data: data }
    }
  },
  async deletePermission (query) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.delete(`/api/admin/v1/permissions/${query.id}`)
      return res
    } else {
      return { status: 200 }
    }
  }
}
