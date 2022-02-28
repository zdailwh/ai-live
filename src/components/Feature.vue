<template>
  <div class="featuresOfFaceList">
    <template v-for="(item,k) in fileList">
      <div v-if="item.status === 1" :key="k" class="imgWrap">
        <div class="box borderGray">
          <img class="tablePopImg" :src="item.fileuri" @click="handlePreview(item)" />
          <div class="del">
            <a-icon type="delete" @click="delFeature(item)" />
          </div>
        </div>
      </div>
      <div v-else-if="item.status === 2" :key="k" class="imgWrap">
        <div class="box borderGreen">
          <img class="tablePopImg" :src="item.fileuri" @click="handlePreview(item)" />
          <div class="del">
            <a-icon type="delete" @click="delFeature(item)" />
          </div>
        </div>
      </div>
      <div v-else-if="item.status === 3" :key="k" class="imgWrap">
        <div class="box borderRed">
          <img class="tablePopImg" :src="item.fileuri" @click="handlePreview(item)" />
          <div class="del">
            <a-icon type="delete" @click="delFeature(item)" />
          </div>
        </div>
        <p class="errMsg">{{item.errorMessage}}</p>
      </div>
    </template>
    <div class="my-addimg" v-if="fileList.length < imgMaxLength" @click="$emit('change-cropper-visible', true)">
      <a-icon type="plus" />
    </div>

    <!--图片预览-->
    <a-modal :visible="previewVisible" :footer="null" @cancel="previewVisible = false" width="250px">
      <img alt="example" style="margin-top: 30px;" :src="previewImage" />
    </a-modal>
  </div>
</template>
<script>
import api from '../api'
export default {
  props: [ 'face' ],
  data () {
    return {
      previewImage: '',
      previewVisible: false,
      imgMaxLength: 5, // 最多上传5张人像图
      fileList: [
        {
          uid: '-1',
          name: 'image.png',
          status: 1,
          url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
          fileuri: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
        },
        {
          uid: '-2',
          name: 'image.png',
          status: 2,
          url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
          fileuri: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
        },
        {
          uid: '-2',
          name: 'image.png',
          status: 3,
          url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
          fileuri: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
        }
      ]
    }
  },
  watch: {
    face: {
      handler (val, oldVal) {
        if (val.features) {
          this.fileList = val.features.map(item => {
            var o = item
            o.uid = item.id
            o.url = item.fileuri
            return o
          })
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    beforeUpload (file, fileList) {
      const isImg = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
      if (!isImg) {
        this.$message.error('请选择图片文件!')
        return false
      }
      return false
    },
    handleRemove (file) {
      this.delFeature(file)
    },
    delFeature (feature) {
      var _this = this
      this.$confirm({
        content: '确定要删除该人像特征图吗？',
        okText: '继续删除',
        cancelText: '取消',
        onOk () {
          api.delFeature({ id: feature.id }).then(res => {
            if (res.data.code === 0) {
              _this.$emit('getfacelist')
              _this.$message.success('特征图删除成功')
            } else {
              _this.$message.error(res.data.message || '请求出错！')
            }
          }).catch(error => {
            if (error.response && error.response.status === 401) {
              _this.$store.dispatch('authentication/resetToken').then(() => {
                _this.$router.push({ path: '/login' })
              })
            }
            if (error.response && error.response.data) {
              _this.$message.error(error.response.data.message || '删除出错！')
            } else {
              _this.$message.error('接口调用失败！')
            }
          })
        },
        onCancel () {}
      })
    },
    async handlePreview (feature) {
      this.previewImage = feature.fileuri
      this.previewVisible = true
    }
  }
}

</script>

<style>
.featuresOfFaceList {
  display: flex;
}
.imgWrap {
}
.imgWrap .box {
  position: relative;
  padding: 4px;
  border-radius: 4px;
  width: 50px;
  height: 70px;
  margin-right: 2px;
}
.imgWrap .errMsg {
  white-space: normal;
  line-height: 13px;
  font-size: 12px;
}
.imgWrap:hover .del {
  display: block;
}
.imgWrap .del {
  display: none;
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  text-align: center;
  line-height: 18px;
  background-color: rgba(0,0,0,.5);
}
.imgWrap .del .anticon {
  color: #fff;
  cursor: pointer;
  font-size: 14px;
}
.borderGray {
  border: 1px solid #d9d9d9;
}
.borderGreen {
  border: 1px solid #87d068;
}
.borderRed {
  border: 1px solid #f5222d;
}
.my-addimg {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 50px;
  height: 70px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
}
.tablePopImg {
  width: 40px;
  height: 60px;
  cursor: pointer;
}
</style>
