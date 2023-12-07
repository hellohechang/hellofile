<template>
  <div class="fileOption">
    <span>选中</span><span class="selectNum">{{ seleckArr.length }}</span>
    <button v-show="seleckArr.length === 1 && seleckArr[0].type === 'file'" @click="handleFile('share')">分享</button>
    <button v-show="seleckArr.length === 1" @click="handleFile('rename')">重命名</button>
    <button v-show="seleckArr.every(item => item.type === 'file')" @click="handleFile('download')">下载</button>
    <button @click="handleFile('copy')">复制</button>
    <button @click="handleFile('move')">移动</button>
    <button v-show="seleckArr.length === 1 && !/(\.zip)/gi.test(seleckArr[0].name)" @click="handleFile('zip')">压缩</button>
    <button v-show="seleckArr.length === 1 && /(\.zip)/gi.test(seleckArr[0].name)"
      @click="handleFile('unzip')">解压缩</button>
    <button @click="handleFile('delete')">删除</button>
    <button @click="handleFile('close')">取消</button>
  </div>
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

import $bus from '../utils/bus'

// let $bus = getCurrentInstance().appContext.config.globalProperties.$bus;

let router = useRouter()
// 接收参数
let props = defineProps({
  // 选中的文件
  seleckArr: {
    type: Array,
    default: []
  },
  //当前路径
  pathArr: {
    type: Array,
    default: []
  }
})
let emit = defineEmits(['updateList'])
let handleFile = (type) => {
  //删除
  if (type === 'delete') {
    confirmBox({ title: '确认删除选中文件和文件夹？' }, ({ type, data, close }) => {
      close()
      if (type === 'confirm') {
        deleteReq({ path: props.pathArr, data: props.seleckArr }).then(res => {
          if (res.code == 0) {
            _success('删除成功')
            emit('updateList', { isDelFile: true })
          }
        }).catch(err => { })
        return
      }
    })
  } else if (type === 'share') {
    shareReq({ path: props.pathArr, data: props.seleckArr }).then(res => {
      if (res.code == 0) {
        _success('分享文件成功')
        router.push("/sharelist");
      }
    }).catch(err => { })
  } else if (type === 'rename') {
    // 重命名
    confirmBox({ title: '重命名', data: [{ value: props.seleckArr[0].name }] }, ({ type, data, close }) => {
      if (type === 'confirm') {
        if (!data[0] || data[0] === props.seleckArr[0].name) return;
        if (!isFileName(data[0])) {
          _err('名称格式错误')
          return
        }
        renameReq({
          path: props.pathArr,
          data: props.seleckArr,
          name: data[0]
        }).then(res => {
          if (res.code == 0) {
            close()
            _success('重命名成功')
            emit('updateList')
          }
        }).catch(err => { })
        return
      }
      close()
    })
  } else if (type === 'download') {
    if (props.seleckArr.length > 5) {
      _err('单次不能下载超过5个')
      return
    }
    props.seleckArr.forEach(item => {
      if (item.type === "file") {
        let path = deepClone(props.pathArr);
        path.push(item.name);
        downloadFile(
          `${window.baseURL}/getfile/${path.join("/")}`,
          item.name
        );
      }
    });
  } else if (type === 'copy') {
    seleckPath({ title: '复制文件到', pathArr: props.pathArr, seleckArr: props.seleckArr }, ({ type, path, close }) => {
      if (type === 'confirm') {
        let from = props.pathArr
        let to = path
        if (from.join('') === to.join('')) {
          close()
          return
        }
        copyReq({ from, to, data: props.seleckArr }).then(res => {
          if (res.code == 0) {
            close()
            _success('复制成功')
            emit('updateList', {
              arr: to
            })
          }
        }).catch(err => { })
        return
      }
      close()
    })
  } else if (type === 'move') {
    seleckPath({ title: '移动文件到', pathArr: props.pathArr, seleckArr: props.seleckArr }, ({ type, path, close }) => {
      if (type === 'confirm') {
        let from = props.pathArr
        let to = path
        if (from.join('') === to.join('')) {
          close()
          return
        }
        moveReq({ from, to, data: props.seleckArr }).then(res => {
          if (res.code == 0) {
            close()
            _success('移动成功')
            emit('updateList', {
              arr: to
            })
          }
        }).catch(err => { })
        return
      }
      close()
    })
  } else if (type === 'zip') {
    seleckPath({ title: '压缩到', pathArr: props.pathArr, seleckArr: props.seleckArr }, ({ type, path, close }) => {
      if (type === 'confirm') {
        let from = props.pathArr
        let to = path
        zipReq({ from, to, data: props.seleckArr }).then(res => {
          if (res.code == 0) {
            close()
            _success('压缩成功')
            emit('updateList', {
              arr: to
            })
          }
        }).catch(err => { })
        return
      }
      close()
    })
  } else if (type === 'unzip') {
    seleckPath({ title: '解压到', pathArr: props.pathArr, seleckArr: props.seleckArr }, ({ type, path, close }) => {
      if (type === 'confirm') {
        let from = props.pathArr
        let to = path
        unzipReq({ from, to, data: props.seleckArr }).then(res => {
          if (res.code == 0) {
            close()
            _success('解压成功')
            emit('updateList', {
              arr: to
            })
          }
        }).catch(err => { })
        return
      }
      close()
    })
  } else if (type === 'close') {
    $bus.emit('clearSelect')
  }
}
</script>

<style lang="less" scoped>
.fileOption {
  box-sizing: border-box;
  padding: 5px;

  .selectNum {
    padding: 0 6px;
  }
}
</style>