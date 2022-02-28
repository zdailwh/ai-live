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
      var res = await axios.get(`/api/admin/v1/roles`, {
        params: opts
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.roles)
      return { status: 200, data: data }
    }
  },
  async getAllRoles (params) {
    if (process.env.NODE_ENV === 'production') {
      var opts = {}
      opts.orderby = 'id'
      if (params && params.name) {
        opts.name = params.name
      }
      var res = await axios.get(`/api/admin/v1/roles`, {
        params: opts
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.roles)
      return { status: 200, data: data }
    }
  },
  async createRole (data) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.post(`/api/admin/v1/roles`, data)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.role)
      return { status: 200, data: data }
    }
  },
  async updateRole (data) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.put(`/api/admin/v1/roles/${data.id}`, {
        name: data.name,
        level: data.level,
        description: data.description
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.role)
      return { status: 200, data: data }
    }
  },
  async deleteRole (query) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.delete(`/api/admin/v1/roles/${query.id}`)
      return res
    } else {
      return { status: 200 }
    }
  }
}
