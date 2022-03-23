<template>
  <div class="faceContainer mydesc">
    <!-- <div class="subTitle">磁盘清理策略<a-button key="submit" type="primary" style="float: right;" @click="toEdit">修改配置</a-button></div>
    <a-row :gutter="16">
      <a-col :span="6">
        <a-statistic title="空间占用百分比" :value="deviceInfo && deviceInfo.space_limit" style="margin-right: 30px">
          <template #suffix>
            <span> %</span>
          </template>
        </a-statistic>
      </a-col>
      <a-col :span="6">
        <a-statistic title="空间满额自动删除" :value="deviceInfo && deviceInfo.space_enable === 1 ? '启用' : '禁用'" :value-style="{ color: deviceInfo.space_enable === 1 ? '#3f8600' : '#cf1322' }" style="margin-right: 30px">
        </a-statistic>
      </a-col>
      <a-col :span="6">
        <a-statistic title="过期天数" :value="deviceInfo && deviceInfo.days_limit" style="margin-right: 30px">
          <template #suffix>
            <span> 天</span>
          </template>
        </a-statistic>
      </a-col>
      <a-col :span="6">
        <a-statistic title="过期自动删除" :value="deviceInfo && deviceInfo.days_enable === 1 ? '启用' : '禁用'" :value-style="{ color: deviceInfo.space_enable === 1 ? '#3f8600' : '#cf1322' }">
        </a-statistic>
      </a-col>
    </a-row> -->
    <a-descriptions bordered title="磁盘清理策略" size="middle" :column="{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }" style="margin-top: 20px;">
      <a-descriptions-item label="空间占用百分比">
        {{ deviceInfo && deviceInfo.space_limit }}
      </a-descriptions-item>
      <a-descriptions-item label="空间满额自动删除">
        {{ deviceInfo && deviceInfo.space_enable === 1 ? '启用' : '禁用' }}
      </a-descriptions-item>
      <a-descriptions-item label="过期天数">
        {{ deviceInfo && deviceInfo.days_limit }}
      </a-descriptions-item>
      <a-descriptions-item label="过期自动删除">
        {{ deviceInfo && deviceInfo.days_enable === 1 ? '启用' : '禁用' }}
      </a-descriptions-item>
    </a-descriptions>
    <p style="text-align: center;margin: 20px 0;">
      <a-button key="submit" type="primary" @click="toEdit">修改配置</a-button>
      <!-- <a-button type="primary" style="margin-left: 10px;" @click="uploadVisible = true"><a-icon type="upload" /> 上传配置文件 </a-button> -->
    </p>

    <!--编辑设备存储配置-->
    <a-modal
      title="编辑设备存储配置"
      width="600px"
      v-model="editVisible"
    >
      <div>
        <a-form-model ref="editform" :model="editForm" :rules="ruleValidate" :label-col="{span:8}" :wrapper-col="{span:16}">
          <a-form-model-item label="空间占用百分比" prop="space_limit">
            <a-input-number v-model="editForm.space_limit" :min="30" :max="90" />
          </a-form-model-item>
          <a-form-model-item label="空间满额自动删除" prop="space_enable">
            <a-radio-group v-model="editForm.space_enable" default-value="a" button-style="solid">
              <a-radio-button :value="1">启用</a-radio-button>
              <a-radio-button :value="0">禁用</a-radio-button>
            </a-radio-group>
          </a-form-model-item>
          <a-form-model-item label="过期天数" prop="days_limit">
            <a-input-number v-model="editForm.days_limit" :min="15" :max="90" />
          </a-form-model-item>
          <a-form-model-item label="过期自动删除" prop="days_enable">
            <a-radio-group v-model="editForm.days_enable" default-value="a" button-style="solid">
              <a-radio-button :value="1">启用</a-radio-button>
              <a-radio-button :value="0">禁用</a-radio-button>
            </a-radio-group>
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

    <!--上传配置文件-->
    <a-modal
      title="上传配置文件"
      width="600px"
      v-model="uploadVisible"
    >
      <div>
        <a-upload
          name="configFile"
          :multiple="false"
          @change="handleChange"
        >
          <a-button> <a-icon type="upload" /> 选择配置文件 </a-button>
        </a-upload>
      </div>
      <template slot="footer">
        <a-button key="back" @click="uploadVisible = false;fileList = [];">
          取消
        </a-button>
        <a-button key="submit" type="primary" :disabled="fileList.length === 0" :loading="uploading" @click="handleUpload">
          上传
        </a-button>
      </template>
    </a-modal>
  </div>
</template>
<script>
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
import api from '@/api/action'

var moment = require('moment')

export default {
  beforeRouteEnter (to, from, next) {
    next()
  },
  data () {
    return {
      locale,
      smallLayout: false,
      spinning: false,
      deviceInfo: {},
      editLoading: false,
      editVisible: false,
      editForm: {},
      ruleValidate: {
        space_limit: [
          { required: true, message: 'Bspace_limit不能为空', trigger: 'blur' }
        ],
        space_enable: [
          { required: true, message: 'space_enable不能为空', trigger: 'change' }
        ],
        days_limit: [
          { required: true, message: 'days_limit不能为空', trigger: 'blur' }
        ],
        days_enable: [
          { required: true, message: 'days_enable不能为空', trigger: 'change' }
        ]
      },
      uploadVisible: false,
      uploading: false,
      fileList: []
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

    this.getDeviceStorage()
  },
  methods: {
    getDeviceStorage () {
      this.spinning = true
      api.getDeviceStorage().then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          this.deviceInfo = resBody.data
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
          this.$message.error(error.response.data.message || '获取设备信息出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    toEdit () {
      this.editVisible = true
      this.editForm = this.deviceInfo
    },
    reset () {
      this.$refs.editform.resetFields()
      this.editVisible = false
    },
    handleEdit () {
      this.$refs.editform.validate((valid) => {
        if (valid) {
          var params = {
            space_limit: this.editForm.space_limit,
            space_enable: this.editForm.space_enable,
            days_limit: this.editForm.days_limit,
            days_enable: this.editForm.days_enable
          }

          this.editLoading = true
          api.editStorage(params).then(res => {
            if (res.data.code === 0) {
              this.page_no = 1
              this.getDeviceStorage()

              this.editVisible = false
              this.editLoading = false
              this.editForm = {}
              this.$message.success('设备存储信息编辑成功')
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
    handleChange ({ file, fileList }) {
      console.log(fileList)
      this.fileList = fileList
      return false
    },
    handleUpload () {
      if (!this.fileList.length) {
        this.$message.error('请选择配置文件！')
        return
      }

      var formdata = new FormData()
      formdata.append('file', this.fileList[0].originFileObj, this.fileList[0].name)
      this.uploading = true
      api.addConfig(formdata).then(res => {
        this.uploading = false
        if (res.data.code === 0) {
          this.uploadVisible = false
          this.fileList = []
          this.$message.success('配置文件上传成功')
        } else {
          this.$message.error(res.data.message || '请求出错！')
        }
      }).catch(error => {
        this.uploading = false
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
    }
  }
}

</script>
<style scoped>
</style>
