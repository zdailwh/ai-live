<template>
  <div class="faceContainer">
    <!--搜索-->
    <div class="searchWrap" :style="smallLayout? 'flex-direction: column;': ''">
      <a-form-model ref="searchForm" :model="searchForm" layout="inline">
        <!-- <a-form-model-item label="任务单" prop="batchId">
          <a-select v-model="searchForm.batchId" :dropdownMatchSelectWidth="false" style="width: 120px;">
            <a-select-option value="">全部</a-select-option>
            <a-select-option :value="val.id" v-for="(val,key) in batchsDatalist" v-bind:key="key">
              {{val.name}}
            </a-select-option>
          </a-select>
        </a-form-model-item> -->
        <a-form-model-item label="任务单" prop="batchName">
          <a-input v-model="searchForm.batchName" style="width: 120px;" />
        </a-form-model-item>
        <a-form-model-item label="状态" prop="status">
          <a-select v-model="searchForm.status" :dropdownMatchSelectWidth="false" style="width: 120px;">
            <a-select-option value="">全部</a-select-option>
            <a-select-option :value="val.value" v-for="(val,key) in statusArr" v-bind:key="key">
              {{val.label}}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="任务名称" prop="name">
          <a-input v-model="searchForm.name" style="width: 120px;" />
        </a-form-model-item>
        <a-form-model-item label="用户" prop="user_id" v-if="currUser.level !== '' && currUser.level > 3">
          <a-select v-model="searchForm.user_id" :dropdownMatchSelectWidth="false" show-search :filter-option="filterOption" style="width: 100px;">
            <a-select-option value="">全部</a-select-option>
            <a-select-option :value="item.id" v-for="item in usersData" v-bind:key="item.id">
              {{item.username}}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="创建时间" prop="createTime" format="YYYY-MM-DD" valueFormat="YYYY-MM-DD">
          <a-range-picker :locale="locale" v-model="searchForm.createTime" style="width: 220px;" />
        </a-form-model-item>
        <a-form-model-item>
          <a-button type="primary" @click="searchHandleOk"><a-icon key="search" type="search"/>搜索</a-button>
          <a-button style="margin-left: 10px;" @click="searchHandleReset('searchForm')">重置</a-button>
          <a-button style="margin-left: 10px;" type="primary" @click="addVisible = true;batchItem = {};targetKeys = ['0']"><a-icon key="plus" type="plus"/>新建任务</a-button>
        </a-form-model-item>
      </a-form-model>
    </div>
    <!--搜索 end-->
    <div class="tableWrap">
      <a-table :columns="columns" :data-source="datalist" :scroll="{ x: true, y: tableHeight }" size="middle" rowKey="id" :pagination="false">
        <span slot="batch_name" slot-scope="batch_name, record">
          <a href="javascript:;" @click="searchForm.batchName = batch_name; searchHandleOk()">{{batch_name}}</a>
        </span>
        <!-- <span slot="groups" slot-scope="groups">
          <template v-if="groups.length">
            <a-popover title="包含人像" trigger="click" arrow-point-at-center>
              <template slot="content">
                <template v-if="facesAboutGroup">
                  <p v-for="(it, k) in facesAboutGroup" :key="k">{{it.name}}</p>
                </template>
              </template>
              <p v-for="(item, key) in groups" :key="key"><a href="javascript:;" @click="getFacesByGroup(item.id)">{{item.name}}</a></p>
            </a-popover>
          </template>
          <template v-else>全部人像</template>
        </span>
        <span slot="frame_rate" slot-scope="frame_rate">
          {{frame_rate === 0 ? '源帧率' : frame_rate}}
        </span> -->
        <span slot="statusStr" slot-scope="statusStr, record">
          {{record.statusStr}}<br>
          <template v-if="record.status === 5">
            <a-tag v-if="record.resultstatus === 1" color="#f50">发现敏感人物</a-tag>
            <a-tag v-if="record.resultstatus === 0" color="#87d068">审核通过</a-tag>
          </template>
          <template v-else><a-progress :percent="(record.processTime / record.duration * 100).toFixed(2)" /></template>
        </span>
        <span slot="duration" slot-scope="duration">
          {{duration | formateSeconds}}
        </span>
        <span slot="create_time" slot-scope="create_time">
          {{create_time | dateFormat}}
        </span>
        <span slot="process" slot-scope="process, record">
          <template v-if="record.status === 5"><a-progress :percent="100" /></template>
          <template v-else><a-progress :percent="(record.processTime / record.duration * 100).toFixed(2)" /></template>
        </span>
        <span slot="action" slot-scope="record, index, idx">
          <!-- <a @click="toEdit(record, idx, 'edit')">编辑</a>
          <a-divider type="vertical" /> -->
          <template v-if="record.status === 1 || record.status === 2 || record.status === 3">
            <a-popconfirm
              title="确定要删除该任务吗?"
              ok-text="删除"
              cancel-text="取消"
              @confirm="delTask(record, idx)"
            >
              <a>删除</a>
            </a-popconfirm>
            <a-divider type="vertical" />
          </template>
          <template v-if="record.status === 3 || record.status === 4">
            <a-popconfirm
              title="确定要取消该任务吗?"
              ok-text="取消"
              cancel-text="取消"
              @confirm="pause(record, idx)"
            >
              <a>取消</a>
            </a-popconfirm>
            <a-divider type="vertical" />
          </template>
          <template v-if="record.status === 1">
            <a-popconfirm
              title="确定要恢复该任务吗?"
              ok-text="恢复"
              cancel-text="取消"
              @confirm="resume(record, idx)"
            >
              <a>恢复</a>
            </a-popconfirm>
            <a-divider type="vertical" />
          </template>
          <template v-if="record.status === 5 || record.status === 6">
            <a-popconfirm
              title="确定要重置该任务吗?"
              ok-text="重置"
              cancel-text="取消"
              @confirm="reset(record, idx)"
            >
              <a>重置</a>
            </a-popconfirm>
            <a-divider type="vertical" />
          </template>
          <router-link v-if="record.status === 5" :to="'/taskResult/' + record.id">查看任务结果<a-icon type="right" /></router-link>
        </span>
      </a-table>
      <div class="mypagination">
        <a-pagination
          v-model="page_no"
          :page-size-options="pageSizeOptions"
          :total="dataTotal"
          :show-total="total => `共 ${total} 条`"
          show-size-changer
          :page-size="page_size"
          @showSizeChange="onShowSizeChange"
          @change="onPageChange"
        >
          <template slot="buildOptionText" slot-scope="props">
            <span v-if="props.value !== dataTotal">{{ props.value }}条/页</span>
            <span v-if="props.value === dataTotal">全部</span>
          </template>
        </a-pagination>
      </div>
    </div>

    <AddTask tag="offline" :datalist="datalist" :curr-batch="batchItem" :add-visible="addVisible" :faces-data="facesDatalist" :modes-data="modesDatalist" :groups-data="groupDatalist" :target-keys="targetKeys" :selected-keys="selectedKeys" :small-layout="smallLayout" @updateData="updateData" @getList="getAllBatchs" />
  </div>
</template>
<script>
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
import api from '@/api'
import apiAdmin from '@/api/admin'
import AddTask from '@/components/AddTask.vue'
var moment = require('moment')

const statusArr = [
  { value: 0, label: '初始化' },
  { value: 1, label: '视频上传成功' },
  { value: 2, label: '视频上传失败' },
  { value: 3, label: '排队中' },
  { value: 4, label: '处理中' },
  { value: 5, label: '处理完成' },
  { value: 6, label: '任务失败' },
  { value: 7, label: '视频已过期' }
]
const columns = [
  {
    title: '用户',
    dataIndex: 'user_name',
    key: 'user_name',
    width: 100
  },
  {
    title: '源文件名',
    dataIndex: 'file_name',
    key: 'file_name',
    width: 150
  },
  {
    title: '时长',
    dataIndex: 'duration',
    key: 'duration',
    scopedSlots: { customRender: 'duration' },
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'statusStr',
    key: 'statusStr',
    scopedSlots: { customRender: 'statusStr' },
    width: 150
  },
  // {
  //   title: '进度',
  //   dataIndex: 'process',
  //   key: 'process',
  //   scopedSlots: { customRender: 'process' },
  //   width: 120
  // },
  {
    title: '任务单',
    dataIndex: 'batch_name',
    key: 'batch_name',
    scopedSlots: { customRender: 'batch_name' },
    width: 120
  },
  // {
  //   title: '模板',
  //   dataIndex: 'modeName',
  //   key: 'modeName',
  //   width: 120
  // },
  // {
  //   title: '人像组',
  //   dataIndex: 'groups',
  //   key: 'groups',
  //   scopedSlots: { customRender: 'groups' },
  //   width: 120
  // },
  // {
  //   title: '帧率',
  //   dataIndex: 'frame_rate',
  //   key: 'frame_rate',
  //   scopedSlots: { customRender: 'frame_rate' },
  //   width: 60
  // },
  // {
  //   title: '优先级',
  //   dataIndex: 'prority',
  //   key: 'prority',
  //   width: 80
  // },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    key: 'create_time',
    scopedSlots: { customRender: 'create_time' },
    width: 120
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: { customRender: 'action' },
    width: 200
  }
]

var timer = null
export default {
  components: { AddTask },
  beforeRouteEnter (to, from, next) {
    next()
  },
  beforeRouteLeave (to, from, next) {
    this.continueCircle = false
    window.clearTimeout(timer)
    next()
  },
  data () {
    return {
      locale,
      stream_type: 'offline',
      smallLayout: false,
      spinning: false,
      tableHeight: 0,
      searchForm: {
        batchId: '',
        batchName: '',
        status: 5,
        name: '',
        user_id: '',
        createTime: []
      },
      usersData: [],
      datalist: [],
      dataTotal: 0,
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      page_no: 1,
      page_size: 20,
      columns,
      batchsDatalist: [],
      continueCircle: true, // 是否继续轮循
      statusArr,
      addVisible: false,
      targetKeys: [],
      selectedKeys: [],
      facesDatalist: [],
      modesDatalist: [],
      groupDatalist: [],
      facesAboutGroup: []
    }
  },
  filters: {
    dateFormat (val) {
      if (val === '' || val === null) return ''
      return moment(val).format('YYYY-MM-DD HH:mm:ss')
    },
    statusFormat (val) {
      var filtedStatus = statusArr.filter(item => {
        return item.value === val
      })
      return filtedStatus[0].label
    },
    formateSeconds (second) {
      let secondTime = parseInt(second / 1000)
      var haomiao = parseInt(second % 1000)
      let min = 0 // 初始化分
      let h = 0 // 初始化小时
      let result = ''
      if (secondTime >= 60) { // 如果秒数大于60，将秒数转换成整数
        min = parseInt(secondTime / 60) // 获取分钟，除以60取整数，得到整数分钟
        secondTime = parseInt(secondTime % 60) // 获取秒数，秒数取佘，得到整数秒数
        if (min >= 60) { // 如果分钟大于60，将分钟转换成小时
          h = parseInt(min / 60) // 获取小时，获取分钟除以60，得到整数小时
          min = parseInt(min % 60) // 获取小时后取佘的分，获取分钟除以60取佘的分
        }
      }
      result = `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${secondTime.toString().padStart(2, '0')}.${haomiao}`
      return result
    }
  },
  watch: {
    $route (newVal, oldVal) {
      if (newVal.query && newVal.query.batchId) {
        // 查询分组人像列表
        // this.searchForm.batchId = newVal.query.batchId
        this.searchForm.batchName = newVal.query.batchName
      }
    }
  },
  computed: {
    currUser: {
      get () {
        var token = this.$store.state.authentication.token
        return token ? JSON.parse(token) : {}
      },
      set (val) {
        // this.$router.push({ path: val[0] || '/' })
      }
    }
  },
  mounted () {
    if (this.$route.query && this.$route.query.batchId) {
      // 查询分组人像列表
      // this.searchForm.batchId = this.$route.query.batchId
      this.searchForm.batchName = this.$route.query.batchName
    }

    var viewWidth = document.documentElement.clientWidth
    if (viewWidth < 540) {
      this.smallLayout = true
    }

    var viewHeight = document.documentElement.clientHeight
    var searchH = document.querySelector('.searchWrap') ? (document.querySelector('.searchWrap').clientHeight + 20) : 0
    this.tableHeight = viewHeight - 60 - (60 + 24 * 2) - searchH - (32 + 15 * 2) - 24 - 54

    this.getTasks()
    this.getAllBatchs()
    this.getAllTemps()
    // this.getAllGroups()
    this.getAllUsers()
  },
  methods: {
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    onPageChange (current) {
      this.page_no = current
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getTasks()
    },
    onShowSizeChange (current, pageSize) {
      this.page_size = pageSize
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getTasks()
    },
    searchHandleOk () {
      this.page_no = 1
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getTasks()
    },
    searchHandleReset (formName) {
      this.$refs[formName].resetFields()
    },
    getTasks () {
      var params = {
        page_no: this.page_no,
        page_size: this.page_size
      }
      // if (this.searchForm.batchId) {
      //   params.batchId = this.searchForm.batchId
      // }
      if (this.searchForm.batchName) {
        params.batchName = this.searchForm.batchName
      }
      if (this.searchForm.status !== '') {
        params.status = this.searchForm.status
      }
      if (this.searchForm.name) {
        params.name = this.searchForm.name
      }
      if (this.searchForm.user_id) {
        params.user_id = this.searchForm.user_id
      }
      if (this.searchForm.createTime && this.searchForm.createTime.length === 2) {
        params.createTime = 'range_' + moment(this.searchForm.createTime[0]).format('YYYY-MM-DD') + ',' + moment(this.searchForm.createTime[1]).format('YYYY-MM-DD')
      }

      this.spinning = true
      api.getTasks(params).then(res => {
        this.spinning = false
        var resBody = res.data
        if (resBody.code === 0) {
          this.datalist = resBody.data.item
          if (this.page_no === 1) {
            this.dataTotal = resBody.data.total
          }
        } else {
          this.$message.error(resBody.message || '请求出错！')
        }
        // 循环调用任务列表接口
        var that = this
        window.clearTimeout(timer)
        if (this.continueCircle) {
          timer = window.setTimeout(function () {
            that.getTasks()
          }, 5000)
        }
      }).catch(error => {
        this.spinning = false
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        if (error.response && error.response.data) {
          this.$message.error(error.response.data.message || '获取任务列表出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    delTask (record, idx) {
      api.delTask({id: record.id}).then(res => {
        if (res.data.code === 0) {
          this.$message.success('任务删除成功')
          this.getTasks()
        } else {
          this.$message.error(res.data.message || '请求出错！')
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        if (error.response && error.response.data) {
          this.$message.error(error.response.data.message || '删除出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    // toEdit (item, key, tag) {
    //   this.editTag = tag
    //   this.editVisible = true
    //   this.editItem = item
    //   this.editKey = key
    //   this.editForm = item
    //   this.editForm.type = parseInt(this.editForm.type)
    //   this.targetKeys = this.editForm.face_ids
    // },
    resume (item, key) {
      var params = {
        id: item.id
      }
      api.taskResume(params).then(res => {
        if (res.data.code === 0) {
          // this.datalist[key].status = 1
          this.$message.success('任务已恢复')
          this.getTasks()
        } else {
          this.$message.error(res.data.message || '请求出错！')
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        if (error.response && error.response.data) {
          this.$message.error(error.response.data.message || '任务恢复出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    pause (item, key) {
      var params = {
        id: item.id
      }
      api.taskPause(params).then(res => {
        if (res.data.code === 0) {
          // this.datalist[key].status = 2
          this.$message.success('任务已取消')
          this.getTasks()
        } else {
          this.$message.error(res.data.message || '请求出错！')
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        if (error.response && error.response.data) {
          this.$message.error(error.response.data.message || '任务取消出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    reset (item, key) {
      var params = {
        id: item.id
      }
      api.taskReset(params).then(res => {
        if (res.data.code === 0) {
          // this.datalist[key].status = 2
          this.$message.success('任务已重置')
          this.getTasks()
        } else {
          this.$message.error(res.data.message || '请求出错！')
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        if (error.response && error.response.data) {
          this.$message.error(error.response.data.message || '任务重置出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    updateData (params) {
      this[params.key] = params.val
    },
    getAllBatchs () {
      api.getBatchs().then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          var batchArr = resBody.data.item
          this.batchsDatalist = batchArr
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        // if (error.response && error.response.data) {
        //   this.$message.error(error.response.data.message || '获取明星列表出错！')
        // } else {
        //   this.$message.error('接口调用失败！')
        // }
      })
    },
    getAllTemps () {
      api.getTemps().then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          var modeArr = resBody.data.item
          this.modesDatalist = modeArr
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        // if (error.response && error.response.data) {
        //   this.$message.error(error.response.data.message || '获取明星列表出错！')
        // } else {
        //   this.$message.error('接口调用失败！')
        // }
      })
    },
    // getAllGroups () {
    //   api.getGroups().then(res => {
    //     var resBody = res.data
    //     if (resBody.code === 0) {
    //       var groupArr = resBody.data.item
    //       groupArr.unshift({ id: 0, name: '全部' })
    //       groupArr.map((item, key, arr) => {
    //         item.key = '' + item.id
    //         item.title = item.name
    //       })
    //       this.groupDatalist = groupArr
    //     }
    //   }).catch(error => {
    //     if (error.response && error.response.status === 401) {
    //       this.$store.dispatch('authentication/resetToken').then(() => {
    //         this.$router.push({ path: '/login' })
    //       })
    //     }
    //     // if (error.response && error.response.data) {
    //     //   this.$message.error(error.response.data.message || '获取明星列表出错！')
    //     // } else {
    //     //   this.$message.error('接口调用失败！')
    //     // }
    //   })
    // },
    getFacesByGroup (groupId) {
      this.loadingFacesOfGroup = true
      api.getGroupFaces({groupId: groupId}).then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          this.facesAboutGroup = resBody.data.item
          this.loadingFacesOfGroup = false
        } else {
          this.$message.error(resBody.message || '请求出错！')
        }
      }).catch(error => {
        this.loadingFacesOfGroup = false
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        if (error.response && error.response.data) {
          this.$message.error(error.response.data.message || '获取人像库出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    getAllUsers () {
      apiAdmin.fetchList().then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          var userArr = resBody.data.item
          this.usersData = userArr
        }
      }).catch(error => {
        console.log(error)
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        // if (error.response && error.response.data) {
        //   this.$message.error(error.response.data.message || '获取明星列表出错！')
        // } else {
        //   this.$message.error('接口调用失败！')
        // }
      })
    }
  }
}

</script>
<style scoped>
.desc {
  color: #555;
}
.date {
  font-size: .8em;
  color: #aaa;
}
</style>
