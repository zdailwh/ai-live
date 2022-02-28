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
  async getLogs (params) {
    if (process.env.NODE_ENV === 'production') {
      var opts = {}
      if (params && params.page_size) {
        opts.page_size = params.page_size
      }
      if (params && params.page_no) {
        opts.page_no = params.page_no - 1
      }
      if (params && params.user_id) {
        opts.userId = params.user_id
      }
      if (params && params.method_type) {
        opts.methodType = params.method_type
      }
      if (params && params.createTime) {
        opts.createTime = params.createTime
      }
      var res = await axios.get(`/api/admin/v1/action/logs`, {
        params: opts
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.logs)
      return { status: 200, data: data }
    }
  },

  async getDeviceInfo () {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.get(`/api/admin/v1/device/getinfo`)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.deviceinfo)
      return { status: 200, data: data }
    }
  },

  async deviceReboot (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.post(`/api/admin/v1/device/reboot`, {
        password: params.password
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.deviceinfo)
      return { status: 200, data: data }
    }
  },

  async getNetworks (params) {
    if (process.env.NODE_ENV === 'production') {
      var opts = {}
      if (params && params.page_size) {
        opts.page_size = params.page_size
      }
      if (params && params.page_no) {
        opts.page_no = params.page_no - 1
      }
      var res = await axios.get(`/api/admin/v1/device/network`, {
        params: opts
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.networks)
      return { status: 200, data: data }
    }
  },

  async editNetwork (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.put(`/api/admin/v1/device/network?name=${params.name}`, {
        BOOTPROTO: params.BOOTPROTO,
        IPADDR: params.IPADDR,
        GATEWAY: params.GATEWAY,
        NETMASK: params.NETMASK
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.network)
      return { status: 200, data: data }
    }
  },

  async getDeviceStorage () {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.get(`/api/admin/v1/device/storage`)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.devicestorage)
      return { status: 200, data: data }
    }
  },

  async editStorage (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.put(`/api/admin/v1/device/storage`, {
        space_limit: params.space_limit,
        space_enable: params.space_enable,
        days_limit: params.days_limit,
        days_enable: params.days_enable
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.devicestorage)
      return { status: 200, data: data }
    }
  },

  async addConfig (formdata) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.post(`/api/admin/v1/device/configure`, formdata)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.feature)
      return { status: 200, data: data }
    }
  }
}
