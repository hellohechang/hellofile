<template>
  <div class="filelist">
    <!-- 面包屑 -->
    <div class="top">
      <BreadCrumb @changePath="changePath" :pathArr="pathArr"></BreadCrumb>
    </div>
    <!-- 列表 -->
    <ul v-show="fileList.length > 0" class="head">
      <li @click.stop="checkAll" style="cursor: pointer;">
        <div :class="`iconfont ${isCheckAll ? 'icon-xuanzeyixuanze' : 'icon-xuanzeweixuanze'}`"></div>
      </li>
      <li>
        <span @click="changeListSort('name')">
          文件
          <span :class="`iconfont ${nameSortType}`"></span>
        </span>
      </li>
      <li>
        <span @click="changeListSort('size')">
          大小
          <span :class="`iconfont ${sizeSortType}`"></span>
        </span>
      </li>
      <li>
        <span @click="changeListSort('time')">
          修改时间
          <span :class="`iconfont ${ctimeSortType}`"></span>
        </span>
      </li>
    </ul>
    <div ref="listDom" class="list">
      <p v-if="fileList.length == 0">It feels lonely here...</p>
      <ul @contextmenu.prevent="hdRightMenu($event, obj)" v-for="(obj, index) in fileList" :key="index">
        <li @click.stop="checkItem(obj)" style="cursor: pointer;">
          <div :class="`iconfont ${obj.checked ? 'icon-xuanzeyixuanze' : 'icon-xuanzeweixuanze'}`"></div>
        </li>
        <li>
          <em :style="obj.type === 'dir' ? 'color:#aaa;' : ''" :class="`iconfont ${fileLogoType(obj)}`"></em>
          <span @click="checkFile(obj)">{{ obj.name }}</span>
        </li>
        <li @click.stop="checkItem(obj)">{{ sizeFormater(obj.size) }}</li>
        <li @click.stop="checkItem(obj)">{{ timeFormater(obj.time) }}</li>
      </ul>
      <!-- 分页器 -->
      <Pager @changePage="changePage" @changeSelect="changeSelect" :pageNo="pageNo" :pageSize="pageSize" :total="total"
        :continuous="continuous"></Pager>
    </div>
  </div>
  <!-- 编辑文本 -->
  <teleport to="body">
    <TextEdit :isShow="editShow" :data="editText" :filePath="editPath" @close="closeEdit" @save="saveText" />
  </teleport>
  <RightMenu @renderList="renderList" ref="rightBox" :fileList="fileList"></RightMenu>
</template>

<script setup>
// 组件
import confirmBox from './confirmBox'
import RightMenu from './RightMenu.vue'
import TextEdit from './TextEdit.vue'
import BreadCrumb from './BreadCrumb.vue'
import Pager from './Pager.vue'
// API
import {
  readDirReq, getFileReq,
  breakpointReq,
  uploadReq,
  mergefileReq
} from '../api'
// 工具
import { deepClone, imgPreview, fileSlice, newDate, UpProgress, computeSize, fileLogoType, mixedSort, _setData, _success, isFileName, _myOpen, isios } from "../utils/utils";
// pinia
import { usepathArrStore } from '../store/pathArr'
import { storeToRefs } from 'pinia';

import { computed, getCurrentInstance, onBeforeUnmount, onMounted, reactive, ref, toRefs, watch } from "vue"
import $bus from '../utils/bus'
let store = usepathArrStore()
// let $bus = getCurrentInstance().appContext.config.globalProperties.$bus;
let { pathArr } = storeToRefs(store)
let rightBox = ref()
// 数据
let data = reactive({
  defaultList: [],
  fileList: [],
  sortObj: { prop: "time", type: "des" },
  editShow: false,
  editText: "",
  editPath: [],
  pageNo: 1,
  pageSize: 50,
  total: 0,
  continuous: 5
})
// 接收参数
let props = defineProps({
  searchText: {
    type: String,
    default: ''
  }
})
let listDom = ref()//获取列表DOM，方便回到顶部
let emit = defineEmits(['clearSearch', 'getCeleck'])
let { defaultList, fileList, sortObj, editShow, editText, editPath, pageNo, pageSize, total, continuous } = toRefs(data)
// 切换路径
let changePath = (arr) => {
  if (arr.join("/") == pathArr.value.join("/")) return;
  emit('clearSearch')//清空搜索框
  store.$patch({
    pathArr: arr
  })
  renderList()
}
let hdRightMenu = (e, obj) => {
  if (!obj.checked) {
    checkItem(obj)
  }
  rightBox.value.showMenuBox(e)
}

// 获取列表信息
let renderList = (isDelFile) => {
  _setData('path', pathArr.value)
  readDirReq({ path: pathArr.value }).then(res => {
    if (res.code == 0) {
      defaultList.value = res.data;
      if (!isDelFile) {
        sortObj.value = { prop: "time", type: "des" }
        pageNo.value = 1;
        pageSize.value = 50;
        listDom.value.scrollTop = 0
      }
      fileList.value = sortList(sortObj.value, defaultList.value);
    }
  });
}
// 暴露刷新列表
defineExpose({ renderList })
// 监听搜索框变化
watch(() => props.searchText, () => {
  pageNo.value = 1
  fileList.value = sortList(sortObj.value, defaultList.value);
})
// 切换分页
let changePage = (num) => {
  listDom.value.scrollTop = 0
  total.value = defaultList.value.length
  pageNo.value = +num
  fileList.value = sortList(sortObj.value, defaultList.value);
}
// 切换每页显示条数
let changeSelect = (val) => {
  pageNo.value = 1
  listDom.value.scrollTop = 0
  total.value = defaultList.value.length
  pageSize.value = +val
  fileList.value = sortList(sortObj.value, defaultList.value);
}
// 列表排序
let sortList = (obj, arr) => {
  arr.sort((a, b) => {
    if (obj.type === "asc") {
      //升序
      return mixedSort(a[obj.prop], b[obj.prop]);
    } else {
      //降序
      return mixedSort(b[obj.prop], a[obj.prop]);
    }
  });
  //处理搜索
  if (props.searchText) {
    arr = arr.filter(item =>
      item.name.toLowerCase().includes(props.searchText.toLowerCase())
    );
    total.value = arr.length
  } else {
    total.value = defaultList.value.length
  }
  // 分页
  return arr.slice((pageNo.value - 1) * pageSize.value, pageNo.value * pageSize.value)
}
let hdDragenter = (e) => {
  e.preventDefault();
}
let hdDragover = (e) => {
  e.preventDefault();
}
// 拖拽上传文件
let hdDrop = (e) => {
  e.preventDefault();
  let files = [...e.dataTransfer.files]
  if (files.length == 0) return;
  (async function next(num) {
    if (num >= files.length) {
      //全部上传完成
      renderList()
      return;
    }
    let { name, size } = files[num];
    let pro = new UpProgress(name);
    if (!isFileName(name)) {
      pro.fail()
      _err(`文件名格式有误~`);
      num++;
      next(num);
      return;
    }
    if (size === 0) {
      pro.fail()
      _err(`${name} 为空文件`);
      num++;
      next(num);
      return;
    }
    try {
      let { chunks, count, HASH } = await fileSlice(files[num], pes => {
        pro.loading(pes);
      }),
        breakpointarr = (await breakpointReq({ HASH })).data;
      let index = breakpointarr.length;
      pro.update(index / count);

      (function upChunk(numm) {
        if (numm >= chunks.length) {
          mergefileReq({ HASH, count, name, path: pathArr.value }).then(
            res => {
              if (res.code == 0) {
                pro.close();
              } else {
                pro.fail();
              }
              num++;
              next(num);
            }
          );
          return;
        }
        let { filename, file } = chunks[numm];
        if (breakpointarr.includes(filename)) {
          numm++;
          upChunk(numm);
          return;
        }

        let formData = new FormData();
        formData.append("file", file);
        uploadReq({ file: formData, name: filename, HASH }).finally(
          () => {
            index++;
            pro.update(index / count);
            numm++;
            upChunk(numm);
          }
        );
      })(0);
    } catch (error) {
      pro.fail();
      num++;
      next(num);
    }
  })(0);
}
let clearSelect = () => {
  fileList.value = fileList.value.map(item => {
    item.checked = false;
    return item;
  });
}
// 挂载钩子
onMounted(() => {
  $bus.on('clearSelect', clearSelect)
  renderList()
  listDom.value
  listDom.value.addEventListener("dragenter", hdDragenter);
  listDom.value.addEventListener("dragover", hdDragover);
  listDom.value.addEventListener("drop", hdDrop);
})
onBeforeUnmount(() => {
  $bus.off('clearSelect', clearSelect)
  listDom.value.removeEventListener("dragenter", hdDragenter);
  listDom.value.removeEventListener("dragover", hdDragover);
  listDom.value.removeEventListener("drop", hdDrop);
})
// 全选全不选
let checkAll = () => {
  let check = isCheckAll.value;
  fileList.value = fileList.value.map(item => {
    item.checked = !check;
    return item;
  });
}
// 是否全选
let isCheckAll = computed(() => {
  emit('getCeleck', fileList.value)
  if (fileList.value.every(item => item.checked === true)) {
    return true;
  } else {
    return false;
  }
})
// 选中项
let checkItem = (obj) => {
  fileList.value = fileList.value.map(item => {
    if (item.name === obj.name && item.type === obj.type) {
      item.checked = !obj.checked;
    }
    return item;
  });
}
// 选择文件
let checkFile = (obj) => {
  let path = deepClone(pathArr.value);
  //打开目录
  if (obj.type === "dir") {
    path.push(obj.name)
    store.$patch({
      pathArr: path
    })
    emit('clearSearch')//清空搜索框
    renderList()
    return;
  }
  // 打开文件
  path.push(obj.name);
  getFileReq({ path }).then(res => {
    if (res.code == 0) {
      // 打开文本文件
      if (res.data.type === "text") {
        editPath.value = path;
        editText.value = res.data.data;
        editShow.value = true;
      } else {
        let url = `${window.baseURL}/getfile/${path.join("/")}`
        // 预览图片
        if (/(\.JPG|\.PNG|\.GIF|\.JPEG)$/gi.test(obj.name)) {
          imgPreview(url)
          return
        }
        // 打开其他文件
        if (isios()) {
          _myOpen(url)
        } else {
          _myOpen(url, '_blank')
        }
      }
    }
  });
}
// 保存文件
let saveText = (flag) => {
  // 如果文件有改变则刷新列表
  if (flag) {
    _success('保存成功~')
    renderList(true)
  }
}
//关闭编辑框
let closeEdit = (flag) => {
  if (flag) {
    confirmBox({ title: '文件还未保存，确认关闭吗？' }, ({ type, data, close }) => {
      close()
      if (type == 'confirm') {
        editShow.value = false;
      }
    })
    return
  }
  editShow.value = false;
}
// 时间转换
let timeFormater = (time) => {
  return newDate('{0}-{1}-{2} {3}:{4}', time)
}
// 文件大小转换
let sizeFormater = (value) => {
  return computeSize(value)
}
// 时间排序标记
let ctimeSortType = computed(() => {
  return sortObj.value.prop === "time"
    ? `${sortObj.value.type === "des"
      ? "icon-jiantou_qiehuanxiangxia"
      : "icon-jiantou_qiehuanxiangshang"
    }`
    : "";
})
//名字排序标记
let nameSortType = computed(() => {
  return sortObj.value.prop === "name"
    ? `${sortObj.value.type === "des"
      ? "icon-jiantou_qiehuanxiangxia"
      : "icon-jiantou_qiehuanxiangshang"
    }`
    : "";
})
//大小排序标记
let sizeSortType = computed(() => {
  return sortObj.value.prop === "size"
    ? `${sortObj.value.type === "des"
      ? " icon-jiantou_qiehuanxiangxia"
      : "icon-jiantou_qiehuanxiangshang"
    }`
    : "";
})
// 切换列表排序
let changeListSort = (prop) => {
  pageNo.value = 1
  sortObj.value.prop = prop;
  listDom.value.scrollTop = 0
  sortObj.value.type = sortObj.value.type === "asc" ? "des" : "asc";
  fileList.value = sortList(sortObj.value, defaultList.value);
}

</script>

<style lang="less" scoped>
.filelist {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
  overflow: hidden;
  box-sizing: border-box;
  padding: 5px;
  min-width: 600px;

  .top {
    flex: none;
  }

  ul {
    flex: none;
    display: flex;
    color: rgb(144, 141, 141);
    border-bottom: 1px solid rgb(235, 235, 235);

    li {
      font-size: 18px;
      display: flex;
      align-items: center;
      word-break: break-all;
      white-space: pre-line;
      padding: 10px 5px;

      span {
        cursor: pointer;

        &:hover {
          color: #000;
        }
      }

      &:nth-child(1) {
        flex: none;
        width: 30px;
        display: flex;
        justify-content: center;
      }

      &:nth-child(2) {
        width: 0;
        flex: 6;

        em {
          font-size: 30px;
          margin-right: 10px;
          color: rgb(89, 187, 200);
        }
      }

      &:nth-child(3),
      &:nth-child(4) {
        flex: 2;
        display: flex;
        justify-content: center;
      }

      // @media (max-width: 800px) {
      //   &:nth-child(4) {
      //     display: none;
      //   }
      // }
    }
  }

  .list {
    flex: auto;
    overflow: auto;

    li {
      span {
        color: rgb(104, 83, 190);

        &:hover {
          color: rgb(60, 14, 243);
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
</style>