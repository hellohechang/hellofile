<template>
  <transition name="box">
    <div v-show="isShow" @click="hideBox" class="confirmBox">
      <transition name="m">
        <div v-show="isShow" class="main">
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
import { _setTimeout } from "../utils/utils";
import { onMounted, reactive, toRefs } from "vue"
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
</script>

<style lang="less" scoped>
.confirmBox {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  color: rgb(98, 97, 97);
  background-color: rgba(0, 0, 0, 0.509);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;

  .main {
    position: relative;
    margin: auto;
    background-color: #fff;
    width: 90%;
    max-width: 500px;
    background-color: #fff;
    border: 1px solid #ccc;
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
      border-bottom: 1px solid #ccc;
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
          color: rgb(124, 122, 122);
          border: 1px solid #ccc;
          outline: none;
          padding: 10px;
          box-sizing: border-box;
          text-align: center;

          &:focus {
            border: 1px solid #757575;
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
          background: rgb(240, 240, 240);
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