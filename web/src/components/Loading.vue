<template>
  <div v-if="isShow" class="loading">
    <div>Loading...</div>
  </div>
</template>

<script setup>
defineProps({
  isShow: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="less" scoped>
.loading {
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  width: 100%;
  height: 100%;
  z-index: 9999999;
  background-color: var(--main-background-color);

  div {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-right: 1ch solid var(--text-color);
    font-size: 40px;
    line-height: 50px;
    width: 10ch;
    white-space: nowrap;
    overflow: hidden;
    animation: typing 3s steps(10, end),
      blink-caret 0.5s 3s step-end infinite alternate;
    text-shadow: 0 0 1px #aaa;

    &::after {
      content: "Loading...";
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      animation: loderWidth 2s 3s infinite;
    }
  }

  @keyframes loderWidth {
    0% {
      width: 0%;
      color: var(--hover-text-color);
    }

    100% {
      width: 100%;
      color: var(--hover-text-color);
    }
  }

  @keyframes typing {
    from {
      width: 0;
    }
  }

  @keyframes blink-caret {
    0% {
      border-color: var(--text-color);
    }

    50% {
      border-color: transparent;
    }

    100% {
      border-color: var(--text-color);
    }
  }
}
</style>