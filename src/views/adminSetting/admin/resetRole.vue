<template>
  <a-modal
    title="修改用户角色"
    v-model="visible"
  >
    <div>
      <a-form-model ref="form" :model="editform" :rules="ruleValidate" :label-col="{span:4}" :wrapper-col="{span:20}">
        <a-form-model-item label="角色" prop="role_id">
          <a-select v-model="editform.role_id" :allowClear="true">
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
        确定
      </a-button>
    </template>
  </a-modal>
</template>
<script>
import apiAdmin from '@/api/admin'
import apiRoleuser from '@/api/roleuser'
export default {
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    editItem: {
      type: Object,
      default () {
        return {}
      }
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
    return {
      loading: false,
      userRoleItem: {},
      editform: {
        role_id: ''
      },
      ruleValidate: {
        role_id: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ]
      }
    }
  },
  watch: {
    editItem (val) {
      this.getUserRole()
    }
  },
  mounted () {
  },
  methods: {
    getUserRole () {
      apiAdmin.getUserRole({ id: this.editItem.id }).then(response => {
        var resBody = response.data
        if (resBody.code === 0) {
          if (resBody.data.id) {
            this.userRoleItem = resBody.data
            this.editform.role_id = resBody.data.role.id
          }
        } else {
          this.$message.error(resBody.message || '请求出错！')
        }
      }).catch((error) => {
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
    commit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.userRoleItem && this.userRoleItem.id) {
            this.updateRoleUser()
          } else {
            this.createRoleUser()
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    updateRoleUser () {
      this.loading = true
      apiRoleuser.updateRoleUser({ id: this.userRoleItem.id, roleId: this.editform.role_id }).then(response => {
        this.loading = false
        var resBody = response.data
        if (resBody.code === 0) {
          this.$message.success('用户角色关联编辑成功！')
          this.$emit('changeVisible', false)
          this.$emit('refresh')
        } else {
          this.$message.error(resBody.message || '请求出错！')
        }
      }).catch((error) => {
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
    createRoleUser () {
      this.loading = true
      apiRoleuser.createRoleUser({ userId: this.editItem.id, roleId: this.editform.role_id }).then(response => {
        this.loading = false
        var resBody = response.data
        if (resBody.code === 0) {
          this.$message.success('用户角色关联创建成功！')
          this.$emit('changeVisible', false)
          this.$emit('refresh')
        } else {
          this.$message.error(resBody.message || '请求出错！')
        }
      }).catch((error) => {
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
    }
  }
}
</script>
