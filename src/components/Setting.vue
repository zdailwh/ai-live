<template>
  <div class="settingWrap">
    <ul>
      <li v-if="taskinfo.timestamp"><p class="title">时间戳：</p><p class="cont">{{ taskinfo.timestamp }}</p></li>
      <li v-if="taskinfo.url"><p class="title">url：</p><p class="cont">{{ taskinfo.url }}</p></li>
    </ul>
  </div>
</template>
<script>
import api from '@/api'
var moment = require('moment')
export default {
  props: [ 'taskinfo' ],
  data () {
    return {
      facesAboutGroup: []
    }
  },
  filters: {
    dateFormat (val) {
      if (val === '' || val === null) return ''
      return moment(val).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  watch: {
    taskinfo (val, oldVal) {
    }
  },
  methods: {
    getFacesByGroup (groupId) {
      this.loadingFacesOfGroup = true
      api.getGroupFaces({groupId: groupId}).then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          this.facesAboutGroup = resBody.data.item
          this.loadingFacesOfGroup = false
        } else {
          this.$message.error(resBody.message || '请求出错！')
        }
      }).catch(error => {
        this.loadingFacesOfGroup = false
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
  }
}
</script>
<style scoped>
.settingWrap {
  padding: 0 10px;
}
.settingWrap li {
  display: flex;
  line-height: 35px;
}
.settingWrap .title {
  width: 100px;
  text-align: right;
  margin-right: 15px;
}
.settingWrap .cont {
  flex: 1;
  color: #fff;
}
</style>
