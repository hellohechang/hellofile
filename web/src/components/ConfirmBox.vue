<template>
  <transition name="box">
    <div v-show="isShow" @click="hideBox" class="confirmBox">
      <transition name="m">
        <div v-show="isShow" ref="main" class="main">
          <h1>{{ title }}</h1>
          <div v-if="inplist.length" class="inputBox">
            <div v-for="(item, idx) in inplist" :key="idx">
              <input @keyup.enter="hdClick('confirm')" @input="setInp($event, idx)" :type="item.type || 'text'"
                :value="item.value || ''" :placeholder="item.placeholder || ''" />
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

<script lang="ts" setup>
import { _setTimeout, myDrag } from "../utils/utils";
import { onMounted, reactive, toRefs, ref, onUnmounted } from "vue"
let data = reactive({
  isShow: false,
  inplist: []
})
let { isShow, inplist } = toRefs(data)
//接收参数
let props = defineProps({
  // 标题
  title: {
    type: String,
    default: ''
  },
  // 生成输入框数据
  data: {
    type: Array,
    default: []
  },
  close: {
    type: Function
  },
  callback: {
    type: Function
  }
})
let inpArr = []//记录输入框数据
let setInp = (e, idx) => {
  inpArr[idx] = e.target.value.trim()
}
onMounted(() => {
  inpArr = props.data.map(_ => '')
  inplist.value = props.data
  isShow.value = true
})
// 点击空白处关闭
let hideBox = (e) => {
  if (e.target.className === "confirmBox") {
    hdClick('close')
  }
}
let hdClick = (type) => {
  props.callback({ type, data: inpArr, close })
}
// 关闭
let close = () => {
  inplist.value = inplist.value.map(item => item.value = '')
  isShow.value = false
  _setTimeout(() => {
    props.close()
  }, 500)
}
let main = ref();
let dragClose;
onMounted(() => {
  dragClose = myDrag({
    trigger: main.value,
    target: main.value
  })
});
onUnmounted(() => {
  dragClose();
})
</script>

<style lang="less" scoped>
.confirmBox {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  color: var(--text-color);
  background-color: var(--mask-color);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;

  .main {
    position: absolute;
    margin: auto;
    background-color: var(--main-background-color);
    width: 90%;
    max-width: 500px;
    border: 1px solid var(--border-color);
    max-height: 80%;
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
      border-bottom: 1px solid var(--border-color);
    }

    .inputBox {
      flex: auto;
      overflow-y: auto;
      box-sizing: border-box;
      padding: 0 10px;

      div {
        width: 100%;
        text-align: center;
        box-sizing: border-box;
        padding: 40px 0 0 0;

        input {
          width: 100%;
          font-size: 18px;
          border: 1px solid var(--border-color);
          outline: none;
          padding: 10px;
          box-sizing: border-box;
          text-align: center;

          &:focus {
            border: 1px solid var(--hover-border-color);
          }
        }
      }
    }

    .btn {
      flex: none;
      text-align: right;
      padding: 40px 0 0 0;

      button {
        &:nth-child(2) {
          margin-left: 30px;
          border: 1px solid var(--hover-border-color);
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
      cursor: pointer;

      &:hover {
        color: var(--hover-text-color);
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
  transition: 0.5s ease-in-out;
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
  transition: 0.5s ease-in-out;
}

.box-enter-to,
.box-leave-from {
  opacity: 1;
}
</style>