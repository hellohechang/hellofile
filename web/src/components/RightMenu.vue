<template>
  <transition name="rBox">
    <div @click="hdClick" v-show="isShow" class="rightBox">
      <div ref="menuBox" class="menuBox">
        <button v-show="seleckArr.length === 1 && seleckArr[0].type === 'file'" @click="handleFile('share')">分享</button>
        <button v-show="seleckArr.length === 1" @click="handleFile('rename')">重命名</button>
        <button v-show="seleckArr.every(item => item.type === 'file')" @click="handleFile('download')">下载</button>
        <button @click="handleFile('copy')">复制</button>
        <button @click="handleFile('move')">移动</button>
        <button v-show="seleckArr.length === 1 && !/(\.zip)/gi.test(seleckArr[0].name)"
          @click="handleFile('zip')">压缩</button>
        <button v-show="seleckArr.length === 1 && /(\.zip)/gi.test(seleckArr[0].name)"
          @click="handleFile('unzip')">解压缩</button>
        <button @click="handleFile('delete')">删除</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
// API
import { deleteReq, renameReq, zipReq, unzipReq, moveReq, copyReq, shareReq } from "../api";
//组件
import confirmBox from './confirmBox'
import seleckPath from './seleckPath'
//路由
import { useRouter } from "vue-router";
//工具
import { deepClone, _err, downloadFile, _success, isFileName } from "../utils/utils";
// pinia
import { usepathArrStore } from '../store/pathArr'
import { storeToRefs } from 'pinia';
import $bus from '../utils/bus'
import { computed, nextTick, reactive, ref, toRefs } from "vue"

let router = useRouter()
const pathArrStore = usepathArrStore()
let { pathArr } = storeToRefs(pathArrStore)
const data = reactive({
  isShow: false
})
let { isShow } = toRefs(data)
let menuBox = ref()
let props = defineProps({
  // 列表数据
  fileList: {
    type: Array,
    default: []
  }
})
// 刷新列表
let emit = defineEmits(['renderList'])
// 获取选中的文件
let seleckArr = computed(() => {
  return props.fileList.filter(item => item.checked)
})
let hdClick = (e) => {
  if (e.target.className === "rightBox") {
    isShow.value = false
    // 取消选中
    $bus.emit('clearSelect')
  }
}
// 定位
let showMenuBox = (e) => {
  isShow.value = true
  nextTick(() => {
    let ww = window.innerWidth;
    let h = window.innerHeight,
      mtw = menuBox.value.offsetWidth,
      mth = menuBox.value.offsetHeight,
      x = e.clientX,
      y = e.clientY;
    x < ww / 2 ? null : (x = x - mtw);
    y < h / 2 ? null : (y = y - mth);
    x < 0 ? x = 0 : (x + mtw > ww ? x = ww - mtw : null);
    y < 0 ? y = 0 : (y + mth > h ? y = h - mth : null);
    menuBox.value.style.top = y + 'px'
    menuBox.value.style.left = x + 'px'
  })
}
// 暴露方法
defineExpose({ showMenuBox })
// 处理选项
let handleFile = (type) => {
  isShow.value = false
  //删除
  if (type === 'delete') {
    confirmBox({ title: '确认删除选中文件和文件夹？' }, ({ type, data, close }) => {
      close()
      if (type === 'confirm') {
        deleteReq({ path: pathArr.value, data: seleckArr.value }).then(res => {
          if (res.code == 0) {
            _success('删除成功')
            emit('renderList', true)
          }
        }).catch(err => { })
        return
      }
    })
  } else if (type === 'share') {
    shareReq({ path: pathArr.value, data: seleckArr.value }).then(res => {
      if (res.code == 0) {
        _success('分享文件成功')
        router.push("/sharelist");
      }
    }).catch(err => { })
  } else if (type === 'rename') {
    // 重命名
    confirmBox({ title: '重命名', data: [{ value: seleckArr.value[0].name }] }, ({ type, data, close }) => {
      if (type === 'confirm') {
        if (!data[0] || data[0] === seleckArr.value[0].name) return;
        if (!isFileName(data[0])) {
          _err('名称格式错误')
          return
        }
        renameReq({
          path: pathArr.value,
          data: seleckArr.value,
          name: data[0]
        }).then(res => {
          if (res.code == 0) {
            close()
            _success('重命名成功')
            emit('renderList')
          }
        }).catch(err => { })
        return
      }
      close()
    })
  } else if (type === 'download') {
    if (seleckArr.value.length > 5) {
      _err('单次不能下载超过5个')
      return
    }
    seleckArr.value.forEach(item => {
      if (item.type === "file") {
        let path = deepClone(pathArr.value);
        path.push(item.name);
        downloadFile(
          `${window.baseURL}/getfile/${path.join("/")}`,
          item.name
        );
      }
    });
  } else if (type === 'copy') {
    seleckPath({ title: '复制文件到', pathArr: pathArr.value, seleckArr: seleckArr.value }, ({ type, path, close }) => {
      if (type === 'confirm') {
        let from = pathArr.value
        let to = path
        if (from.join('') === to.join('')) {
          close()
          return
        }
        copyReq({ from, to, data: seleckArr.value }).then(res => {
          if (res.code == 0) {
            close()
            _success('复制成功')
            pathArrStore.setPathArr(to)
            emit('renderList')
          }
        }).catch(err => { })
        return
      }
      close()
    })
  } else if (type === 'move') {
    seleckPath({ title: '移动文件到', pathArr: pathArr.value, seleckArr: seleckArr.value }, ({ type, path, close }) => {
      if (type === 'confirm') {
        let from = pathArr.value
        let to = path
        if (from.join('') === to.join('')) {
          close()
          return
        }
        moveReq({ from, to, data: seleckArr.value }).then(res => {
          if (res.code == 0) {
            close()
            _success('移动成功')
            pathArrStore.setPathArr(to)
            emit('renderList')
          }
        }).catch(err => { })
        return
      }
      close()
    })
  } else if (type === 'zip') {
    seleckPath({ title: '压缩到', pathArr: pathArr.value, seleckArr: seleckArr.value }, ({ type, path, close }) => {
      if (type === 'confirm') {
        let from = pathArr.value
        let to = path
        zipReq({ from, to, data: seleckArr.value }).then(res => {
          if (res.code == 0) {
            close()
            _success('压缩成功')
            pathArrStore.setPathArr(to)
            emit('renderList')
          }
        }).catch(err => { })
        return
      }
      close()
    })
  } else if (type === 'unzip') {
    seleckPath({ title: '解压到', pathArr: pathArr.value, seleckArr: seleckArr.value }, ({ type, path, close }) => {
      if (type === 'confirm') {
        let from = pathArr.value
        let to = path
        unzipReq({ from, to, data: seleckArr.value }).then(res => {
          if (res.code == 0) {
            close()
            _success('解压成功')
            pathArrStore.setPathArr(to)
            emit('renderList')
          }
        }).catch(err => { })
        return
      }
      close()
    })
  }
}
</script>

<style lang="less" scoped>
.rightBox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 2;

  .menuBox {
    display: flex;
    flex-flow: column;
    width: 150px;
    border: 1px solid var(--border-color);
    padding: 5px;
    box-sizing: border-box;
    position: absolute;
    background-color: var(--main-background-color);
  }
}

.rBox-enter-from,
.rBox-leave-to {
  opacity: 0;
}

.rBox-enter-active,
.rBox-leave-active {
  transition: .5s ease-in-out;
}

.rBox-enter-to,
.rBox-leave-from {
  opacity: 1;
}
</style>