<template>
  <a-modal
    :title="'编辑角色权限-' + editItem && editItem.role && editItem.role.name"
    width="600px"
    v-model="visible"
  >
    <div>
      <a-form-model ref="form" :model="editItem" :rules="ruleValidate" :label-col="{span:4}" :wrapper-col="{span:20}">
        <a-form-model-item label="权限">
          <a-transfer
            :data-source="optionsPermissions"
            :locale="{ itemUnit: '项', itemsUnit: '项', notFoundContent: '列表为空', searchPlaceholder: '请输入搜索内容' }"
            :titles="['所有权限', '已选权限']"
            :list-style="{width: smallLayout?'100%':'200px', height: '300px'}"
            show-search
            :filter-option="filterOption"
            :target-keys="checkedPerm"
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
        确定
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
    editItem: {
      type: Object,
      default () {
        return {}
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
      checkedPerm: [],
      ruleValidate: {
      }
    }
  },
  watch: {
    editItem (newVal) {
      if (newVal && newVal.role && newVal.perms.length) {
        this.checkedPerm = newVal.perms.map(item => {
          return item && item.id
        })
      }
    }
  },
  mounted () {
  },
  methods: {
    commit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (!this.checkedPerm.length) {
            this.$message.error('请选择权限！')
            return
          }
          this.updateRolePerm()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    updateRolePerm () {
      var params = {
        roleId: this.editItem.id,
        permissionIds: this.checkedPerm
      }
      apiRoleperm.updateRolePerm(params).then(response => {
        this.loading = false
        var resBody = response.data
        if (resBody.code === 0) {
          this.$message.success('编辑成功！')
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
    filterOption (inputValue, option) {
      return option.label.indexOf(inputValue) > -1
    },
    handleChange (targetKeys, direction, moveKeys) {
      console.log(targetKeys, direction, moveKeys)
      this.checkedPerm = targetKeys
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
