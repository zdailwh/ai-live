<template>
  <div class="liveWrap">
<!--<div class="sliderWrap">
      <a-tabs
        :default-active-key="1"
        tab-position="left"
        style="height:90vh"
      >
        <a-tab-pane v-for="i in 10" :key="i" :tab="`频道${i}`"></a-tab-pane>
      </a-tabs>
    </div> -->
    <div class="videoWrap" :style="smallLayout? 'display: block;': ''">
      <div class="d-left" :style="smallLayout? 'width: 100%;height: auto;': ''">
        <div class="media-wrapper">
          <div class="media-player">
            <div class="playwrap">
              <div ref="videoobj"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="d-right" :style="smallLayout? 'width: 100%;height: auto;': ''">
        <a-tabs v-model="activeTab" size="small" @change="tabChange" @tabClick="tabClick">
          <a-tab-pane key="add">
            <span slot="tab">
              <a-icon type="plus" />
              创建任务
            </span>
          </a-tab-pane>
          <a-tab-pane v-for="(record, idx) in datalist" :key="record.id" :tab="record.name + '（共' + resDataTotal + '条）'">
            <div class="oprateWrap">
              <!-- <a-button type="primary" size="small" @click="toEdit(record, idx, 'edit')">编辑</a-button> -->
              <a-button type="primary" size="small" v-if="record.status === 2" :disabled="true">删除</a-button>
              <a-popconfirm
                v-else
                title="确定要删除该任务吗?"
                ok-text="删除"
                cancel-text="取消"
                @confirm="delTask(record, idx)"
              >
                <a-button type="primary" size="small">删除</a-button>
              </a-popconfirm>
              <!-- <a-button type="primary" size="small" @click="toEdit(record, idx, 'copy')">复制</a-button> -->
              <a-popconfirm
                  v-if="record.status === 2"
                  title="确定要暂停该任务吗?"
                  ok-text="暂停"
                  cancel-text="取消"
                  @confirm="pause(record, idx)"
                >
                <a-button type="danger" size="small">暂停</a-button>
              </a-popconfirm>
              <a-popconfirm
                  v-else
                  title="确定要恢复该任务吗?"
                  ok-text="恢复"
                  cancel-text="取消"
                  @confirm="resume(record, idx)"
                >
                <a-button type="primary" size="small">恢复</a-button>
              </a-popconfirm>
              <a-popconfirm
                  title="确定要重置该任务吗?"
                  ok-text="重置"
                  cancel-text="取消"
                  @confirm="reset(record, idx)"
                >
                <a-button type="danger" size="small">重置</a-button>
              </a-popconfirm>
            </div>
            <!--结果筛选-->
            <div class="searchWrap_video">
              <a-form-model ref="searchForm" :model="searchForm" layout="inline">
                <a-form-model-item label="人像">
                  <a-input v-model="searchForm.name" placeholder="姓名" allow-clear style="width: 110px;" />
                </a-form-model-item>
                <a-form-model-item>
                  <a-button type="primary" ghost @click="searchHandleOk">搜索</a-button>
                </a-form-model-item>
              </a-form-model>
            </div>
            <div v-if="resDataTotal === ''" class="loadingWrap"><img src="static/loading_.gif"></div>
            <Face :taskresult="filtedResDatalist" :smalllayout="smallLayout" @videofixed="videoFixed" />
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>

    <AddTask tag="online" :datalist="datalist" :add-visible="addVisible" :faces-data="facesDatalist" :groups-data="groupDatalist" :target-keys="targetKeys" :selected-keys="selectedKeys" :small-layout="smallLayout" @updateData="updateData" @getList="getTasks" />
    <EditTask tag="online" :datalist="datalist" :edit-visible="editVisible" :faces-data="facesDatalist" :groups-data="groupDatalist" :target-keys="targetKeys" :selected-keys="selectedKeys" :small-layout="smallLayout" :edit-tag="editTag" :edit-form="editForm" :edit-item="editItem" :edit-key="editKey" @updateData="updateData" @getList="getTasks" />

  </div>
</template>
<script>
import api from '../api'
// import { TcPlayer } from 'tcplayer'
import Setting from '../components/Setting'
import Face from '../components/Face'
import AddTask from '../components/AddTask.vue'
import EditTask from '../components/EditTask.vue'

var timer = null
export default {
  beforeRouteEnter (to, from, next) {
    next()
  },
  beforeRouteLeave (to, from, next) {
    this.continueCircle = false
    window.clearTimeout(timer)
    next()
  },
  components: { Setting, Face, AddTask, EditTask },
  data () {
    return {
      stream_type: 'online',
      smallLayout: false,
      spinning: false,
      prevTab: '',
      activeTab: '',
      datalist: [],
      dataTotal: 0,
      page_no: 1,
      page_size: 20,
      task: {},
      taskId: '',
      page_no_res: 1,
      page_size_res: 500,
      resDatalist: [],
      filtedResDatalist: [],
      taskResItem: {},
      searchForm: {
        name: ''
      },
      addVisible: false,
      editVisible: false,
      targetKeys: [],
      selectedKeys: [],
      editForm: {},
      editItem: {},
      editKey: '',
      editTag: '', // 'edit' || 'copy'
      facesDatalist: [],
      groupDatalist: [],
      resDataTotal: '',
      continueCircle: true // 是否继续轮循
    }
  },
  mounted () {
    var viewWidth = document.documentElement.clientWidth
    if (viewWidth < 768) {
      this.smallLayout = true
    }

    var ele = document.querySelectorAll('.file-main')
    if (ele.length) {
      ele[0].style.backgroundColor = '#171819'
    }

    this.getTasks()
    this.getAllFaces()
    this.getAllGroups()
  },
  methods: {
    getTasks () {
      var params = {
        page_no: this.page_no,
        page_size: this.page_size,
        stream_type: this.stream_type
      }
      this.spinning = true
      api.getTasks(params).then(res => {
        if (res.data.code === 0) {
          this.datalist = res.data.data
          if (this.page_no === 1) {
            this.dataTotal = res.data.total
          }
          this.spinning = false
          if (this.datalist.length) {
            this.activeTab = this.datalist[0].id
            this.getPlayurl(this.datalist[0].id)
            this.getTaskResults(this.datalist[0].id)
          }
        } else {
          this.$message.error(res.data.message || '请求出错！')
        }
      }).catch(error => {
        this.spinning = false
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        if (error.response && error.response.data) {
          this.$message.error(error.response.data.message || '获取任务列表出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    tabChange (tab) {
      if (tab === 'add') {
        this.addVisible = true
        this.targetKeys = []
        this.activeTab = this.prevTab
      } else {
        this.activeTab = tab
        this.page_no_res = 1
        this.resDataTotal = ''
        this.getPlayurl(tab)
        this.getTaskResults(tab)
      }
    },
    tabClick () {
      this.prevTab = this.activeTab
    },
    getPlayurl (tid) {
      var params = {
        id: tid
      }
      api.getTasksById(params).then(res => {
        if (res.data.code === 0) {
          this.task = res.data
          if (this.task && this.task.url && this.task.url !== 'undefined') {
            this.createPlayer()
          }
        } else {
          this.$message.error(res.data.message || '请求出错！')
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
    getTaskResults (tid) {
      var that = this
      var params = {
        id: tid,
        page_no: this.page_no_res,
        page_size: this.page_size_res
      }
      api.getTaskResults(params).then(res => {
        if (res.data.code === 0) {
          this.resDatalist = this.resDatalist.concat(res.data.data)
          this.resDataTotal = res.data.total
          this.page_no_res += 1
          this.filtedResDatalist = this.resDatalist

          window.clearTimeout(timer)
          if (this.continueCircle && res.data.data.length === this.page_size_res) {
            timer = window.setTimeout(function () {
              that.getTaskResults(tid)
            }, 0)
          }
        } else {
          this.$message.error(res.data.message || '请求出错！')
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
    createPlayer () {
      var url = this.task.url
      // var url = 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov'

      let obj = document.createElement('OBJECT')
      obj.setAttribute('id', 'vlc')
      obj.setAttribute('classid', 'clsid:9BE31822-FDAD-461B-AD51-BE1D1C159921')
      obj.setAttribute('codebase', 'http://comic.sjtu.edu.cn/vlc/cab/axvlc.cab')
      obj.setAttribute('type', 'application/x-vlc-plugin')
      obj.setAttribute('events', true)

      let param1 = document.createElement('param')
      param1.setAttribute('name', 'mrl')
      param1.setAttribute('value', url)
      obj.appendChild(param1)

      let param2 = document.createElement('param')
      param2.setAttribute('name', 'src')
      param2.setAttribute('value', url)
      obj.appendChild(param2)

      let param3 = document.createElement('param')
      param3.setAttribute('name', 'controls')
      param3.setAttribute('value', true)
      obj.appendChild(param3)

      let param4 = document.createElement('param')
      param4.setAttribute('name', 'autoplay')
      param4.setAttribute('value', true)
      obj.appendChild(param4)

      let embed = document.createElement('embed')
      embed.setAttribute('type', 'application/x-vlc-plugin')
      embed.setAttribute('version', 'VideoLAN.VLCPlugin.3.0.11')
      embed.setAttribute('autoplay', 'yes')
      embed.setAttribute('loop', 'no')
      embed.setAttribute('width', '100%')
      embed.setAttribute('height', '480')
      embed.setAttribute('target', url)
      obj.appendChild(embed)

      obj.setAttribute('width', '100%')
      obj.setAttribute('height', '480')
      this.$refs['videoobj'].appendChild(obj)
      // 在这里通过ocxTest的id来寻找到ocx控件
      // this.vlc = document.getElementById('vlc')
    },
    videoFixed (params) {
      this.taskResItem = params.item
      // var timeStr = params.currentTime
      // var h = 0
      // var m = 0
      // var s = 0
      // if (timeStr.indexOf('时') !== -1) {
      //   h = timeStr.substring(0, timeStr.indexOf('时'))
      //   timeStr = timeStr.replace(timeStr.substring(0, timeStr.indexOf('时') + 1), '')
      // }
      // if (timeStr.indexOf('分') !== -1) {
      //   m = timeStr.substring(0, timeStr.indexOf('分'))
      //   timeStr = timeStr.replace(timeStr.substring(0, timeStr.indexOf('分') + 1), '')
      // }
      // if (timeStr.indexOf('秒') !== -1) {
      //   s = timeStr.substring(0, timeStr.indexOf('秒'))
      // }
      // var time = parseInt(h * 3600) + parseInt(m * 60) + parseInt(s)
      // // console.log(h + ':' + m + ':' + s + ':::' + time)
      // window.player.currentTime(time)
    },
    delTask (record, idx) {
      api.delTask({id: record.id}).then(res => {
        if (res.data.code === 0) {
          // this.datalist.splice(idx, 1)
          this.$message.success('任务删除成功')
          this.getTasks()
        } else {
          this.$message.error(res.data.message || '请求出错！')
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        if (error.response && error.response.data) {
          this.$message.error(error.response.data.message || '删除出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    toEdit (item, key, tag) {
      this.editTag = tag
      this.editVisible = true
      this.editItem = item
      this.editKey = key
      this.editForm = item
      this.editForm.type = parseInt(this.editForm.type)
      this.targetKeys = this.editForm.face_ids
    },
    resume (item, key) {
      var params = {
        id: item.id
      }
      api.taskResume(params).then(res => {
        if (res.data.code === 0) {
          // this.datalist[key].status = 1
          this.$message.success('任务已恢复')
          this.getTasks()
        } else {
          this.$message.error(res.data.message || '请求出错！')
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        if (error.response && error.response.data) {
          this.$message.error(error.response.data.message || '任务恢复出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    pause (item, key) {
      var params = {
        id: item.id
      }
      api.taskPause(params).then(res => {
        if (res.data.code === 0) {
          // this.datalist[key].status = 2
          this.$message.success('任务已暂停')
          this.getTasks()
        } else {
          this.$message.error(res.data.message || '请求出错！')
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        if (error.response && error.response.data) {
          this.$message.error(error.response.data.message || '任务暂停出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    reset (item, key) {
      var params = {
        id: item.id
      }
      api.taskReset(params).then(res => {
        if (res.data.code === 0) {
          // this.datalist[key].status = 1
          this.$message.success('任务已重置')
          this.getTasks()
        } else {
          this.$message.error(res.data.message || '请求出错！')
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        if (error.response && error.response.data) {
          this.$message.error(error.response.data.message || '任务重置出错！')
        } else {
          this.$message.error('接口调用失败！')
        }
      })
    },
    updateData (params) {
      this[params.key] = params.val
    },
    getAllFaces () {
      api.getFaces().then(res => {
        if (res.data.code === 0) {
          var faceArr = res.data.data
          faceArr.map((item, key, arr) => {
            item.key = item.FaceID
            item.title = item.Name
          })
          this.facesDatalist = faceArr
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        // if (error.response && error.response.data) {
        //   this.$message.error(error.response.data.message || '获取人像列表出错！')
        // } else {
        //   this.$message.error('接口调用失败！')
        // }
      })
    },
    searchHandleOk () {
      var filterName = this.searchForm.name
      if (filterName === '') {
        // this.filtedResDatalist = this.resDatalist
        this.continueCircle = true
        this.getTaskResults(this.activeTab)
      } else {
        this.continueCircle = false
        window.clearTimeout(timer)
        var arr = this.resDatalist
        arr = arr.filter((item, val, array) => {
          if (item.face_name && item.face_name === filterName) {
            return true
          } else {
            return false
          }
        })
        this.filtedResDatalist = arr
      }
    },
    getAllGroups () {
      api.getGroups().then(res => {
        if (res.data.code === 0) {
          var groupArr = res.data.data
          this.groupDatalist = groupArr
        }
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
          })
        }
        // if (error.response && error.response.data) {
        //   this.$message.error(error.response.data.message || '获取明星列表出错！')
        // } else {
        //   this.$message.error('接口调用失败！')
        // }
      })
    }
  }
}
</script>
<style scoped>
.liveWrap {
  display: flex;
}
.liveWrap .sliderWrap {
  width: 91px;
}
.oprateWrap {
  margin: 0 15px 15px;
}
.videoWrap {
  flex: 1;
  display: flex;
  height: 100%;
}
.d-left {
  width: 50%;
  height: 100%;
}
.d-right {
  width: 50%;
  height: 100%;
  overflow-y: hidden;
}
.media-wrapper {
  width: 100%;
  z-index: 1000;
  box-sizing: border-box;
}
.media-wrapper .media-player {
  text-align: center;
  width: 100%;
  position: relative;
}
.playwrap {
  padding: 0 5px;
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
</style>
