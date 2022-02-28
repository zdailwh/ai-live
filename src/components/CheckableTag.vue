<template>
  <div>
    <template v-for="(tag, key) in optionTags">
      <a-tooltip v-if="tag.name.length > 20" :key="key" :title="tag.name">
        <a-checkable-tag :key="key" :closable="false" :checked="selectedTags.indexOf(tag.id) > -1" @change="checked => handleChange(tag.id, checked)">
          {{ `${tag.name.slice(0, 20)}...` }}
        </a-checkable-tag>
      </a-tooltip>
      <a-checkable-tag v-else :key="key" :closable="false" :checked="selectedTags.indexOf(tag.id) > -1" @change="checked => handleChange(tag.id, checked)">
        {{ tag.name }}
      </a-checkable-tag>
    </template>
    <a-input
      v-if="inputVisible"
      ref="input"
      type="text"
      :style="{ width: '150px' }"
      :value="inputValue"
      @change="handleInputChange"
      @blur="handleInputConfirm"
      @keyup.enter="handleInputConfirm"
    />
    <a-tag v-else style="background: #fff; borderStyle: dashed;" @click="showInput">
      <a-icon type="plus" /> 添加
    </a-tag>
  </div>
</template>
<script>
import api from '@/api'
export default {
  props: {
    // currTags: {
    //   type: String,
    //   default () {
    //     return ''
    //   }
    // },
    currTags: {
      type: Array,
      default () {
        return []
      }
    },
    optionTags: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      inputVisible: false,
      inputValue: ''
    }
  },
  // watch: {
  //   currTags (val) {
  //     if (val) {
  //       this.selectedTags = val.split('|')
  //     } else {
  //       this.selectedTags = []
  //     }
  //   }
  // },
  // watch: {
  //   currTags (val) {
  //     this.selectedTags = val
  //   }
  // },
  computed: {
    selectedTags: {
      get () {
        return this.currTags
      },
      set () {
      }
    }
  },
  methods: {
    handleChange (tag, checked) {
      const { selectedTags } = this

      const nextSelectedTags = checked
        ? [...selectedTags, tag]
        : selectedTags.filter(t => t !== tag)
      // this.selectedTags = nextSelectedTags

      this.$emit('commitTag', nextSelectedTags)
    },
    showInput () {
      this.inputVisible = true
      this.$nextTick(function () {
        this.$refs.input.focus()
      })
    },
    handleInputChange (e) {
      this.inputValue = e.target.value
    },
    handleInputConfirm () {
      const inputValue = this.inputValue
      let optionTags = this.optionTags.map(item => { return item.name })
      if (inputValue) {
        if (optionTags.indexOf(inputValue) === -1) {
          // 去创建标签
          this.addLoading = true
          api.addGroup({ name: inputValue }).then(res => {
            this.addLoading = false
            if (res.data.code === 0) {
              this.$emit('refreshTags')

              Object.assign(this, {
                inputVisible: false,
                inputValue: ''
              })
              this.$message.success('标签创建成功')
            } else {
              this.$message.error(res.data.message || '请求出错！')
            }
          }).catch(error => {
            this.addLoading = false
            if (error.response && error.response.status === 401) {
              this.$store.dispatch('authentication/resetToken').then(() => {
                this.$router.push({ path: '/login' })
              })
            }
            if (error.response && error.response.data) {
              this.$message.error(error.response.data.message || '创建出错！')
            } else {
              this.$message.error('接口调用失败！')
            }
          })
        } else {
          this.$message.error('标签名已存在！')
        }
      } else {
        Object.assign(this, {
          inputVisible: false,
          inputValue: ''
        })
      }
    }
  }
}
</script>
