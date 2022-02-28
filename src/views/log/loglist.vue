<template>
  <div class="faceContainer">
    <!--搜索-->
    <div class="searchWrap" :style="smallLayout? 'flex-direction: column;': ''">
      <a-form-model ref="searchForm" :model="searchForm" layout="inline">
        <a-form-model-item label="用户" prop="user_id">
          <a-select v-model="searchForm.user_id" :dropdownMatchSelectWidth="false" style="width: 100px;">
            <a-select-option value="">全部</a-select-option>
            <a-select-option :value="item.id" v-for="item in usersData" v-bind:key="item.id">
              {{item.username}}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="请求类型" prop="method_type">
          <a-select v-model="searchForm.method_type" :dropdownMatchSelectWidth="false" style="width: 100px;">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="POST">POST</a-select-option>
            <a-select-option value="GET">GET</a-select-option>
            <a-select-option value="PUT">PUT</a-select-option>
            <a-select-option value="DELETE">DELETE</a-select-option>
            <a-select-option value="HEAD">HEAD</a-select-option>
            <a-select-option value="CONNECT">CONNECT</a-select-option>
            <a-select-option value="OPTIONS">OPTIONS</a-select-option>
            <a-select-option value="TRACE">TRACE</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="创建时间" prop="createTime" format="YYYY-MM-DD" valueFormat="YYYY-MM-DD">
          <a-range-picker :locale="locale" v-model="searchForm.createTime" style="width: 220px;" />
        </a-form-model-item>
        <a-form-model-item>
          <a-button type="primary" @click="searchHandleOk"><a-icon key="search" type="search"/>搜索</a-button>
          <a-button style="margin-left: 10px;" @click="searchHandleReset('searchForm')">重置</a-button>
          <a-button style="margin-left: 10px;" type="primary" @click="toDownload"><a-icon key="download" type="download"/>下载</a-button>
        </a-form-model-item>
      </a-form-model>
    </div>
    <!--搜索 end-->
    <div class="tableWrap">
      <a-table :columns="columns" :data-source="datalist" :scroll="{ x: true, y: tableHeight }" size="middle" rowKey="id" :pagination="false">
        <span slot="create_time" slot-scope="create_time">
          {{create_time | dateFormat}}
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
  </div>
</template>
<script>
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
import api from '@/api/action'
import apiAdmin from '@/api/admin'

var moment = require('moment')
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 100
  },
  {
    title: '用户',
    dataIndex: 'userName',
    key: 'userName',
    width: 120
  },
  // {
  //   title: 'url',
  //   dataIndex: 'url',
  //   key: 'url',
  //   width: 120
  // },
  {
    title: '描述',
    dataIndex: 'info',
    key: 'info',
    width: 120
  },
  // {
  //   title: '请求方式',
  //   dataIndex: 'method_type',
  //   key: 'method_type',
  //   width: 120
  // },
  // {
  //   title: '请求参数',
  //   dataIndex: 'request_param',
  //   key: 'request_param',
  //   width: 120
  // },
  {
    title: '客户访问ip',
    dataIndex: 'ip',
    key: 'ip',
    width: 120
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    key: 'create_time',
    scopedSlots: { customRender: 'create_time' },
    width: 120
  }
]

export default {
  beforeRouteEnter (to, from, next) {
    next()
  },
  data () {
    return {
      locale,
      smallLayout: false,
      spinning: false,
      tableHeight: 0,
      datalist: [],
      dataTotal: 0,
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      page_no: 1,
      page_size: 20,
      columns,
      searchForm: {
        user_id: '',
        method_type: '',
        createTime: []
      },
      usersData: []
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

    this.getLogs()
    this.getAllUsers()
  },
  methods: {
    onPageChange (current) {
      this.page_no = current
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getLogs()
    },
    onShowSizeChange (current, pageSize) {
      this.page_size = pageSize
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getLogs()
    },
    searchHandleOk () {
      this.page_no = 1
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getLogs()
    },
    searchHandleReset (formName) {
      this.$refs[formName].resetFields()
    },
    getLogs () {
      var params = {
        page_no: this.page_no,
        page_size: this.page_size
      }
      if (this.searchForm.user_id) {
        params.user_id = this.searchForm.user_id
      }
      if (this.searchForm.method_type) {
        params.method_type = this.searchForm.method_type
      }
      if (this.searchForm.createTime && this.searchForm.createTime.length === 2) {
        params.createTime = 'range_' + moment(this.searchForm.createTime[0]).format('YYYY-MM-DD') + ',' + moment(this.searchForm.createTime[1]).format('YYYY-MM-DD')
      }

      this.spinning = true
      api.getLogs(params).then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          this.datalist = resBody.data.item
          this.dataTotal = resBody.data.total
          this.spinning = false
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
          this.$message.error(error.response.data.message || '获取日志出错！')
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
    },
    toDownload () {
      var time = moment().format('YYYY-MM-DD HH:mm:ss')
      console.log(time)
      var name = time + 'Log.xlsx'
      var aLink = document.createElement('a')
      aLink.style.display = 'none'
      aLink.href = '/api/face/v1/export-order'
      aLink.setAttribute('target', '_blank')
      aLink.setAttribute('download', name)
      document.body.appendChild(aLink)
      aLink.click()
      document.body.removeChild(aLink) // 下载完成移除元素
    }
  }
}

</script>
<style scoped>
</style>
