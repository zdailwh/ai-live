<template>
  <div class="videoWrap" :style="smallLayout? 'display: block;': ''">
    <div class="d-left" :style="smallLayout? 'width: 100%;height: auto;': ''">
      <div class="media-wrapper">
        <div class="media-player">
          <div class="playwrap">
            <video src="" width="100%" video controls="controls" id="myvideo"></video>
            <div v-if="showLineControl" class="lineParent">
              <div v-for="it in timePoints" :key="it" class="point" :style="{ left: (it / task.duration * 100).toFixed(2) + '%' }" @click="videoImgFixed(it)"></div>
            </div>
            <a-button-group size="small">
              <a-button @click="bofang()">开始播放</a-button>
              <a-button @click="zanting()">暂停播放</a-button>
              <a-button @click="kuaijin()">快进播放</a-button>
              <a-button @click="kuaitui()">快退播放</a-button>
              <a-button @click="soso()">加速播放</a-button>

              <a-button @click="yu()">减速播放</a-button>
              <a-button @click="normal()">正常播放</a-button>
              <a-button @click="upper()">声音增加</a-button>
              <a-button @click="lower()">声音减小</a-button>
            </a-button-group>
            <!-- <div id="tcplayer"></div> -->
          </div>
        </div>
        <div class="locationDetailWrap">
          <h4>人像详情</h4>
          <ResDetail :res-item="taskResItem" />
        </div>
      </div>
    </div>
    <div class="d-right" :style="smallLayout? 'width: 100%;height: auto;': ''">
      <a-tabs :default-active-key="defaultActiveKey" size="small" @change="tabChange">
        <a-tab-pane key="1" tab="任务结果">
          <Timeline ref="timeline" :taskresult="resTimeFaces" :smalllayout="smallLayout" @videofixed="videoFixed" />
        </a-tab-pane>
        <a-tab-pane key="2" tab="按人像查看">
          <Face ref="face" :taskresult="resFaces" :smalllayout="smallLayout" @videofixed="videoFixed" />
        </a-tab-pane>
        <a-tab-pane key="3" tab="任务基本信息">
          <Setting :taskinfo="task"/>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>
<script>
import api from '../api'
import { TcPlayer } from 'tcplayer'
import Setting from '../components/Setting'
import Face from '../components/Face'
import Timeline from '../components/Timeline'
import ResDetail from '../components/ResDetail'

export default {
  beforeRouteEnter (to, from, next) {
    next()
  },
  components: { Setting, Timeline, Face, ResDetail },
  data () {
    return {
      smallLayout: false,
      defaultActiveKey: 1,
      resTimeFaces: {},
      resFaces: {},
      task: {},
      taskId: '',
      taskResItem: {},
      resDataKeyTotal_timeline: '',
      resDataKeyTotal_face: '',
      timePoints: [],
      showLineControl: false
    }
  },
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
  mounted () {
    var viewWidth = document.documentElement.clientWidth
    if (viewWidth < 768) {
      this.smallLayout = true
    }
    // var ele = document.querySelectorAll('.file-main')
    // if (ele.length) {
    //   ele[0].style.backgroundColor = '#171819'
    // }

    this.taskId = this.$route.params.taskId
    if (this.taskId) {
      this.getPlayurl(this.taskId)
    }
  },
  methods: {
    getPlayurl (tid) {
      var params = {
        id: tid
      }
      api.getTasksById(params).then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          this.task = resBody.data
          if (this.task && this.task.file_path && this.task.file_path !== 'undefined') {
            var halfH = document.querySelectorAll('.locationDetailWrap')[0].clientHeight
            // document.getElementById('myvideo').style.height = (halfH - 48) + 'px'
            document.getElementById('myvideo').setAttribute('height', halfH - 48)
            document.getElementById('myvideo').setAttribute('src', '/resource/' + this.task.file_path)
            document.querySelectorAll('.detailImgBox')[0].style.height = (halfH - 44 - 20) + 'px'
            // this.createPlayer()
          }
          if (this.task.status === 5 && this.task.resultstatus === 0) {
            this.defaultActiveKey = 3
          }
          if (this.defaultActiveKey === 1) {
            this.getTaskResultsTimeline(this.taskId)
            this.showLineControl = true
          }
        } else {
          this.$message.error(resBody.message || '请求出错！')
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        if (error.response && error.response.data) {
          this.$message.error(error.response.data.message || '获取任务详情出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    getTaskResultsTimeline (tid) {
      var params = {
        id: tid,
        isFace: 0
      }
      api.getTaskResults(params).then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          this.resTimeFaces = resBody.data.timefaces
          this.timePoints = Object.keys(resBody.data.timefaces)
          this.timePoints = this.timePoints.map(item => {
            return parseInt(item)
          })
          this.resDataKeyTotal_timeline = Object.keys(resBody.data.timefaces).length
        } else {
          this.$message.error(resBody.message || '请求出错！')
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        if (error.response && error.response.data) {
          this.$message.error(error.response.data.message || '获取任务结果出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    getTaskResultsFace (tid) {
      var params = {
        id: tid,
        isFace: 1
      }
      api.getTaskResults(params).then(res => {
        var resBody = res.data
        if (resBody.code === 0) {
          this.resFaces = resBody.data.faces
          this.resDataKeyTotal_face = Object.keys(resBody.data.faces).length
        } else {
          this.$message.error(resBody.message || '请求出错！')
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        if (error.response && error.response.data) {
          this.$message.error(error.response.data.message || '获取任务结果出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    tabChange (key) {
      var currK = 0
      if (key === '1') {
        // 获取结果 按时间轴
        if (!Object.keys(this.resTimeFaces).length) {
          this.getTaskResultsTimeline(this.taskId)
        }
        this.showLineControl = true

        // 根据上次选中的人像 初始化左侧视频和大图
        if (this.$refs.timeline && this.$refs.timeline.currBoxKey) {
          currK = this.$refs.timeline.currBoxKey
          this.$nextTick(function () {
            this.$refs.timeline.$refs[currK][0].click()
          })
        }
      } else if (key === '2') {
        // 获取结果 按人像
        if (!Object.keys(this.resFaces).length) {
          this.getTaskResultsFace(this.taskId)
        }
        this.showLineControl = false

        // 根据上次选中的人像 初始化左侧视频和大图
        if (this.$refs.face && this.$refs.face.currBoxKey) {
          currK = this.$refs.face.currBoxKey
          this.$nextTick(function () {
            this.$refs.face.$refs[currK][0].click()
          })
        }
      } else {
        this.showLineControl = false
      }
    },
    createPlayer () {
      // var url = 'http://ai.evereasycom.cn:15280/face_reco_web/userData/test_user2/videoAsset/1638182188388.mp4'
      var url = this.task.file_path
      document.querySelector('#tcplayer').innerHTML = ''
      var player = new TcPlayer('tcplayer', {
        mp4: url,
        autoplay: true,
        width: 'auto',
        height: '100%',
        wording: {
          1001: '网络错误，请检查网络配置或者播放链接是否正确',
          1002: '获取视频失败，请检查播放链接是否有效',
          2032: '获取视频失败，请检查播放链接是否有效',
          2048: '无法加载视频文件，跨域访问被拒绝'
        },
        listener: function (msg) {
          // console.log('listener:', msg)
          // if (msg.type === 'play') {
          //   self.videoPlay()
          // }
          // if (msg.type === 'loadeddata') {
          //   player.play()
          // }
        }
      })
      window.player = player
    },
    videoFixed (params) {
      this.taskResItem = params.item
      var fixSecond = params.currentTime || params.timepos
      document.getElementById('myvideo').currentTime = fixSecond / 1000
    },
    bofang () {
      document.getElementById('myvideo').play()
    },
    // 暂停
    zanting () {
      document.getElementById('myvideo').pause()
    },
    // 快进
    kuaijin () {
      document.getElementById('myvideo').currentTime += 10
    },
    // 快退
    kuaitui () {
      document.getElementById('myvideo').currentTime -= 10
    },
    // 加速(3)
    soso () {
      document.getElementById('myvideo').playbackRate = 3
    },
    // 减速（3）
    yu () {
      document.getElementById('myvideo').playbackRate = 1 / 3
    },
    normal () {
      document.getElementById('myvideo').playbackRate = 1
    },
    // 调高声音
    upper () {
      document.getElementById('myvideo').volume += 0.3
    },
    // 降低声音
    lower () {
      document.getElementById('myvideo').volume -= 0.3
    },
    videoImgFixed (hm) {
      this.$refs.timeline.timelineFix(hm)
      // this.$nextTick(function () {
      //   var nodeId = 'point_' + hm
      //   console.log(nodeId)
      //   var node = document.getElementById(nodeId)
      //   console.log(node)
      //   if (node) {
      //     document.querySelectorAll('.faceWrap')[0].scrollTop = (node.offsetTop - 60) <= 0 ? 0 : (node.offsetTop - 60)
      //   }
      // })
    }
  }
}
</script>
<style scoped>
.videoWrap {
  display: flex;
  height: 100%;
}
.d-left {
  flex: 1;
}
.d-right {
  flex: 1;
  overflow-y: hidden;
}
.media-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.media-wrapper .media-player {
  flex: 1;
  margin: 0 20px;
}
.playwrap {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.cut_catalog_dropdown {
  position: absolute;
  right: 5px;
  bottom: -153px;
  width: 210px;
  height: 153px;
  z-index: 1000;
  border-radius: 4px;
  background: #2d2f31;
  box-shadow: 0 0 1px 0 rgba(10, 31, 68, 0.08), 0 8px 10px 0 rgba(10, 31, 68, 0.1);
}
.cut_catalog_dropdown .cut_catalog_list {
  padding: 10px;
}
.cut_catalog_dropdown .cut_catalog_list li.cut_catalog_item:first-child {
  margin-top: 0;
}
.cut_catalog_dropdown .cut_catalog_list li.cut_catalog_item {
  height: 24px;
  margin: 10px 0;
}
.cut_catalog_dropdown .cut_catalog_list li.cut_catalog_item span.title {
  width: 78px;
  font-size: 12px;
  color: #acb0b7;
  text-align: right;
  padding-right: 10px;
}
.cut_catalog_dropdown .cut_catalog_list li.cut_catalog_item input {
  width: 100px;
  font-size: 12px;
}
input[type="text"], textarea {
  -webkit-appearance: none;
}
.cut_catalog_dropdown .cut_catalog_list li.cut_catalog_item span.title, .cut_catalog_dropdown .cut_catalog_list li.cut_catalog_item input {
  height: 24px;
  line-height: 24px;
  float: left;
}
.cut_catalog_dropdown .cut_catalog_list li.cut_catalog_item .anticon-close {
  position: absolute;
  top: 2px;
  right: 2px;
  color: #a5aab3;
  cursor: pointer;
  font-size: 13px;
  background: #3c3c3c;
  border-radius: 50%;
}
.cut_catalog_dropdown .cut_catalog_list li.cut_catalog_item .btn {
  display: inline-block;
  width: 78px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background-color: #3c3c3c;
  border-radius: 4px;
  color: #fff;
  margin: 0 5px;
  font-size: 12px;
  cursor: pointer;
}
.cut_catalog_dropdown .cut_catalog_list li.cut_catalog_item .btn.btn_ok {
  background-color: #2a92fe;
}
.searchWrap_video {
  margin-bottom: 15px;
}

.locationDetailWrap {
  flex: 1;
  margin: 0 20px 20px;
}
.locationDetailWrap h4 {
  font-size: 16px;
  color: #fff;
  font-weight: bold;
  margin: 10px 0;
}
.locationDetailWrap .locDetail p {
  color: #989898;
  font-size: 14px;
}
.locationDetailWrap .locDetail p label {
  display: inline-block;
  text-align: right;
  width: 120px;
  color: #cecece;
  margin-right: 10px;
}
.locationDetailWrap .locDetail.inlineDetail {
  display: flex;
  flex-wrap: wrap;
}
.lineParent {
  margin: 10px;
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
