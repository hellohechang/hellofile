<template>
  <div v-show="total > 0" class="pagerBox">
    <button @click="changePage('pre')" v-show="obj.pageNo > 1">上一页</button>
    <button @click="changePage(1)" v-show="obj.arr[0] > 1">1</button>
    <button @click="changePage(obj.arr[0] - 1)" v-show="obj.arr[0] > 2">...</button>
    <button :class="item === obj.pageNo ? 'active' : ''" @click="changePage(item)" v-for="(item, idx) in obj.arr"
      :key="idx">{{ item
      }}</button>
    <button @click="changePage(obj.arr[obj.arr.length - 1] + 1)"
      v-show="obj.totalPage - obj.arr[obj.arr.length - 1] >= 2">...</button>
    <button @click="changePage(obj.totalPage)" v-show="obj.totalPage - obj.arr[obj.arr.length - 1] >= 1">{{ obj.totalPage
    }}</button>
    <button @click="changePage('next')" v-show="obj.pageNo < obj.totalPage">下一页</button>
    <span>共{{ total }}条</span>
    <select @change="changeSelect" :value="pageSize">
      <option value="20">20条/页</option>
      <option value="50">50条/页</option>
      <option value="100">100条/页</option>
    </select>
    <span>前往第</span>
    <input @keyup.enter="goPage" v-model="inpNum" type="text">
    <span>页</span>
    <button @click="goPage">GO</button>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
//接收参数
let props = defineProps({
  //当前页
  pageNo: {
    type: Number,
    default: 1
  },
  //每页展示条数
  pageSize: {
    type: Number,
    default: 20
  },
  //总条数
  total: {
    type: Number,
    default: 0
  },
  // 连续页码数
  continuous: {
    type: Number,
    default: 5
  }
})
let inpNum = ref('')

//计算出连续开始和结尾数组
let obj = computed(() => {
  let { total, pageSize, pageNo, continuous } = props;
  //总页数
  let totalPage = Math.ceil(total / pageSize);
  //pageNo容错处理
  pageNo <= 0 ? pageNo = 1 : (pageNo >= totalPage ? pageNo = totalPage : null);
  inpNum.value = pageNo
  //计算连续开始数和结束数
  let startPage = pageNo - parseInt(continuous / 2),
    endPage = pageNo + parseInt(continuous / 2);
  // 如果总页数大于连续数
  if (totalPage > continuous) {
    startPage < 1 ? (startPage = 1, endPage = continuous) : null;
    endPage > totalPage ? (endPage = totalPage, startPage = totalPage - continuous + 1) : null;
  } else {
    startPage = 1
    endPage = totalPage
  }
  let arr = []
  for (let i = startPage; i <= endPage; i++) {
    arr.push(i)
  }
  return {
    arr,
    totalPage,
    pageNo
  }
})
let emit = defineEmits(['changePage', 'changeSelect'])
let changeSelect = (e) => {
  emit('changeSelect', e.target.value)
}
let goPage = () => {
  let num = parseInt(inpNum.value)
  if (isNaN(num)) return;
  emit('changePage', num)
}
let changePage = (val) => {
  let num = 1;
  if (val === 'pre') {
    num = props.pageNo - 1
  } else if (val === 'next') {
    num = props.pageNo + 1
  } else {
    num = val
  }
  if (num == props.pageNo) return;
  num <= 0 ? num = 1 : (num >= obj.value.totalPage ? num = obj.value.totalPage : null)
  emit('changePage', num)
}
</script>

<style lang="less" scoped>
.pagerBox {
  font-size: 16px;
  padding: 20px 0;

  button {
    min-width: 40px;

    &.active {
      border: 1px solid var(--hover-border-color);
    }
  }

  span {
    margin: 0 5px;
    font-size: 16px;
  }

  select {
    outline: none;
    height: 34px;
    line-height: 34px;
    padding: 0 10px;
    margin: 0 5px;
    transition: 0.3s ease-in-out;
    border-radius: 0;
    font-size: 16px;
    cursor: pointer;
  }

  input {
    outline: none;
    height: 34px;
    width: 60px;
    text-align: center;
    box-sizing: border-box;
    font-size: 16px;
  }
}
</style>