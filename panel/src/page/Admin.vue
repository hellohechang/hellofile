<template>
  <div class="adminBox">
    <div class="admin">
      <h1>
        <button @click="router.replace('/')">返回</button>
        <button @click="regState">{{ isreg === 'y' ? '注册:开' : '注册:关' }}</button>
      </h1>
      <ul class="list">
        <li v-for="(obj, index) in list" :key="index">
          <span>{{ `${obj.username}(${obj.id})` }}</span>
          <button @click="rePass(obj)">重置密码</button>
          <button @click="DelUser(obj)">删除</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
//组件
import confirmBox from '../components/confirmBox'
// 路由
import { useRouter } from "vue-router";
//API
import { isregisterReq, getisregisterReq, rdeleteReq, repassReq, userlistReq } from '../api'
//工具
import { _success } from "../utils/utils";
import { onMounted, reactive, toRefs } from "vue"
let router = useRouter()
let data = reactive({
  isreg: 'n',
  list: []
})
let {
  isreg,
  list
} = toRefs(data)
// 关闭/开放注册
let regState = () => {
  isregisterReq().then(res => {
    if (res.code == 0) {
      isreg.value = res.data;
      _success(res.data === 'y' ? '开放注册成功~' : '已关闭注册~')
    }
  });
}
onMounted(() => {
  //获取注册状态
  getisregisterReq().then(res => {
    if (res.code == 0) {
      isreg.value = res.data;
    }
  });
  render()
})
// 渲染列表
let render = () => {
  userlistReq().then(res => {
    if (res.code == 0) {
      list.value = res.data;
    }
  });
}
let rePass = (obj) => {
  let { username, id } = obj;
  confirmBox({ title: `确认重置[${username}]密码吗？` }, ({ type, data, close }) => {
    if (type == 'confirm') {
      repassReq({ id }).then(res => {
        if (res.code == 0) {
          _success(res.codeText);
        }
      });
    }
    close()
  })
}
let DelUser = (obj) => {
  let { username, id } = obj;
  confirmBox({ title: `确认删除[${username}]吗？` }, ({ type, data, close }) => {
    if (type == 'confirm') {
      rdeleteReq({ id }).then(res => {
        if (res.code == 0) {
          _success('删除账号成功~')
          render();
        }
      });
    }
    close()
  })
}
</script>

<style lang="less" scoped>
.adminBox {
  width: 100%;
  height: 100%;
  max-width: 1200px;
  margin: auto;
  overflow: hidden;
  box-sizing: border-box;
  padding: 10px;

  .admin {
    box-sizing: border-box;
    padding: 5px;
    width: 100%;
    height: 100%;
    border: 1px solid #ccc;
    background-color: rgba(255, 255, 255, 0.836);
    color: rgb(88, 88, 88);
    display: flex;
    flex-flow: column;

    h1 {
      flex: none;
      border-bottom: 1px solid #ccc;
      padding: 10px;
    }

    .list {
      flex: auto;
      overflow-y: auto;

      li {
        display: flex;
        align-items: center;
        padding: 5px 10px;
        border-bottom: 1px solid rgb(231, 229, 229);

        span {
          flex: auto;
          word-break: break-all;
        }
      }
    }
  }
}
</style>