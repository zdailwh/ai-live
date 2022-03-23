<template>
  <div class="faceContainer">
    <!--搜索-->
    <div class="searchWrap" :style="smallLayout? 'flex-direction: column;': ''">
      <a-form-model ref="searchForm" :model="searchForm" layout="inline">
        <a-form-model-item label="频道" prop="channelId">
          <a-select v-model="searchForm.channelId" :dropdownMatchSelectWidth="false" style="width: 120px;">
            <a-select-option value="">全部</a-select-option>
            <a-select-option :value="val.id" v-for="(val,key) in channelsDatalist" v-bind:key="key">
              {{val.name}}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <!-- <a-form-model-item label="状态" prop="status">
          <a-select v-model="searchForm.status" :dropdownMatchSelectWidth="false" style="width: 120px;">
            <a-select-option value="">全部</a-select-option>
            <a-select-option :value="val.value" v-for="(val,key) in statusArr" v-bind:key="key">
              {{val.label}}
            </a-select-option>
          </a-select>
        </a-form-model-item> -->
        <a-form-model-item label="创建时间" prop="createTime" format="YYYY-MM-DD" valueFormat="YYYY-MM-DD">
          <a-range-picker :locale="locale" v-model="searchForm.createTime" style="width: 220px;" />
        </a-form-model-item>
        <a-form-model-item>
          <a-button type="primary" @click="searchHandleOk"><a-icon key="search" type="search"/>搜索</a-button>
          <a-button style="margin-left: 10px;" @click="searchHandleReset('searchForm')">重置</a-button>
        </a-form-model-item>
      </a-form-model>
    </div>
    <!--搜索 end-->
    <div class="tableWrap">
      <a-table :columns="columns" :data-source="datalist" :scroll="{ x: true, y: tableHeight }" size="middle" rowKey="id" :pagination="false">
        <span slot="startPos" slot-scope="startPos">
          {{startPos ? ((startPos * 1000) | formateSeconds) : ''}}
        </span>
        <!-- <span slot="statusStr" slot-scope="statusStr, record">
          {{record.statusStr}}<br>
          <template v-if="record.status === 5">
            <a-tag v-if="record.resultstatus === 1" color="#f50">发现敏感人物</a-tag>
            <a-tag v-if="record.resultstatus === 0" color="#87d068">审核通过</a-tag>
          </template>
        </span> -->
        <span slot="duration" slot-scope="duration">
          {{duration | formateSeconds}}
        </span>
        <span slot="create_time" slot-scope="create_time">
          {{create_time | dateFormat}}
        </span>
        <span slot="action" slot-scope="record, index, idx">
          <router-link :to="'/taskResult/' + record.id">查看录像<a-icon type="right" /></router-link>
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
import api from '@/api'
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
    title: '频道',
    dataIndex: 'channelName',
    key: 'channelName',
    width: 150
  },
  {
    title: '人像',
    dataIndex: 'faceName',
    key: 'faceName',
    scopedSlots: { customRender: 'faceName' },
    width: 100
  },
  {
    title: '得分',
    dataIndex: 'score',
    key: 'score',
    width: 100
  },
  {
    title: '开始时间',
    dataIndex: 'startPos',
    key: 'startPos',
    scopedSlots: { customRender: 'startPos' },
    width: 100
  },
  // {
  //   title: '时长',
  //   dataIndex: 'duration',
  //   key: 'duration',
  //   scopedSlots: { customRender: 'duration' },
  //   width: 100
  // },
  // {
  //   title: '状态',
  //   dataIndex: 'statusStr',
  //   key: 'statusStr',
  //   scopedSlots: { customRender: 'statusStr' },
  //   width: 150
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
    width: 100
  }
]

var timer = null
export default {
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (from.name !== 'TaskResult') {
        vm.page_no = 1
        vm.page_size = 20
        vm.searchForm = {
          channelId: '',
          status: '',
          createTime: []
        }
        vm.getResults()
      }
    })
  },
  beforeRouteLeave (to, from, next) {
    this.continueCircle = false
    window.clearTimeout(timer)
    next()
  },
  data () {
    return {
      locale,
      smallLayout: false,
      spinning: false,
      tableHeight: 0,
      searchForm: {
        channelId: '',
        status: '',
        createTime: []
      },
      datalist: [],
      dataTotal: 0,
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      page_no: 1,
      page_size: 20,
      columns,
      continueCircle: true, // 是否继续轮循
      statusArr,
      channelsDatalist: []
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
      if (newVal.query && newVal.query.channelId) {
        this.searchForm.channelId = newVal.query.channelId
      }
    }
  },
  mounted () {
    if (this.$route.query && this.$route.query.channelId) {
      this.searchForm.channelId = this.$route.query.channelId
    }

    var viewWidth = document.documentElement.clientWidth
    if (viewWidth < 540) {
      this.smallLayout = true
    }

    var viewHeight = document.documentElement.clientHeight
    var searchH = document.querySelector('.searchWrap') ? (document.querySelector('.searchWrap').clientHeight + 20) : 0
    this.tableHeight = viewHeight - 60 - (60 + 24 * 2) - searchH - (32 + 15 * 2) - 24 - 54

    this.getResults()
    this.getAllChannels()
  },
  activated () {
    this.continueCircle = true
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
      this.getResults()
    },
    onShowSizeChange (current, pageSize) {
      this.page_size = pageSize
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getResults()
    },
    searchHandleOk () {
      this.page_no = 1
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getResults()
    },
    searchHandleReset (formName) {
      this.$refs[formName].resetFields()
    },
    getResults () {
      var params = {
        page_no: this.page_no,
        page_size: this.page_size
      }
      if (this.searchForm.channelId) {
        params.channelId = this.searchForm.channelId
      }
      if (this.searchForm.status !== '') {
        params.status = this.searchForm.status
      }
      if (this.searchForm.createTime && this.searchForm.createTime.length === 2) {
        params.createTime = 'range_' + moment(this.searchForm.createTime[0]).format('YYYY-MM-DD') + ',' + moment(this.searchForm.createTime[1]).format('YYYY-MM-DD')
      }

      this.spinning = true
      api.getResults(params).then(res => {
        this.spinning = false
        var resBody = res.data
        if (resBody.code === 0) {
          this.datalist = resBody.data.item
          // var datalist = resBody.data.item
          // var newDatalist = []
          // datalist.forEach(item => {
          //   if (newDatalist.length) {
          //     var has = newDatalist.filter(it => {
          //       return it.faceId === item.faceId
          //     })
          //     if (has.length) {
          //       if (has[0].children) {
          //         has[0].children.push(item)
          //       } else {
          //         has[0].children = [item]
          //       }
          //     } else {
          //       newDatalist.push(item)
          //     }
          //   } else {
          //     newDatalist.push(item)
          //   }
          // })
          // this.datalist = newDatalist
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
            that.getResults()
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
          this.$message.error(error.response.data.message || '获取结果列表出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    getAllChannels () {
      api.getChannels().then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          var channelArr = resBody.data
          this.channelsDatalist = channelArr
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        // if (error.response && error.response.data) {
        //   this.$message.error(error.response.data.message || '获取频道列表出错！')
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
.resultImg {
  width: 40px;
  height: 60px;
  cursor: pointer;
}
</style>
