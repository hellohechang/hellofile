<template>
  <div class="shareBox">
    <div class="admin">
      <h1>
        <button @click="router.push('/')">返回</button>
        <button @click="clearList">清空</button>
      </h1>
      <h1>分享列表:</h1>
      <ul class="list">
        <p v-if="list.length == 0">It feels lonely here...</p>
        <li v-for="(obj, index) in list" :key="index">
          <div>
            <em :class="`iconfont ${fileLogoType({ type: 'file', name: obj.name })}`"></em>
            <span>
              <span @click="openShare(obj)">{{ obj.name }}</span>
            </span>
          </div>
          <button @click="copyshare(obj)">复制地址</button>
          <button @click="deleteshare(obj)">删除</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import confirmBox from '../components/confirmBox'
import { getShareReq, deleteShareReq } from '../api'
import { onMounted, reactive, toRefs } from "vue"
import { useRouter } from 'vue-router';
import { _success, copyText, fileLogoType, _myOpen } from '../utils/utils';
let router = useRouter()
let data = reactive({
  list: []
})
let { list } = toRefs(data)
let render = () => {
  getShareReq().then(res => {
    if (res.code == 0) {
      res.data.reverse();
      list.value = res.data;
    }
  }).catch(err => { })
}
let copyshare = (obj) => {
  copyText(`${window.hostUrl}/share/${obj.id}`)
}
let openShare = (obj) => {
  _myOpen(`${window.hostUrl}/share/${obj.id}`, '_blank')
}
let deleteshare = (obj) => {
  confirmBox({ title: '确认删除分享？' }, ({ type, data, close }) => {
    if (type === 'confirm') {
      deleteShareReq([obj.id]).then(res => {
        if (res.code == 0) {
          _success('删除成功')
          render();
        }
      }).catch(err => { })
    }
    close()
  })
}
let clearList = () => {
  confirmBox({ title: '确认清空分享？' }, ({ type, data, close }) => {
    if (type === 'confirm') {
      deleteShareReq(list.value.map(item => item.id)).then(res => {
        if (res.code == 0) {
          _success('清空成功')
          render();
        }
      }).catch(err => { })
    }
    close()
  })
}
onMounted(() => {
  render()
})
</script>

<style lang="less" scoped>
.shareBox {
  width: 100%;
  height: 100%;
  margin: auto;
  overflow: hidden;
  max-width: 1200px;
  box-sizing: border-box;
  padding: 10px;
  color: var(--text-color);

  .admin {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 5px;
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

      p {
        text-align: center;
        line-height: 40px;
        margin: 30px auto;
        font-size: 20px;
      }

      li {
        display: flex;
        padding: 5px 10px;
        align-items: center;
        border-bottom: 1px solid var(--border-color1);

        div {
          flex: auto;
          display: flex;
          align-items: center;

          span {
            span {
              word-break: break-all;
              flex: auto;
              font-size: 18px;
              line-height: 22px;
              cursor: pointer;

              &:hover {
                color: var(--hover-text-color);
              }
            }
          }

          .iconfont {
            flex: none;
            font-size: 30px;
            margin-right: 10px;
            color: var(--file-logo-color);
          }
        }
      }
    }
  }
}
</style>