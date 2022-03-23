<template>
  <div class="faceContainer mydesc">

    <p style="text-align: center;margin: 20px 0;">
      <a-button type="primary" @click="uploadVisible = true"><a-icon type="import" /> 导入 </a-button>
      <a-button type="primary" style="margin-left: 10px;" @click="toExport" :loading="exporting"><a-icon v-if="!exporting" type="export" /> 导出 </a-button>
    </p>

    <!--导入-->
    <a-modal
      title="导入"
      width="600px"
      v-model="uploadVisible"
    >
      <div>
        <a-upload
          name="configFile"
          :multiple="false"
          @change="handleChange"
        >
          <a-button> <a-icon type="upload" /> 选择文件 </a-button>
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

export default {
  beforeRouteEnter (to, from, next) {
    next()
  },
  data () {
    return {
      locale,
      smallLayout: false,
      uploadVisible: false,
      uploading: false,
      fileList: [],
      exporting: false
    }
  },
  mounted () {
    var viewWidth = document.documentElement.clientWidth
    if (viewWidth < 540) {
      this.smallLayout = true
    }
  },
  methods: {
    handleChange ({ file, fileList }) {
      this.fileList = fileList
      return false
    },
    handleUpload () {
      if (this.uploading) {
        return
      }
      if (!this.fileList.length) {
        this.$message.error('请选择文件！')
        return
      }

      var formdata = new FormData()
      formdata.append('file', this.fileList[0].originFileObj, this.fileList[0].name)
      this.uploading = true
      api.importConfig(formdata).then(res => {
        this.uploading = false
        if (res.data.code === 0) {
          this.uploadVisible = false
          this.fileList = []
          this.$message.success('导入成功')
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
    },
    toExport () {
      if (this.exporting) {
        return
      }
      this.exporting = true
      api.exportConfig().then(res => {
        this.exporting = false
        if (res.data.code === 0) {
          this.toDownload(res.data.data.filepath)
        } else {
          this.$message.error(res.data.message || '请求出错！')
        }
      }).catch(error => {
        this.exporting = false
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
    toDownload (filepath) {
      var name = filepath.substr(filepath.lastIndexOf('/') + 1)
      var aLink = document.createElement('a')
      aLink.style.display = 'none'
      aLink.href = filepath
      aLink.setAttribute('target', '_blank')
      aLink.setAttribute('download', name)
      document.body.appendChild(aLink)
      aLink.click()
      document.body.removeChild(aLink) // 下载完成移除元素
    }
  }
}

</script>
<style scoped>
</style>
