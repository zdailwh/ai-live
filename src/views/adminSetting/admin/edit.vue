<template>
  <div class="taskContainer">
    <div class="formWrap">
      <a-form-model ref="form" :model="currUser" :rules="ruleValidate" :label-col="{span:4}" :wrapper-col="{span:20}">
        <a-form-model-item label="手机号" prop="mobile">
          <a-input v-model="currUser.mobile" />
        </a-form-model-item>
        <a-form-model-item :wrapper-col="{ span: 14, offset: 4 }">
          <a-button type="primary" :loading="loading" @click="commit">
            确定
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </div>
  </div>
</template>
<script>
import Cookies from 'js-cookie'
import apiAdmin from '@/api/admin'
import { getToken, setToken } from '@/utils/auth'
export default {
  data () {
    return {
      isVisitor: (Cookies.get('MultiDisplay-isVisitor') && JSON.parse(Cookies.get('MultiDisplay-isVisitor'))) || false,
      currUser: JSON.parse(getToken()),
      loading: false,
      ruleValidate: {
        mobile: [
          { required: true, message: '手机号码不能为空', trigger: 'blur' },
          { type: 'string', message: '手机号格式不正确', length: 11, pattern: /^1[3|5|8|7]([0-9]{9})$/, trigger: 'blur' }
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
          this.updateUser()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    updateUser () {
      this.loading = true
      apiAdmin.updateUser(this.currUser).then(response => {
        this.loading = false
        var resBody = response.data
        if (resBody.code === 0) {
          this.$message.success('编辑成功！')
          this.$store.commit('authentication/SET_TOKEN', JSON.stringify(this.currUser))
          setToken(JSON.stringify(this.currUser))
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
          this.$message.error(error.response.data.message || error.response.data)
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
