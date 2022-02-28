<template>
  <div class="faceContainer">
    <!--搜索-->
    <div class="searchWrap" :style="smallLayout? 'flex-direction: column;': ''">
      <a-form-model ref="searchForm" :model="searchForm" layout="inline">
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
        <span slot="status" slot-scope="status" style="color: #87d068;">
          {{status === 0? '初始化': status === 1? '排队中' : status === 2? '处理中' : '处理完成'}}
        </span>
        <span slot="type" slot-scope="type">
          {{type === 1? '文件': type === 2? '实时直播流': ''}}
        </span>
        <span slot="create_time" slot-scope="create_time">
          {{create_time | dateFormat}}
        </span>
        <span slot="process" slot-scope="process, record">
          {{ (record.processTime / record.duration).toFixed(4) * 100 }}%
        </span>
        <span slot="action" slot-scope="record, index, idx">
          <!-- <a-popconfirm
            title="确定要删除该任务单吗?"
            ok-text="删除"
            cancel-text="取消"
            @confirm="delBatch(record, idx)"
          >
            <a :disabled="record.status === 2">删除</a>
          </a-popconfirm>
          <a-divider type="vertical" /> -->
          <a @click="toAddTask(record, idx)">追加任务</a>
          <a-divider type="vertical" />
          <router-link :to="{ path: '/taskBatch/task', query: { batchId: record.id, batchName: record.name }}">查看任务<a-icon type="right" /></router-link>
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

    <AddTask tag="offline" :datalist="datalist" :curr-batch="batchItem" :add-visible="addVisible" :faces-data="facesDatalist" :modes-data="modesDatalist" :groups-data="groupDatalist" :target-keys="targetKeys" :selected-keys="selectedKeys" :small-layout="smallLayout" @updateData="updateData" @getList="getBatchs" />

  </div>
</template>
<script>
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
import api from '@/api'
import AddTask from '@/components/AddTask.vue'
var moment = require('moment')
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    key: 'id',
    width: 50
  },
  {
    title: '任务单名称',
    dataIndex: 'name',
    key: 'name',
    width: 100
  },
  {
    title: '总数',
    dataIndex: 'totalcount',
    key: 'totalcount',
    width: 80
  },
  {
    title: '完成数',
    dataIndex: 'finishcount',
    key: 'finishcount',
    width: 80
  },
  {
    title: '失败数',
    dataIndex: 'failcount',
    key: 'failcount',
    width: 80
  },
  {
    title: '命中数',
    dataIndex: 'hitcount',
    key: 'hitcount',
    width: 80
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    scopedSlots: { customRender: 'status' },
    width: 100
  },
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
    width: 160
  }
]

export default {
  components: { AddTask },
  beforeRouteEnter (to, from, next) {
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
        createTime: []
      },
      datalist: [],
      dataTotal: 0,
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      page_no: 1,
      page_size: 20,
      columns,
      addVisible: false,
      editVisible: false,
      typeArr_search: [ '任意', '文件', '实时直播流' ],
      targetKeys: [],
      selectedKeys: [],
      facesDatalist: [],
      modesDatalist: [],
      groupDatalist: [],
      batchItem: {}
    }
  },
  filters: {
    dateFormat (val) {
      if (val === '' || val === null) return ''
      return moment(val).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  mounted () {
    var viewWidth = document.documentElement.clientWidth
    if (viewWidth < 540) {
      this.smallLayout = true
    }

    var viewHeight = document.documentElement.clientHeight
    var searchH = document.querySelector('.searchWrap') ? (document.querySelector('.searchWrap').clientHeight + 20) : 0
    this.tableHeight = viewHeight - 60 - (60 + 24 * 2) - searchH - (32 + 15 * 2) - 24 - 54

    this.getBatchs()
    this.getAllTemps()
    // this.getAllGroups()
  },
  methods: {
    onPageChange (current) {
      this.page_no = current
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getBatchs()
    },
    onShowSizeChange (current, pageSize) {
      this.page_size = pageSize
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getBatchs()
    },
    searchHandleOk () {
      this.page_no = 1
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getBatchs()
    },
    searchHandleReset (formName) {
      this.$refs[formName].resetFields()
    },
    getBatchs () {
      var params = {
        page_no: this.page_no,
        page_size: this.page_size
      }
      if (this.searchForm.id) {
        params.id = this.searchForm.id
      }
      if (this.searchForm.createTime && this.searchForm.createTime.length === 2) {
        params.createTime = 'range_' + moment(this.searchForm.createTime[0]).format('YYYY-MM-DD') + ',' + moment(this.searchForm.createTime[1]).format('YYYY-MM-DD')
      }

      this.spinning = true
      api.getBatchs(params).then(res => {
        this.spinning = false
        var resBody = res.data
        if (resBody.code === 0) {
          this.datalist = resBody.data.item
          this.dataTotal = resBody.data.total
        } else {
          this.$message.error(resBody.message || '请求出错！')
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
    delBatch (record, idx) {
      api.delBatch({id: record.id}).then(res => {
        if (res.data.code === 0) {
          this.$message.success('任务单删除成功')
          this.getBatchs()
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
    toAddTask (item, key) {
      this.addVisible = true
      this.batchItem = item
    },
    updateData (params) {
      this[params.key] = params.val
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
    }
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
    // }
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
