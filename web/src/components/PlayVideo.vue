<template>
  <div v-if="isShow" class="video_box">
    <div @click="close" class="close iconfont icon-guanbi"></div>
    <video controls :src="url"></video>
  </div>
</template>

<script setup>

let props = defineProps({
  isShow: {
    type: Boolean,
    default: false
  },
  url: {
    type: String,
    default: ''
  },
})
let emit = defineEmits(['close']);
let close = () => {
  emit('close');
}
</script>

<style lang="less" scoped>
.video_box {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--main-background-color);
  z-index: 5;

  video {
    width: 100%;
    height: 100%;
  }

  .close {
    position: absolute;
    left: 0px;
    top: 0px;
    padding: 10px;
    font-size: 40px;
    border-radius: 0px 0px 50%;
    color: #ccc;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 2;
    cursor: pointer;

    &:hover {
      color: #fff;
    }
  }
}
</style>