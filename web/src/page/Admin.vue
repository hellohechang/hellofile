<template>
  <div class="adminBox">
    <div class="admin">
      <h1>
        <button @click="router.replace('/')">返回</button>
        <button @click="regState">注册：{{ isreg === 'y' ? '开' : '关' }}</button>
        <button @click="hdRecycle">回收站：{{ recycle === 'y' ? '开' : '关' }}</button>
        <button @click="hdToken">更新token</button>
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
import { isregisterReq, rdeleteReq, updatetokenReq, recycleReq, repassReq, userlistReq } from '../api'
//工具
import { _success } from "../utils/utils";
import { onMounted, reactive, toRefs } from "vue"
let router = useRouter()
let data = reactive({
  isreg: 'n',
  list: [],
  recycle: 'y'
})
let {
  isreg,
  list,
  recycle
} = toRefs(data)
// 关闭/开放注册
let regState = () => {
  isregisterReq().then(res => {
    if (res.code == 0) {
      isreg.value = res.data;
      _success(res.data === 'y' ? '开放注册成功' : '已关闭注册')
    }
  }).catch(err => { })
}
let hdRecycle = () => {
  recycleReq().then(res => {
    if (res.code == 0) {
      recycle.value = res.data;
      _success(res.data === 'y' ? '开启成功' : '关闭成功')
    }
  })
}
let hdToken = () => {
  confirmBox({ title: `确认更新token？` }, ({ type, data, close }) => {
    if (type == 'confirm') {
      updatetokenReq().then(res => {
        if (res.code == 0) {
          _success(res.codeText);
        }
      }).catch(err => { })
    }
    close()
  })
}
onMounted(() => {
  render()
})
// 渲染列表
let render = () => {
  userlistReq().then(res => {
    if (res.code == 0) {
      const { userlist, recyclestate, registerstate } = res.data
      isreg.value = registerstate
      recycle.value = recyclestate;
      list.value = userlist;
    }
  }).catch(err => { })
}
let rePass = (obj) => {
  let { username, id } = obj;
  confirmBox({ title: `确认重置[${username}]密码吗？` }, ({ type, data, close }) => {
    if (type == 'confirm') {
      repassReq({ id }).then(res => {
        if (res.code == 0) {
          _success(res.codeText);
        }
      }).catch(err => { })
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
          _success('删除账号成功')
          render();
        }
      }).catch(err => { })
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
  color: var(--text-color);

  .admin {
    box-sizing: border-box;
    padding: 5px;
    width: 100%;
    height: 100%;
    border: 1px solid var(--border-color);
    display: flex;
    flex-flow: column;

    h1 {
      flex: none;
      border-bottom: 1px solid var(--border-color);
      padding: 10px;
    }

    .list {
      flex: auto;
      overflow-y: auto;

      li {
        display: flex;
        align-items: center;
        padding: 5px 10px;
        border-bottom: 1px solid var(--border-color1);

        span {
          flex: auto;
          word-break: break-all;
        }
      }
    }
  }
}
</style>