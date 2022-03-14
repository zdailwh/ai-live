<template>
  <div>
    <div class="imgWrap">
      <img class="img" :src="channelUrl">
    </div>
  </div>
</template>
<script>
import api from '@/api'
export default {
  data () {
    return {
      channelId: null,
      channelUrl: ''
    }
  },
  mounted () {
    if (this.$route.params && this.$route.params.id) {
      this.channelId = this.$route.params.id
    }
    if (this.channelId) {
      this.getUrl()
    }
  },
  methods: {
    getUrl () {
      api.channelJiankan({ id: this.channelId }).then(res => {
        if (res.data.code === 0) {
          this.channelUrl = res.data.data.url
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
.imgWrap {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.img {
  display: block;
  width: 70%;
  height: auto;
  border: 1px solid #ddd;
  min-height: 400px;
}
</style>
