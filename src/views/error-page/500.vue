<template>
  <div class="myResultCont">
    <a-result status="500" title="500" sub-title="服务器发生了错误。">
      <template #extra>
        <a-button type="primary" @click="back">
          返回
        </a-button>
      </template>
    </a-result>
  </div>
</template>

<script>
export default {
  name: 'Page500',
  methods: {
    back () {
      window.history.go(-1)
    }
  }
}
</script>

<style scoped>
</style>
