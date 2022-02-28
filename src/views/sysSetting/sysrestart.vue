<template>
  <div class="faceContainer">
    <h2 class="formTitle">设备重启</h2>
    <div class="formWrap">
      <a-form-model ref="form" :model="formadd" :rules="ruleValidate" :label-col="{span:4}" :wrapper-col="{span:20}">
        <a-form-model-item label="密码" prop="password">
          <a-input v-model="formadd.password" type="password" />
        </a-form-model-item>
        <a-form-model-item :wrapper-col="{ span: 20, offset: 4 }">
          <a-button type="danger" :loading="loading" @click="commit">
            重启
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </div>
  </div>
</template>
<script>
import api from '@/api/action'
export default {
  beforeRouteEnter (to, from, next) {
    next()
  },
  data () {
    return {
      loading: false,
      formadd: {
        password: ''
      },
      ruleValidate: {
        password: [
          { required: true, message: '请输入管理员密码', trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
  },
  methods: {
    commit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.toReboot()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    toReboot () {
      var that = this
      this.$confirm({
        title: '您确定要重启设备吗？',
        content: '谨慎操作',
        okText: '继续重启',
        cancelText: '取消',
        onOk () {
          that.doReboot()
        },
        onCancel () {}
      })
    },
    doReboot () {
      this.loading = true
      api.deviceReboot({ password: this.formadd.password }).then(res => {
        this.loading = false
        var resBody = res.data
        if (resBody.code === 0) {
          this.$message.success('设备已重启！')
        } else {
          this.$message.error(resBody.message || '请求出错！')
        }
      }).catch(error => {
        this.loading = false
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        if (error.response && error.response.data) {
          this.$message.error(error.response.data.message || '设备重启出错！')
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
