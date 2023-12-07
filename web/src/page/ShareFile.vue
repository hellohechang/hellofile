<template>
  <div v-if="id" class="shareFile">
    <h1><span @click="router.push('/')">{{ username }}</span> 分享文件</h1>
    <div><em :class="`iconfont ${fileLogoType({ type: 'file', name })}`"></em><span @click="openFile">{{ name }}</span>
    </div>
    <button @click="downloadF">下载文件 {{ computeSize(size) }}</button>
  </div>
  <p v-else>文件分享已失效</p>
  <teleport to="body">
    <PlayVideo :isShow="showVideo" :url="videoUrl" @close="showVideo = false" />
  </teleport>
</template>

<script setup>
import { onMounted, reactive, toRefs } from "vue"
import { getShareInfoReq, getSharefileReq } from '../api'
import { useRouter } from 'vue-router'
import { downloadFile, fileLogoType, imgPreview, _err, _myOpen, computeSize } from "../utils/utils";
import PlayVideo from "../components/PlayVideo.vue";
let router = useRouter()
const data = reactive({
  username: '',
  id: '',
  name: '',
  size: 0,
  showVideo: false,
  videoUrl: ''
})
let { username, id, name, size, showVideo, videoUrl } = toRefs(data)
let downloadF = () => {
  getSharefileReq({ i: id.value }).then(res => {
    if (res.code == 0) {
      downloadFile(`${window.baseURL}/sharefile/${id.value}/${name.value}`, name.value)
    }
  }).catch(err => { })
}
let openFile = () => {
  getSharefileReq({ i: id.value }).then(res => {
    if (res.code == 0) {
      let url = `${window.baseURL}/sharefile/${id.value}/${name.value}`
      // 预览图片
      if (/(\.JPG|\.PNG|\.GIF|\.JPEG)$/gi.test(name.value)) {
        imgPreview([{ u1: url }])
      } else if (/\.mp4/ig.test(name.value)) {
        showVideo.value = true;
        videoUrl.value = url;
      } else {
        // 打开其他文件
        _myOpen(url, '_blank')
      }
    }
  }).catch(err => { })
}
onMounted(() => {
  getShareInfoReq({ id: router.currentRoute.value.params.id }).then(res => {
    if (res.code == 0) {
      username.value = res.data.username
      id.value = res.data.id
      name.value = res.data.name
      size.value = res.data.size
    }
  }).catch(err => { })
})
</script>

<style lang="less" scoped>
.shareFile {
  width: 90%;
  max-width: 600px;
  border: 1px solid var(--border-color);
  padding: 20px;
  box-sizing: border-box;
  margin: auto;
  text-align: center;
  color: var(--text-color);

  h1 {
    border-bottom: 1px solid var(--border-color);
    padding: 20px 0;
    font-size: 20px;

    span {
      cursor: pointer;
      font-weight: bold;

      &:hover {
        color: var(--hover-text-color)
      }
    }
  }

  div {
    padding: 30px 0;
    display: flex;
    align-items: center;
    justify-content: center;

    span {
      word-break: break-all;
      flex: 0 1 auto;
      font-size: 18px;
      cursor: pointer;
      line-height: 22px;

      &:hover {
        color: var(--hover-text-color)
      }
    }

    .iconfont {
      flex: none;
      font-size: 30px;
      margin-right: 10px;
      color: var(--file-logo-color);
    }
  }
}

p {
  font-size: 30px;
}
</style>