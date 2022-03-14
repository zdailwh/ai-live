<template>
  <div class="faceContainer" style="position: relative;">
    <a-button type="primary" ghost style="position: absolute;top: -70px;right: 40px;" @click="toJiankanAll">监看全部</a-button>
    <!--搜索-->
    <!-- <div class="searchWrap" :style="smallLayout? 'flex-direction: column;': ''">
      <a-form-model ref="searchForm" :model="searchForm" layout="inline">
        <a-form-model-item label="创建时间" prop="createTime" format="YYYY-MM-DD" valueFormat="YYYY-MM-DD">
          <a-range-picker :locale="locale" v-model="searchForm.createTime" style="width: 220px;" />
        </a-form-model-item>
        <a-form-model-item>
          <a-button type="primary" @click="searchHandleOk"><a-icon key="search" type="search"/>搜索</a-button>
          <a-button style="margin-left: 10px;" @click="searchHandleReset('searchForm')">重置</a-button>
        </a-form-model-item>
      </a-form-model>
    </div> -->
    <!--搜索 end-->
    <div class="tableWrap">
      <a-table :columns="columns" :data-source="datalist" :scroll="{ x: true, y: tableHeight }" size="middle" rowKey="id" :pagination="false">
        <span slot="create_time" slot-scope="create_time">
          {{create_time | dateFormat}}
        </span>
        <span slot="status" slot-scope="status">
          <a-tag v-if="status === 1" color="#87d068">开启</a-tag>
          <a-tag v-else-if="status === 2" color="#f50">关闭</a-tag>
          <template v-else>初始化</template>
        </span>
        <span slot="action" slot-scope="record, index, idx">
          <a @click="toEdit(record, idx)">编辑</a>
          <template v-if="record.status === 0 || record.status === 2">
            <a-divider type="vertical" />
            <a-popconfirm
              title="确定要启动监测吗?"
              ok-text="启动"
              cancel-text="取消"
              @confirm="channelon(record, idx)"
            >
              <a>启动监测</a>
            </a-popconfirm>
          </template>
          <template v-if="record.status === 1">
            <a-divider type="vertical" />
            <a-popconfirm
              title="确定要关闭监测吗?"
              ok-text="关闭"
              cancel-text="取消"
              @confirm="channeloff(record, idx)"
            >
              <a>关闭监测</a>
            </a-popconfirm>
          </template>
          <template v-if="record.status === 1">
            <a-divider type="vertical" />
            <a @click="toJiankan(record)">实时监控</a>
          </template>
        </span>
      </a-table>
      <!-- <div class="mypagination">
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
      </div> -->
    </div>

    <!--通道配置-->
    <a-modal
      title="通道配置"
      width="800px"
      v-model="editVisible"
    >
      <div>
        <a-form-model ref="editform" :model="editForm" :rules="ruleValidate" :label-col="{span:4}" :wrapper-col="{span:20}">
          <a-form-model-item label="频道名称" prop="name">
            <a-input v-model="editForm.name" />
          </a-form-model-item>
          <a-form-model-item label="频道类型" prop="type">
            <a-select v-model="editForm.type">
              <a-select-option value="SDI1" :disabled="selectedSDI.indexOf('SDI1') !== -1">SDI1</a-select-option>
              <a-select-option value="SDI2" :disabled="selectedSDI.indexOf('SDI2') !== -1">SDI2</a-select-option>
              <a-select-option value="SDI3" :disabled="selectedSDI.indexOf('SDI3') !== -1">SDI3</a-select-option>
              <a-select-option value="SDI4" :disabled="selectedSDI.indexOf('SDI4') !== -1">SDI4</a-select-option>
              <a-select-option value="UDP">UDP</a-select-option>
              <a-select-option value="RTMP">RTMP</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item v-if="editForm.type === 'UDP' || editForm.type === 'RTMP'" label="频道链接" prop="url">
            <a-input v-model="editForm.url" />
          </a-form-model-item>
        </a-form-model>
      </div>
      <template slot="footer">
        <a-button key="back" @click="handleCancel_edit">
          取消
        </a-button>
        <a-button key="submit" type="primary" :loading="editLoading" @click="handleEdit">
          提交
        </a-button>
      </template>
    </a-modal>

  </div>
</template>
<script>
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
import api from '@/api'

var moment = require('moment')
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 100
  },
  {
    title: '频道',
    dataIndex: 'name',
    key: 'name',
    width: 120
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 80
  },
  {
    title: '链接',
    dataIndex: 'url',
    key: 'url',
    width: 200
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    scopedSlots: { customRender: 'status' },
    width: 100
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: { customRender: 'action' },
    width: 200
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
        createTime: []
      },
      editForm: {
      },
      editLoading: false,
      editItem: {},
      editKey: '',
      editVisible: false,
      ruleValidate: {
        channel: [
          { required: true, message: '请填写频道名称', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择频道类型', trigger: 'change' }
        ]
      },
      selectedSDI: []
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

    this.getChannels()
  },
  methods: {
    onPageChange (current) {
      this.page_no = current
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getChannels()
    },
    onShowSizeChange (current, pageSize) {
      this.page_size = pageSize
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getChannels()
    },
    searchHandleOk () {
      this.page_no = 1
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getChannels()
    },
    searchHandleReset (formName) {
      this.$refs[formName].resetFields()
    },
    getChannels () {
      var params = {
        page_no: this.page_no,
        page_size: this.page_size
      }
      if (this.searchForm.createTime && this.searchForm.createTime.length === 2) {
        params.createTime = 'range_' + moment(this.searchForm.createTime[0]).format('YYYY-MM-DD') + ',' + moment(this.searchForm.createTime[1]).format('YYYY-MM-DD')
      }

      this.spinning = true
      api.getChannels(params).then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          this.datalist = resBody.data
          var selectedSDI = this.datalist.map(item => {
            if (item.type && item.type.indexOf('SDI') !== -1) {
              return item.type
            }
          })
          this.selectedSDI = selectedSDI.filter(item => {
            return item
          })

          this.dataTotal = resBody.data.length
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
          this.$message.error(error.response.data.message || '获取通道出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    toEdit (item, key) {
      if (item.status === 1) {
        this.$message.info('请先关闭监测再进行编辑操作！')
        return false
      }
      this.editVisible = true
      this.editItem = item
      this.editKey = key
      this.editForm = item
    },
    handleCancel_edit () {
      this.editVisible = false
      this.$refs.editform.resetFields()
      this.editForm = {}
      this.editItem = {}
      this.editKey = ''
    },
    handleEdit () {
      this.$refs.editform.validate((valid) => {
        if (valid) {
          if ((this.editForm.type === 'UDP' || this.editForm.type === 'RTMP') && !this.editForm.url) {
            this.$message.error('请填写频道链接！')
            return
          }
          var params = {
            id: this.editItem.id,
            name: this.editForm.name,
            type: this.editForm.type,
            url: this.editForm.url
          }

          this.editLoading = true
          api.editChannel(params).then(res => {
            if (res.data.code === 0) {
              this.page_no = 1
              this.getChannels()

              this.editVisible = false
              this.editLoading = false
              this.editForm = {}
              this.$message.success('频道编辑成功')
            } else {
              this.$message.error(res.data.message || '请求出错！')
            }
          }).catch(error => {
            this.editLoading = false
            if (error.response && error.response.status === 401) {
              this.$store.dispatch('authentication/resetToken').then(() => {
                this.$router.push({ path: '/login' })
              })
            }
            if (error.response && error.response.data) {
              this.$message.error(error.response.data.message || '更新出错！')
            } else {
              this.$message.error('接口调用失败！')
            }
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    channelon (item, key) {
      var params = {
        id: item.id
      }
      api.channelon(params).then(res => {
        if (res.data.code === 0) {
          this.$message.success('已启动监测')
          this.getChannels()
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
          this.$message.error(error.response.data.message || '启动监测出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    channeloff (item, key) {
      var params = {
        id: item.id
      }
      api.channeloff(params).then(res => {
        if (res.data.code === 0) {
          this.$message.success('已关闭监测')
          this.getChannels()
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
          this.$message.error(error.response.data.message || '关闭监测出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    toJiankan (channel) {
      var newHash = `/jiankan/${channel.id}`
      var oldHash = window.location.hash
      var url = window.location.href.replace(oldHash, '#' + newHash)
      window.open(url, '_blank')
    },
    toJiankanAll () {
      var newHash = `/jiankanAll`
      var oldHash = window.location.hash
      var url = window.location.href.replace(oldHash, '#' + newHash)
      window.open(url, '_blank')
    }
  }
}

</script>
<style scoped>
</style>
