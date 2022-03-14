<template>
  <div id="app">
    <a-spin :spinning="pageSpin.spinning" size="large" :tip="pageSpin.tip" class="myPageSpinning">
      <div class="lager-layout">
        <div class="header">
          <div class="opt">
            <div class="logo" v-show="smallLayout === false"><img src="./assets/zg_logo.png"><span class="logo_title">广电专业人像直播审核系统</span></div>
          </div>
          <div class="opt" style="justify-content: flex-end;flex:1;margin-right: 10px;">
            <a-dropdown v-if="currUser.id">
              <a class="ant-dropdown-link" style="color: #9aa1a8; font-size: 16px;" @click="e => e.preventDefault()">
                 {{currUser.username}} <img src="./assets/user.png" alt="" style="width: 28px; margin: 0 5px;"><a-icon type="down" />
              </a>
              <a-menu slot="overlay">
                <!-- <a-menu-item>
                  <router-link to="/user/admin/edit">编辑个人信息</router-link>
                </a-menu-item> -->
                <a-menu-item v-if="$route.path !== '/updatePwdFirst'">
                  <router-link to="/user/admin/updatePwd">修改密码</router-link>
                </a-menu-item>
                <a-menu-item>
                  <a href="javascript:;" @click="logout">退出登录</a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="file-page">
          <div v-if="routeWhiteList.indexOf($route.path) === -1 && $route.path.indexOf('jiankan') === -1" class="file-slider">
            <div class="myTopMenu">
              <a-menu theme="dark" v-model="current" @click="menuClick">
                <template v-if="permission_routes.length">
                  <a-menu-item v-if="!route.hidden" v-for="route in permission_routes" :key="route.meta.active">
                    <router-link :to="route.redirect" :data-top-route="JSON.stringify(route)">
                      <p class="myMenuIcon"><span :class="`iconfont ${route.meta.icon}`"></span></p>
                      <p class="myMenuTitle">{{route.meta.title}}</p>
                    </router-link>
                  </a-menu-item>
                </template>
              </a-menu>
            </div>
          </div>
          <div class="file-main" :style="{ paddingLeft: (routeWhiteList.indexOf($route.path) === -1 && $route.path.indexOf('jiankan') === -1) ? '166px': '0px' }">
            <div v-if="showSubMenu" class="mySubMenu">
              <a-menu v-if="topRoute && topRoute.children && topRoute.children.length" v-model="currentChild" mode="horizontal">
                <a-menu-item v-if="!rou.hidden" v-for="rou in topRoute.children" :key="`${topRoute.path}/${rou.path}`" :style="{float: rou.path.indexOf('sysrestart') !== -1 ? 'right' : ''}">
                  {{rou.meta.title}}
                </a-menu-item>
              </a-menu>
            </div>
            <router-view/>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'App',
  data: function () {
    return {
      smallLayout: false,
      showMenus: false,
      topRoute: {},
      routeWhiteList: [ '/login', '/updatePwdFirst', '/404', '/500', '/jiankan' ]
    }
  },
  computed: {
    currUser: {
      get () {
        var token = this.$store.state.authentication.token
        return token ? JSON.parse(token) : {}
      },
      set (val) {
        // this.$router.push({ path: val[0] || '/' })
      }
    },
    current: {
      get () {
        return [this.$route.meta.active || '']
      },
      set (val) {
        // this.$router.push({ path: val[0] || '/' })
      }
    },
    currentChild: {
      get () {
        return [this.$route.path]
      },
      set (val) {
        this.$router.push({ path: val[0] || '/' })
      }
    },
    showSubMenu () {
      var hideSubMenuRoute = ['Login', 'UpdatePwdFirst', 'TaskResult', 'MyEdit', 'MyUpdatePwd', '404', '500', 'Jiankan', 'JiankanAll']
      if (hideSubMenuRoute.indexOf(this.$route.name) !== -1) {
        return false
      } else {
        return true
      }
    },
    ...mapGetters([
      'permission_routes',
      'pageSpin'
    ])
  },
  watch: {
    '$route' (val) {
      var topRouteName = val.matched[0].name
      this.topRoute = this.permission_routes.filter(item => {
        return item.name === topRouteName
      })[0]
    }
  },
  mounted () {
    var viewWidth = document.documentElement.clientWidth
    if (viewWidth < 540) {
      this.smallLayout = true
    }
  },
  methods: {
    menuClick ({domEvent, item, key, keyPath}) {
      // console.log(item)
      // console.log(key)
      // console.log(keyPath)
      var currTopRoute = domEvent.target.dataset.topRoute
      this.topRoute = JSON.parse(currTopRoute)
    },
    logout () {
      // this.$store.commit('permission/SET_ROUTES', [])
      this.showMenus = false
      this.$store.dispatch('authentication/logout').then((res) => {
        if (res.data.code === 0) {
          this.$router.push({ path: '/login' })
        } else {
          this.$message.error(res.data.message)
        }
      }).catch((error) => {
        if (error.response.status === 401) {
          this.$store.dispatch('authentication/resetToken').then(() => {
            this.$router.push({ path: '/login' })
            window.history.go(0)
          })
        } else {
          this.$message.error(error.response.data.message || error.response.data || '接口调用失败！')
        }
      })
    }
  }
}
</script>

<style>
@import './styles/font/iconfont.css';
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  /*background-color: #171819;*/
  overflow: hidden;
}
.header {
  height: 60px;
  width: 100%;
  background-color: #1a2025;
  display: flex;
  position: fixed;
  z-index: 1000;
  line-height: 60px;
  padding: 0;
  align-self: center;
}
.header .opt {
  display: flex;
}
.header .logo {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.header .logo img {
  max-height: 27px;
  margin-left: 30px;
}
.header .logo .logo_title {
  height: 60px;
  line-height: 60px;
  display: inline-block;
  font-size: 16px;
  color: #fff;
  /*letter-spacing: 1px;*/
  margin-left: 10px;
  margin-right: 10px;
}

.container {
  height: 100%;
  width: 100%;
  margin: 0 auto;
  margin-bottom: 0px;
  flex: 1;
  display: flex;
  position: relative;
  /*background-color: #171819;*/
}
.file-page {
  width: 100%;
  height: 100%;
  padding-top: 60px;
}
.file-slider {
  width: 142px;
  margin: 84px 24px 24px;
  height: calc(100vh - 108px);
  overflow: auto;
  background: #1a2025;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 9;
  letter-spacing: 1px;
  border-radius: 10px;
}
.file-page .file-main {
  width: 100%;
  height: 100%;
  /*background-color: #171819;*/
  overflow: auto;
  padding: 0 0 0 0;
}

/* 覆盖ant样式 */
.login-form .ant-input, .cut_catalog_dropdown .ant-input {
  background-color: #161616;
  border: 1px solid #3c3c3c;
  border-radius: 4px;
  font-size: 14px;
  color: #fff;
}

.d-right .ant-tabs {
  color: #a2a2a2;
}
.d-right .ant-tabs-tab-prev, .d-right .ant-tabs-tab-next {
  color: #a2a2a2;
}
.d-right .ant-tabs-bar {
  border-bottom: 1px solid #555;
}
.d-right .ant-tabs-nav .ant-tabs-tab-active {
  color: #fff;
}
.d-right .ant-tabs-nav .ant-tabs-tab:hover {
  color: #fff;
}
.d-right .ant-tabs-ink-bar {
  background-color: #fff;
}
.searchWrap_video .ant-form-item-label > label {
  color: #fff;
}
.searchWrap_video .ant-select-selection {
  background-color: #161616;
  border: 1px solid #3c3c3c;
  border-radius: 4px;
  font-size: 14px;
  color: #fff;
}
.searchWrap_video .ant-select-selection--multiple .ant-select-selection__choice {
  background-color: #000;
  color: #989898;
  border: 1px solid #989898;
}
.searchWrap_video .ant-select-selection--multiple .ant-select-selection__choice__remove {
  color: #989898;
}
.searchWrap_video .ant-input {
  background-color: #161616;
  border: 1px solid #3c3c3c;
  border-radius: 4px;
  font-size: 14px;
  color: #fff;
}
.searchWrap_video .ant-input-clear-icon,.searchWrap_video .ant-select-arrow {
  color: rgba(255,255,255,.5);
}

.ant-card-cover {
  position: relative;
  width: 100%;
  height: 0;
  padding-top: 75%;
  overflow: hidden;
}
.taskContainer .ant-card-cover {
  padding-top: 57% !important;
}
.ant-card-cover img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 100%;
  height: auto;
}
.ant-card-cover video {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 100%;
  height: auto;
}

.cardList {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.cardList .cardItem {
  width: 200px;
  height: auto;
  margin: 5px;
}

/* 定位时显示详细信息 */
.vcp-slider {
  opacity: 1;
}
.absDetailWrap {
  position: absolute;
  top: 0;
  left: 120%;
  padding: 15px;
  width: 250px;
  height: 300px;
  overflow-y: scroll;
  font-size: 14px;
  text-align: left;
  background-color: #fff;
  border-radius: 15px;
  z-index: 9999;
}
.absDetailWrap p {
  word-break: break-all;
}
/*穿梭框*/
.ant-transfer-customize-list {
  flex-wrap: wrap;
}
.ant-transfer-list-body-customize-wrapper {
  height: calc(260px - 40px - 44px);
  overflow-y: scroll;
}
</style>
