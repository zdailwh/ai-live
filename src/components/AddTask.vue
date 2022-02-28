<template>
  <a-modal
    title="创建任务"
    width="800px"
    v-model="addVisible"
    @cancel="reset"
  >
    <div>
      <a-form-model ref="form" :model="addForm" :rules="ruleValidate">
        <a-form-model-item label="任务单名称" prop="batch" :label-col="{span:3}" :wrapper-col="{span:21}">
          <a-input v-model="addForm.batch" placeholder="任务单是一批相同条件的文件任务合集，如不填默认以当前时间命名" :disabled="!!(batch && batch.id)" />
        </a-form-model-item>
        <a-form-model-item label="上传视频" v-if="addForm.type === 1" :label-col="{span:3}" :wrapper-col="{span:21}" :help="`视频上载支持的文件类型有${enableFile.join('、')}`">
          <a-upload
            list-type="text"
            :show-upload-list="false"
            :multiple="true"
            :beforeUpload="beforeUpload"
            @change="uploadVideoChange"
          >
            <a-button> <a-icon type="upload" /> 选择视频文件 </a-button>
          </a-upload>
          <a-table :columns="filecolumns" :data-source="filterList" row-key="file.name" v-if="filterList.length" size="small" :pagination="false">
            <span slot="size" slot-scope="size">
              {{ size | change }}
            </span>
            <span slot="percentage" slot-scope="percentage">
              {{ percentage }}%
            </span>
            <span slot="percentageHash" slot-scope="percentageHash">
              {{ percentageHash }}%
            </span>
          </a-table>
        </a-form-model-item>
        <a-form-model-item label="直播流地址" prop="url" v-if="addForm.type !== 1" :label-col="{span:3}" :wrapper-col="{span:21}">
          <a-input v-model="addForm.url" :disabled="addForm.type === 1" />
        </a-form-model-item>
        <a-form-model-item label="模板" prop="mymode" :label-col="{span:3}" :wrapper-col="{span:21}">
          <a-select v-model="addForm.mymode" :allowClear="true" @change="handleChangeMode">
            <a-select-option :value="item.id" v-for="item in modesData" v-bind:key="item.id" :myitem="item">
              {{item.name}}
            </a-select-option>
            <a-select-option :value="0">默认</a-select-option>
          </a-select>
        </a-form-model-item>
        <template v-if="addForm.mymode !== ''">
          <!-- <a-form-model-item label="帧率" prop="frame_rate" :label-col="{span:3}" :wrapper-col="{span:21}" extra="扫描检测时每秒时长抽取的画面帧数">
            <a-select v-model="addForm.frame_rate" :disabled="true">
              <a-select-option :value="0">原始帧率</a-select-option>
              <a-select-option :value="5">5</a-select-option>
              <a-select-option :value="10">10</a-select-option>
              <a-select-option :value="15">15</a-select-option>
              <a-select-option :value="20">20</a-select-option>
              <a-select-option :value="25">25</a-select-option>
            </a-select>
          </a-form-model-item> -->
          <!-- <a-form-model-item label="动态帧率" prop="dynamic_rate" :label-col="{span:3}" :wrapper-col="{span:21}">
            <a-select v-model="addForm.dynamic_rate" :disabled="true" @change="handleChangeDynamicRate">
              <a-select-option :value="0">不启用</a-select-option>
              <a-select-option :value="5">5</a-select-option>
              <a-select-option :value="10">10</a-select-option>
              <a-select-option :value="15">15</a-select-option>
              <a-select-option :value="20">20</a-select-option>
              <a-select-option :value="25">25</a-select-option>
            </a-select>
          </a-form-model-item> -->
          <!-- <a-form-model-item label="优先级" prop="prority" :label-col="{span:3}" :wrapper-col="{span:21}" extra="数值越大，任务越先执行">
            <a-select v-model="addForm.prority" :disabled="true">
              <a-select-option :value="item" :key="k" v-for="(item, k) in 3">{{item}}</a-select-option>
            </a-select>
          </a-form-model-item> -->
          <!-- <a-form-model-item label="选择人像组" prop="groupId" :label-col="{span:3}" :wrapper-col="{span:21}">
            <a-transfer
              :data-source="groupsData"
              :filter-option="filterOption"
              :showSelectAll="false"
              :showSearch="true"
              :locale="{ itemUnit: '项', itemsUnit: '项', notFoundContent: '列表为空', searchPlaceholder: '请输入搜索内容' }"
              :titles="['人像组', '目标']"
              :target-keys="targetKeys"
              :selected-keys="selectedKeys"
              :list-style="{width: smallLayout?'100%':'200px', height: '260px'}"
              @change="handleChange"
              @selectChange="handleSelectChange">
              <template
                slot="children"
                slot-scope="{
                  props: { direction, filteredItems, selectedKeys, disabled: listDisabled },
                  on: { itemSelectAll, itemSelect },
                }"
              >
                <a-table
                  :row-selection="
                    getRowSelection({ disabled: listDisabled, selectedKeys, itemSelectAll, itemSelect })
                  "
                  :columns="direction === 'left' ? leftColumns : rightColumns"
                  :data-source="filteredItems"
                  :pagination="{ pageSize: 10 }"
                  size="small"
                  :style="{ pointerEvents: listDisabled ? 'none' : null }"
                  :custom-row="
                    ({ key, disabled: itemDisabled }) => ({
                      on: {
                        click: () => {
                          if (itemDisabled || listDisabled) return;
                          itemSelect(key, !selectedKeys.includes(key));
                        },
                      },
                    })
                  "
                  >
                  <template slot="title" slot-scope="item">
                    <a href="javascript:;">{{item.title}}</a>
                  </template>
                </a-table>
              </template>
            </a-transfer>
          </a-form-model-item> -->
        </template>
      </a-form-model>
    </div>
    <template slot="footer">
      <a-button key="back" @click="reset">
        取消
      </a-button>
      <a-button key="submit" type="primary" :loading="addLoading" @click="commit">
        创建
      </a-button>
    </template>
  </a-modal>
</template>

<script>
// import difference from 'lodash/difference'
import api from '../api'
import bigimg from '@/assets/big.png'

var moment = require('moment')
const SIZE = 32 * 1024 * 1024 // 切片大小
export default {
  props: [ 'tag', 'datalist', 'currBatch', 'addVisible', 'facesData', 'modesData', 'groupsData', 'targetKeys', 'selectedKeys', 'smallLayout' ],
  watch: {
    addVisible (newVal, oldVal) {
      if (newVal) {
        var token = this.$store.state.authentication.token
        if (token) {
          var userObj = JSON.parse(token)
          if (userObj.mode && userObj.mode.id) {
            this.addForm.mymode = userObj.mode.id
            this.addForm.frame_rate = userObj.mode.frameRate
            // this.addForm.dynamic_rate = userObj.mode.dynamic_rate
            this.addForm.prority = userObj.mode.prority
            // this.addForm.groupId = userObj.mode.groupIds
            // this.updateParentData('targetKeys', userObj.mode.groupIds.split(','))
          } else {
            this.addForm.mymode = 0
            this.addForm.frame_rate = 5
            this.addForm.prority = 1
            // this.addForm.groupId = ''
            // this.updateParentData('targetKeys', ['0'])
          }
        } else {
          this.addForm.mymode = 0
          this.addForm.frame_rate = 5
          this.addForm.prority = 1
          // this.addForm.groupId = ''
          // this.updateParentData('targetKeys', ['0'])
        }
      }
    },
    currBatch (newVal, oldVal) {
      this.addForm.batch = newVal.name
      // this.addForm.mymode = newVal.mode_id ? newVal.mode_id : 0
      // if (this.addForm.mymode) {
      //   this.modesData.map(item => {
      //     if (item.id === this.addForm.mymode) {
      //       this.addForm.frame_rate = item.frame_rate
      //       // this.addForm.dynamic_rate = item.dynamic_rate
      //       this.addForm.prority = item.prority
      //       this.addForm.groupId = item.group_ids
      //       this.updateParentData('targetKeys', item.group_ids.split(','))
      //     }
      //   })
      // } else {
      //   this.addForm.frame_rate = 5
      //   this.addForm.prority = 1
      //   this.addForm.groupId = ''
      //   this.updateParentData('targetKeys', ['0'])
      // }
    }
  },
  computed: {
    batch: {
      get () {
        return this.currBatch
      },
      set (val) {
        this.updateParentData('batchItem', val)
      }
    }
  },
  filters: {
    change (limit) {
      var size = ''
      if (limit < 0.1 * 1024) { // 小于0.1KB，则转化成B
        size = limit.toFixed(2) + 'B'
      } else if (limit < 0.1 * 1024 * 1024) { // 小于0.1MB，则转化成KB
        size = (limit / 1024).toFixed(2) + 'KB'
      } else if (limit < 0.1 * 1024 * 1024 * 1024) { // 小于0.1GB，则转化成MB
        size = (limit / (1024 * 1024)).toFixed(2) + 'MB'
      } else { // 其他转化成GB
        size = (limit / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
      }
      var sizeStr = size + '' // 转成字符串
      var index = sizeStr.indexOf('.') // 获取小数点处的索引
      var dou = sizeStr.substr(index + 1, 2) // 获取小数点后两位的值
      if (dou === '00') { // 判断后两位是否为00，如果是则删除00
        return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2)
      }
      return size
    }
  },
  data () {
    return {
      leftColumns: leftTableColumns,
      rightColumns: rightTableColumns,
      addLoading: false,
      addForm: {
        batch: '',
        type: 1,
        url: '',
        mymode: 0,
        frame_rate: 5,
        // dynamic_rate: 0,
        prority: 1,
        // groupId: '',
        files: []
      },
      newBatch: {},
      ruleValidate: {
        type: [
          { required: true, type: 'number', message: '任务类型不能为空', trigger: 'change' }
        ],
        mymode: [
          { required: true, type: 'number', message: '模板不能为空', trigger: 'change' }
        ],
        frame_rate: [
          { required: true, type: 'number', message: '帧率不能为空', trigger: 'change' }
        ],
        // dynamic_rate: [
        //   { required: true, type: 'number', message: '动态帧率不能为空', trigger: 'change' }
        // ],
        prority: [
          { required: true, type: 'number', message: '优先级不能为空', trigger: 'change' }
        ]
      },
      typeArr: [
        { value: 1, text: '文件' },
        { value: 2, text: '实时直播流' }
      ],
      // targetGroupIds: [],
      // 上传视频相关 ----------------------------------------------
      filecolumns,
      container: {
        file: null,
        hash: '',
        worker: null
      },
      enableFile: ['TS', 'MXF', 'MP4', 'MPG', 'MOV', 'AVI', 'MPEG', 'M2TS', 'WMV', 'FLV', 'RMVB', 'M4V'],
      uploadCompleted: true, // 当前页文件是否已经全部上传
      list: [],
      filterList: [],
      requestList: []
    }
  },
  methods: {
    handleChangeMode (val, opt) {
      if (val) {
        var selMode = opt.data.attrs.myitem
        this.addForm.frame_rate = selMode.frame_rate
        // this.addForm.dynamic_rate = selMode.dynamic_rate
        this.addForm.prority = selMode.prority
        // this.addForm.groupId = selMode.group_ids
        // this.updateParentData('targetKeys', selMode.group_ids.split(','))
      } else {
        this.addForm.frame_rate = 5
        // this.addForm.dynamic_rate = 0
        this.addForm.prority = 1
        // this.addForm.groupId = ''
        // this.updateParentData('targetKeys', ['0'])
      }
    },
    // handleChangeFrameRate (val) {
    //   if (val !== 0) {
    //     this.addForm.dynamic_rate = 0
    //   }
    // },
    // handleChangeDynamicRate (val) {
    //   if (val !== 0) {
    //     this.addForm.frame_rate = 0
    //   }
    // },
    commit () {
      console.log(this.filterList)
      if (!this.filterList.length) {
        this.$message.error('请选择视频文件！')
        return
      }
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          if (this.currBatch && this.currBatch.id) {
            this.updateParentData('addVisible', false) // 创建窗口消失
            this.createNotification(this.filterList) // 显示进度浮窗
            await this.createTasks(this.filterList, 0)
          } else {
            if (!this.addForm.batch) {
              var _this = this
              this.$confirm({
                title: '任务单是一批相同条件的文件任务合集，如不填默认以当前时间命名，确定提交？',
                okText: '确认',
                cancelText: '取消',
                onOk () {
                  api.addBatch({name: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), mode_id: _this.addForm.mymode}).then(async res => {
                    if (res.data.code === 0) {
                      _this.newBatch = res.data.data
                      _this.updateParentData('addVisible', false) // 创建窗口消失
                      _this.createNotification(_this.filterList) // 显示进度浮窗
                      await _this.createTasks(_this.filterList, 0)
                    } else {
                      _this.$message.error(res.data.message || '请求出错！')
                    }
                  })
                },
                onCancel () {}
              })
            } else {
              api.addBatch({name: this.addForm.batch, mode_id: this.addForm.mymode}).then(async res => {
                if (res.data.code === 0) {
                  this.newBatch = res.data.data
                  this.updateParentData('addVisible', false) // 创建窗口消失
                  this.createNotification(this.filterList) // 显示进度浮窗
                  await this.createTasks(this.filterList, 0)
                } else {
                  this.$message.error(res.data.message || '请求出错！')
                }
              })
            }
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    createNotification (list) {
      if (!document.querySelector('#smallNotify')) {
        var mydiv = document.createElement('div')
        mydiv.setAttribute('class', 'smallNotify')
        mydiv.setAttribute('id', 'smallNotify')
        var icon = document.createElement('img')
        icon.setAttribute('src', bigimg)
        mydiv.append(icon)
        var p = document.createElement('p')
        p.innerHTML = '上传进度'
        mydiv.append(p)
        document.body.append(mydiv)
      }
      var _this = this
      this.$notification.open({
        message: `上传进度`,
        key: 'uploadProgress',
        duration: 0,
        placement: 'bottomRight',
        description: (h) => {
          var pers = list.map(item => {
            var totalPercent = parseInt((item.percentageHash + item.percentage) / 2)
            if (totalPercent < 100) {
              return h('div', null, [
                h('div', null, [h('p', { style: { color: '#1890ff' } }, item.file.name)]),
                // h('div', { style: { display: 'flex' } }, [
                //   h('p', { style: { width: '90px', color: '#999' } }, 'hash进度'),
                //   h('a-progress', { props: { size: 'small', status: 'active', percent: item.percentageHash } })
                // ]),
                h('div', { style: { display: 'flex' } }, [
                  h('p', { style: { width: '90px', color: '#999' } }, '上传进度'),
                  h('a-progress', { props: { size: 'small', status: 'active', percent: totalPercent } }) // 把hash进度和上传进度放在一个进度条里
                ])
              ])
            } else {
              return h('div', null, [
                h('div', null, [h('p', { style: { color: '#1890ff' } }, item.file.name)]),
                // h('div', { style: { display: 'flex' } }, [
                //   h('p', { style: { width: '90px', color: '#999' } }, 'hash进度'),
                //   h('a-progress', { props: { size: 'small', status: 'active', percent: item.percentageHash } })
                // ]),
                h('div', { style: { display: 'flex' } }, [
                  h('p', { style: { width: '90px', color: '#999' } }, '上传进度'),
                  h('a-progress', { props: { size: 'small', status: 'success', percent: 100 } }) // 把hash进度和上传进度放在一个进度条里
                ])
              ])
            }
          })
          return h('div', null, pers)
        },
        closeIcon: (h) => {
          return h('a-icon', { props: { type: 'minus' } })
        },
        onClose () {
          document.querySelector('#smallNotify').style.display = 'block'
          document.querySelector('#smallNotify').addEventListener('click', function () {
            document.querySelector('#smallNotify').style.display = 'none'
            _this.createNotification(_this.filterList)
          })
          return false
        }
      })
    },
    reset () {
      // this.addVisible = false
      this.$refs.form.resetFields()
      this.filterList = []
      this.updateParentData('addVisible', false)
    },
    beforeUpload (file, fileList) {
      var ext = file.name.substring(file.name.lastIndexOf('.') + 1)
      const isAvailable = this.enableFile.indexOf(ext.toUpperCase()) >= 0
      if (!isAvailable) {
        this.$message.error(`视频上载支持的文件类型有${this.enableFile.join('、')}`)
      }
      return false
    },
    uploadVideoChange ({ fileList }) {
      this.addForm.files = fileList
      this.filterList = []
      for (var i = 0; i < fileList.length; i++) {
        var file = fileList[i]

        var ext = file.name.substring(file.name.lastIndexOf('.') + 1)
        if (this.enableFile.includes(ext) || this.enableFile.includes(ext.toUpperCase()) || this.enableFile.includes(ext.toLowerCase())) {
          this.filterList.push({ file: file.originFileObj, ext: ext, percentage: 0, percentageHash: 0, createRes: '' })
        }
      }
    },
    // filterOption (inputValue, option) {
    //   return option.title.indexOf(inputValue) > -1
    // },
    // getRowSelection ({ disabled, selectedKeys, itemSelectAll, itemSelect }) {
    //   return {
    //     getCheckboxProps: item => ({ props: { disabled: disabled || item.disabled } }),
    //     onSelectAll (selected, selectedRows) {
    //       const treeSelectedKeys = selectedRows
    //         .filter(item => !item.disabled)
    //         .map(({ key }) => key)
    //       const diffKeys = selected
    //         ? difference(treeSelectedKeys, selectedKeys)
    //         : difference(selectedKeys, treeSelectedKeys)
    //       itemSelectAll(diffKeys, selected)
    //     },
    //     onSelect ({ key }, selected) {
    //       itemSelect(key, selected)
    //     },
    //     selectedRowKeys: selectedKeys
    //   }
    // },
    // handleChange (nextTargetKeys, direction, moveKeys) {
    //   // this.targetKeys = nextTargetKeys
    //   this.updateParentData('targetKeys', nextTargetKeys)
    //   this.targetGroupIds = nextTargetKeys

    //   // console.log('targetKeys: ', nextTargetKeys)
    //   // console.log('direction: ', direction)
    //   // console.log('moveKeys: ', moveKeys)
    // },
    // handleSelectChange (sourceSelectedKeys, targetSelectedKeys) {
    //   // this.selectedKeys = [...sourceSelectedKeys, ...targetSelectedKeys]
    //   this.updateParentData('selectedKeys', [...sourceSelectedKeys, ...targetSelectedKeys])

    //   // console.log('sourceSelectedKeys: ', sourceSelectedKeys)
    //   // console.log('targetSelectedKeys: ', targetSelectedKeys)
    // },
    updateParentData (key, val) {
      this.$emit('updateData', { key: key, val: val })
    },
    // 上传视频相关 ------------------------------------------------------------------------------------->
    handleCloseTag (removedTag) {
      const tags = this.enableFile.filter(tag => tag !== removedTag)
      this.enableFile = tags
    },
    resetFilelist () {
      this.list = []
      this.filterList = []
      // this.$refs.multipleTable.clearSelection()
      // this.extsArr = []
      // this.checkedExts = []
    },
    async createTasks (filelist, startIdx) {
      this.uploadCompleted = false

      const listItem = filelist[startIdx]
      const fileChunkList = await this.createFileChunk(listItem.file)
      filelist[startIdx].fileChunkList = fileChunkList
      console.log(startIdx + '切片个数：' + fileChunkList.length)
      filelist[startIdx].hash = await this.calculateHash(fileChunkList, filelist, startIdx)
      filelist[startIdx].guid = filelist[startIdx].hash + '_' + new Date().getTime()
      console.log(startIdx + 'hash：' + filelist[startIdx].hash)
      await this.createTask(listItem, startIdx).then(async (response) => {
        console.log('创建任务返回' + startIdx + '/' + response.data.id)
        filelist[startIdx].taskid = response.data.id

        this.uploadFiles(filelist, startIdx)
      }).catch((error) => {
        filelist[startIdx].createRes = (error.response && error.response.data) || '任务创建执行失败'
      })

      if (startIdx < filelist.length - 1) {
        await this.createTasks(filelist, startIdx + 1)
      } else {
        this.uploadCompleted = true
      }
    },
    async createTask (fileItem, idx) {
      var md5 = fileItem.hash
      var params = {
        type: this.addForm.type,
        frame_rate: this.addForm.frame_rate,
        // dynamic_rate: this.addForm.dynamic_rate,
        prority: this.addForm.prority,
        // group_ids: this.addForm.groupId !== '' ? this.addForm.groupId : this.targetGroupIds.join(','),
        batch_id: this.currBatch.id || this.newBatch.id,
        filename: fileItem.file.name,
        md5: md5,
        ext: fileItem.ext
      }
      return new Promise((resolve, reject) => {
        api.addTask(params).then(res => {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            reject(res.data.message || '请求出错！')
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    async uploadFiles (filelist, startIdx) {
      console.log('开始上传文件' + startIdx)
      const listItem = filelist[startIdx]
      const fileChunkList = listItem.fileChunkList

      var requestList = []

      this.chunkData = fileChunkList.map(({ file }, index) => ({
        taskid: listItem.taskid,
        fileHash: listItem.hash,
        guid: listItem.guid,
        index,
        hash: listItem.hash + '-' + index,
        chunk: file,
        size: file.size,
        percentage: 0
      }))

      requestList = await this.uploadChunks(filelist, startIdx, this.chunkData)
      await Promise.all(requestList).then(async (result) => {
        console.log('上传分片结果')
        console.log(result)
        var errRes = result.filter(item => {
          return JSON.parse(item.data).code !== 0
        })
        if (errRes.length) {
          this.$message.error(JSON.parse(errRes[0].data).message)
        } else {
          // 合并切片
          await this.mergeRequest(listItem)
        }
      }).catch((error) => {
        console.log('分片上传接口调用出错')
        console.log(error)
      })
    },
    // 上传切片，同时过滤已上传的切片
    async uploadChunks (filelist, startIdx, chunkData, uploadedList = []) {
      const requestList = chunkData
        .filter(({ hash }) => !uploadedList.includes(hash))
        .map(({ taskid, fileHash, chunk, hash, index, size, guid }) => {
          const formData = new FormData()
          formData.append('taskid', taskid)
          formData.append('chunk', index)
          formData.append('guid', guid)
          formData.append('chunkTotal', chunkData.length)
          formData.append('file', chunk)
          return { formData, index }
        })
        .map(async ({ formData, index }) =>
          this.myRequest({
            url: '/api/admin/v1/task/chunks',
            method: 'post',
            data: formData,
            onProgress: this.createProgressHandler(chunkData[index], filelist, startIdx, chunkData),
            requestList: this.requestList
          })
        )
      return requestList
    },
    // xhr
    myRequest ({ url, method, data, headers = {}, onProgress = e => e, requestList }) {
      return new Promise(resolve => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = onProgress
        xhr.open(method, url)
        Object.keys(headers).forEach(key =>
          xhr.setRequestHeader(key, headers[key])
        )
        xhr.send(data)
        xhr.onload = e => {
          // 将请求成功的 xhr 从列表中删除
          if (requestList) {
            const xhrIndex = requestList.findIndex(item => item === xhr)
            requestList.splice(xhrIndex, 1)
          }
          resolve({
            data: e.target.response
          })
        }
        // 暴露当前 xhr 给外部
        // requestList?.push(xhr)
      })
    },
    // 通知服务端合并切片
    async mergeRequest (item) {
      api.taskMergeFile({ taskid: item.taskid, guid: item.guid, fileName: item.file.name }).then(res => {
        if (res.data.code === 0) {
          item.percentage = 100
          // 合并成功后 将上传进度 从99 置为100
          var notFinish = this.filterList.filter(it => {
            return it.percentage !== 100
          })
          if (!notFinish.length) {
            // 全部文件上传成功 5s后关闭上传进度小窗口
            this.reset()
            var _this = this
            window.setTimeout(function () {
              _this.$notification.close('uploadProgress')
            }, 5000)
          }
          this.$message.success('合并成功！')
        } else {
          this.$message.error(res.data.message || '合并出错！')
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        } else {
          if (error.response && error.response.data) {
            this.$message.error(error.response.data.message || '文件合并出错！')
          } else {
            this.$message.error('合并-接口调用失败！' + JSON.stringify(error))
          }
        }
      })
    },
    // 用闭包保存每个 chunk 的进度数据
    createProgressHandler (item, filelist, startIdx, chunkData) {
      return e => {
        item.percentage = parseInt(String((e.loaded / e.total) * 99))

        const loaded = chunkData
          .map(item => item.size * item.percentage)
          .reduce((acc, cur) => acc + cur)
        const per = parseInt((loaded / filelist[startIdx].file.size).toFixed(2))
        filelist[startIdx].percentage = per > 99 ? 99 : per
      }
    },
    // 生成文件切片
    async createFileChunk (file, size = SIZE) {
      const fileChunkList = []
      let cur = 0
      while (cur < file.size) {
        fileChunkList.push({ file: file.slice(cur, cur + size) })
        cur += size
      }
      return fileChunkList
    },
    // 生成文件 hash（web-worker）
    calculateHash (fileChunkList, filelist, startIdx) {
      console.log('开始计算hash' + startIdx)
      return new Promise(resolve => {
        this.container.worker = new Worker('/static/hash.js')
        this.container.worker.postMessage({ fileChunkList })
        this.container.worker.onmessage = e => {
          const { percentage, hash } = e.data
          filelist[startIdx].percentageHash = parseInt(percentage)
          if (hash) {
            resolve(hash)
          }
        }
      })
    }
  }
}

const filecolumns = [
  {
    title: '文件名',
    dataIndex: 'file.name',
    key: 'name',
    width: '150px',
    ellipsis: true
  },
  {
    title: '大小',
    dataIndex: 'file.size',
    key: 'size',
    scopedSlots: { customRender: 'size' }
  },
  {
    title: '类型',
    key: 'ext',
    dataIndex: 'ext'
  },
  {
    title: '文件路径',
    dataIndex: 'file.path',
    key: 'path',
    width: '150px',
    ellipsis: true
  },
  {
    title: 'hash进度',
    dataIndex: 'percentageHash',
    key: 'percentageHash',
    scopedSlots: { customRender: 'percentageHash' }
  },
  {
    title: '上传进度',
    key: 'percentage',
    dataIndex: 'percentage',
    scopedSlots: { customRender: 'percentage' }
  }
]

const leftTableColumns = [
  {
    dataIndex: 'title',
    title: '名称',
    scopedSlots: { customRender: 'name' }
  }
]
const rightTableColumns = [
  {
    dataIndex: 'title',
    title: '名称',
    scopedSlots: { customRender: 'name' }
  }
]
</script>

<style scoped>
</style>
