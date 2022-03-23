<template>
  <div class="faceContainer">
    <!--搜索-->
    <div class="searchWrap" :style="smallLayout? 'flex-direction: column;': ''">
      <a-form-model ref="filterForm" :model="filterForm" layout="inline">
        <!-- <a-form-model-item label="角色名称" prop="name">
          <a-input v-model="filterForm.name" style="width: 120px;" />
        </a-form-model-item> -->
        <!-- <a-form-model-item label="创建时间" prop="createTime" format="YYYY-MM-DD" valueFormat="YYYY-MM-DD">
          <a-range-picker :locale="locale" v-model="filterForm.createTime" style="width: 220px;" />
        </a-form-model-item> -->
        <a-form-model-item>
          <!-- <a-button type="primary" @click="handleFilter"><a-icon key="search" type="search"/>搜索</a-button>
          <a-button style="margin-left: 10px;" @click="resetForm('filterForm')">重置</a-button> -->
          <a-button v-if="currUser.level !== '' && currUser.level > 3" style="margin-left: 10px;" type="primary" @click="dialogVisibleAdd = true"><a-icon key="plus" type="plus"/>创建角色</a-button>
          <!-- <a-button v-if="currUser.level !== '' && currUser.level > 3" style="margin-left: 10px;" type="primary" @click="dialogVisibleAddApi = true"><a-icon key="plus" type="plus"/>创建角色接口权限</a-button>
          <a-button v-if="currUser.level !== '' && currUser.level > 3" style="margin-left: 10px;" type="primary" @click="dialogVisibleAddMenu = true"><a-icon key="plus" type="plus"/>创建角色菜单权限</a-button> -->
        </a-form-model-item>
      </a-form-model>
    </div>
    <!--搜索 end-->
    <div class="tableWrap" v-if="listPermsOfRole.length">
      <a-table :columns="columns" :data-source="listPermsOfRole" :scroll="{ x: true, y: tableHeight }" size="middle" rowKey="id" :pagination="false">
        <span slot="name" slot-scope="name, record">
          {{ record.role && record.role.name }}
        </span>
        <span slot="description" slot-scope="description, record">
          {{ record.role && record.role.description }}
        </span>
        <span slot="levelstr" slot-scope="levelstr, record">
          {{ record.role && record.role.levelstr }}
        </span>
        <span slot="statusstr" slot-scope="statusstr, record">
          {{ record.role && record.role.statusstr }}
        </span>
        <span slot="create_time" slot-scope="create_time, record">
          {{ record.role && record.role.create_time | dateFormat }}
        </span>
        <div slot="perms" slot-scope="perms">
          <a-popover title="接口权限" trigger="hover" arrow-point-at-center>
            <template slot="content">
              <div style="width: 800px;" v-if="perms.length">
                <span v-for="it in perms" :key="it.id"> {{ it.info }}、 </span>
              </div>
            </template>
            <span>查看接口权限 ></span>
          </a-popover>
        </div>
        <div slot="menu" slot-scope="menu">
          <a-popover title="菜单权限" trigger="hover" arrow-point-at-center>
            <template slot="content">
              <div style="width: 300px;" v-if="menu.length" >
                <span v-for="(it,k) in menu.split(',')" v-if="it.indexOf('_') === -1" :key="k"> {{ it | toMenuTitle }}、 </span>
              </div>
            </template>
            <span>查看菜单权限 ></span>
          </a-popover>
        </div>
        <span slot="action" slot-scope="action, record, idx">
          <template v-if="currUser.level !== '' && currUser.level > 3">
            <a @click="editHandle(record.role, idx)">编辑</a>
            <a-divider type="vertical" />
          </template>
          <template v-if="currUser.level !== '' && currUser.level > 3">
            <a-popconfirm
              title="确定要删除该角色吗?"
              ok-text="删除"
              cancel-text="取消"
              @confirm="delRole(record.role.id, idx)"
            >
              <a v-if="currUser.level !== '' && currUser.level > 3">删除</a>
            </a-popconfirm>
            <a-divider type="vertical" />
          </template>
          <template v-if="currUser.level !== '' && currUser.level > 3">
            <a v-if="currUser.level !== '' && currUser.level > 3" @click="editApiHandle(record, idx)">编辑接口权限</a>
            <a-divider type="vertical" />
          </template>
          <template v-if="currUser.level !== '' && currUser.level > 3">
            <a v-if="currUser.level !== '' && currUser.level > 3" @click="editMenuHandle(record, idx)">编辑菜单权限</a>
          </template>
        </span>
      </a-table>
      <!-- <div class="mypagination">
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
      </div> -->
    </div>

    <Add :dialog-visible="dialogVisibleAdd" @changeVisible="changeAddVisible" @refresh="getList" />
    <Edit :edit-item="editItem" :dialog-visible="dialogVisibleEdit" @changeVisible="changeEditVisible" @refresh="getList" />

    <AddApi :dialog-visible="dialogVisibleAddApi" :options-permissions="optionsPermissions" :options-roles="optionsRoles" @changeVisible="changeAddApiVisible" :small-layout="smallLayout" @refresh="getPermsOfRole" />
    <EditApi :edit-item="editItem" :dialog-visible="dialogVisibleEditApi" :options-permissions="optionsPermissions" @changeVisible="changeEditApiVisible" :small-layout="smallLayout" @refresh="getPermsOfRole" />

    <AddMenu :dialog-visible="dialogVisibleAddMenu" :routes-data="routesData" :options-roles="optionsRoles" @changeVisible="changeAddMenuVisible" :small-layout="smallLayout" @refresh="getMenuOfRole" />
    <EditMenu :edit-item="editItem" :dialog-visible="dialogVisibleEditMenu" :routes-data="routesData" @changeVisible="changeEditMenuVisible" :small-layout="smallLayout" @refresh="getMenuOfRole" />
  </div>
</template>

<script>
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
import Cookies from 'js-cookie'
import apiRole from '@/api/myrole'
import apiRoleperm from '@/api/roleperm'
import apiPermission from '@/api/mypermission'
import Add from './add.vue'
import Edit from './edit.vue'

import AddApi from '../roleperm/add.vue'
import EditApi from '../roleperm/edit.vue'

import AddMenu from '../roleperm/addMenu.vue'
import EditMenu from '../roleperm/editMenu.vue'

import { routes } from '../roleperm/routes.js'

var moment = require('moment')
const columns = [
  // {
  //   title: 'ID',
  //   dataIndex: 'id',
  //   key: 'id',
  //   width: 50
  // },
  {
    title: '角色名称',
    dataIndex: 'name',
    key: 'name',
    scopedSlots: { customRender: 'name' },
    width: 100
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    scopedSlots: { customRender: 'description' },
    width: 120
  },
  {
    title: '等级',
    dataIndex: 'levelstr',
    key: 'levelstr',
    scopedSlots: { customRender: 'levelstr' },
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
    title: '接口',
    dataIndex: 'perms',
    key: 'perms',
    scopedSlots: { customRender: 'perms' },
    width: 120
  },
  {
    title: '菜单',
    dataIndex: 'menu',
    key: 'menu',
    scopedSlots: { customRender: 'menu' },
    width: 120
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
    width: 330
  }
]

export default {
  components: { Add, Edit, AddApi, EditApi, AddMenu, EditMenu },
  filters: {
    dateFormat (val) {
      if (val === '' || val === null) return ''
      return moment(val).format('YYYY-MM-DD HH:mm:ss')
    },
    toMenuTitle (val) {
      if (val.indexOf('_') !== -1) {
        return ''
      } else {
        var tit = ''
        routes.map(item => {
          if (item.name === val) {
            tit = item.title
          }
          if (item.children) {
            item.children.map(it => {
              if (it.name === val) {
                tit = it.title
              }
            })
          }
        })
        return tit || val
      }
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
      dialogVisibleAddApi: false,
      dialogVisibleEditApi: false,
      dialogVisibleAddMenu: false,
      dialogVisibleEditMenu: false,
      allPermissions: [],
      optionsPermissions: [],
      allRoles: [],
      optionsRoles: [],
      listPermsOfRole: []
    }
  },
  watch: {
    allPermissions: function (newVal) {
      if (newVal.length) {
        this.optionsPermissions = newVal.map((item, idx, arr) => {
          return {
            label: item.info,
            value: item.id,
            key: item.id
          }
        })
      }
    },
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
  created () {
    var viewWidth = document.documentElement.clientWidth
    if (viewWidth < 540) {
      this.smallLayout = true
    }

    var viewHeight = document.documentElement.clientHeight
    var searchH = document.querySelector('.searchWrap') ? (document.querySelector('.searchWrap').clientHeight + 20) : 0
    this.tableHeight = viewHeight - 60 - (60 + 24 * 2) - searchH - (32 + 15 * 2) - 24 - 54

    // this.getList()
    this.getAllPermissions()
    this.getAllRoles()
    this.getMyRoutes()
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
      apiRole.fetchList(this.listQuery).then(res => {
        this.listLoading = false
        var resBody = res.data
        if (resBody.code === 0) {
          this.list = resBody.data.item || []
          this.total = resBody.data.total
          // 分别获取各角色的权限列表
          this.getPermsOfRole()
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
    delRole (id, idx) {
      apiRole.deleteRole({ id: id }).then(res => {
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
    editApiHandle (item, idx) {
      this.editItem = JSON.parse(JSON.stringify(item))
      this.editIndex = idx
      this.dialogVisibleEditApi = true
    },
    editMenuHandle (item, idx) {
      this.editItem = JSON.parse(JSON.stringify(item))
      this.editIndex = idx
      this.dialogVisibleEditMenu = true
    },
    getAllPermissions () {
      apiPermission.getAllPermissions().then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          this.allPermissions = resBody.data.item || []
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
    },
    getAllRoles () {
      if (this.filterForm.name !== '') {
        this.listQuery.name = this.filterForm.name
      }
      apiRole.getAllRoles(this.listQuery).then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          this.allRoles = resBody.data.item || []
          // 分别获取各角色的权限列表
          this.getPermsOfRole()
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
    },
    getPermsOfRole () {
      this.listLoading = true
      var requestList = this.allRoles.map(async item => {
        var listQuery = {
          page: 1,
          limit: 100,
          roleId: item.id
        }
        return new Promise((resolve, reject) => {
          apiRoleperm.fetchList(listQuery).then(response => {
            var resBody = response.data
            if (resBody.code === 0) {
              var permissions = resBody.data.item.map(it => {
                return it.permission
              })
              resolve({ id: item.id, role: item, perms: permissions, menu: item.menu || '' })
            } else {
              reject(resBody.message || '请求出错！')
            }
          }).catch((error) => {
            reject(error)
          })
        })
      })

      Promise.all(requestList).then(result => {
        this.listPermsOfRole = result
        // 获取角色菜单权限
        this.getMenuOfRole()
        this.listLoading = false
      }).catch((result) => {
        this.listLoading = false
        console.log(result)
        console.log('获取角色权限失败！')
      })
    },
    getMenuOfRole () {
      apiRoleperm.getRoleMenus().then(response => {
        var resBody = response.data
        if (resBody.code === 0) {
          var menus = resBody.data.item || []
          this.listPermsOfRole.map(item => {
            var menu = menus.filter(it => {
              return it.role_id === item.id
            })
            item.menu = (menu && menu[0] && menu[0].menu) || ''
          })
        } else {
          this.$message.error(resBody.message || '请求出错！')
        }
      }).catch((error) => {
        console.log(error)
      })
    },
    changeAddApiVisible (params) {
      this.dialogVisibleAddApi = params
    },
    changeEditApiVisible (params) {
      this.dialogVisibleEditApi = params
    },
    changeAddMenuVisible (params) {
      this.dialogVisibleAddMenu = params
    },
    changeEditMenuVisible (params) {
      this.dialogVisibleEditMenu = params
    },
    async getMyRoutes () {
      this.serviceRoutes = routes
      this.routesData = this.generateRoutes(routes)
    },

    // Reshape the routes structure so that it looks the same as the sidebar
    generateRoutes (routes, basePath = '/') {
      const res = []

      for (let route of routes) {
        // skip some route
        if (route.hidden) { continue }

        const onlyOneShowingChild = this.onlyOneShowingChild(route.children, route)

        if (route.children && onlyOneShowingChild && !route.alwaysShow) {
          route = onlyOneShowingChild
        }

        const data = {
          title: route.title,
          name: route.name
        }
        if (route.parent) {
          data.parent = route.parent
        }

        // recursive child routes
        if (route.children) {
          data.children = this.generateRoutes(route.children, data.path)
        }
        res.push(data)
      }
      return res
    },
    onlyOneShowingChild (children = [], parent) {
      let onlyOneChild = null
      const showingChildren = children.filter(item => !item.hidden)

      // When there is only one child route, the child route is displayed by default
      if (showingChildren.length === 1) {
        onlyOneChild = showingChildren[0]
        return onlyOneChild
      }

      // Show parent if there are no child route to display
      if (showingChildren.length === 0) {
        onlyOneChild = { title: parent.title, name: parent.name }
        return onlyOneChild
      }

      return false
    }
  }
}
</script>
<style scoped>
</style>
