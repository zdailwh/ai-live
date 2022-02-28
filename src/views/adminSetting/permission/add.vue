<template>
  <a-modal
    title="创建权限"
    v-model="visible"
  >
    <div>
      <a-form-model ref="form" :model="formadd" :rules="ruleValidate" :label-col="{span:4}" :wrapper-col="{span:20}">
        <a-form-model-item label="接口地址" prop="name">
          <a-input v-model="formadd.name" placeholder="请输入接口地址（如：userUpdatePhone）" />
        </a-form-model-item>
        <a-form-model-item label="权限描述" prop="info">
          <a-input v-model="formadd.info" placeholder="请输入权限描述" />
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
import apiPermission from '@/api/mypermission'

export default {
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
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
      formadd: {
        name: '',
        info: ''
      },
      ruleValidate: {
        name: [
          { required: true, message: '接口地址不能为空', trigger: 'blur' }
        ],
        info: [
          { required: true, message: '权限描述不能为空', trigger: 'blur' }
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
          this.createPermission()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    createPermission () {
      console.log(this.formadd)
      this.loading = true
      apiPermission.createPermission(this.formadd).then(response => {
        this.loading = false
        var resBody = response.data
        if (resBody.code === 0) {
          this.$message.success('创建成功！')
          this.formadd = {
            name: '',
            info: ''
          }
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
