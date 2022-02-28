<template>
  <a-modal
    title="创建角色权限关联"
    width="600px"
    v-model="visible"
  >
    <div>
      <a-form-model ref="form" :model="formadd" :rules="ruleValidate" :label-col="{span:4}" :wrapper-col="{span:20}">
        <a-form-model-item label="角色" prop="roleId">
          <a-select v-model="formadd.roleId" :allowClear="true" placeholder="请选择">
            <a-select-option :value="item.value" v-for="item in optionsRoles" v-bind:key="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="权限">
          <a-transfer
            :data-source="optionsPermissions"
            :locale="{ itemUnit: '项', itemsUnit: '项', notFoundContent: '列表为空', searchPlaceholder: '请输入搜索内容' }"
            :titles="['所有权限', '已选权限']"
            :list-style="{width: smallLayout?'100%':'200px', height: '300px'}"
            show-search
            :filter-option="filterOption"
            :target-keys="formadd.permissionIds"
            :render="item => item.label"
            @change="handleChange"
            @search="handleSearch"
          />
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
import apiRoleperm from '@/api/roleperm'
export default {
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    optionsPermissions: {
      type: Array,
      default: function () {
        return []
      }
    },
    optionsRoles: {
      type: Array,
      default: function () {
        return []
      }
    },
    smallLayout: {
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
        permissionIds: [],
        roleId: ''
      },
      ruleValidate: {
        permissionIds: [
          { required: true, type: Array, message: '请选择权限', trigger: 'change' }
        ],
        roleId: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ]
      }
    }
  },
  mounted () {
    console.log(this.optionsPermissions)
  },
  methods: {
    commit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (!this.formadd.permissionIds.length) {
            this.$message.error('请选择权限！')
            return
          }
          this.loading = true
          var requestList = this.formadd.permissionIds.map(async item => {
            return this.createRolePerm({ permissionId: item, roleId: this.formadd.roleId })
          })
          Promise.all(requestList).then(result => {
            console.log(result)
            this.loading = false
            this.$message.success('创建成功！')
            this.formadd = {
              permissionIds: [],
              roleId: ''
            }

            this.$emit('changeVisible', false)
            this.$emit('refresh')
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
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    createRolePerm (formdata) {
      return new Promise((resolve, reject) => {
        apiRoleperm.createRolePerm(formdata).then(response => {
          var resBody = response.data
          if (resBody.code === 0) {
            resolve(response)
          } else {
            reject(resBody.message || '请求出错！')
          }
        }).catch((error) => {
          reject(error)
        })
      })
    },
    filterOption (inputValue, option) {
      return option.label.indexOf(inputValue) > -1
    },
    handleChange (targetKeys, direction, moveKeys) {
      console.log(targetKeys, direction, moveKeys)
      this.formadd.permissionIds = targetKeys
    },
    handleSearch (dir, value) {
      console.log('search:', dir, value)
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
