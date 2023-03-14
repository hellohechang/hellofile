<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script setup>
import { updateTitle, _getTarget } from "./utils/utils";
import { onMounted } from 'vue'
onMounted(() => {
  updateTitle();
  document.addEventListener('mouseover', function (e) {
    let target = _getTarget(e, 'input', 1)
    if (target) {
      target.focus()
      // target.select && target.select()
    }
  })
})
</script>

<style lang="less">
/* 重置样式 */
@import url("./assets/css/reset.css");
@import url("./assets/css/iconfont.css");

html,
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
  min-width: auto;

  #app {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    max-width: none;
    text-align: left;
    color: #636363;
    display: flex;
    justify-content: center;
    align-items: center;

  }

  button {
    flex: none;
    outline: none;
    height: 34px;
    line-height: 34px;
    white-space: nowrap;
    border: 1px solid #ccc;
    padding: 0 10px;
    background-color: transparent;
    margin: 5px;
    transition: 0.3s;
    color: rgb(96, 96, 96);
    font-size: 16px;
    border-radius: 0;
    cursor: pointer;

    &:hover {
      border: 1px solid #7b7b7b;
    }
  }
}
</style>
