<template>
  <div class="faceContainer">
    <!--搜索-->
    <div class="searchWrap" :style="smallLayout? 'flex-direction: column;': ''">
      <a-form-model ref="searchForm" :model="searchForm" layout="inline">
        <a-form-model-item label="标签" prop="groupId">
          <a-select v-model="searchForm.groupId" :dropdownMatchSelectWidth="false" style="width: 100px;">
            <a-select-option value="">全部</a-select-option>
            <a-select-option :value="item.id" v-for="item in groupsData" v-bind:key="item.id">
              {{item.name}}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="人名" prop="name">
          <a-input v-model="searchForm.name" style="width: 120px;" />
        </a-form-model-item>
        <a-form-model-item label="描述" prop="description">
          <a-input v-model="searchForm.description" style="width: 160px;" />
        </a-form-model-item>
        <a-form-model-item label="创建时间" prop="createTime" format="YYYY-MM-DD" valueFormat="YYYY-MM-DD">
          <a-range-picker :locale="locale" v-model="searchForm.createTime" style="width: 220px;" />
        </a-form-model-item>
        <a-form-model-item>
          <a-button type="primary" @click="searchHandleOk"><a-icon key="search" type="search"/>搜索</a-button>
          <a-button style="margin-left: 10px;" @click="searchHandleReset('searchForm')">重置</a-button>
          <a-button style="margin-left: 10px;" type="primary" @click="addVisible = true"><a-icon key="plus" type="plus"/>创建人像</a-button>
        </a-form-model-item>
      </a-form-model>
    </div>
    <!--搜索 end-->
    <div class="tableWrap">
      <a-table :columns="columns" :data-source="datalist" :scroll="{ x: true, y: tableHeight }" size="middle" rowKey="id" :pagination="false">
        <p slot="description" slot-scope="description">
          <a-popover title="描述" trigger="hover" arrow-point-at-center>
            <template slot="content">
              <p style="width: 300px">{{description}}</p>
            </template>
            <span class="ellipText" style="width: 230px;">{{description}}</span>
          </a-popover>
        </p>
        <p slot="labels" slot-scope="labels">
          <a-popover title="标签" trigger="hover">
            <template slot="content">
              <p style="width: 200px"><template v-for="label in labels">{{label.name}}、</template></p>
            </template>
            <span class="ellipText" style="width: 80px;"><template v-for="label in labels">{{label.name}}、</template></span>
          </a-popover>
        </p>
        <span slot="gender" slot-scope="gender">
          {{!gender? '未知':(gender === 1)? '男': '女'}}
        </span>
        <!-- <span slot="groups" slot-scope="groups">
          <a-popover title="所属分组" trigger="hover" arrow-point-at-center>
            <template slot="content">
              <template v-if="groups">
                <p v-for="(it, k) in groups" :key="k">{{it.name}}</p>
              </template>
            </template>
            <a href="javascript:;" v-if="groups.length">查看分组</a>
          </a-popover>
        </span> -->
        <span slot="features" slot-scope="text, record, index">
          <!-- <a-popover title="" v-for="(i,k) in features" :key="k">
            <template slot="content">
              <img class="tablePopImg" :src="i.fileuri" />
            </template>
            <img class="tableImg" :src="i.fileuri" />
          </a-popover> -->
          <Feature :face="record" @getfacelist="getFaces" v-on:change-cropper-visible="changeCropperVisible($event, record)"></Feature>
        </span>
        <span slot="birthday" slot-scope="birthday">
          {{birthday | birthFormat}}
        </span>
        <span slot="create_time" slot-scope="create_time">
          {{create_time | dateFormat}}
        </span>
        <span slot="action" slot-scope="record, index, idx">
          <a @click="toEdit(record, idx)">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定要删除该人像吗?"
            ok-text="删除"
            cancel-text="取消"
            @confirm="delFace(record, idx)"
          >
            <a>删除</a>
          </a-popconfirm>
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
    <!--创建人像-->
    <a-modal
      title="创建人像"
      v-model="addVisible"
    >
      <div>
        <a-form-model ref="addform" :model="addForm" :rules="ruleValidate" :label-col="{span:4}" :wrapper-col="{span:20}">
          <a-form-model-item label="人名" prop="name">
            <a-input v-model="addForm.name" />
          </a-form-model-item>
          <a-form-model-item label="描述" prop="description">
            <a-input v-model="addForm.description" />
          </a-form-model-item>
          <a-form-model-item label="性别" prop="gender">
            <a-radio-group name="gender" v-model="addForm.gender">
              <a-radio :value="1">男</a-radio><a-radio :value="2">女</a-radio>
            </a-radio-group>
          </a-form-model-item>
          <a-form-model-item label="生日" prop="birthday">
            <a-date-picker :locale="locale" format="YYYY-MM-DD" v-model="addForm.birthday" />
          </a-form-model-item>
          <a-form-model-item label="别名" prop="title">
            <Tag :curr-tags="addForm.title" @commitTag="commitAddTitle"></Tag>
          </a-form-model-item>
          <a-form-model-item label="标签" prop="labelIds">
            <CheckableTag :curr-tags="addForm.labelIds" :option-tags="groupsData" @commitTag="commitAddLabel" @refreshTags="getAllGroups"></CheckableTag>
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
    <!--编辑人像-->
    <a-modal
      title="编辑人像"
      v-model="editVisible"
    >
      <div>
        <a-form-model ref="editform" :model="editForm" :rules="ruleValidate" :label-col="{span:4}" :wrapper-col="{span:20}">
          <a-form-model-item label="人名" prop="name">
            <a-input v-model="editForm.name" />
          </a-form-model-item>
          <a-form-model-item label="描述" prop="description">
            <a-input v-model="editForm.description" />
          </a-form-model-item>
          <a-form-model-item label="性别" prop="gender">
            <a-radio-group name="gender" v-model="editForm.gender">
              <a-radio :value="1">男</a-radio><a-radio :value="2">女</a-radio>
            </a-radio-group>
          </a-form-model-item>
          <a-form-model-item label="生日" prop="birthday">
            <a-date-picker :locale="locale" format="YYYY-MM-DD" v-model="editForm.birthday" />
          </a-form-model-item>
          <a-form-model-item label="别名" prop="title">
            <Tag :curr-tags="editForm.title" @commitTag="commitEditTitle"></Tag>
          </a-form-model-item>
          <a-form-model-item label="标签" prop="labelIds">
            <CheckableTag :curr-tags="editForm.labelIds" :option-tags="groupsData" @commitTag="commitEditLabel" @refreshTags="getAllGroups"></CheckableTag>
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
    <!--图片裁剪-->
    <a-modal
      title="裁剪人像"
      width="800px"
      :footer="null"
      v-model="cropperVisible"
    >
      <CropperImage :show-input-img="true" :show-upload-img="true" :cropper-visible="cropperVisible" @uploadCropperImg="handleAddFeature" ref="child"></CropperImage>
    </a-modal>
  </div>
</template>
<script>
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
import api from '@/api'
import Tag from '@/components/Tag.vue'
import CheckableTag from '@/components/CheckableTag.vue'
import CropperImage from '@/components/Cropper.vue'
import Feature from '@/components/Feature.vue'

var moment = require('moment')
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 50
  },
  {
    title: '人名',
    dataIndex: 'name',
    key: 'name',
    width: 100
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    scopedSlots: { customRender: 'description' },
    width: 250
  },
  {
    title: '生日',
    dataIndex: 'birthday',
    key: 'birthday',
    scopedSlots: { customRender: 'birthday' },
    width: 100
  },
  {
    title: '性别',
    dataIndex: 'gender',
    key: 'gender',
    scopedSlots: { customRender: 'gender' },
    width: 60
  },
  {
    title: '别名',
    dataIndex: 'title',
    key: 'title',
    scopedSlots: { customRender: 'title' },
    width: 100
  },
  {
    title: '标签',
    dataIndex: 'labels',
    key: 'labels',
    scopedSlots: { customRender: 'labels' },
    width: 100
  },
  {
    title: '人像特征图',
    dataIndex: 'features',
    key: 'features',
    scopedSlots: { customRender: 'features' },
    width: 300
  },
  // {
  //   title: '所属分组',
  //   dataIndex: 'groups',
  //   key: 'groups',
  //   scopedSlots: { customRender: 'groups' },
  //   width: 100
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
    width: 120
  }
]

export default {
  beforeRouteEnter (to, from, next) {
    next()
  },
  components: { CropperImage, Feature, Tag, CheckableTag },
  data () {
    return {
      locale,
      imgMaxLength: 5, // 最多上传5张人像图
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
          { required: true, message: '请填写人名', trigger: 'blur' }
        ],
        gender: [
          { required: true, message: '请选择性别', trigger: 'change' }
        ]
      },
      addForm: {
        name: '',
        description: '',
        gender: '',
        birthday: null,
        title: '',
        labelIds: []
      },
      addLoading: false,
      addVisible: false,
      searchForm: {
        name: '',
        description: '',
        groupId: '',
        createTime: []
      },
      editForm: {
        // name: '',
        // description: '',
        // gender: '',
        // birthday: ''
      },
      editLoading: false,
      editItem: {},
      editKey: '',
      editVisible: false,
      previewVisible: false,
      previewImage: '',
      groupsData: [],
      currCropperFace: {},
      cropperVisible: false,
      addFeatureForm: {
        faceId: '',
        file: ''
      }
    }
  },
  filters: {
    birthFormat (val) {
      if (val === '' || val === null) return ''
      return moment(val).format('YYYY-MM-DD')
    },
    dateFormat (val) {
      if (val === '' || val === null) return ''
      return moment(val).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  watch: {
    $route (newVal, oldVal) {
      if (newVal.query && newVal.query.groupId) {
        // 查询分组人像列表
        this.searchForm.groupId = newVal.query.groupId
      }
    }
  },
  mounted () {
    if (this.$route.query && this.$route.query.groupId) {
      // 查询分组人像列表
      this.searchForm.groupId = this.$route.query.groupId
    }

    var viewWidth = document.documentElement.clientWidth
    if (viewWidth < 540) {
      this.smallLayout = true
    }

    var viewHeight = document.documentElement.clientHeight
    var searchH = document.querySelector('.searchWrap') ? (document.querySelector('.searchWrap').clientHeight + 20) : 0
    this.tableHeight = viewHeight - 60 - (60 + 24 * 2) - searchH - (32 + 15 * 2) - 24 - 54

    this.getAllGroups()
    this.getFaces()
  },
  methods: {
    onPageChange (current) {
      this.page_no = current
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getFaces()
    },
    onShowSizeChange (current, pageSize) {
      this.page_size = pageSize
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getFaces()
    },
    searchHandleOk () {
      this.page_no = 1
      if (document.querySelector('.ant-table-body')) {
        document.querySelector('.ant-table-body').scrollTop = 0
      }
      this.getFaces()
    },
    searchHandleReset (formName) {
      this.$refs[formName].resetFields()
    },
    getFaces () {
      var params = {
        page_no: this.page_no,
        page_size: this.page_size
      }
      if (this.searchForm.name) {
        params.name = this.searchForm.name
      }
      if (this.searchForm.description) {
        params.description = this.searchForm.description
      }
      if (this.searchForm.groupId) {
        params.groupId = this.searchForm.groupId
      }
      if (this.searchForm.createTime && this.searchForm.createTime.length === 2) {
        params.createTime = 'range_' + moment(this.searchForm.createTime[0]).format('YYYY-MM-DD') + ',' + moment(this.searchForm.createTime[1]).format('YYYY-MM-DD')
      }

      this.spinning = true
      if (params.groupId) {
        api.getGroupFaces(params).then(res => {
          var resBody = res.data
          if (resBody.code === 0) {
            this.datalist = resBody.data.item
            if (this.page_no === 1) {
              this.dataTotal = resBody.data.total
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
      } else {
        api.getFaces(params).then(res => {
          var resBody = res.data
          if (resBody.code === 0) {
            this.datalist = resBody.data.item
            if (this.page_no === 1) {
              this.dataTotal = resBody.data.total
              this.$store.commit('setFaceTotal', resBody.total)
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
      }
    },
    commitAddTitle (params) {
      this.addForm.title = params.join('|')
    },
    commitAddLabel (params) {
      this.addForm.labelIds = params
    },
    commitEditTitle (params) {
      this.editForm.title = params.join('|')
    },
    commitEditLabel (params) {
      this.editForm.labelIds = params
    },
    handleCancel_add () {
      this.addVisible = false
      this.$refs.addform.resetFields()
    },
    handleAdd (e) {
      this.$refs.addform.validate((valid) => {
        if (valid) {
          var formdata = {
            name: this.addForm.name,
            description: this.addForm.description,
            gender: this.addForm.gender,
            birthday: this.addForm.birthday ? moment(this.addForm.birthday).format('YYYY-MM-DD') : '',
            title: this.addForm.title,
            labelIds: this.addForm.labelIds
          }

          this.addLoading = true
          api.addFace(formdata).then(res => {
            if (res.data.code === 0) {
              this.page_no = 1
              this.getFaces()

              this.addVisible = false
              this.addLoading = false
              this.addForm = {
                name: '',
                description: '',
                gender: '',
                birthday: null,
                title: '',
                labelIds: []
              }
              this.$message.success('人像创建成功')
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
          var formdata = {
            id: this.editForm.id,
            name: this.editForm.name,
            description: this.editForm.description,
            gender: this.editForm.gender,
            birthday: this.editForm.birthday ? moment(this.editForm.birthday).format('YYYY-MM-DD') : '',
            title: this.editForm.title,
            labelIds: this.editForm.labelIds
          }

          this.editLoading = true
          api.editFace(formdata).then(res => {
            if (res.data.code === 0) {
              this.page_no = 1
              this.getFaces()

              this.editVisible = false
              this.editLoading = false
              this.editForm = {}
              this.$message.success('人像编辑成功')
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
    async handlePreview (file) {
      if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj)
      }
      this.previewImage = file.url || file.preview
      this.previewVisible = true
    },
    delFace (record, idx) {
      api.delFace({ id: record.id }).then(res => {
        if (res.data.code === 0) {
          this.getFaces()
          this.$message.success('人像删除成功')
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
    changeCropperVisible (e, record) {
      this.currCropperFace = record
      this.cropperVisible = e
    },
    handleAddFeature (data) {
      console.log(data)
      if (!data.url) {
        this.$message.error('请上传人像图片！')
        return
      }

      this.cropperVisible = false
      var originFileObj = dataURLtoFile(data.url, data.file.name)

      var formdata = new FormData()
      formdata.append('side', data.side)
      formdata.append('file', originFileObj, data.file.name)

      api.addFeature({ faceId: this.currCropperFace.id, formdata: formdata }).then(res => {
        if (res.data.code === 0) {
          this.addFeatureForm = {
            faceId: '',
            file: ''
          }
          // this.$message.success('人像特征创建成功')

          this.getFeature(res.data.data.id)
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
          this.$message.error(error.response.data.message || '创建出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    getFeature (fid) {
      this.$store.commit('setPageSpin', { spinning: true, tip: '等待人像核验...' })
      api.getFeature({ featureId: fid }).then(res => {
        if (res.data.code === 0) {
          var feat = res.data.data
          if (feat.status === 1) {
            this.getFeature(fid)
          } else {
            this.getFaces()
            if (feat.status === 2) {
              this.$store.commit('setPageSpin', { spinning: false })
              this.$message.success('人像核验通过')
            } else if (feat.status === 3) {
              this.$store.commit('setPageSpin', { spinning: false })
              this.$message.error(feat.errorMessage)
            }
          }
        } else {
          this.$message.error(res.data.message || '请求出错！')
        }
      }).catch(error => {
        this.$store.commit('setPageSpin', { spinning: false })
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        if (error.response && error.response.data) {
          this.$message.error(error.response.data.message || '获取人像图出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    getAllGroups () {
      api.getGroups().then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          var groupArr = resBody.data.item
          this.groupsData = groupArr
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
    }
  }
}

// 将base64转换为文件对象
function dataURLtoFile (dataurl, filename) {
  var arr = dataurl.split(',')
  var mime = arr[0].match(/:(.*?);/)[1]
  var bstr = atob(arr[1])
  var n = bstr.length
  var u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  // 转换成file对象
  return new File([u8arr], filename, { type: mime })
  // 转换成成blob对象
  // return new Blob([u8arr],{type:mime});
}

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
.tableImg {
  max-width: 50px;
}
.tableImg + .tableImg {
  margin-left: 5px;
}
.ellipText {
  display: block;
  white-space: nowrap;
  word-break: break-all;
  text-overflow: ellipsis;
  overflow: hidden;
  cursor: pointer;
}
</style>
