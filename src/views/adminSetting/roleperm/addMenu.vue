<template>
  <a-modal
    title="创建角色菜单关联"
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
        <a-form-model-item label="菜单" prop="menu">
          <a-tree
            v-model="checkedKeys"
            checkable
            :defaultExpandAll="true"
            :replace-fields="replaceFields"
            :tree-data="routesData"
            @check="onCheckTree"
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
    routesData: {
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
        menu: [],
        roleId: ''
      },
      ruleValidate: {
        menu: [
          { required: true, message: '请选择菜单', trigger: 'change' }
        ],
        roleId: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ]
      },
      checkedKeys: [],
      replaceFields: {
        key: 'name'
      }
    }
  },
  mounted () {
  },
  methods: {
    onCheckTree (checkedKeys, info) {
      var checkedNodes = info.checkedNodes
      var names = []
      checkedNodes.map(item => {
        names.push(item.key)
        if (item.data.props.parent && !names.includes(item.data.props.parent)) {
          names.push(item.data.props.parent + '_')
        }
      })
      this.formadd.menu = names
    },
    commit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (!this.formadd.menu.length) {
            this.$message.error('请选择菜单！')
            return
          }
          this.loading = true
          apiRoleperm.createRoleMenu({ menu: this.formadd.menu.join(','), role_id: this.formadd.roleId }).then(response => {
            this.loading = false
            var resBody = response.data
            if (resBody.code === 0) {
              this.$message.success('创建成功！')
              this.formadd = {
                menu: [],
                roleId: ''
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
        } else {
          console.log('error submit!!')
          return false
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
