<template>
  <div class="faceContainer">
    <!--搜索-->
    <div class="searchWrap" :style="smallLayout? 'flex-direction: column;': ''">
      <a-form-model ref="filterForm" :model="filterForm" layout="inline">
        <a-form-model-item>
          <!-- <a-button type="primary" @click="handleFilter"><a-icon key="search" type="search"/>搜索</a-button>
          <a-button style="margin-left: 10px;" @click="resetForm('filterForm')">重置</a-button> -->
          <a-button v-if="currUser.level !== '' && currUser.level > 3" style="margin-left: 10px;" type="primary" @click="dialogVisibleAdd = true"><a-icon key="plus" type="plus"/>创建角色接口权限</a-button>
          <a-button v-if="currUser.level !== '' && currUser.level > 3" style="margin-left: 10px;" type="primary" @click="dialogVisibleAddMenu = true"><a-icon key="plus" type="plus"/>创建角色菜单权限</a-button>
          <!-- <a-popconfirm
            title="确定要删除所选关联记录吗？"
            ok-text="删除"
            cancel-text="取消"
            @confirm="delSome()"
          >
            <a-button style="margin-left: 10px;" type="danger" :disabled="!multipleSelection.length"><a-icon key="delete" type="delete"/>批量删除</a-button>
          </a-popconfirm> -->
        </a-form-model-item>
      </a-form-model>
    </div>
    <!--搜索 end-->

    <div class="tableWrap" v-if="listPermsOfRole.length">
      <a-table :columns="columns" :data-source="listPermsOfRole" :scroll="{ x: true, y: tableHeight }" size="middle" rowKey="id" :pagination="false">
        <span slot="role" slot-scope="role">
          {{ role && role.name }}
        </span>
        <div slot="perms" slot-scope="perms">
          <template v-if="perms.length">
            <p v-for="it in perms" :key="it.id"> {{ it.info }}、 </p>
          </template>
        </div>
        <div slot="menu" slot-scope="menu">
          <template v-if="menu.length" v-for="(it,k) in menu.split(',')" >
            <p v-if="it.indexOf('_') === -1" :key="k"> {{ it | toMenuTitle }}、 </p>
          </template>
        </div>
        <span slot="create_time" slot-scope="create_time">
          {{create_time | dateFormat}}
        </span>
        <span slot="action" slot-scope="action, record, idx">
          <template v-if="currUser.level !== '' && currUser.level > 3">
            <a v-if="currUser.level !== '' && currUser.level > 3" @click="editHandle(record, idx)">编辑接口权限</a>
            <a-divider type="vertical" />
          </template>
          <template v-if="currUser.level !== '' && currUser.level > 3">
            <a v-if="currUser.level !== '' && currUser.level > 3" @click="editMenuHandle(record, idx)">编辑菜单权限</a>
          </template>
          <!-- <a-divider type="vertical" />
          <a-popconfirm
            title="确定要删除此关联吗？"
            ok-text="删除"
            cancel-text="取消"
            @confirm="delRolePerm(record.id, idx)"
          >
            <a>删除</a>
          </a-popconfirm> -->
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

    <Add :dialog-visible="dialogVisibleAdd" :options-permissions="optionsPermissions" :options-roles="optionsRoles" @changeVisible="changeAddVisible" :small-layout="smallLayout" @refresh="getPermsOfRole" />
    <Edit :edit-item="editItem" :dialog-visible="dialogVisibleEdit" :options-permissions="optionsPermissions" @changeVisible="changeEditVisible" :small-layout="smallLayout" @refresh="getPermsOfRole" />

    <AddMenu :dialog-visible="dialogVisibleAddMenu" :routes-data="routesData" :options-roles="optionsRoles" @changeVisible="changeAddMenuVisible" :small-layout="smallLayout" @refresh="getMenuOfRole" />
    <EditMenu :edit-item="editItem" :dialog-visible="dialogVisibleEditMenu" :routes-data="routesData" @changeVisible="changeEditMenuVisible" :small-layout="smallLayout" @refresh="getMenuOfRole" />
  </div>
</template>

<script>
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
import Cookies from 'js-cookie'
import apiRole from '@/api/myrole'
import apiPermission from '@/api/mypermission'
import apiRoleperm from '@/api/roleperm'
import { routes } from './routes.js'

import Add from './add.vue'
import Edit from './edit.vue'

import AddMenu from './addMenu.vue'
import EditMenu from './editMenu.vue'

var moment = require('moment')
const columns = [
  // {
  //   title: 'ID',
  //   dataIndex: 'id',
  //   key: 'id',
  //   width: 50
  // },
  {
    title: '角色名',
    dataIndex: 'role',
    key: 'role',
    scopedSlots: { customRender: 'role' },
    width: 100
  },
  {
    title: '接口',
    dataIndex: 'perms',
    key: 'perms',
    scopedSlots: { customRender: 'perms' },
    width: 200
  },
  {
    title: '菜单',
    dataIndex: 'menu',
    key: 'menu',
    scopedSlots: { customRender: 'menu' },
    width: 200
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
    width: 210
  }
]

export default {
  components: { Add, Edit, AddMenu, EditMenu },
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
        permissionId: '',
        roleId: ''
      },
      editItem: {},
      editIndex: '',
      dialogVisibleAdd: false,
      dialogVisibleEdit: false,
      dialogVisibleAddMenu: false,
      dialogVisibleEditMenu: false,
      allPermissions: [],
      optionsPermissions: [],
      allRoles: [],
      optionsRoles: [],
      multipleSelection: [],
      listPermsOfRole: [],
      routesData: []
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

    this.getAllPermissions()
    this.getAllRoles()
    // this.getList()
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
      apiRoleperm.fetchList(this.listQuery).then(res => {
        this.listLoading = false
        var resBody = res.data
        if (resBody.code === 0) {
          this.list = resBody.data.item || []
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
      if (this.filterForm.permissionId !== '') {
        this.listQuery.permissionId = this.filterForm.permissionId
      }
      if (this.filterForm.roleId !== '') {
        this.listQuery.roleId = this.filterForm.roleId
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
    changeAddVisible (params) {
      this.dialogVisibleAdd = params
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
      apiRole.getAllRoles().then(res => {
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
    delRolePerm (id, idx) {
      apiRoleperm.deleteRolePerm({ id: id }).then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          this.$message.success('删除成功！')
          this.getList()
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
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    delSome () {
      var requestList = this.multipleSelection.map(async item => {
        return new Promise((resolve, reject) => {
          apiRoleperm.deleteRolePerm({ id: item.id }).then(response => {
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
        this.$message.success('删除成功！')
        this.getList()
      }).catch((result) => {
        console.log(result)
        console.log('失败了')
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
    editHandle (item, idx) {
      this.editItem = JSON.parse(JSON.stringify(item))
      this.editIndex = idx
      this.dialogVisibleEdit = true
    },
    editMenuHandle (item, idx) {
      this.editItem = JSON.parse(JSON.stringify(item))
      this.editIndex = idx
      this.dialogVisibleEditMenu = true
    },
    changeEditVisible (params) {
      this.dialogVisibleEdit = params
    },
    changeAddMenuVisible (params) {
      this.dialogVisibleAddMenu = params
    },
    changeEditMenuVisible (params) {
      this.dialogVisibleEditMenu = params
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
.ant-table td {
  white-space: normal;
}
</style>
