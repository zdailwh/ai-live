<template>
  <div class="app-container">
    <div class="formWrap">
      <el-form ref="addForm" label-width="100px">
        <el-form-item prop="length" label="密码长度：">
          <el-input-number v-model="addForm.length" :min="8" label="描述文字" />
        </el-form-item>
        <el-form-item prop="complexity" label="复杂度：">
          <el-radio-group v-model="addForm.complexity">
            <el-radio :label="1">字母数字</el-radio>
            <el-radio :label="2">大小写及数字</el-radio>
            <el-radio :label="3">大小写、数字及特殊符号</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="changespace" label="更换要求：">
          <el-radio-group v-model="addForm.changespace">
            <el-radio :label="30">30天</el-radio>
            <el-radio :label="60">60天</el-radio>
            <el-radio :label="90">90天</el-radio>
            <el-radio :label="180">180天</el-radio>
            <el-radio :label="360">360天</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button class="filter-item" type="primary" :disabled="isVisitor" @click="commit">确定</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie'
export default {
  data () {
    return {
      isVisitor: (Cookies.get('MultiDisplay-isVisitor') && JSON.parse(Cookies.get('MultiDisplay-isVisitor'))) || false,
      addForm: {
        length: 8,
        complexity: 1,
        changespace: 30
      }
    }
  },
  created () {
    this.addForm = (Cookies.get('MultiDisplay-pwdset') && JSON.parse(Cookies.get('MultiDisplay-pwdset'))) || {
      length: 8,
      complexity: 1,
      changespace: 30
    }
  },
  methods: {
    commit () {
      Cookies.set('MultiDisplay-pwdset', this.addForm)
      this.$message({
        message: '密码强度设置成功！',
        type: 'success'
      })
    }
  }
}
</script>
<style scoped>
.formWrap {
  width: 700px;
  padding: 20px;
  border: 1px solid #DCDFE6;
  border-radius: 10px;
}
</style>
