<template>
  <transition name="box">
    <div v-show="isShow" @click="hideBox" class="seleckBox">
      <transition name="m">
        <div v-show="isShow" class="main">
          <h1>{{ title }}</h1>
          <div class="filelist">
            <div class="top">
              <BreadCrumb @changePath="changePath" :pathArr="parr"></BreadCrumb>
            </div>
            <div class="list">
              <p v-if="fileList.length == 0">It feels lonely here...</p>
              <ul @click="checkFile(obj)" v-for="(obj, index) in fileList" :key="index">
                <li>
                  <em class="iconfont icon-24gl-folderOpen"></em>
                  <span>{{ obj.name }}</span>
                </li>
              </ul>
            </div>
          </div>
          <div class="btn">
            <button @click="hdClick('cancel')">取消</button>
            <button @click="hdClick('confirm')">确认</button>
          </div>
          <div @click="hdClick('close')" class="close iconfont icon-guanbi"></div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
// API
import { readDirReq } from '../api'
//组件
import BreadCrumb from './BreadCrumb.vue'
//工具
import { deepClone, mixedSort, _setTimeout } from '../utils/utils'

import { onMounted, reactive, toRefs } from "vue"
//接收参数
let props = defineProps({
  //名称
  title: {
    type: String,
    default: ''
  },
  //当前路径
  pathArr: {
    type: Array,
    default: []
  },
  //选择文件
  seleckArr: {
    type: Array,
    default: []
  },
  callback: {
    type: Function
  },
  close: {
    type: Function
  }
})
let data = reactive({
  fileList: [],
  parr: [],//目标路径
  isShow: false
})
let { fileList, parr, isShow } = toRefs(data)
onMounted(() => {
  isShow.value = true
  parr.value = deepClone(props.pathArr)
  renderList()
})
// 切换路径
let changePath = (arr) => {
  if (arr.join("/") == parr.value.join("/")) return;
  parr.value = arr
  renderList()
}
//打开文件夹
let checkFile = (obj) => {
  parr.value.push(obj.name);
  renderList();
}
//隐藏
let hideBox = (e) => {
  if (e.target.className === "seleckBox") {
    hdClick('close')
  }
}
let hdClick = (type) => {
  let path = deepClone(parr.value)
  props.callback({ type, path, close })
}
let close = () => {
  isShow.value = false
  _setTimeout(() => {
    props.close()
  }, 500)
}
//渲染列表
let renderList = () => {
  readDirReq({ path: parr.value }).then(res => {
    if (res.code == 0) {
      let from = props.pathArr.join('')
      let to = parr.value.join('')
      let arr = res.data.filter(item => {
        // 如果是文件或者同一个父文件夹下的同名文件夹不显示
        if (item.type === "file" || (from === to && props.seleckArr.some(y => y.name === item.name))) {
          return false;
        }
        return true;
      });
      // 排序
      arr.sort((a, b) => {
        return mixedSort(a.name, b.name);
      })
      fileList.value = arr
    }
  });
}
</script>

<style lang="less" scoped>
.seleckBox {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  color: rgb(98, 97, 97);
  background-color: rgba(0, 0, 0, 0.509);
  z-index: 9;
  display: flex;
  align-items: center;
  justify-content: center;

  .main {
    position: relative;
    margin: auto;
    background-color: #fff;
    width: 90%;
    height: 80%;
    max-width: 800px;
    max-height: 1000px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 50px 20px 20px 20px;
    box-sizing: border-box;
    display: flex;
    flex-flow: column;
    overflow: hidden;

    h1 {
      flex: none;
      font-size: 20px;
      padding: 10px;
      border-bottom: 1px solid #ccc;
    }

    .filelist {
      width: 100%;
      height: 100%;
      display: flex;
      flex-flow: column;
      overflow: hidden;
      box-sizing: border-box;
      padding: 5px;

      .list {
        flex: auto;
        overflow-y: auto;

        ul {
          transition: 0.3s;
          display: flex;
          color: rgb(144, 141, 141);
          border-bottom: 1px solid rgb(224, 224, 224);

          li {
            font-size: 18px;
            display: flex;
            align-items: center;
            word-break: break-all;
            white-space: pre-line;
            padding: 10px 5px;

            span {
              color: rgb(104, 83, 190);

              &:hover {
                color: rgb(60, 14, 243);
              }
            }

            em {
              font-size: 30px;
              margin-right: 10px;
              color: #aaa;
            }
          }
        }

        p {
          text-align: center;
          line-height: 40px;
          margin: 40px auto;
          font-size: 20px;
          color: #aaa;
        }
      }
    }

    .btn {
      flex: none;
      text-align: right;
      padding: 40px 0 0 0;


      button {
        &:nth-child(2) {
          background: rgb(230, 229, 229);
          margin-left: 30px;
        }
      }
    }

    .close {
      position: absolute;
      left: 0;
      top: 0;
      width: 50px;
      height: 50px;
      line-height: 50px;
      font-size: 30px;
      text-align: center;
      color: #aaa;
      cursor: pointer;

      &:hover {
        color: rgb(88, 87, 87);
        font-weight: bold;
      }
    }
  }
}

.m-enter-from,
.m-leave-to {
  opacity: 0;
  transform: translateY(-50px);
}

.m-enter-active,
.m-leave-active {
  transition: 0.5s;
}

.m-enter-to,
.m-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.box-enter-from,
.box-leave-to {
  opacity: 0;
}

.box-enter-active,
.box-leave-active {
  transition: 0.5s;
}

.box-enter-to,
.box-leave-from {
  opacity: 1;
}
</style>