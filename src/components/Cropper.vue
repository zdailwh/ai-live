<template>
  <div class="cropper-content">
    <div class="cropper-box">
      <div class="cropper">
        <vue-cropper
          ref="cropper"
          :img="option.img"
          :outputSize="option.outputSize"
          :outputType="option.outputType"
          :info="option.info"
          :canScale="option.canScale"
          :autoCrop="option.autoCrop"
          :autoCropWidth="option.autoCropWidth"
          :autoCropHeight="option.autoCropHeight"
          :fixed="option.fixed"
          :fixedNumber="option.fixedNumber"
          :full="option.full"
          :fixedBox="option.fixedBox"
          :canMove="option.canMove"
          :canMoveBox="option.canMoveBox"
          :original="option.original"
          :centerBox="option.centerBox"
          :height="option.height"
          :infoTrue="option.infoTrue"
          :maxImgSize="option.maxImgSize"
          :enlarge="option.enlarge"
          :mode="option.mode"
          @realTime="realTime"
          @imgLoad="imgLoad"
        >
        </vue-cropper>
      </div>
      <!-- <div>
        <a-radio-group v-model="side">
          <a-radio :value="0">正脸</a-radio>
          <a-radio :value="1">左侧</a-radio>
          <a-radio :value="2">右侧</a-radio>
        </a-radio-group>
      </div> -->
      <!--底部操作工具按钮-->
      <div class="footer-btn">
        <div class="scope-btn">
          <template v-if="showInputImg">
            <label class="btn" for="uploads">选择人像</label>
            <input type="file" id="uploads" style="position:absolute; clip:rect(0 0 0 0);" accept="image/png, image/jpeg, image/gif, image/jpg" @change="selectImg($event)">
          </template>
          <!-- <a-button size="small" type="primary" icon="scissor" @click="startCrop" v-if="!crap">开始截图</a-button>
          <a-button size="small" type="primary" icon="scissor" @click="stopCrop" v-else>停止截图</a-button> -->
          <a-button size="small" type="primary" ghost icon="zoom-in" :disabled="disableScaleBig" @click="changeScale(1)">放大</a-button>
          <a-button size="small" type="primary" ghost icon="zoom-out" @click="changeScale(-1)">缩小</a-button>
          <!-- <a-button size="small" type="primary" ghost @click="rotateLeft">↺ 左旋转</a-button>
          <a-button size="small" type="primary" ghost @click="rotateRight">↻ 右旋转</a-button> -->
        </div>
        <div class="upload-btn" v-if="showUseImg">
          <a-button size="small" type="primary" icon="cloud-upload" @click="useImg('base64')">使用截图</a-button>
        </div>
        <div class="upload-btn" v-if="showUploadImg">
          <a-button size="small" type="primary" icon="cloud-upload" @click="uploadImg('base64')">上传截图</a-button>
        </div>
      </div>
    </div>
    <!--预览效果图-->
    <div class="show-preview" :style="{'width': previews.w + 'px', 'height': previews.h + 'px',  'overflow': 'hidden', 'margin': '5px'}">
      <div :style="previews.div" class="preview">
        <img :src="previews.url" :style="previews.img">
      </div>
    </div>
  </div>
</template>

<script>
import { VueCropper } from 'vue-cropper'
export default {
  name: 'CropperImage',
  components: {
    VueCropper
  },
  props: {
    Uid: {
      type: String,
      default: ''
    },
    Name: {
      type: String,
      default: ''
    },
    fileObj: {
      type: Object,
      default () {
        return {}
      }
    },
    showInputImg: {
      type: Boolean,
      default: false
    },
    showUseImg: {
      type: Boolean,
      default: false
    },
    showUploadImg: {
      type: Boolean,
      default: false
    },
    cropperVisible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      previews: {},
      crap: false,
      side: 0,
      selectedImg: {},
      option: {
        img: '', // 裁剪图片的地址
        outputSize: 1, // 裁剪生成图片的质量(可选0.1 - 1)
        outputType: 'jpeg', // 裁剪生成图片的格式（jpeg || png || webp）
        info: true, // 图片大小信息
        canScale: false, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        autoCropWidth: 200, // 默认生成截图框宽度
        autoCropHeight: 300, // 默认生成截图框高度
        fixed: true, // 是否开启截图框宽高固定比例
        fixedNumber: [1, 1.5], // 截图框的宽高比例
        full: false, // false按原比例裁切图片，不失真
        fixedBox: true, // 固定截图框大小，不允许改变
        canMove: true, // 上传图片是否可以移动
        canMoveBox: true, // 截图框能否拖动
        original: false, // 上传图片按照原始比例渲染
        centerBox: false, // 截图框是否被限制在图片里面
        height: true, // 是否按照设备的dpr 输出等比例图片
        infoTrue: false, // true为展示真实输出图片宽高，false展示看到的截图框宽高
        maxImgSize: 3000, // 限制图片最大宽度和高度
        enlarge: 1, // 图片根据截图框输出比例倍数
        mode: 'contain' // 图片默认渲染方式
      },
      disableScaleBig: false,
      originWidth: 0,
      originHeight: 0
    }
  },
  watch: {
    fileObj: {
      handler (val, oldVal) {
        if (val && val.originFileObj) {
          this.crap = false

          let reader = new FileReader()
          reader.onload = (e) => {
            this.option.img = reader.result
          }
          // 转化为base64
          reader.readAsDataURL(val.originFileObj)
        }
      },
      deep: true,
      immediate: true
    },
    cropperVisible () {
      document.querySelector('#uploads').value = ''
      this.disableScaleBig = false
      this.option.img = ''
      this.selectedImg = {}
    }
  },
  methods: {
    // 初始化函数
    imgLoad (msg) {
      console.log('工具初始化函数=====' + msg)
    },
    //
    startCrop () {
      this.crap = true
      this.$refs.cropper.startCrop()
    },
    stopCrop () {
      this.crap = false
      this.$refs.cropper.stopCrop()
    },
    // 图片缩放
    changeScale (num) {
      num = num || 1

      var trans = document.querySelector('.cropper-box-canvas').style.transform.split(' ')
      var scaleStr = trans.filter(item => {
        return item.indexOf('scale') !== -1
      })
      var scale = scaleStr[0].substring(6, scaleStr[0].length - 1)

      if (num > 0 && scale * this.originWidth >= this.originWidth) {
        this.disableScaleBig = true
        return
      } else {
        this.disableScaleBig = false
      }

      this.$refs.cropper.changeScale(num)
    },
    // 向左旋转
    rotateLeft () {
      this.$refs.cropper.rotateLeft()
    },
    // 向右旋转
    rotateRight () {
      this.$refs.cropper.rotateRight()
    },
    // 实时预览函数
    realTime (data) {
      this.previews = data
    },
    // 选择图片
    selectImg (e) {
      var _this = this
      let file = e.target.files[0]
      this.selectedImg = file
      if (!/\.(jpg|jpeg|png|JPG|PNG)$/.test(e.target.value)) {
        this.$message({
          message: '图片类型要求：jpeg、jpg、png',
          type: 'error'
        })
        return false
      }
      // 转化为blob
      let reader = new FileReader()
      reader.onload = (e) => {
        let data
        if (typeof e.target.result === 'object') {
          data = window.URL.createObjectURL(new Blob([e.target.result]))
        } else {
          data = e.target.result
        }
        this.option.img = data
        var newimg = new Image()
        newimg.src = data
        newimg.onload = function () {
          _this.originWidth = this.width
          _this.originHeight = this.height
        }
      }
      // 转化为base64
      reader.readAsDataURL(file)
    },
    // 使用截图
    useImg (type) {
      let _this = this
      if (type === 'base64') {
        // 获取截图的base64数据
        this.$refs.cropper.getCropData(async (data) => {
          let imgInfo = {
            uid: _this.Uid,
            name: _this.Name,
            url: data
          }
          _this.$emit('cropperImgSuccess', imgInfo)
        })
      }
    },
    // 上传图片
    uploadImg (type) {
      let _this = this
      console.log(this.selectedImg)
      if (!this.selectedImg.name) {
        this.$message.error('请选择图片！')
        return
      }
      if (type === 'base64') {
        // 获取截图的base64数据
        this.$refs.cropper.getCropData(async (data) => {
          let imgInfo = {
            file: this.selectedImg,
            url: data,
            side: this.side
          }
          _this.$emit('uploadCropperImg', imgInfo)
        })
      }
    }
  }
}
</script>

<style scoped>
.cropper-content{
  display: flex;
  display: -webkit-flex;
  justify-content: flex-end;
}
.cropper-content .cropper-box{
  flex: 1;
  width: 100%;
}
.cropper-content .cropper-box .cropper{
  width: auto;
  height: 400px;
}
.cropper-content .show-preview{
  flex: 1;
  -webkit-flex: 1;
  display: flex;
  display: -webkit-flex;
  justify-content: center;
}
.cropper-content .show-preview .preview {
  overflow: hidden;
  border:1px solid #67c23a;
  background: #cccccc;
}
.cropper-content .show-preview .preview img {
  max-width: unset;
}
.footer-btn{
  margin-top: 15px;
  display: flex;
  display: -webkit-flex;
  justify-content: flex-end;
}
.footer-btn .scope-btn{
  display: flex;
  display: -webkit-flex;
  justify-content: space-between;
}
.footer-btn .upload-btn{
  flex: 1;
  -webkit-flex: 1;
  display: flex;
  display: -webkit-flex;
  justify-content: center;
}
.footer-btn .btn {
  outline: none;
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  -webkit-appearance: none;
  text-align: center;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  outline: 0;
  -webkit-transition: .1s;
  transition: .1s;
  font-weight: 500;
  padding: 5px 15px;
  font-size: 12px;
  border-radius: 3px;
  color: #fff;
  background-color: #409EFF;
  border-color: #409EFF;
  margin-right: 10px;
}
.footer-btn .ant-btn {
  margin-right: 10px;
}
</style>
