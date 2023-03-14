<template>
  <div class="logBox">
    <div class="log">
      <div class="top">
        <button @click="router.push('/')">返回</button>
        <button @click="clearList">清空</button>
        <input v-model.trim="text" placeholder="搜索" type="search">
        <button @click="refreshList">刷新</button>
      </div>
      <div ref="mainBox" class="main">
        <p style="text-align: center;padding: 20px;" v-if="list.length == 0">It feels lonely here...</p>
        <p v-for="(item, idx) in list" :key="idx">{{ item }}</p>
        <!-- 分页器 -->
        <Pager @changePage="changePage" @changeSelect="changeSelect" :pageNo="pageNo" :pageSize="pageSize" :total="total"
          :continuous="continuous"></Pager>
      </div>
    </div>
  </div>
</template>

<script setup>
import { logsearchReq, logclearReq } from '../api'
import confirmBox from '../components/confirmBox'
import Pager from '../components/Pager.vue'
import { onMounted, reactive, ref, toRefs, watch } from "vue"
import { debounce, _success } from '../utils/utils';
import { useRouter } from 'vue-router';
let router = useRouter()
const data = reactive({
  list: [],
  text: '',
  pageNo: 1,
  pageSize: 50,
  total: 0,
  continuous: 5
})
let { list, text, pageNo, pageSize, total, continuous } = toRefs(data)
let mainBox = ref()
let refreshList = () => {
  pageNo.value = 1
  hdList()
}
let clearList = () => {
  confirmBox({ title: '确认清空日志？' }, ({ type, close }) => {
    if (type == 'confirm') {
      logclearReq().then(res => {
        if (res.code == 0) {
          _success('清空成功~')
          pageNo.value = 1
          hdList()
        }
      })
    }
    close()
  })
}
watch(text, debounce(() => {
  pageNo.value = 1
  hdList()
}, 1000))

let hdList = () => {
  logsearchReq({ page: pageNo.value, context: text.value, showpage: pageSize.value }).then(res => {
    if (res.code == 0) {
      total.value = +res.data.total
      pageNo.value = +res.data.pageNo
      list.value = res.data.data
      mainBox.value.scrollTop = 0
    }
  })
}
let changePage = (num) => {
  pageNo.value = +num
  hdList()
}
let changeSelect = (num) => {
  pageNo.value = 1
  pageSize.value = +num
  hdList()
}
onMounted(() => {
  hdList()
})
</script>

<style lang="less" scoped>
.logBox {
  width: 100%;
  height: 100%;
  margin: auto;
  overflow: hidden;
  max-width: 1200px;
  box-sizing: border-box;
  padding: 10px;

  .log {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 5px;
    border: 1px solid #ccc;
    background-color: rgba(255, 255, 255, 0.836);
    color: rgb(88, 88, 88);
    display: flex;
    flex-flow: column;

    .top {
      flex: none;
      border-bottom: 1px solid #ccc;
      padding: 10px;
      color: #767474;
      display: flex;
      flex-flow: row wrap;

      input {
        flex: auto;
        outline: 0;
        margin: 5px;
        max-width: 200px;
        min-width: 80px;
        font-size: 16px;
        width: 0;
        border: 1px solid #ccc;
        height: 34px;
        text-align: center;
        box-sizing: border-box;

        &:focus {
          border: 1px solid #7b7b7b;
        }
      }
    }

    .main {
      flex: auto;
      overflow-y: auto;

      p {
        word-break: break-all;
        line-height: 25px;
        color: #d729d7;
        padding: 5px 0;

        &:nth-child(2n) {
          background-color: #f3f3f3;
          color: rgb(67, 56, 228);
        }
      }
    }
  }
}
</style>