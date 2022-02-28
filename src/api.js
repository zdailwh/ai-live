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

  async addTask (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.post(`/api/admin/v1/task`, params)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.createTask)
      return { status: 200, data: data }
    }
  },

  async taskMergeFile (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.post(`/api/admin/v1/task/merge`, params)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.task)
      return { status: 200, data: data }
    }
  },

  // async editTask (params) {
  //   if (process.env.NODE_ENV === 'production') {
  //     var res = await axios.put(`/api/admin/v1/task/${params.id}`, params)
  //     return res
  //   } else {
  //     const data = await await timeout(200).then(() => mock.task)
  //     return { status: 200, data: data }
  //   }
  // },

  async delTask (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.delete(`/api/admin/v1/task/${params.id}`)
      return res
    } else {
      return { status: 200 }
    }
  },

  async getTasks (params) {
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
      if (params && params.batchId) {
        opts.batchId = params.batchId
      }
      if (params && params.batchName) {
        opts.batchName = 'like_' + params.batchName
      }
      if (params && params.user_id) {
        opts.userId = params.user_id
      }
      if (params && params.status !== '') {
        opts.status = params.status
      }
      if (params && params.createTime) {
        opts.createTime = params.createTime
      }
      var res = await axios.get(`/api/admin/v1/task`, {
        params: opts
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.tasks)
      return { status: 200, data: data }
    }
  },

  async getAllTasks (params) {
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
      if (params && params.batchId) {
        opts.batchId = params.batchId
      }
      if (params && params.batchName) {
        opts.batchName = 'like_' + params.batchName
      }
      if (params && params.user_id) {
        opts.userId = params.user_id
      }
      if (params && params.status !== '') {
        opts.status = params.status
      }
      if (params && params.createTime) {
        opts.createTime = params.createTime
      }
      var res = await axios.get(`/api/admin/v1/getAllTask`, {
        params: opts
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.tasks)
      return { status: 200, data: data }
    }
  },

  async getMyTasks (params) {
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
      if (params && params.batchId) {
        opts.batchId = params.batchId
      }
      if (params && params.batchName) {
        opts.batchName = 'like_' + params.batchName
      }
      if (params && params.user_id) {
        opts.userId = params.user_id
      }
      if (params && params.status !== '') {
        opts.status = params.status
      }
      if (params && params.createTime) {
        opts.createTime = params.createTime
      }
      var res = await axios.get(`/api/admin/v1/getMyTask`, {
        params: opts
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.tasks)
      return { status: 200, data: data }
    }
  },

  async getTasksById (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.get(`/api/admin/v1/task/${params.id}`)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.task)
      return { status: 200, data: data }
    }
  },

  async taskPause (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.put(`/api/admin/v1/task/pause/${params.id}`)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.task)
      return { status: 200, data: data }
    }
  },

  async taskResume (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.put(`/api/admin/v1/task/resume/${params.id}`)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.task)
      return { status: 200, data: data }
    }
  },

  async taskReset (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.put(`/api/admin/v1/task/reset/${params.id}`)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.task)
      return { status: 200, data: data }
    }
  },

  async getTaskResults (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.get(`/api/admin/v1/task/result/${params.id}?isFace=${params.isFace}`)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.result)
      return { status: 200, data: { data: data, count: 1 } }
    }
  },

  async addBatch (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.post(`/api/face/v1/batch`, params)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.createBatch)
      return { status: 200, data: data }
    }
  },

  async getBatchs (params) {
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
      if (params && params.id) {
        opts.id = params.id
      }
      if (params && params.createTime) {
        opts.createTime = params.createTime
      }
      var res = await axios.get(`/api/face/v1/batch`, {
        params: opts
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.batchs)
      return { status: 200, data: data }
    }
  },

  async addTemp (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.post(`/api/face/v1/mode`, params)
      return res
    } else {
      const data = await await timeout(200).then(() => mock.temp)
      return { status: 200, data: data }
    }
  },

  async editTemp (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.put(`/api/face/v1/mode/${params.id}`, {
        name: params.name,
        frame_rate: params.frame_rate,
        // dynamic_rate: params.dynamic_rate,
        prority: params.prority
        // group_ids: params.group_ids
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.temp)
      return { status: 200, data: data }
    }
  },

  async delTemp (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.delete(`/api/face/v1/mode/${params.id}`)
      return res
    } else {
      return { status: 200 }
    }
  },

  async getTemps (params) {
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
      if (params && params.user_id) {
        opts.userId = params.user_id
      }
      if (params && params.createTime) {
        opts.createTime = params.createTime
      }
      var res = await axios.get(`/api/face/v1/mode`, {
        params: opts
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.temps)
      return { status: 200, data: data }
    }
  },

  async tempAssign (params) {
    if (process.env.NODE_ENV === 'production') {
      var res = await axios.put(`/api/face/v1/modeAssigned`, {
        mode_id: params.mode_id,
        user_id: params.user_id
      })
      return res
    } else {
      const data = await await timeout(200).then(() => mock.temp)
      return { status: 200, data: data }
    }
  }
}
