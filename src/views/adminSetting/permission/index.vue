<template>
<div class="faceContainer">
    <!--搜索-->
    <div class="searchWrap" :style="smallLayout? 'flex-direction: column;': ''">
      <a-form-model ref="filterForm" :model="filterForm" layout="inline">
        <a-form-model-item label="权限名称" prop="name">
          <a-input v-model="filterForm.name" style="width: 120px;" />
        </a-form-model-item>
        <!-- <a-form-model-item label="创建时间" prop="createTime" format="YYYY-MM-DD" valueFormat="YYYY-MM-DD">
          <a-range-picker :locale="locale" v-model="filterForm.createTime" style="width: 220px;" />
        </a-form-model-item> -->
        <a-form-model-item>
          <a-button type="primary" @click="handleFilter"><a-icon key="search" type="search"/>搜索</a-button>
          <a-button style="margin-left: 10px;" @click="resetForm('filterForm')">重置</a-button>
          <a-button style="margin-left: 10px;" type="primary" @click="dialogVisibleAdd = true"><a-icon key="plus" type="plus"/>创建权限</a-button>
          <a-popconfirm
            title="确定要删除所选关联记录吗？"
            ok-text="删除"
            cancel-text="取消"
            @confirm="delSome()"
          >
            <a-button style="margin-left: 10px;" type="danger" :disabled="!multipleSelection.length"><a-icon key="delete" type="delete"/>批量删除</a-button>
          </a-popconfirm>
        </a-form-model-item>
      </a-form-model>
    </div>
    <!--搜索 end-->
    <div class="tableWrap">
      <a-table :columns="columns" :data-source="list" :scroll="{ x: true, y: tableHeight }" size="middle" rowKey="id" :pagination="false" :row-selection="{ selectedRowKeys: multipleSelection, onChange: handleSelectionChange, columnWidth: '10px' }">
        <span slot="create_time" slot-scope="create_time">
          {{create_time | dateFormat}}
        </span>
        <span slot="action" slot-scope="action, record, idx">
          <a @click="editHandle(record, idx)">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定要删除该权限吗?"
            ok-text="删除"
            cancel-text="取消"
            @confirm="delPrem(record.id, idx)"
          >
            <a>删除</a>
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

    <Add :dialog-visible="dialogVisibleAdd" @changeVisible="changeAddVisible" @refresh="getList" />
    <Edit :edit-item="editItem" :dialog-visible="dialogVisibleEdit" @changeVisible="changeEditVisible" @refresh="getList" />
  </div>
</template>

<script>
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
import Cookies from 'js-cookie'
import apiPermission from '@/api/mypermission'

import Add from './add.vue'
import Edit from './edit.vue'

var moment = require('moment')
const columns = [
  // {
  //   title: 'ID',
  //   dataIndex: 'id',
  //   key: 'id',
  //   width: 50
  // },
  {
    title: '接口地址',
    dataIndex: 'name',
    key: 'name',
    width: 100
  },
  {
    title: '权限描述',
    dataIndex: 'info',
    key: 'info',
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
    width: 120
  }
]

export default {
  components: { Add, Edit },
  filters: {
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
      isVisitor: (Cookies.get('Programme-isVisitor') && JSON.parse(Cookies.get('Programme-isVisitor'))) || false,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20
      },
      filterForm: {
        name: ''
      },
      editItem: {},
      editIndex: '',
      dialogVisibleAdd: false,
      dialogVisibleEdit: false,
      multipleSelection: []
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
      apiPermission.fetchList(this.listQuery).then(res => {
        this.listLoading = false
        var resBody = res.data
        if (resBody.code === 0) {
          this.list = resBody.data.item || []
          this.list.map(item => {
            item.menu = item.menu.split(',').filter(it => { return it.indexOf('_') === -1 })
          })
          this.total = resBody.data.total
        } else {
          this.$message.error(resBody.message || '请求出错！')
        }
      }).catch((error) => {
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
      if (this.filterForm.name !== '') {
        this.listQuery.name = this.filterForm.name
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
    delPrem (id, idx) {
      apiPermission.deletePermission({ id: id }).then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          this.$message.success('删除成功！')
          this.getList()
        } else {
          this.$message.error(resBody.message || '请求出错！')
        }
      }).catch((error) => {
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
    editHandle (item, idx) {
      this.editItem = JSON.parse(JSON.stringify(item))
      this.editIndex = idx
      this.dialogVisibleEdit = true
    },
    changeEditVisible (params) {
      this.dialogVisibleEdit = params
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    delSome () {
      var requestList = this.multipleSelection.map(async item => {
        return new Promise((resolve, reject) => {
          apiPermission.deletePermission({ id: item.id }).then(response => {
            var resBody = response.data
            if (resBody.code === 0) {
              resolve(response)
            } else {
              reject(resBody.message || '请求出错！')
            }
          }).catch((error) => {
            reject(error)
          })
        })
      })
      Promise.all(requestList).then(result => {
        console.log(result)
        this.$message.success('删除成功！')
        this.getList()
      }).catch((result) => {
        console.log(result)
        console.log('失败了')
      })
    }
  }
}
</script>
<style scoped>
</style>
