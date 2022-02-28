<template>
  <div class="faceContainer">
    <!--搜索-->
    <div class="searchWrap" :style="smallLayout? 'flex-direction: column;': ''">
      <a-form-model ref="searchForm" :model="searchForm" layout="inline">
        <a-form-model-item label="标签名" prop="name">
          <a-input v-model="searchForm.name" style="width: 120px;" />
        </a-form-model-item>
        <a-form-model-item label="创建时间" prop="createTime" format="YYYY-MM-DD" valueFormat="YYYY-MM-DD">
          <a-range-picker :locale="locale" v-model="searchForm.createTime" style="width: 220px;" />
        </a-form-model-item>
        <a-form-model-item>
          <a-button type="primary" @click="searchHandleOk"><a-icon key="search" type="search"/>搜索</a-button>
          <a-button style="margin-left: 10px;" @click="searchHandleReset('searchForm')">重置</a-button>
          <a-button style="margin-left: 10px;" type="primary" @click="addVisible = true"><a-icon key="plus" type="plus"/>创建标签</a-button>
        </a-form-model-item>
      </a-form-model>
    </div>
    <!--搜索 end-->
    <div class="tableWrap">
      <a-table :columns="columns" :data-source="datalist" :scroll="{ x: true, y: tableHeight }" size="middle" rowKey="id" :pagination="false">
        <!-- <span slot="faceNames" slot-scope="faceNames">
          {{faceNames.join(',')}}
        </span> -->
        <span slot="create_time" slot-scope="create_time">
          {{create_time | dateFormat}}
        </span>
        <span slot="action" slot-scope="record, index, idx">
          <!-- <a @click="toEdit(record, idx)">编辑</a>
          <a-divider type="vertical" /> -->
          <a-popconfirm
            title="确定要删除该标签吗?"
            ok-text="删除"
            cancel-text="取消"
            @confirm="delGroup(record, idx)"
          >
            <a>删除</a>
          </a-popconfirm>
          <a-divider type="vertical" />
          <router-link :to="{ path: '/facegroup/face', query: { groupId: record.id }}">查看人像<a-icon type="right" /></router-link>
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
    <!--创建标签-->
    <a-modal
      title="创建标签"
      v-model="addVisible"
    >
      <div>
        <a-form-model ref="addform" :model="addForm" :rules="ruleValidate" :label-col="{span:4}" :wrapper-col="{span:14}">
          <a-form-model-item label="名称" prop="name">
            <a-input v-model="addForm.name" />
          </a-form-model-item>
          <a-form-model-item label="描述" prop="description">
            <a-input v-model="addForm.description" />
          </a-form-model-item>
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
    <!--编辑标签-->
    <a-modal
      title="标签维护"
      width="800px"
      v-model="editVisible"
    >
      <div>
        <a-form-model :model="editForm" :label-col="{span:0}">
          <a-form-model-item label="选择人像">
            <a-transfer
              :data-source="facesDatalist"
              :filter-option="filterOption"
              :showSelectAll="false"
              :showSearch="true"
              :locale="{ itemUnit: '项', itemsUnit: '项', notFoundContent: '列表为空', searchPlaceholder: '请输入搜索内容' }"
              :titles="['人像库', '目标']"
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
                  <template slot="features" slot-scope="features">
                    <template v-for="(fe, key) in features">
                      <img :src="fe.fileuri" :key="key" style="max-width: 50px;max-height: 50px;">
                    </template>
                  </template>
                </a-table>
              </template>
            </a-transfer>
          </a-form-model-item>
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
    <!--图片预览-->
    <a-modal :visible="previewVisible" :footer="null" @cancel="previewVisible = false">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>
<script>
import difference from 'lodash/difference'
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
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 120
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    width: 120
  },
  // {
  //   title: '人像',
  //   dataIndex: 'faceNames',
  //   key: 'faceNames',
  //   scopedSlots: { customRender: 'faceNames' }
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
      tableHeight: 0,
      spinning: false,
      datalist: [],
      dataTotal: 0,
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      page_no: 1,
      page_size: 20,
      columns,
      ruleValidate: {
        name: [
          { required: true, message: '请填写标签名称', trigger: 'blur' }
        ]
        // description: [
        //   { required: true, message: '请填写标签描述', trigger: 'blur' }
        // ]
      },
      addForm: {
        name: '',
        description: ''
      },
      addLoading: false,
      addVisible: false,
      searchForm: {
        name: '',
        createTime: []
      },
      editForm: {
      },
      editLoading: false,
      editItem: {},
      editKey: '',
      editVisible: false,
      previewVisible: false,
      previewImage: '',
      leftColumns: leftTableColumns,
      rightColumns: rightTableColumns,
      targetFaceIds: [],
      targetKeys: [],
      selectedKeys: [],
      facesDatalist: []
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

    this.getGroups()
    this.getAllFaces()
  },
  methods: {
    onPageChange (current) {
      this.page_no = current
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getGroups()
    },
    onShowSizeChange (current, pageSize) {
      this.page_size = pageSize
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getGroups()
    },
    searchHandleOk () {
      this.page_no = 1
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getGroups()
    },
    searchHandleReset (formName) {
      this.$refs[formName].resetFields()
    },
    getGroups () {
      var params = {
        page_no: this.page_no,
        page_size: this.page_size
      }
      if (this.searchForm.name) {
        params.name = this.searchForm.name
      }
      if (this.searchForm.createTime && this.searchForm.createTime.length === 2) {
        params.createTime = 'range_' + moment(this.searchForm.createTime[0]).format('YYYY-MM-DD') + ',' + moment(this.searchForm.createTime[1]).format('YYYY-MM-DD')
      }

      this.spinning = true
      api.getGroups(params).then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          this.datalist = resBody.data.item
          if (this.page_no === 1) {
            this.dataTotal = resBody.data.total
            this.$store.commit('setGroupTotal', resBody.data.total)
          }
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
      this.addForm = {
        name: '',
        description: ''
      }
    },
    handleAdd (e) {
      this.$refs.addform.validate((valid) => {
        if (valid) {
          this.addLoading = true
          api.addGroup(this.addForm).then(res => {
            this.addLoading = false
            if (res.data.code === 0) {
              this.page_no = 1
              this.getGroups()

              this.addVisible = false
              this.addForm = {
                name: '',
                description: ''
              }
              this.$message.success('标签创建成功')
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
      this.targetKeys = this.editForm.faceIds
    },
    handleCancel_edit () {
      this.editVisible = false
      this.editForm = {}
      this.editItem = {}
      this.editKey = ''
      this.targetKeys = []
    },
    handleEdit () {
      if (!this.targetFaceIds.length) {
        this.$message.error('请选择人像！')
        return
      }
      var params = {
        id: this.editItem.id,
        faceIds: this.targetFaceIds
      }

      this.editLoading = true
      api.editGroup(params).then(res => {
        if (res.data.code === 0) {
          this.page_no = 1
          this.getGroups()

          this.editVisible = false
          this.editLoading = false
          this.editForm = {}
          this.$message.success('标签编辑成功')
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
    },
    async handlePreview (file) {
      if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj)
      }
      this.previewImage = file.url || file.preview
      this.previewVisible = true
    },
    delGroup (record, idx) {
      api.delGroup({id: record.id}).then(res => {
        if (res.data.code === 0) {
          this.datalist.splice(idx, 1)
          this.$message.success('标签删除成功')
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
    getAllFaces () {
      api.getFaces().then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          var faceArr = resBody.data.item
          faceArr.map((item, key, arr) => {
            item.key = item.id
            item.title = item.name
          })
          this.facesDatalist = faceArr
        } else {
          this.$message.error(resBody.message || '请求出错！')
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
    filterOption (inputValue, option) {
      return option.title.indexOf(inputValue) > -1
    },
    getRowSelection ({ disabled, selectedKeys, itemSelectAll, itemSelect }) {
      return {
        getCheckboxProps: item => ({ props: { disabled: disabled || item.disabled } }),
        onSelectAll (selected, selectedRows) {
          const treeSelectedKeys = selectedRows
            .filter(item => !item.disabled)
            .map(({ key }) => key)
          const diffKeys = selected
            ? difference(treeSelectedKeys, selectedKeys)
            : difference(selectedKeys, treeSelectedKeys)
          itemSelectAll(diffKeys, selected)
        },
        onSelect ({ key }, selected) {
          itemSelect(key, selected)
        },
        selectedRowKeys: selectedKeys
      }
    },
    handleChange (nextTargetKeys, direction, moveKeys) {
      this.targetKeys = nextTargetKeys
      this.targetFaceIds = nextTargetKeys

      // console.log('targetKeys: ', nextTargetKeys)
      // console.log('direction: ', direction)
      // console.log('moveKeys: ', moveKeys)
    },
    handleSelectChange (sourceSelectedKeys, targetSelectedKeys) {
      this.selectedKeys = [...sourceSelectedKeys, ...targetSelectedKeys]

      // console.log('sourceSelectedKeys: ', sourceSelectedKeys)
      // console.log('targetSelectedKeys: ', targetSelectedKeys)
    }
  }
}

const leftTableColumns = [
  {
    dataIndex: 'title',
    title: '姓名',
    width: '50px',
    scopedSlots: { customRender: 'name' }
  },
  {
    dataIndex: 'features',
    title: '特征图',
    width: '150px',
    scopedSlots: { customRender: 'features' }
  }
]
const rightTableColumns = [
  {
    dataIndex: 'title',
    title: '姓名',
    width: '50px',
    scopedSlots: { customRender: 'name' }
  },
  {
    dataIndex: 'features',
    title: '特征图',
    width: '150px',
    scopedSlots: { customRender: 'features' }
  }
]

function getBase64 (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}
</script>
<style scoped>
</style>
