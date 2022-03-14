import axios from 'axios'

// const mock = (process.env.NODE_ENV === 'production') ? {} : require('./mock')
const mock = require('./mock')

function timeout (ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

export default {
  async login (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.post(`/login`, {
        username: params.username,
        password: params.password
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.loginRes)
      return { status: 200, data: data }
    }
  },

  async logout (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.get('/logout')
      return res
    } else {
      const data = await await timeout(200).then(() => mock.authentication)
      return { status: 200, data: data }
    }
  },

  async addGroup (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.post(`/api/admin/v1/label`, params)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.group)
      return { status: 200, data: data }
    }
  },

  async editGroup (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.put(`/api/admin/v1/label/${params.id}`, {
        faceIds: params.faceIds || []
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.group)
      return { status: 200, data: data }
    }
  },

  async delGroup (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.delete(`/api/admin/v1/label/${params.id}`)
      return res
    } else {
      return { status: 200 }
    }
  },

  async getGroups (params) {
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
      if (params && params.createTime) {
        opts.createTime = params.createTime
      }
      var res = await axios.get(`/api/admin/v1/label`, {
        params: opts
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.groups)
      return { status: 200, data: data }
    }
  },

  async addFace (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.post(`/api/admin/v1/face`, params)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.face)
      return { status: 200, data: data }
    }
  },

  async editFace (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.put(`/api/admin/v1/face/${params.id}`, {
        name: params.name || '',
        description: params.description || '',
        gender: params.gender || '',
        birthday: params.birthday || '',
        title: params.title || '',
        labelIds: params.labelIds
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.face)
      return { status: 200, data: data }
    }
  },

  async delFace (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.delete(`/api/admin/v1/face/${params.id}`)
      return res
    } else {
      return { status: 200 }
    }
  },

  async getFaces (params) {
    if (process.env.NODE_ENV === 'production') {
      var opts = {}
      if (params && params.page_size) {
        opts.page_size = params.page_size
      }
      if (params && params.page_no) {
        opts.page_no = params.page_no - 1
      }
      if (params && params.name) {
        opts.name = 'like_' + params.name
      }
      if (params && params.description) {
        opts.description = 'like_' + params.description
      }
      if (params && params.createTime) {
        opts.createTime = params.createTime
      }
      var res = await axios.get(`/api/admin/v1/face`, {
        params: opts
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.faces)
      return { status: 200, data: data }
    }
  },

  async getFace (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.get(`/api/admin/v1/face/${params.id}`)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.faces)
      return { status: 200, data: data }
    }
  },

  async getGroupFaces (params) {
    if (process.env.NODE_ENV === 'production') {
      var opts = {}
      if (params && params.page_size) {
        opts.page_size = params.page_size
      }
      if (params && params.page_no) {
        opts.page_no = params.page_no - 1
      }
      if (params && params.name) {
        opts.name = 'like_' + params.name
      }
      if (params && params.description) {
        opts.description = 'like_' + params.description
      }
      if (params && params.createTime) {
        opts.createTime = params.createTime
      }
      var res = await axios.get(`/api/admin/v1/label/faces/${params.groupId}`, {
        params: opts
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.faces)
      return { status: 200, data: data }
    }
  },

  async addFeature ({ faceId, formdata }) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.post(`/api/admin/v1/feature/${faceId}`, formdata)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.feature)
      return { status: 200, data: data }
    }
  },

  async getFeature ({ featureId }) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.get(`/api/admin/v1/feature/${featureId}`)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.feature)
      return { status: 200, data: data }
    }
  },

  async delFeature (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.delete(`/api/admin/v1/feature/${params.id}`)
      return res
    } else {
      return { status: 200 }
    }
  },

  // async getTasks (params) {
  //   if (process.env.NODE_ENV === 'production') {
  //     var opts = {}
  //     if (params && params.page_size) {
  //       opts.page_size = params.page_size
  //     }
  //     if (params && params.page_no) {
  //       opts.page_no = params.page_no - 1
  //     }
  //     if (params && params.name) {
  //       opts.name = 'like_' + params.name
  //     }
  //     if (params && params.passId) {
  //       opts.passId = params.passId
  //     }
  //     if (params && params.passName) {
  //       opts.passName = 'like_' + params.passName
  //     }
  //     if (params && params.user_id) {
  //       opts.userId = params.user_id
  //     }
  //     if (params && params.status !== '') {
  //       opts.status = params.status
  //     }
  //     if (params && params.createTime) {
  //       opts.createTime = params.createTime
  //     }
  //     var res = await axios.get(`/api/admin/v1/task`, {
  //       params: opts
  //     })
  //     return res
  //   } else {
  //     const data = await await timeout(200).then(() => mock.tasks)
  //     return { status: 200, data: data }
  //   }
  // },

  // async getAllTasks (params) {
  //   if (process.env.NODE_ENV === 'production') {
  //     var opts = {}
  //     if (params && params.page_size) {
  //       opts.page_size = params.page_size
  //     }
  //     if (params && params.page_no) {
  //       opts.page_no = params.page_no - 1
  //     }
  //     if (params && params.name) {
  //       opts.name = 'like_' + params.name
  //     }
  //     if (params && params.passId) {
  //       opts.passId = params.passId
  //     }
  //     if (params && params.passName) {
  //       opts.passName = 'like_' + params.passName
  //     }
  //     if (params && params.user_id) {
  //       opts.userId = params.user_id
  //     }
  //     if (params && params.status !== '') {
  //       opts.status = params.status
  //     }
  //     if (params && params.createTime) {
  //       opts.createTime = params.createTime
  //     }
  //     var res = await axios.get(`/api/admin/v1/getAllTask`, {
  //       params: opts
  //     })
  //     return res
  //   } else {
  //     const data = await await timeout(200).then(() => mock.tasks)
  //     return { status: 200, data: data }
  //   }
  // },

  // async getTasksById (params) {
  //   if (process.env.NODE_ENV === 'production') {
  //     var res = await axios.get(`/api/admin/v1/task/${params.id}`)
  //     return res
  //   } else {
  //     const data = await await timeout(200).then(() => mock.task)
  //     return { status: 200, data: data }
  //   }
  // },

  // async getTaskResults (params) {
  //   if (process.env.NODE_ENV === 'production') {
  //     var res = await axios.get(`/api/admin/v1/task/result/${params.id}?isFace=${params.isFace}`)
  //     return res
  //   } else {
  //     const data = await await timeout(200).then(() => mock.result)
  //     return { status: 200, data: { data: data, count: 1 } }
  //   }
  // },

  async getChannels (params) {
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
      var res = await axios.get(`/api/admin/v1/channel`)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.tasks)
      return { status: 200, data: data }
    }
  },

  async channelon (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.put(`/api/admin/v1/channel/${params.id}/channelon`)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.task)
      return { status: 200, data: data }
    }
  },

  async channeloff (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.put(`/api/admin/v1/channel/${params.id}/channeloff`)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.task)
      return { status: 200, data: data }
    }
  },

  async editChannel (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.put(`/api/admin/v1/channel/${params.id}`, {
        name: params.name || '',
        type: params.type || '',
        url: params.url || ''
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.face)
      return { status: 200, data: data }
    }
  },

  async getResults (params) {
    if (process.env.NODE_ENV === 'production') {
      var opts = {}
      if (params && params.page_size) {
        opts.page_size = params.page_size
      }
      if (params && params.page_no) {
        opts.page_no = params.page_no - 1
      }
      if (params && params.channelId) {
        opts.channelId = params.channelId
      }
      if (params && params.status !== '') {
        opts.status = params.status
      }
      if (params && params.createTime) {
        opts.createTime = params.createTime
      }
      var res = await axios.get(`/api/admin/v1/result`, {
        params: opts
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.tasks)
      return { status: 200, data: data }
    }
  },

  async getResultById (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.get(`/api/admin/v1/result/${params.id}/record`)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.task)
      return { status: 200, data: data }
    }
  },

  async getResultByTime (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.get(`/api/admin/v1/result/${params.id}/time`, {
        params: {
          timestamp: params.timestamp
        }
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.result)
      return { status: 200, data: { data: data, count: 1 } }
    }
  },

  async getResultByFace (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.get(`/api/admin/v1/result/${params.id}/face`, {
        params: {
          timestamp: params.timestamp
        }
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.result)
      return { status: 200, data: { data: data, count: 1 } }
    }
  },

  async channelJiankan (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.get(`/api/admin/v1/live/${params.id}`)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.result)
      return { status: 200, data: { data: data, count: 1 } }
    }
  }
}
