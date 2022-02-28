<template>
  <div class="faceContainer">
    <!--搜索-->
    <div class="searchWrap" :style="smallLayout? 'flex-direction: column;': ''">
      <a-form-model ref="searchForm" :model="searchForm" layout="inline">
        <a-form-model-item label="模板名称" prop="name">
          <a-input v-model="searchForm.name" style="width: 120px" />
        </a-form-model-item>
        <a-form-model-item label="用户" prop="user_id" v-if="currUser.level !== '' && currUser.level > 3">
          <a-select v-model="searchForm.user_id" :dropdownMatchSelectWidth="false" show-search :filter-option="userFilterOption" style="width: 100px;">
            <a-select-option value="">全部</a-select-option>
            <a-select-option :value="item.id" v-for="item in allUsers" v-bind:key="item.id">
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
          <a-button v-if="currUser.level !== '' && currUser.level > 3" style="margin-left: 10px;" type="primary" @click="addVisible = true"><a-icon key="plus" type="plus"/>创建模板</a-button>
        </a-form-model-item>
      </a-form-model>
    </div>
    <!--搜索 end-->
    <div class="tableWrap">
      <a-table :columns="columns" :data-source="datalist" :scroll="{ x: true, y: tableHeight }" size="middle" rowKey="id" :pagination="false">
        <span slot="user" slot-scope="user">
          <template v-if="user && user.id">
            <span>{{user.username}}</span>
          </template>
        </span>
        <span slot="create_time" slot-scope="create_time">
          {{create_time | dateFormat}}
        </span>
        <span slot="action" slot-scope="record, index, idx">
          <template v-if="currUser.level !== '' && currUser.level > 3">
            <a @click="toEdit(record, idx)">编辑</a>
            <a-divider type="vertical" />
          </template>
          <template v-if="currUser.level !== '' && currUser.level > 3">
            <a-popconfirm
              title="确定要删除该模板吗?"
              ok-text="删除"
              cancel-text="取消"
              @confirm="delTemp(record, idx)"
            >
              <a>删除</a>
            </a-popconfirm>
            <a-divider type="vertical" />
          </template>
          <template v-if="currUser.level !== '' && currUser.level > 3">
            <a @click="toModeAssign(record, idx)">关联用户</a>
          </template>
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
    <!--创建模板-->
    <a-modal
      title="创建模板"
      width="800px"
      v-model="addVisible"
    >
      <div>
        <a-form-model ref="addform" :model="addForm" :rules="ruleValidate" :label-col="{span:4}" :wrapper-col="{span:20}">
          <a-form-model-item label="名称" prop="name">
            <a-input v-model="addForm.name" />
          </a-form-model-item>
          <a-form-model-item label="帧率" prop="frame_rate" extra="扫描检测时每秒时长抽取的画面帧数">
            <a-select v-model="addForm.frame_rate">
              <a-select-option :value="0">原始帧率</a-select-option>
              <a-select-option :value="5">5</a-select-option>
              <a-select-option :value="10">10</a-select-option>
              <a-select-option :value="15">15</a-select-option>
              <a-select-option :value="20">20</a-select-option>
              <a-select-option :value="25">25</a-select-option>
            </a-select>
          </a-form-model-item>
          <!-- <a-form-model-item label="动态帧率" prop="dynamic_rate">
            <a-select v-model="addForm.dynamic_rate" :disabled="addForm.frame_rate > 0" @change="handleChangeDynamicRate">
              <a-select-option :value="0">不启用</a-select-option>
              <a-select-option :value="5">5</a-select-option>
              <a-select-option :value="10">10</a-select-option>
              <a-select-option :value="15">15</a-select-option>
              <a-select-option :value="20">20</a-select-option>
              <a-select-option :value="25">25</a-select-option>
            </a-select>
          </a-form-model-item> -->
          <a-form-model-item label="优先级" prop="prority" extra="数值越大，任务越先执行">
            <a-select v-model="addForm.prority">
              <a-select-option :value="item" :key="k" v-for="(item, k) in 3">{{item}}</a-select-option>
            </a-select>
          </a-form-model-item>
          <!-- <a-form-model-item label="选择人像组">
            <a-transfer
              :data-source="groupsDatalist"
              :filter-option="filterOption"
              :showSelectAll="false"
              :showSearch="true"
              :locale="{ itemUnit: '项', itemsUnit: '项', notFoundContent: '列表为空', searchPlaceholder: '请输入搜索内容' }"
              :titles="['人像组', '目标']"
              :target-keys="targetKeys"
              :selected-keys="selectedKeys"
              :list-style="{width: smallLayout?'100%':'200px', height: '260px'}"
              @change="handleChange"
              @selectChange="handleSelectChange">
              <template
                slot="children"
                slot-scope="{
                  props: { direction, filteredItems, selectedKeys, disabled: listDisabled },
                  on: { itemSelectAll, itemSelect },
                }"
              >
                <a-table
                  :row-selection="
                    getRowSelection({ disabled: listDisabled, selectedKeys, itemSelectAll, itemSelect })
                  "
                  :columns="direction === 'left' ? leftColumns : rightColumns"
                  :data-source="filteredItems"
                  :pagination="{ pageSize: 10 }"
                  size="small"
                  :style="{ pointerEvents: listDisabled ? 'none' : null }"
                  :custom-row="
                    ({ key, disabled: itemDisabled }) => ({
                      on: {
                        click: () => {
                          if (itemDisabled || listDisabled) return;
                          itemSelect(key, !selectedKeys.includes(key));
                        },
                      },
                    })
                  "
                  >
                  <template slot="title" slot-scope="item">
                    <a href="javascript:;">{{item.title}}</a>
                  </template>
                </a-table>
              </template>
            </a-transfer>
          </a-form-model-item> -->
        </a-form-model>
      </div>
      <template slot="footer">
        <a-button key="back" @click="handleCancel_add">
          取消
        </a-button>
        <a-button key="submit" type="primary" :loading="addLoading" @click="handleAdd">
          创建
        </a-button>
      </template>
    </a-modal>
    <!--编辑模板-->
    <a-modal
      title="模板维护"
      width="800px"
      v-model="editVisible"
    >
      <div>
        <a-form-model ref="editform" :model="editForm" :rules="ruleValidate" :label-col="{span:4}" :wrapper-col="{span:20}">
          <a-form-model-item label="名称" prop="name">
            <a-input v-model="editForm.name" />
          </a-form-model-item>
          <a-form-model-item label="帧率" prop="frame_rate" extra="扫描检测时每秒时长抽取的画面帧数">
            <a-select v-model="editForm.frame_rate">
              <a-select-option :value="0">原始帧率</a-select-option>
              <a-select-option :value="5">5</a-select-option>
              <a-select-option :value="10">10</a-select-option>
              <a-select-option :value="15">15</a-select-option>
              <a-select-option :value="20">20</a-select-option>
              <a-select-option :value="25">25</a-select-option>
            </a-select>
          </a-form-model-item>
          <!-- <a-form-model-item label="动态帧率" prop="dynamic_rate">
            <a-select v-model="editForm.dynamic_rate" :disabled="editForm.frame_rate > 0" @change="handleChangeDynamicRate_edit">
              <a-select-option :value="0">不启用</a-select-option>
              <a-select-option :value="5">5</a-select-option>
              <a-select-option :value="10">10</a-select-option>
              <a-select-option :value="15">15</a-select-option>
              <a-select-option :value="20">20</a-select-option>
              <a-select-option :value="25">25</a-select-option>
            </a-select>
          </a-form-model-item> -->
          <a-form-model-item label="优先级" prop="prority" extra="数值越大，任务越先执行">
            <a-select v-model="editForm.prority">
              <a-select-option :value="item" :key="k" v-for="(item, k) in 3">{{item}}</a-select-option>
            </a-select>
          </a-form-model-item>
          <!-- <a-form-model-item label="选择人像组">
            <a-transfer
              :data-source="groupsDatalist"
              :filter-option="filterOption"
              :showSelectAll="false"
              :showSearch="true"
              :locale="{ itemUnit: '项', itemsUnit: '项', notFoundContent: '列表为空', searchPlaceholder: '请输入搜索内容' }"
              :titles="['人像组', '目标']"
              :target-keys="targetKeys"
              :selected-keys="selectedKeys"
              :list-style="{width: smallLayout?'100%':'200px', height: '260px'}"
              @change="handleChange"
              @selectChange="handleSelectChange">
              <template
                slot="children"
                slot-scope="{
                  props: { direction, filteredItems, selectedKeys, disabled: listDisabled },
                  on: { itemSelectAll, itemSelect },
                }"
              >
                <a-table
                  :row-selection="
                    getRowSelection({ disabled: listDisabled, selectedKeys, itemSelectAll, itemSelect })
                  "
                  :columns="direction === 'left' ? leftColumns : rightColumns"
                  :data-source="filteredItems"
                  :pagination="{ pageSize: 10 }"
                  size="small"
                  :style="{ pointerEvents: listDisabled ? 'none' : null }"
                  :custom-row="
                    ({ key, disabled: itemDisabled }) => ({
                      on: {
                        click: () => {
                          if (itemDisabled || listDisabled) return;
                          itemSelect(key, !selectedKeys.includes(key));
                        },
                      },
                    })
                  "
                  >
                  <template slot="title" slot-scope="item">
                    <a href="javascript:;">{{item.title}}</a>
                  </template>
                </a-table>
              </template>
            </a-transfer>
          </a-form-model-item> -->
        </a-form-model>
      </div>
      <template slot="footer">
        <a-button key="back" @click="handleCancel_edit">
          取消
        </a-button>
        <a-button key="submit" type="primary" :loading="editLoading" @click="handleEdit">
          更新
        </a-button>
      </template>
    </a-modal>

    <TempAssign :edit-item="editItem" :options-users="allUsers" :small-layout="smallLayout" :dialog-visible="modeAssignVisible" @changeVisible="changeModeAssignVisible" @refresh="getTemps" />
  </div>
</template>
<script>
// import difference from 'lodash/difference'
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
import api from '@/api'
import apiAdmin from '@/api/admin'
import TempAssign from '@/components/TempAssign'

var moment = require('moment')
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 90
  },
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 120
  },
  {
    title: '帧率',
    dataIndex: 'frame_rate',
    key: 'frame_rate',
    width: 90
  },
  // {
  //   title: '动态帧率',
  //   dataIndex: 'dynamic_rate',
  //   key: 'dynamic_rate',
  //   width: 90
  // },
  {
    title: '优先级',
    dataIndex: 'prority',
    key: 'prority',
    width: 90
  },
  {
    title: '关联用户',
    dataIndex: 'user',
    key: 'user',
    scopedSlots: { customRender: 'user' },
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
    width: 180
  }
]

export default {
  components: { TempAssign },
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
      ruleValidate: {
        name: [
          { required: true, message: '请填写模板名称', trigger: 'blur' }
        ],
        frame_rate: [
          { required: true, message: '请选择帧率', trigger: 'change' }
        ],
        // dynamic_rate: [
        //   { required: true, message: '请选择动态帧率', trigger: 'change' }
        // ],
        prority: [
          { required: true, message: '请选择优先级', trigger: 'change' }
        ]
      },
      addForm: {
        name: '',
        frame_rate: 5,
        // dynamic_rate: 0,
        prority: 1
      },
      addLoading: false,
      addVisible: false,
      searchForm: {
        name: '',
        user_id: '',
        createTime: []
      },
      editForm: {
      },
      editLoading: false,
      editItem: {},
      editKey: '',
      editVisible: false,
      // leftColumns: leftTableColumns,
      // rightColumns: rightTableColumns,
      // targetGroupIds: [],
      // targetKeys: [],
      // selectedKeys: [],
      // groupsDatalist: [],
      allUsers: [],
      modeAssignVisible: false
    }
  },
  filters: {
    dateFormat (val) {
      if (val === '' || val === null) return ''
      return moment(val).format('YYYY-MM-DD HH:mm:ss')
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
    var viewWidth = document.documentElement.clientWidth
    if (viewWidth < 540) {
      this.smallLayout = true
    }

    var viewHeight = document.documentElement.clientHeight
    var searchH = document.querySelector('.searchWrap') ? (document.querySelector('.searchWrap').clientHeight + 20) : 0
    this.tableHeight = viewHeight - 60 - (60 + 24 * 2) - searchH - (32 + 15 * 2) - 24 - 54

    this.getTemps()
    // this.getAllGroups()
    this.getAllUsers()
  },
  methods: {
    userFilterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    onPageChange (current) {
      this.page_no = current
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getTemps()
    },
    onShowSizeChange (current, pageSize) {
      this.page_size = pageSize
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getTemps()
    },
    searchHandleOk () {
      this.page_no = 1
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getTemps()
    },
    searchHandleReset (formName) {
      this.$refs[formName].resetFields()
    },
    getTemps () {
      var params = {
        page_no: this.page_no,
        page_size: this.page_size
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
      api.getTemps(params).then(res => {
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
          this.$message.error(error.response.data.message || '获取人像库出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    handleCancel_add () {
      this.addVisible = false
      this.$refs.addform.resetFields()
    },
    handleAdd (e) {
      this.$refs.addform.validate((valid) => {
        if (valid) {
          if (this.addForm.frame_rate === '') {
            this.$message.error('请选择帧率！')
            return
          }
          // if (!this.targetGroupIds.length) {
          //   this.$message.error('请选择人像组！')
          //   return
          // } else {
          //   this.addForm.group_ids = this.targetGroupIds.join(',')
          // }
          console.log(this.addForm)
          this.addLoading = true
          api.addTemp(this.addForm).then(res => {
            if (res.data.code === 0) {
              this.page_no = 1
              this.getTemps()

              this.addVisible = false
              this.addLoading = false
              this.addForm = {
                frame_rate: 5,
                // dynamic_rate: 0,
                prority: 1
              }
              this.$message.success('模板创建成功')
            } else {
              this.$message.error(res.data.message || '请求出错！')
            }
          }).catch(error => {
            this.addLoading = false
            if (error.response && error.response.status === 401) {
              this.$store.dispatch('authentication/resetToken').then(() => {
                this.$router.push({ path: '/login' })
              })
            }
            if (error.response && error.response.data) {
              this.$message.error(error.response.data.message || '创建出错！')
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
    toEdit (item, key) {
      this.editVisible = true
      this.editItem = item
      this.editKey = key
      this.editForm = item
      // this.targetKeys = this.editForm.group_ids.split(',')
      // this.targetGroupIds = this.targetKeys
    },
    handleCancel_edit () {
      this.editVisible = false
      this.$refs.editform.resetFields()
      this.editForm = {}
      this.editItem = {}
      this.editKey = ''
      // this.targetKeys = []
      // this.targetGroupIds = []
    },
    handleEdit () {
      this.$refs.editform.validate((valid) => {
        if (valid) {
          if (this.editForm.frame_rate === '') {
            this.$message.error('请选择帧率！')
            return
          }
          // if (!this.targetGroupIds.length) {
          //   this.$message.error('请选择人像组！')
          //   return
          // }
          var params = {
            id: this.editItem.id,
            name: this.editForm.name,
            frame_rate: this.editForm.frame_rate,
            // dynamic_rate: this.editForm.dynamic_rate,
            prority: this.editForm.prority
            // group_ids: this.targetGroupIds.join(',')
          }

          this.editLoading = true
          api.editTemp(params).then(res => {
            if (res.data.code === 0) {
              this.page_no = 1
              this.getTemps()

              this.editVisible = false
              this.editLoading = false
              this.editForm = {}
              this.$message.success('模板编辑成功')
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
    delTemp (record, idx) {
      api.delTemp({id: record.id}).then(res => {
        if (res.data.code === 0) {
          this.datalist.splice(idx, 1)
          this.$message.success('模板删除成功')
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
    //       this.groupsDatalist = groupArr
    //     } else {
    //       this.$message.error(resBody.message || '请求出错！')
    //     }
    //   }).catch(error => {
    //     console.log(error)
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
    // filterOption (inputValue, option) {
    //   return option.title.indexOf(inputValue) > -1
    // },
    // getRowSelection ({ disabled, selectedKeys, itemSelectAll, itemSelect }) {
    //   return {
    //     getCheckboxProps: item => ({ props: { disabled: disabled || item.disabled } }),
    //     onSelectAll (selected, selectedRows) {
    //       const treeSelectedKeys = selectedRows
    //         .filter(item => !item.disabled)
    //         .map(({ key }) => key)
    //       const diffKeys = selected
    //         ? difference(treeSelectedKeys, selectedKeys)
    //         : difference(selectedKeys, treeSelectedKeys)
    //       itemSelectAll(diffKeys, selected)
    //     },
    //     onSelect ({ key }, selected) {
    //       itemSelect(key, selected)
    //     },
    //     selectedRowKeys: selectedKeys
    //   }
    // },
    // handleChange (nextTargetKeys, direction, moveKeys) {
    //   this.targetKeys = nextTargetKeys
    //   this.targetGroupIds = nextTargetKeys

    //   // console.log('targetKeys: ', nextTargetKeys)
    //   // console.log('direction: ', direction)
    //   // console.log('moveKeys: ', moveKeys)
    // },
    // handleSelectChange (sourceSelectedKeys, targetSelectedKeys) {
    //   this.selectedKeys = [...sourceSelectedKeys, ...targetSelectedKeys]

    //   // console.log('sourceSelectedKeys: ', sourceSelectedKeys)
    //   // console.log('targetSelectedKeys: ', targetSelectedKeys)
    // },
    getAllUsers () {
      apiAdmin.getAllUsers().then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          var allUsers = resBody.data.item || []
          allUsers.map((item, key, arr) => {
            item.key = '' + item.id
            item.title = item.username
          })
          this.allUsers = allUsers
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
    toModeAssign (item, key) {
      this.modeAssignVisible = true
      this.editItem = item
    },
    changeModeAssignVisible (param) {
      this.modeAssignVisible = param
    }
    // handleChangeFrameRate (val) {
    //   if (val !== 0) {
    //     this.addForm.dynamic_rate = 0
    //   }
    // },
    // handleChangeDynamicRate (val) {
    //   if (val !== 0) {
    //     this.addForm.frame_rate = 0
    //   }
    // },
    // handleChangeFrameRate_edit (val) {
    //   if (val !== 0) {
    //     this.editForm.dynamic_rate = 0
    //   }
    // },
    // handleChangeDynamicRate_edit (val) {
    //   if (val !== 0) {
    //     this.editForm.frame_rate = 0
    //   }
    // }
  }
}

// const leftTableColumns = [
//   {
//     dataIndex: 'title',
//     title: '名称',
//     scopedSlots: { customRender: 'name' }
//   }
// ]
// const rightTableColumns = [
//   {
//     dataIndex: 'title',
//     title: '名称',
//     scopedSlots: { customRender: 'name' }
//   }
// ]
</script>
<style scoped>
</style>
