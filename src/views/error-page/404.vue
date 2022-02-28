<template>
  <div class="myResultCont">
    <a-result status="404" title="404" sub-title="对不起，您访问的页面未找到。">
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
  name: 'Page404',
  methods: {
    back () {
      window.history.go(-1)
    }
  }
}
</script>

<style scoped>
</style>
