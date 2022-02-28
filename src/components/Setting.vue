<template>
  <div class="settingWrap">
    <ul>
      <li>
        <p class="title">结果状态：</p>
        <p class="cont">
          <a-tag v-if="taskinfo.resultstatus === 1" color="#f50">发现敏感人物</a-tag>
          <a-tag v-if="taskinfo.resultstatus === 0" color="#87d068">审核通过</a-tag>
        </p>
      </li>
      <li><p class="title">任务名称：</p><p class="cont">{{ taskinfo.name }}</p></li>
      <li><p class="title">任务描述：</p><p class="cont">{{ taskinfo.description }}</p></li>
      <li v-if="taskinfo.type === 1"><p class="title">源文件名：</p><p class="cont">{{ taskinfo.file_name }}</p></li>
      <li v-if="taskinfo.type === 2"><p class="title">直播流地址：</p><p class="cont">{{ taskinfo.url }}</p></li>
      <li><p class="title">状态：</p><p class="cont">{{ taskinfo.statusStr }}</p></li>
      <!-- <li>
        <p class="title">关联人像组：</p>
        <p class="cont">
          <a-popover title="包含人像" trigger="click" arrow-point-at-center>
            <template slot="content">
              <template v-if="facesAboutGroup">
                <p v-for="(it, k) in facesAboutGroup" :key="k">{{it.name}}</p>
              </template>
            </template>
            <a href="javascript:;" v-for="(item, key) in taskinfo.groups" :key="key" @click="getFacesByGroup(item.id)"> {{item.name}} </a>
          </a-popover>
        </p>
      </li> -->
      <!-- <li><p class="title">动态帧率：</p><p class="cont">{{ taskinfo.dynamic_rate === 0 ? '不启用' : taskinfo.dynamic_rate }}</p></li> -->
      <li><p class="title">帧率：</p><p class="cont">{{ taskinfo.frame_rate }}</p></li>
      <li><p class="title">优先级：</p><p class="cont">{{ taskinfo.prority }}</p></li>
      <li v-if="taskinfo.create_time"><p class="title">创建时间：</p><p class="cont">{{ taskinfo.create_time | dateFormat }}</p></li>
      <li v-if="taskinfo.update_time"><p class="title">更新时间：</p><p class="cont">{{ taskinfo.update_time | dateFormat }}</p></li>
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
