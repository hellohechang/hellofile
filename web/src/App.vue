<template>
  <div id="app">
    <div class="page_bg"></div>
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { updateTitle, _getTarget, darkMode, _getData } from "./utils/utils";
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
  // 黑暗模式
  let dark = _getData('dark') || 'r';
  if (dark === 'r') {
    darkMode(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
  } else if (dark === 'y') {
    darkMode(true);
  } else if (dark === 'n') {
    darkMode(false);
  }
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
  background-color: var(--main-background-color);

  #app {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    max-width: none;
    text-align: left;
    color: var(--text-color);

    .page_bg {
      width: 100%;
      height: 100%;
      position: fixed;
      top: 0;
      left: 0;
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
      background-image: url('/img/bg.svg');
      opacity: .6;
    }

    .content {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  button {
    flex: none;
    outline: none;
    height: 34px;
    line-height: 34px;
    white-space: nowrap;
    color: var(--text-color);
    border: 1px solid var(--border-color);
    padding: 0 10px;
    background-color: transparent;
    margin: 5px;
    transition: 0.3s;
    font-size: 16px;
    border-radius: 0;
    cursor: pointer;

    &:hover {
      border: 1px solid var(--hover-border-color);
    }
  }

  select,
  input {
    background-color: transparent;
    color: var(--text-color);
    border: 1px solid var(--border-color);

    &:focus {
      border: 1px solid var(--hover-border-color);
    }
  }
}
</style>
