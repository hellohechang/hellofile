<template>
  <div v-if="id" class="shareFile">
    <h1><span @click="router.push('/')">{{ username }}</span> 分享文件</h1>
    <div><em :class="`iconfont ${fileLogoType({ type: 'file', name })}`"></em><span @click="openFile">{{ name }}</span>
    </div>
    <button @click="downloadF">下载文件 {{ computeSize(size) }}</button>
  </div>
  <p v-else>文件分享已失效~</p>
</template>

<script setup>
import { onMounted, reactive, toRefs } from "vue"
import { getShareInfoReq, getSharefileReq } from '../api'
import { useRouter } from 'vue-router'
import { downloadFile, fileLogoType, imgPreview, _err, _myOpen, computeSize } from "../utils/utils";
let router = useRouter()
const data = reactive({
  username: '',
  id: '',
  name: '',
  size: 0
})
let { username, id, name, size } = toRefs(data)
let downloadF = () => {
  getSharefileReq({ i: id.value }).then(res => {
    if (res.code == 0) {
      downloadFile(`${window.baseURL}/sharefile/${id.value}/${name.value}`, name.value)
    }
  })
}
let openFile = () => {
  getSharefileReq({ i: id.value }).then(res => {
    if (res.code == 0) {
      let url = `${window.baseURL}/sharefile/${id.value}/${name.value}`
      // 预览图片
      if (/(\.JPG|\.PNG|\.GIF|\.JPEG)$/gi.test(name.value)) {
        imgPreview(url)
        return
      }
      // 打开其他文件
      _myOpen(url, '_blank')
    }
  })
}
onMounted(() => {
  getShareInfoReq({ id: router.currentRoute.value.params.id }).then(res => {
    if (res.code == 0) {
      username.value = res.data.username
      id.value = res.data.id
      name.value = res.data.name
      size.value = res.data.size
    }
  })
})
</script>

<style lang="less" scoped>
.shareFile {
  width: 90%;
  max-width: 600px;
  border: 1px solid #ccc;
  padding: 20px;
  box-sizing: border-box;
  margin: auto;
  text-align: center;

  h1 {
    border-bottom: 1px solid #ccc;
    padding: 20px 0;
    font-size: 20px;

    span {
      cursor: pointer;
      color: #6d64bb;
      font-weight: bold;
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
      color: rgb(104, 83, 190);
      cursor: pointer;
      line-height: 22px;

      &:hover {
        color: rgb(60, 14, 243);
      }
    }

    .iconfont {
      flex: none;
      font-size: 30px;
      margin-right: 10px;
      color: rgb(89, 187, 200);
    }
  }
}

p {
  font-size: 30px;
}
</style>