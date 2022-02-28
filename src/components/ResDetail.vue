<template>
  <div class="detailImgBox">
    <img v-if="resItem && resItem.image" :src="`/api/admin/v1/getResultImage?filepath=${resItem.image}`" style="max-width: 100%; max-height: 100%;">
    <!-- <a-icon v-else type="file-image" class="defaultIcon" /> -->
  </div>
</template>
<script>
export default {
  props: [ 'resItem' ],
  data () {
    return {
    }
  },
  mounted () {
  }
}
</script>
<style scoped>
.detailImgBox {
  text-align: center;
}
.defaultIcon {
  font-size: 50px;
}
</style>
