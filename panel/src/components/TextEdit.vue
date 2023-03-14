<template>
  <transition name="box">
    <div v-show="isShow" class="wrap">
      <div class="textEdit">
        <div class="box">
          <div class="head">
            <button @click="hdClick('close')">关闭</button>
            <button v-show="isChange" style="margin-right:20px;" @click="hdClick('save')">保存</button>
            <div v-for="(item, index) of path" :key="index"><span class="iconfont icon-fenge"></span>{{ item }}</div>
          </div>
          <textarea @keydown.ctrl.s.prevent="hdClick('save')" placeholder="输入内容……" ref="textarea"
            v-model="text"></textarea>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { savefileReq } from '../api'
import { nextTick, reactive, ref, toRefs, watch } from "vue"
import { deepClone } from '../utils/utils';
//接收参数
let props = defineProps({
  //显示
  isShow: {
    type: Boolean,
    default: false
  },
  //文本初始内容
  data: {
    type: String,
    default: ''
  },
  // 文件所在路径
  filePath: {
    type: Array,
    default: []
  }
})
let textarea = ref()//获取输入框
let edata = reactive({
  text: '',
  path: [],
  isChange: false
})
let { text, path, isChange } = toRefs(edata)
let emit = defineEmits(['close', 'save'])
let defaultText = ''
// 对比内容是否改变
watch(text, () => {
  isChange.value = text.value !== defaultText
})
let hdClick = (type) => {
  //保存处理
  if (type === 'save') {
    if (isChange.value) {
      savefileReq({ path: path.value, text: text.value }).then(res => {
        if (res.code == 0) {
          defaultText = text.value//赋值新默认值
          isChange.value = false
          emit("save", true);
        }
      });
    }
    // 关闭
  } else if (type === 'close') {
    if (isChange.value) {
      emit("close", true);
    } else {
      emit("close", false);
    }
  }
}

watch(() => props.isShow, (val) => {
  if (val) {
    // 如果显示展示初始值，并回到顶部
    text.value = defaultText = props.data;
    path.value = deepClone(props.filePath);
    nextTick(() => {
      textarea.value.scrollTop = 0;
    })
  }
})
</script>

<style lang="less" scoped>
.wrap {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  z-index: 5;

  .textEdit {
    width: 100%;
    height: 100%;
    max-width: 1200px;
    padding: 10px;
    box-sizing: border-box;
    background-color: #fff;
    color: rgb(130, 128, 128);
    overflow: hidden;

    .box {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-flow: column;
      border: 1px solid #ccc;

      .head {
        flex: none;
        padding: 10px;
        box-sizing: border-box;
        border-bottom: 1px solid #ccc;


        button {
          &:nth-child(2) {
            background: rgb(230, 229, 229);
            margin-left: 20px;
          }
        }

        div {
          display: inline-block;
          margin: 4px 0;
          font-size: 18px;

          span {
            color: #aaa;
            font-size: 16px;
          }
        }
      }

      textarea {
        flex: auto;
        width: 100%;
        height: 100%;
        padding: 20px;
        box-sizing: border-box;
        overflow-y: auto;
        line-height: 30px;
        border: none;
        outline: none;
        font-size: 18px;
        resize: none;
      }
    }
  }
}

.box-enter-from,
.box-leave-to {
  transform: translateY(100%);
}

.box-enter-active,
.box-leave-active {
  transition: .5s;
}

.box-enter-to,
.box-leave-from {
  transform: translateY(0);
}
</style>