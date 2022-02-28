<template>
  <a-modal
    title="关联用户"
    v-model="visible"
  >
    <div>
      <a-form-model ref="form" :model="editform" :rules="ruleValidate"  :label-col="{span:4}" :wrapper-col="{span:20}">
        <a-form-model-item label="选择用户">
          <!-- <a-transfer
            :data-source="optionsUsers"
            :filter-option="filterOption"
            :showSelectAll="false"
            :showSearch="true"
            :locale="{ itemUnit: '项', itemsUnit: '项', notFoundContent: '列表为空', searchPlaceholder: '请输入搜索内容' }"
            :titles="['用户', '目标']"
            :target-keys="targetKeys"
            :selected-keys="selectedKeys"
            :list-style="{width: smallLayout?'100%':'200px', height: '260px'}"
            @change="handleChange"
            @selectChange="handleSelectChange">
            <template
              slot="children"
              slot-scope="{
                props: { direction, filteredItems, selectedKeys, disabled: listDisabled },
                on: { itemSelectAll, itemSelect },
              }"
            >
              <a-table
                :row-selection="
                  getRowSelection({ disabled: listDisabled, selectedKeys, itemSelectAll, itemSelect })
                "
                :columns="direction === 'left' ? leftColumns : rightColumns"
                :data-source="filteredItems"
                :pagination="{ pageSize: 10 }"
                size="small"
                :style="{ pointerEvents: listDisabled ? 'none' : null }"
                :custom-row="
                  ({ key, disabled: itemDisabled }) => ({
                    on: {
                      click: () => {
                        if (itemDisabled || listDisabled) return;
                        itemSelect(key, !selectedKeys.includes(key));
                      },
                    },
                  })
                "
                >
              </a-table>
            </template>
          </a-transfer> -->
          <a-select v-model="editform.user_id" show-search :filter-option="userFilterOption">
            <a-select-option :value="item.id" v-for="item in optionsUsers" v-bind:key="item.id">
              {{item.username}}
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
import difference from 'lodash/difference'
import api from '../api'
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
    smallLayout: {
      type: Boolean,
      default: false
    },
    optionsUsers: {
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
  watch: {
    editItem (newVal, oldVal) {
      if (newVal.user_id) {
        this.editform.user_id = newVal.user_id
      }
    }
  },
  data () {
    return {
      loading: false,
      userRoleItem: {},
      editform: {
        user_id: ''
      },
      ruleValidate: {
        user_id: [
          { required: true, message: '请选择用户', trigger: 'change' }
        ]
      },
      leftColumns: leftTableColumns,
      rightColumns: rightTableColumns,
      targetGroupIds: [],
      targetKeys: [],
      selectedKeys: [],
      targetUserIds: []
    }
  },
  mounted () {
  },
  methods: {
    userFilterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    commit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.tempAssign()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    tempAssign () {
      var param = {
        mode_id: this.editItem.id,
        user_id: this.editform.user_id
      }
      this.loading = true
      api.tempAssign(param).then(response => {
        this.loading = false
        var resBody = response.data
        if (resBody.code === 0) {
          this.$message.success('关联成功！')
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
    },
    reset () {
      this.$refs.form.resetFields()
      this.$emit('changeVisible', false)
    },
    filterOption (inputValue, option) {
      return option.title.indexOf(inputValue) > -1
    },
    getRowSelection ({ disabled, selectedKeys, itemSelectAll, itemSelect }) {
      return {
        getCheckboxProps: item => ({ props: { disabled: disabled || item.disabled } }),
        onSelectAll (selected, selectedRows) {
          const treeSelectedKeys = selectedRows
            .filter(item => !item.disabled)
            .map(({ key }) => key)
          const diffKeys = selected
            ? difference(treeSelectedKeys, selectedKeys)
            : difference(selectedKeys, treeSelectedKeys)
          itemSelectAll(diffKeys, selected)
        },
        onSelect ({ key }, selected) {
          itemSelect(key, selected)
        },
        selectedRowKeys: selectedKeys
      }
    },
    handleChange (nextTargetKeys, direction, moveKeys) {
      this.targetKeys = nextTargetKeys
      this.targetUserIds = nextTargetKeys

      // console.log('targetKeys: ', nextTargetKeys)
      // console.log('direction: ', direction)
      // console.log('moveKeys: ', moveKeys)
    },
    handleSelectChange (sourceSelectedKeys, targetSelectedKeys) {
      this.selectedKeys = [...sourceSelectedKeys, ...targetSelectedKeys]

      // console.log('sourceSelectedKeys: ', sourceSelectedKeys)
      // console.log('targetSelectedKeys: ', targetSelectedKeys)
    }
  }
}

const leftTableColumns = [
  {
    dataIndex: 'title',
    title: '名称'
  }
]
const rightTableColumns = [
  {
    dataIndex: 'title',
    title: '名称'
  }
]

</script>
<style scoped>
.formWrap {
  width: 500px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #DCDFE6;
  border-radius: 10px;
}
</style>
