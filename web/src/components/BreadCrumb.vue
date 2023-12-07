<template>
  <div @contextmenu.prevent="copyPath" class="breadCrumb">
    <div v-show="pathArr.length > 0" @click="changePath({ type: 'prev' })" class="iconfont icon-fh"
      style="margin:0 0 0 10px;"></div>
    <div style="margin:0 0 0 15px;" @click="changePath({ type: 'home' })" title="根目录">Root</div>
    <div @click="changePath({ type: 'check', index })" v-for="(item, index) in pathArr" :key="index"><span
        class="iconfont icon-fenge"></span>{{ item }}</div>
  </div>
</template>

<script setup>
import { deepClone, copyText } from '../utils/utils';
// 接受参数
let props = defineProps({
  pathArr: {
    type: Array,
    default: []
  }
})
// 路径改变返回数据
let emit = defineEmits(['changePath'])
let copyPath = () => {
  copyText(`/${props.pathArr.join('/')}`, {
    success: '路径复制成功',
    error: '路径复制失败'
  })
}
let changePath = (obj) => {
  let arr = [];
  let path = deepClone(props.pathArr)
  if (obj.type === "check") {
    arr = path.slice(0, obj.index + 1);
  } else if (obj.type === "home") {
    arr = [];
  } else if (obj.type === "prev") {
    arr = path;
    arr.pop();
  }
  emit("changePath", arr);
}
</script>

<style lang="less" scoped>
.breadCrumb {
  box-sizing: border-box;
  padding: 10px 0;
  background-color: var(--breadCrumb-background-color);
  color: var(--text-color);

  div {
    display: inline-block;
    margin: 4px 0;
    cursor: pointer;
    font-size: 18px;

    &:hover {
      color: var(--hover-text-color);
    }

    span {
      color: #aaa;
      font-size: 16px;


      .icon-fenge {
        pointer-events: none;
      }
    }

  }
}
</style>