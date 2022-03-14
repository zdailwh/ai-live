<template>
  <div class="faceWrap" :style="smalllayout? 'height: auto;': ''" v-infinite-scroll="handleInfiniteOnLoad" :infinite-scroll-disabled="busy" :infinite-scroll-distance="30">
    <a-collapse accordion :bordered="false" v-if="Object.keys(taskresult).length" :activeKey="activeKey" @change="changeActivekey">
      <template v-for="(fItem, fid) in taskresult">
        <a-collapse-panel :key="fid" :header="`${fItem[0].name} ${fItem.length}次`">
          <div class="faceList">
            <p class="faceItem" :class="{ currBox: currBoxKey === fid + '-' + k }" v-for="(it, k) in slicedTaskresult" :key="k" @click="changeBox(it, it.timepos, fid, k)" :ref="fid + '-' + k">
              <img v-if="it.thumbs" v-lazy="`/api/admin/v1/getResultImage?filepath=${it.thumbs}`" alt="人像图">
              <img v-else src="../assets/user.png" alt="人像图" style="width:32px;height:32px;">
              <span>{{ it.timepos * 1000 | formateSeconds }}</span>
            </p>
            <div v-if="loading && !busy" class="loading-container">
              <a-spin />
            </div>
          </div>
        </a-collapse-panel>
      </template>
    </a-collapse>
    <div v-else><p>没有识别到目标人像！</p></div>
  </div>
</template>
<script>
import infiniteScroll from 'vue-infinite-scroll'
import api from '../api'
export default {
  directives: { infiniteScroll },
  props: [ 'taskresult', 'smalllayout' ],
  filters: {
    formateSeconds (second) {
      let secondTime = parseInt(second / 1000)
      var haomiao = parseInt(second % 1000)
      let min = 0 // 初始化分
      let h = 0 // 初始化小时
      let result = ''
      if (secondTime >= 60) { // 如果秒数大于60，将秒数转换成整数
        min = parseInt(secondTime / 60) // 获取分钟，除以60取整数，得到整数分钟
        secondTime = parseInt(secondTime % 60) // 获取秒数，秒数取佘，得到整数秒数
        if (min >= 60) { // 如果分钟大于60，将分钟转换成小时
          h = parseInt(min / 60) // 获取小时，获取分钟除以60，得到整数小时
          min = parseInt(min % 60) // 获取小时后取佘的分，获取分钟除以60取佘的分
        }
      }
      result = `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${secondTime.toString().padStart(2, '0')}.${haomiao}`
      return result
    }
  },
  data () {
    return {
      activeKey: '',
      currBoxKey: 0,
      clickFace: {},
      slicedTaskresult: [],
      loading: false,
      busy: false,
      limit: 100,
      page: 0
    }
  },
  watch: {
    taskresult (val, oldVal) {
      // if (val.length) {
      //   this.currBoxKey = 0
      //   var fItem = val[0]
      //   this.$emit('videofixed', { currentTime: fItem.time, item: fItem })
      // }
    }
  },
  methods: {
    changeBox (fItem, second, fid, k) {
      this.$emit('videofixed', { currentTime: second * 1000, item: fItem })
      this.currBoxKey = fid + '-' + k
    },
    getFace (faceId) {
      this.spinning = true
      api.getFace({ id: faceId }).then(res => {
        this.spinning = false
        var resBody = res.data
        if (resBody.code === 0) {
          this.clickFace = resBody.data
        } else {
          this.$message.error(resBody.message || '请求出错！')
        }
      }).catch(error => {
        this.spinning = false
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        if (error.response && error.response.data) {
          this.$message.error(error.response.data.message || '获取人像库出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    changeActivekey (k) {
      if (k) {
        this.activeKey = k
        this.slicedTaskresult = []
        this.loading = false
        this.busy = false
        this.limit = 100
        this.page = 0

        this.currFaceResults = this.taskresult[k]
        this.loading = true
        var sliceRes = this.currFaceResults.slice(this.page * this.limit, this.page * this.limit + this.limit)
        this.slicedTaskresult = this.slicedTaskresult.concat(sliceRes)

        this.loading = false
        this.page++
      }
    },
    handleInfiniteOnLoad () {
      console.log('去加载')
      console.log(this.activeKey)
      if (this.activeKey) {
        this.loading = true
        if (this.slicedTaskresult.length >= this.currFaceResults.length) {
          // this.$message.warning('没有更多数据了~')
          this.busy = true
          this.loading = false
          return
        }

        var sliceRes = this.currFaceResults.slice(this.page * this.limit, this.page * this.limit + this.limit)
        this.slicedTaskresult = this.slicedTaskresult.concat(sliceRes)

        this.loading = false
        this.page++
      }
    }
  }
}
</script>
<style scoped>
.faceWrap {
  height: calc(100vh - 180px);
  overflow-y: scroll;
  padding: 0 10px;
}
.faceList {
  display: flex;
  flex-wrap: wrap;
}
.faceItem {
  width: 76px;
  margin: 0 2px 5px;
}
.faceItem.currBox {
  border: 1px solid #f00;
  box-shadow: 0 0 10px 0 rgba(255,255,255,.7);
}
.faceItem img {
  display: block;
  max-width: 60px;
  max-height: 60px;
  margin: 0 auto;
  border: 1px solid #555;
}
.faceItem span {
  display: block;
  text-align: center;
  font-size: 12px;
  color: #ddd;
  height: 25px;
  line-height: 25px;
}

.loading-container {
  position: absolute;
  bottom: 40px;
  width: 100%;
  text-align: center;
}
</style>
