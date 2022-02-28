<template>
  <div>
    <div>
      <div class="lineParent">
        <div class="point" style="left: 50%;"></div>
      </div>
    </div>
    <div
      v-infinite-scroll="handleInfiniteOnLoad"
      :infinite-scroll-disabled="busy"
      :infinite-scroll-distance="10"
    >
      <p v-for="(item,key) in slicedData" :key="key">{{item}}</p>
    </div>
  </div>
</template>
<script>
import infiniteScroll from 'vue-infinite-scroll'
export default {
  directives: { infiniteScroll },
  data () {
    return {
      mydata: [],
      slicedData: [],
      loading: false,
      busy: false,
      limit: 100,
      page: 0
    }
  },
  mounted () {
    var d = []
    for (var i = 1; i < 1000; i++) {
      d.push(i)
    }
    this.mydata = d
  },
  methods: {
    handleInfiniteOnLoad () {
      this.loading = true
      if (this.slicedData.length >= this.mydata.length) {
        this.$message.warning('没有更多数据了~')
        this.busy = true
        this.loading = false
        return
      }
      var sliced = this.mydata.slice(this.page * this.limit, this.page * this.limit + this.limit)
      this.slicedData = this.slicedData.concat(sliced)
      this.loading = false
      this.page++
    }
  }
}
</script>
<style scoped>
.lineParent {
  margin-top: 50px;
  position: relative;
  width: 100%;
  height: 8px;
  border-radius: 8px;
  background-color: #f5f5f5;
}
.lineParent .point {
  position: absolute;
  top: 0;
  width: 2px;
  height: 8px;
  background-color: #f5222d;
  cursor: pointer;
}
</style>
