<template>
  <div>
    <div class="imgAllWrap">
      <div class="imgWrap"><img class="img" :src="channelUrl1"></div>
      <div class="imgWrap"><img class="img" :src="channelUrl2"></div>
      <div class="imgWrap"><img class="img" :src="channelUrl3"></div>
      <div class="imgWrap"><img class="img" :src="channelUrl4"></div>
    </div>
  </div>
</template>
<script>
import api from '@/api'
export default {
  data () {
    return {
      channelId: null,
      channelUrl1: '',
      channelUrl2: '',
      channelUrl3: '',
      channelUrl4: ''
    }
  },
  mounted () {
    this.getUrl(1)
    this.getUrl(2)
    this.getUrl(3)
    this.getUrl(4)
  },
  methods: {
    getUrl (channelId) {
      api.channelJiankan({ id: channelId }).then(res => {
        if (res.data.code === 0) {
          this['channelUrl' + channelId] = res.data.data.url
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
          this.$message.error(error.response.data.message || '获取url出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    }
  }
}
</script>
<style scoped>
.imgAllWrap {
  width: 100%;
  height: calc(100vh - 60px);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-around;
}
.imgWrap {
  width: 50%;
  height: 50%;
  border: 1px solid #ddd;
}
.img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  margin: 0 auto;
  min-height: 200px;
}
</style>
