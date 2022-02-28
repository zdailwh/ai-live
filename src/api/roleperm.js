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
      if (params && params.permissionId) {
        opts.permissionId = params.permissionId
      }
      if (params && params.roleId) {
        opts.roleId = params.roleId
      }
      var res = await axios.get(`/api/admin/v1/rolepermissions`, {
        params: opts
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.roleperms)
      return { status: 200, data: data }
    }
  },
  async createRolePerm (data) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.post(`/api/admin/v1/rolepermissions`, data)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.roleperm)
      return { status: 200, data: data }
    }
  },
  async updateRolePerm (data) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.put(`/api/admin/v1/rolepermissions`, data)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.roleperm)
      return { status: 200, data: data }
    }
  },
  async deleteRolePerm (query) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.delete(`/api/admin/v1/rolepermissions/${query.id}`)
      return res
    } else {
      return { status: 200 }
    }
  },
  async createRoleMenu (data) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.post(`/api/admin/v1/addMenu`, data)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.roleperm)
      return { status: 200, data: data }
    }
  },
  async updateRoleMenu (data) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.put(`/api/admin/v1/updateMenu`, data)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.roleperm)
      return { status: 200, data: data }
    }
  },
  async getRoleMenus (data) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.get(`/api/admin/v1/menu`)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.roleperm)
      return { status: 200, data: data }
    }
  }
}
