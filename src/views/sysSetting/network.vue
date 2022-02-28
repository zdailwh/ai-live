<template>
  <div class="faceContainer">
    <div class="tableWrap">
      <a-table :columns="columns" :data-source="datalist" :scroll="{ x: true, y: tableHeight }" size="middle" rowKey="name" :pagination="false">
        <span slot="action" slot-scope="record, index, idx">
          <a @click="toEdit(record, idx)">编辑</a>
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

    <!--编辑模板-->
    <a-modal
      title="编辑网络配置"
      width="800px"
      v-model="editVisible"
    >
      <div>
        <a-form-model ref="editform" :model="editForm" :rules="ruleValidate" :label-col="{span:4}" :wrapper-col="{span:14}">
          <a-form-model-item label="连接模式" prop="BOOTPROTO">
            <a-select v-model="editForm.BOOTPROTO">
              <a-select-option value="static">static</a-select-option>
              <a-select-option value="DHCP">DHCP</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item label="IP地址" prop="IPADDR">
          <a-input v-model="editForm.IPADDR" :disabled="editForm.BOOTPROTO === 'DHCP'" />
        </a-form-model-item>
        <a-form-model-item label="网关地址" prop="GATEWAY">
          <a-input v-model="editForm.GATEWAY" :disabled="editForm.BOOTPROTO === 'DHCP'"/>
        </a-form-model-item>
        <a-form-model-item label="子网掩码" prop="NETMASK">
          <a-input v-model="editForm.NETMASK" :disabled="editForm.BOOTPROTO === 'DHCP'" />
        </a-form-model-item>
        </a-form-model>
      </div>
      <template slot="footer">
        <a-button key="back" @click="reset">
          取消
        </a-button>
        <a-button key="submit" type="primary" :loading="editLoading" @click="handleEdit">
          更新
        </a-button>
      </template>
    </a-modal>
  </div>
</template>
<script>
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
import api from '@/api/action'

var moment = require('moment')

const columns = [
  {
    title: '网络接口',
    dataIndex: 'NAME',
    key: 'NAME',
    width: 100
  },
  {
    title: '设备',
    dataIndex: 'DEVICE',
    key: 'DEVICE',
    width: 100
  },
  {
    title: '连接模式',
    dataIndex: 'BOOTPROTO',
    key: 'BOOTPROTO',
    width: 120
  },
  {
    title: 'IP地址',
    dataIndex: 'IPADDR',
    key: 'IPADDR',
    width: 120
  },
  {
    title: '网关地址',
    dataIndex: 'GATEWAY',
    key: 'GATEWAY',
    width: 120
  },
  {
    title: '子网掩码',
    dataIndex: 'NETMASK',
    key: 'NETMASK',
    width: 120
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: { customRender: 'action' },
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
      },
      ruleValidate: {
        BOOTPROTO: [
          { required: true, message: '连接模式不能为空', trigger: 'change' }
        ]
        // IPADDR: [
        //   { required: !!(this.editForm && this.editForm.BOOTPROTO === 'static'), message: 'IP地址不能为空', trigger: 'blur' }
        // ],
        // GATEWAY: [
        //   { required: !!(this.editForm && this.editForm.BOOTPROTO === 'static'), message: '网关地址不能为空', trigger: 'blur' }
        // ],
        // NETMASK: [
        //   { required: !!(this.editForm && this.editForm.BOOTPROTO === 'static'), message: '子网掩码不能为空', trigger: 'blur' }
        // ]
      },
      editForm: {
      },
      editLoading: false,
      editItem: {},
      editKey: '',
      editVisible: false
    }
  },
  filters: {
    dateFormat (val) {
      if (val === '' || val === null) return ''
      return moment(val).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  watch: {
    'editForm.BOOTPROTO' (val) {
      if (val === 'DHCP') {
        this.editForm.IPADDR = ''
        this.editForm.GATEWAY = ''
        this.editForm.NETMASK = ''
      }
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

    this.getNetworks()
  },
  methods: {
    onPageChange (current) {
      this.page_no = current
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getNetworks()
    },
    onShowSizeChange (current, pageSize) {
      this.page_size = pageSize
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getNetworks()
    },
    searchHandleOk () {
      this.page_no = 1
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getNetworks()
    },
    searchHandleReset (formName) {
      this.$refs[formName].resetFields()
    },
    getNetworks () {
      var params = {
        page_no: this.page_no,
        page_size: this.page_size
      }

      this.spinning = true
      api.getNetworks(params).then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          this.datalist = resBody.data.item
          this.datalist.map(item => {
            if (item.BOOTPROTO === 'none') {
              item.BOOTPROTO = 'static'
            }
          })
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
          this.$message.error(error.response.data.message || '获取网络配置出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    toEdit (item, key) {
      this.editVisible = true
      this.editItem = item
      this.editKey = key
      this.editForm = item
    },
    reset () {
      this.$refs.editform.resetFields()
      this.editVisible = false
    },
    handleEdit () {
      this.$refs.editform.validate((valid) => {
        if (valid) {
          if (this.editForm.BOOTPROTO === 'static') {
            if (this.editForm.IPADDR === '') {
              this.$message.error('请填写IP地址！')
              return
            }
            // if (this.editForm.GATEWAY === '') {
            //   this.$message.error('请填写网关地址！')
            //   return
            // }
            // if (this.editForm.NETMASK === '') {
            //   this.$message.error('请填写子网掩码！')
            //   return
            // }
          }
          var params = {
            name: this.editForm.NAME,
            BOOTPROTO: this.editForm.BOOTPROTO,
            IPADDR: this.editForm.IPADDR,
            GATEWAY: this.editForm.GATEWAY,
            NETMASK: this.editForm.NETMASK
          }

          this.editLoading = true
          api.editNetwork(params).then(res => {
            if (res.data.code === 0) {
              this.page_no = 1
              this.getNetworks()

              this.editVisible = false
              this.editLoading = false
              this.editForm = {}
              this.$message.success('网络配置编辑成功')
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
    }
  }
}

</script>
<style scoped>
</style>
