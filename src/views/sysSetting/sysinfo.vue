<template>
  <div class="faceContainer mydesc">
<!--     <div class="subTitle">软件信息</div>
    <a-row :gutter="16">
      <a-col :span="8">
        <a-statistic title="名称" :value="deviceInfo && deviceInfo.software && deviceInfo.software.name" style="margin-right: 30px">
        </a-statistic>
      </a-col>
      <a-col :span="8">
        <a-statistic title="版本" :value="deviceInfo && deviceInfo.software && deviceInfo.software.version">
        </a-statistic>
      </a-col>
    </a-row>
    <div class="subTitle">系统信息</div>
    <a-row :gutter="16">
      <a-col :span="8">
        <a-statistic title="运行状态" :value="deviceInfo && deviceInfo.system && deviceInfo.system.uptime" style="margin-right: 30px">
        </a-statistic>
      </a-col>
      <a-col :span="8">
        <a-statistic title="磁盘总空间" :value="(parseInt(deviceInfo.system.Mem.total) / 1024).toFixed(3)" style="margin-right: 30px">
          <template #suffix>
            <span> GB</span>
          </template>
        </a-statistic>
      </a-col>
      <a-col :span="8">
        <a-statistic title="磁盘剩余空间" :value="(parseInt(deviceInfo.system.Mem.avail) / 1024).toFixed(3)">
          <template #suffix>
            <span> GB</span>
          </template>
        </a-statistic>
      </a-col>
    </a-row>
    <div class="subTitle">人像库</div>
    <a-row :gutter="16">
      <a-col :span="8">
        <a-statistic title="总数" :value="deviceInfo && deviceInfo.facedata && deviceInfo.facedata.total" style="margin-right: 30px">
        </a-statistic>
      </a-col>
      <a-col :span="8">
        <a-statistic title="图片总数" :value="deviceInfo && deviceInfo.facedata && deviceInfo.facedata.total_images" style="margin-right: 30px">
        </a-statistic>
      </a-col>
      <a-col :span="8">
        <a-statistic title="更新时间" :value="deviceInfo && deviceInfo.facedata && deviceInfo.facedata.update_time | dateFormat">
        </a-statistic>
      </a-col>
    </a-row> -->

    <a-descriptions bordered title="软件信息" size="middle" style="margin-top: 20px;">
      <a-descriptions-item label="名称" :span="3">
        {{ deviceInfo && deviceInfo.software && deviceInfo.software.name }}
      </a-descriptions-item>
      <a-descriptions-item label="版本" :span="3">
        {{ deviceInfo && deviceInfo.software && deviceInfo.software.version }}
      </a-descriptions-item>
    </a-descriptions>
    <a-descriptions bordered title="系统信息" size="middle" style="margin-top: 20px;">
      <a-descriptions-item label="运行状态" :span="3">
        {{ deviceInfo && deviceInfo.system && deviceInfo.system.uptime }}
      </a-descriptions-item>
      <!-- <a-descriptions-item label="CPU" :span="3">
        <template v-for="(it, k) in (deviceInfo && deviceInfo.system && deviceInfo.system.CPU)">
          <p :key="k">{{k}} : {{it}}</p>
        </template>
      </a-descriptions-item> -->
      <a-descriptions-item label="磁盘空间" :span="3">
        <template v-if="deviceInfo && deviceInfo.system && deviceInfo.system.Mem">
          <p>总空间 : {{(parseInt(deviceInfo.system.Mem.total) / 1024).toFixed(3)}} GB</p>
          <p>剩余空间 : {{(parseInt(deviceInfo.system.Mem.avail) / 1024).toFixed(3)}} GB</p>
        </template>
      </a-descriptions-item>
    </a-descriptions>
    <a-descriptions bordered title="人像库" size="middle" style="margin-top: 20px;">
      <a-descriptions-item label="总数" :span="3">
        {{ deviceInfo && deviceInfo.facedata && deviceInfo.facedata.total }}
      </a-descriptions-item>
      <a-descriptions-item label="图片总数" :span="3">
        {{ deviceInfo && deviceInfo.facedata && deviceInfo.facedata.total_images }}
      </a-descriptions-item>
      <!-- <a-descriptions-item label="版本" :span="3">
        {{ deviceInfo && deviceInfo.facedata && deviceInfo.facedata.version }}
      </a-descriptions-item> -->
      <a-descriptions-item label="更新时间" :span="3">
        {{ deviceInfo && deviceInfo.facedata && deviceInfo.facedata.update_time | dateFormat }}
      </a-descriptions-item>
    </a-descriptions>
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
      deviceInfo: {}
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

    this.getDeviceInfo()
  },
  methods: {
    getDeviceInfo () {
      this.spinning = true
      api.getDeviceInfo().then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          this.deviceInfo = resBody.data
          console.log(this.deviceInfo)
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
    }
  }
}

</script>
<style scoped>
</style>
