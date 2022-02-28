<template>
  <a-modal
    title="创建角色"
    v-model="visible"
  >
    <div>
      <a-form-model ref="form" :model="formadd" :rules="ruleValidate" :label-col="{span:4}" :wrapper-col="{span:20}">
        <a-form-model-item label="角色名称" prop="name">
          <a-input v-model="formadd.name" placeholder="请输入角色名称" />
        </a-form-model-item>
        <a-form-model-item label="角色等级" prop="level">
          <a-select v-model="formadd.level" :allowClear="true" placeholder="请选择">
            <a-select-option :value="item.value" v-for="item in levelArr" v-bind:key="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="角色描述" prop="description">
          <a-input v-model="formadd.description" placeholder="请输入角色描述" />
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
import apiRole from '@/api/myrole'

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
        level: '',
        description: ''
      },
      ruleValidate: {
        name: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ],
        level: [
          { required: true, message: '角色等级不能为空', trigger: 'change' }
        ]
      },
      levelArr: [
        // { label: '最高', value: 5 },
        { label: '高', value: 4 },
        { label: '中', value: 3 },
        { label: '低', value: 2 }
        // { label: '最低', value: 1 }
      ]
    }
  },
  mounted () {
  },
  methods: {
    commit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.createRole()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    createRole () {
      this.loading = true
      apiRole.createRole(this.formadd).then(response => {
        this.loading = false
        var resBody = response.data
        if (resBody.code === 0) {
          this.$message.success('创建成功！')
          this.formadd = {
            name: '',
            level: '',
            description: ''
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
<style scoped>
</style>
