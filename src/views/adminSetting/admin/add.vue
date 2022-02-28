<template>
  <a-modal
    title="创建用户"
    v-model="visible"
  >
    <div>
      <a-form-model ref="form" :model="formadd" :rules="ruleValidate" :label-col="{span:4}" :wrapper-col="{span:20}">
        <a-form-model-item label="登录名" prop="username">
          <a-input v-model="formadd.username" />
        </a-form-model-item>
        <a-form-model-item label="实名" prop="realname">
          <a-input v-model="formadd.realname" />
        </a-form-model-item>
        <a-form-model-item label="密码" prop="password">
          <a-input v-model="formadd.password" />
        </a-form-model-item>
        <a-form-model-item label="手机号" prop="mobile">
          <a-input v-model="formadd.mobile" />
        </a-form-model-item>
        <a-form-model-item label="角色" prop="role_id">
          <a-select v-model="formadd.role_id" :allowClear="true">
            <a-select-option :value="item.value" v-for="item in optionsRoles" v-bind:key="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
        </a-form-model-item>
      </a-form-model>
    </div>
    <template slot="footer">
      <a-button key="back" @click="reset">
        取消
      </a-button>
      <a-button key="submit" type="primary" :loading="loading" @click="commit">
        创建
      </a-button>
    </template>
  </a-modal>
</template>
<script>
import apiAdmin from '@/api/admin'
import apiRoleuser from '@/api/roleuser'
import Cookies from 'js-cookie'
export default {
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    optionsRoles: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  computed: {
    visible: {
      get () {
        return this.dialogVisible
      },
      set (val) {
        this.$emit('changeVisible', false)
      }
    }
  },
  data () {
    var validatePwd = (rule, value, callback) => {
      var len = this.pwdset.length
      var complexity = this.pwdset.complexity
      var reg = new RegExp('^.*(?=.{8,})(?=.*[0-9])(?=.*[a-zA-Z]).*$')
      var regMsg = '至少8位字母数字'
      if (complexity === 1) {
        // 字母数字
        reg = new RegExp('^.*(?=.{' + len + ',})(?=.*[0-9])(?=.*[a-zA-Z]).*$')
        regMsg = `至少${len}位字母数字`
      } if (complexity === 2) {
        // 大小写及数字
        reg = new RegExp('^.*(?=.{' + len + ',})(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).*$')
        regMsg = `至少${len}位大小写字母加数字`
      } if (complexity === 3) {
        // 大小写、数字及特殊符号
        reg = new RegExp('^.*(?=.{' + len + ',})(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*? ]).*$')
        regMsg = `至少${len}位大小写字母加数字加特殊符号`
      }
      if (value === '') {
        callback(new Error('密码不能为空'))
      } else if (!reg.test(value)) {
        callback(new Error(regMsg))
      } else {
        callback()
      }
    }
    return {
      pwdset: (Cookies.get('MultiDisplay-pwdset') && JSON.parse(Cookies.get('MultiDisplay-pwdset'))) || { length: 8, complexity: 1, changespace: 30 },
      loading: false,
      formadd: {
        username: '',
        realname: '',
        password: '',
        mobile: '',
        role_id: ''
      },
      ruleValidate: {
        username: [
          { required: true, message: '登录名不能为空', trigger: 'blur' },
          { type: 'string', message: '登录名由2-8位字母、数字组成', min: 2, max: 8, pattern: /^[0-9A-Za-z]{2,8}$/, trigger: 'blur' }
        ],
        realname: [
          { required: true, type: 'string', message: '实名不能为空', trigger: 'blur' }
        ],
        password: [
          { required: true, validator: validatePwd, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '手机号码不能为空', trigger: 'blur' },
          { type: 'string', message: '手机号格式不正确', length: 11, pattern: /^1[3|5|8|7]([0-9]{9})$/, trigger: 'blur' }
        ],
        role_id: [
          { required: true, message: '请选择用户角色！', trigger: 'blur' }
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
          this.createUser()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    createUser () {
      console.log(this.formadd)
      this.loading = true
      apiAdmin.createUser(this.formadd).then(response => {
        this.loading = false
        var resBody = response.data
        if (resBody.code === 0) {
          this.$message.success('用户创建成功！')
          this.createRoleUser(resBody.data.id, this.formadd.role_id)
          this.formadd = {
            username: '',
            realname: '',
            password: '',
            mobile: '',
            role_id: ''
          }
          // this.$emit('changeVisible', false)
          // this.$emit('refresh')
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
    },
    reset () {
      this.$refs.form.resetFields()
      this.$emit('changeVisible', false)
    },
    handleClose (done) {
      this.$emit('changeVisible', false)
      // done()
    },
    createRoleUser (userId, roleId) {
      apiRoleuser.createRoleUser({ userId: userId, roleId: roleId }).then(response => {
        var resBody = response.data
        if (resBody.code === 0) {
          this.$message.success('用户角色关联创建成功！')
          this.$emit('changeVisible', false)
          this.$emit('refresh')
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
