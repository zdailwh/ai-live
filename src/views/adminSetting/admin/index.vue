<template>
  <div class="faceContainer">
    <!--搜索-->
    <div class="searchWrap" :style="smallLayout? 'flex-direction: column;': ''">
      <a-form-model ref="filterForm" :model="filterForm" layout="inline">
        <a-form-model-item label="登录名" prop="username">
          <a-input v-model="filterForm.username" style="width: 120px;" />
        </a-form-model-item>
        <!-- <a-form-model-item label="创建时间" prop="createTime" format="YYYY-MM-DD" valueFormat="YYYY-MM-DD">
          <a-range-picker :locale="locale" v-model="filterForm.createTime" style="width: 220px;" />
        </a-form-model-item> -->
        <a-form-model-item>
          <a-button type="primary" @click="handleFilter"><a-icon key="search" type="search"/>搜索</a-button>
          <a-button style="margin-left: 10px;" @click="resetForm('filterForm')">重置</a-button>
          <a-button v-if="currUser.level !== '' && currUser.level > 3" style="margin-left: 10px;" type="primary" @click="dialogVisibleAdd = true"><a-icon key="plus" type="plus"/>创建用户</a-button>
        </a-form-model-item>
      </a-form-model>
    </div>
    <!--搜索 end-->
    <div class="tableWrap">
      <a-table :columns="columns" :data-source="list" :scroll="{ x: true, y: tableHeight }" size="middle" rowKey="id" :pagination="false">
        <span slot="level" slot-scope="level">
          {{level | levelFilter}}
        </span>
        <span slot="statusstr" slot-scope="statusstr, record">
          <span :style="{ color: record.status === 1 ? '#52c41a' : record.status === 2 ? '#f5222d' : '#fff' }">{{statusstr}}</span>
        </span>
        <span slot="create_time" slot-scope="create_time">
          {{create_time | dateFormat}}
        </span>
        <span slot="action" slot-scope="action, record, idx">
          <template v-if="currUser.level !== '' && currUser.level > 3 && record.status !== 1">
            <a @click="actived(record.id, idx)">激活</a>
            <a-divider type="vertical" />
          </template>
          <template v-if="currUser.level !== '' && currUser.level > 3 && currUser.id !== record.id && record.status !== 2">
            <a @click="inactived(record.id, idx)">禁用</a>
            <a-divider type="vertical" />
          </template>
          <template v-if="currUser.level !== '' && currUser.level > 3 && record.status === 2">
            <a @click="resetPwdHandle(record, idx)">重置密码</a>
            <a-divider type="vertical" />
          </template>
          <template v-if="currUser.level !== '' && currUser.level > 3 && record.status === 2">
            <a @click="resetRoleHandle(record, idx)">修改角色</a>
            <a-divider type="vertical" />
          </template>
          <a-popconfirm
            title="确定要删除该用户吗?"
            ok-text="删除"
            cancel-text="取消"
            @confirm="delUser(record.id, idx)"
          >
            <a v-if="currUser.level !== '' && currUser.level > 3 && currUser.level >= record.level && currUser.id !== record.id">删除</a>
          </a-popconfirm>
        </span>
      </a-table>
      <div class="mypagination">
        <a-pagination
          v-model="listQuery.page"
          :page-size-options="pageSizeOptions"
          :total="total"
          :show-total="total => `共 ${total} 条`"
          show-size-changer
          :page-size="listQuery.limit"
          @showSizeChange="onShowSizeChange"
          @change="onPageChange"
        >
          <template slot="buildOptionText" slot-scope="props">
            <span v-if="props.value !== total">{{ props.value }}条/页</span>
            <span v-if="props.value === total">全部</span>
          </template>
        </a-pagination>
      </div>
    </div>

    <Add :dialog-visible="dialogVisibleAdd" :options-roles="optionsRoles" @changeVisible="changeAddVisible" @refresh="getList" />
    <ResetPwd :edit-item="editItem" :dialog-visible="dialogVisibleResetPwd" @changeVisible="changeResetPwdVisible" />
    <ResetRole :edit-item="editItem" :options-roles="optionsRoles" :dialog-visible="dialogVisibleResetRole" @changeVisible="changeResetRoleVisible" @refresh="getList" />
  </div>
</template>

<script>
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
import apiAdmin from '@/api/admin'
import apiRole from '@/api/myrole'

import Add from './add.vue'
import ResetPwd from './resetPwd.vue'
import ResetRole from './resetRole.vue'

var moment = require('moment')
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 50
  },
  {
    title: '登录名',
    dataIndex: 'username',
    key: 'username',
    width: 100
  },
  {
    title: '实名',
    dataIndex: 'realname',
    key: 'realname',
    width: 100
  },
  {
    title: '手机号',
    dataIndex: 'mobile',
    key: 'mobile',
    width: 120
  },
  {
    title: '管理员标识',
    dataIndex: 'level',
    key: 'level',
    scopedSlots: { customRender: 'level' },
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'statusstr',
    key: 'statusstr',
    scopedSlots: { customRender: 'statusstr' },
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
    width: 280
  }
]

export default {
  components: { Add, ResetPwd, ResetRole },
  filters: {
    levelFilter (val) {
      const typeObj = {
        2: '普通',
        3: '操作员',
        4: '管理员',
        5: '超级管理员'
      }
      return typeObj[val]
    },
    dateFormat (val) {
      if (val === '' || val === null) return ''
      return moment(val).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  data () {
    return {
      locale,
      columns,
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      smallLayout: false,
      tableHeight: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20
      },
      filterForm: {
        createTime: [],
        username: ''
      },
      editItem: {},
      editIndex: '',
      dialogVisibleAdd: false,
      dialogVisibleResetPwd: false,
      dialogVisibleResetRole: false,
      allRoles: [],
      optionsRoles: []
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
  watch: {
    allRoles: function (newVal) {
      if (newVal.length) {
        this.optionsRoles = newVal.map((item, idx, arr) => {
          return {
            label: item.name,
            value: item.id
          }
        })
      }
    }
  },
  created () {
    var viewWidth = document.documentElement.clientWidth
    if (viewWidth < 540) {
      this.smallLayout = true
    }

    var viewHeight = document.documentElement.clientHeight
    var searchH = document.querySelector('.searchWrap') ? (document.querySelector('.searchWrap').clientHeight + 20) : 0
    this.tableHeight = viewHeight - 60 - (60 + 24 * 2) - searchH - (32 + 15 * 2) - 24 - 54

    this.getList()
    this.getAllRoles()
  },
  methods: {
    onPageChange (current) {
      this.listQuery.page = current
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getList()
    },
    onShowSizeChange (current, pageSize) {
      this.listQuery.limit = pageSize
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getList()
    },
    getList () {
      this.listLoading = true
      apiAdmin.fetchList(this.listQuery).then(res => {
        this.listLoading = false
        var resBody = res.data
        if (resBody.code === 0) {
          this.list = resBody.data.item
          this.total = resBody.data.total
        } else {
          this.$message.error(resBody.message || '请求出错！')
        }
      }).catch(error => {
        this.listLoading = false
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        if (error.response && error.response.data) {
          this.$message.error(error.response.data.message || error.response.data)
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    handleFilter () {
      this.listQuery = {
        page: 1,
        limit: 20
      }
      if (this.filterForm.createTime && this.filterForm.createTime.length) {
        this.listQuery.createTime = this.filterForm.createTime
      }
      if (this.filterForm.username !== '') {
        this.listQuery.username = this.filterForm.username
      }
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getList()
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
      this.handleFilter()
    },
    actived (id, idx) {
      apiAdmin.actived({ id: id }).then(res => {
        if (res.data.code === 0) {
          this.$message.success('激活成功！')
          this.getList()
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
          this.$message.error(error.response.data.message || error.response.data)
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    inactived (id, idx) {
      apiAdmin.inactived({ id: id }).then(res => {
        if (res.data.code === 0) {
          this.$message.success('禁用成功！')
          this.getList()
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
          this.$message.error(error.response.data.message || error.response.data)
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    delUser (id, idx) {
      apiAdmin.deleteUser({ id: id }).then(res => {
        if (res.data.code === 0) {
          this.$message.success('删除成功！')
          this.getList()
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
          this.$message.error(error.response.data.message || error.response.data)
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    changeAddVisible (params) {
      this.dialogVisibleAdd = params
    },
    resetPwdHandle (item, idx) {
      this.editItem = item
      this.dialogVisibleResetPwd = true
    },
    changeResetPwdVisible (params) {
      this.dialogVisibleResetPwd = params
    },
    resetRoleHandle (item, idx) {
      this.editItem = item
      this.dialogVisibleResetRole = true
    },
    changeResetRoleVisible (params) {
      this.dialogVisibleResetRole = params
    },
    getAllRoles () {
      apiRole.getAllRoles().then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          this.allRoles = resBody.data.item || []
        } else {
          this.$message.error(resBody.message || '请求出错！')
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        if (error.response && error.response.data) {
          this.$message.error(error.response.data.message || error.response.data)
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    }
  }
}
</script>
<style scoped>
</style>
