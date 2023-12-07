<template>
  <div class="home">
    <transition name="top">
      <div v-show="topShow" class="top">
        <div class="left">
          <button @click="upFile">上传文件</button>
          <button @click="upFolder">上传目录</button>
          <button @click="newFolder">新建目录</button>
          <button @click="newFile">新建文本</button>
          <input @input="changeSearch" :value="searchText" placeholder="搜索" type="search">
        </div>
        <div class="right">
          <span @click="showUse = true" class="iconfont icon-shezhi"></span>
        </div>
      </div>
    </transition>
    <transition name="userBox">
      <div @click="hdUserBox" v-show="showUse" class="userBox">
        <transition name="userCon">
          <div class="con" ref="con" v-show="showUse">
            <div @click="closeUserBox" class="close iconfont icon-guanbi"></div>
            <div class="bott">
              <h1>
                <span>{{ userObj.username }}</span>
                <i @click="changeName" class="iconfont icon-bianji"></i>
              </h1>
              <div>
                <span>账号操作：</span>
                <div>
                  <button @click="changePass">修改密码</button>
                  <button @click="deleteAccount">删除账号</button>
                  <button @click="logOut">退出</button>
                </div>
              </div>
              <div>
                <span>文件分享：</span>
                <div>
                  <button @click="router.push('/sharelist')">分享列表</button>
                </div>
              </div>
              <div>
                <span>图片显示：</span>
                <div>
                  <button @click="hdCimg">{{ cimg === 'y' ? '开启' : '关闭' }}</button>
                </div>
              </div>
              <div>
                <span>黑暗模式：</span>
                <div>
                  <button @click="hdDark">{{ isDark === 'r' ? '跟随系统' : (isDark === 'y' ? '开启' : '关闭') }}</button>
                </div>
              </div>
              <div v-if="userObj.id === 'root'">
                <span>管理员：</span>
                <div>
                  <button @click="router.push('/admin')">Admin</button>
                </div>
              </div>
              <div>
                <span>关于：</span>
                <div>
                  <button @click="_myOpen('https://github.com/hellohechang/hellofile', '_blank')">github</button>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
    <div @click="topShow = !topShow" :class="`hideTop iconfont ${topShow ? 'icon-up' : 'icon-Down'}`">
    </div>
    <div class="main">
      <FileList ref="fileList" @getCeleck="getCeleck" @clearSearch="clearSearch" :searchText="searchText"></FileList>
    </div>
    <transition name="bottom">
      <div v-show="seleckArr.length" class="bottom">
        <FileOption @updateList="updateList" :pathArr="pathArr" :seleckArr="seleckArr"></FileOption>
      </div>
    </transition>
  </div>
  <teleport to="body">
    <!-- 编辑文本 -->
    <TextEdit :isShow="editShow" :data="editText" :filePath="editPath" @close="editClose" @save="saveText" />
  </teleport>
</template>

<script setup>
//组件
import FileList from '../components/FileList.vue'
import TextEdit from '../components/TextEdit.vue'
import confirmBox from '../components/confirmBox';
import FileOption from '../components/FileOption.vue'
//密码加密
import md5 from 'md5';
//API
import { adddirReq, addfileReq, breakpointReq, logoutReq, deleteUserReq, mergefileReq, changepdReq, uploadReq, changeuserReq } from '../api'
// pinia
import { usepathArrStore } from '../store/pathArr'
import { storeToRefs } from 'pinia';
//路由
import { useRouter } from 'vue-router';
// 工具
import { _myOpen, deepClone, UpProgress, _err, _getData, _getTarget, _success, updateTitle, _loadingBar, fileSlice, _setData, isUserName, isFileName, _delData, darkMode, myDrag } from '../utils/utils';
import { onMounted, onUnmounted, reactive, ref, toRefs, watch } from "vue"
let router = useRouter()
const pathArrStore = usepathArrStore()
let { pathArr } = storeToRefs(pathArrStore)
let data = reactive({
  searchText: '',
  seleckArr: [],
  topShow: _getData('topshow') || false,
  showUse: false,
  editShow: false,
  editText: '',
  editPath: [],
  cimg: _getData('showImg') || 'y',
  // cimg: _getData('cimg') || 'n',
  isDark: _getData('dark') || 'r',
  userObj: { username: _getData('username') || 'hello', id: _getData('id') }
})
let { editShow, isDark, cimg, userObj, editText, editPath, searchText, seleckArr, topShow, showUse } = toRefs(data);
watch(topShow, (val) => {
  _setData('topshow', val);
})
let fileList = ref()//获取显示列表组件实例
// 清空搜索框
let clearSearch = () => {
  searchText.value = ''
}
let closeUserBox = () => {
  showUse.value = false
}
let hdUserBox = (e) => {
  if (e.target.className === "userBox") {
    closeUserBox()
  }
}
let hdCimg = () => {
  cimg.value = cimg.value === 'y' ? 'n' : 'y';
  _setData('showImg', cimg.value)
  fileList.value.renderList()
  // cimg.value = cimg.value === 'y' ? 'n' : 'y';
  // _setData('cimg', cimg.value)
}
let hdDark = () => {
  if (isDark.value === 'r') {
    isDark.value = 'y';
    darkMode(true)
  } else if (isDark.value === 'y') {
    isDark.value = 'n';
    darkMode(false)
  } else if (isDark.value === 'n') {
    isDark.value = 'r';
    darkMode(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
  }
  _setData('dark', isDark.value);
}
// 搜索文件
let changeSearch = (e) => {
  searchText.value = e.target.value
}
// 新建目录
let newFolder = () => {
  confirmBox({ title: '新建目录', data: [{ placeholder: '请输入目录名' }] }, ({ type, data, close }) => {
    if (type === 'confirm') {
      if (!data[0]) return;
      if (!isFileName(data[0])) {
        _err('目录名格式有误')
        return
      };
      adddirReq({ path: pathArr.value, name: data[0] }).then(res => {
        if (res.code == 0) {
          close()
          _success('新建目录成功')
          fileList.value.renderList()
        }
      }).catch(err => { })
      return
    }
    close()
  })
}
let newFile = () => {
  confirmBox({ title: '新建文本', data: [{ placeholder: '请输入文本名' }] }, ({ type, data, close }) => {
    if (type === 'confirm') {
      if (!data[0]) return;
      if (!isFileName(data[0])) {
        _err('文件名格式有误')
        return
      };
      addfileReq({ path: pathArr.value, name: data[0] }).then(res => {
        if (res.code == 0) {
          close()
          _success('新建文本成功')
          let path = deepClone(pathArr.value)
          path.push(data[0])
          editPath.value = path;
          editText.value = '';
          editShow.value = true;
          fileList.value.renderList()
        }
      }).catch(err => { })
      return
    }
    close()
  })
}
// 上传文件
let upFile = () => {
  let input = document.createElement("input");
  input.type = "file";
  input.multiple = "multiple";
  input.style.display = 'none'
  document.body.appendChild(input)
  input.click();
  input.addEventListener("change", function upf(e) {
    let files = [...e.target.files];
    let upPath = deepClone(pathArr.value);
    input.removeEventListener('change', upf)
    input.remove()
    if (files.length == 0) return;
    (async function next(num) {
      if (num >= files.length) {
        //全部上传完成
        fileList.value.renderList()
        return;
      }
      let { name, size } = files[num];
      let pro = new UpProgress(name);
      if (!isFileName(name)) {
        pro.fail()
        _err(`文件名格式有误`);
        num++;
        next(num);
        return;
      }
      if (size === 0) {
        pro.fail()
        _err(`${name} 为空文件`);
        num++;
        next(num);
        return;
      }
      try {
        let { chunks, count, HASH } = await fileSlice(files[num], pes => {
          pro.loading(pes);
        }),
          breakpointarr = (await breakpointReq({ HASH })).data;
        let index = breakpointarr.length;
        pro.update(index / count);

        (function upChunk(numm) {
          if (numm >= chunks.length) {
            mergefileReq({ HASH, count, name, path: upPath }).then(
              res => {
                if (res.code == 0) {
                  pro.close();
                } else {
                  pro.fail();
                }
                num++;
                next(num);
              }
            ).catch(err => { })
            return;
          }
          let { filename, file } = chunks[numm];
          if (breakpointarr.includes(filename)) {
            numm++;
            upChunk(numm);
            return;
          }

          let formData = new FormData();
          formData.append("file", file);
          uploadReq({ file: formData, name: filename, HASH }).finally(
            () => {
              index++;
              pro.update(index / count);
              numm++;
              upChunk(numm);
            }
          );
        })(0);
      } catch (error) {
        pro.fail();
        num++;
        next(num);
      }
    })(0);
  });
}
//上传目录
let upFolder = () => {
  let input = document.createElement("input");
  input.type = "file";
  input.webkitdirectory = true;
  input.style.display = 'none'
  document.body.appendChild(input)
  input.click();
  input.addEventListener("change", function upf(e) {
    let files = [...e.target.files];
    let upPath = deepClone(pathArr.value)
    input.removeEventListener('change', upf)
    input.remove()
    if (files.length == 0) return;
    (async function next(num) {
      if (num >= files.length) {
        //全部上传完成
        fileList.value.renderList()
        return;
      }
      let { name, size, webkitRelativePath } = files[num];
      let fpath = [...upPath, ...webkitRelativePath.split('/')]
      fpath.pop()
      let pro = new UpProgress(name);
      if (!isFileName(name)) {
        pro.fail()
        _err(`文件名格式有误`);
        num++;
        next(num);
        return;
      }
      if (size === 0) {
        pro.fail()
        _err(`${name} 为空文件`);
        num++;
        next(num);
        return;
      }
      try {
        let { chunks, count, HASH } = await fileSlice(files[num], pes => {
          pro.loading(pes);
        }),
          breakpointarr = (await breakpointReq({ HASH })).data;
        let index = breakpointarr.length;
        pro.update(index / count);

        (function upChunk(numm) {
          if (numm >= chunks.length) {
            mergefileReq({ HASH, count, name, path: fpath }).then(
              res => {
                if (res.code == 0) {
                  pro.close();
                } else {
                  pro.fail();
                }
                num++;
                next(num);
              }
            ).catch(err => { })
            return;
          }
          let { filename, file } = chunks[numm];
          if (breakpointarr.includes(filename)) {
            numm++;
            upChunk(numm);
            return;
          }

          let formData = new FormData();
          formData.append("file", file);
          uploadReq({ file: formData, name: filename, HASH }).finally(
            () => {
              index++;
              pro.update(index / count);
              numm++;
              upChunk(numm);
            }
          );
        })(0);
      } catch (error) {
        pro.fail();
        num++;
        next(num);
      }
    })(0);
  });
}
// 修改用户名
let changeName = () => {
  confirmBox({ title: '修改用户名为', data: [{ value: userObj.value.username }] }, ({ type, data, close }) => {
    if (type === 'confirm') {
      if (!data[0] || data[0] === userObj.value.username) return
      if (!isUserName(data[0])) {
        _err('用户名格式错误')
        return
      }
      if (data[0].length > 20) {
        _err('用户名不能超过20字符')
        return
      }
      changeuserReq({ username: data[0] }).then(res => {
        if (res.code == 0) {
          close()
          _success('用户名修改成功')
          userObj.value.username = data[0];
          _setData("username", data[0]);
          updateTitle()
        }
      }).catch(err => { })
      return
    }
    close()
  })
}
//修改密码
let changePass = () => {
  confirmBox({ title: '修改密码', data: [{ type: 'password', placeholder: '原密码' }, { type: 'password', placeholder: '新密码' }, { type: 'password', placeholder: '确认密码' }] }, ({ type, data, close }) => {
    if (type === 'confirm') {
      let [a, b, c] = data;
      if (b !== c) {
        _err('密码不一致')
        return
      }
      changepdReq({ password: md5(b), oldpassword: md5(a) }).then(res => {
        if (res.code == 0) {
          close()
          _success('密码修改成功')
        }
      }).catch(err => { })
      return
    }
    close()
  })
}
// 退出
let logOut = () => {
  confirmBox({ title: '确认退出登录？' }, ({ type, data, close }) => {
    if (type === 'confirm') {
      logoutReq().then(res => {
        if (res.code == 0) {
          _success('退出登录成功')
          _delData('id')
          router.replace("/login");
        }
      }).catch(err => { })
    }
    close()
  })
}
//删除账号
let deleteAccount = () => {
  confirmBox({ title: '确认删除账号？' }, ({ type, data, close }) => {
    if (type === 'confirm') {
      deleteUserReq().then(res => {
        if (res.code == 0) {
          _delData()
          _success('删除账号成功')
          router.replace("/login");
        }
      }).catch(err => { })
    }
    close()
  })
}
// 保存文本文件
let saveText = (flag) => {
  if (flag) {
    fileList.value.renderList(true)
    _success('保存成功')
  }
}
let editClose = (flag) => {
  if (flag) {
    confirmBox({ title: '文件还未保存，确认关闭吗？' }, ({ type, data, close }) => {
      if (type === 'confirm') {
        editShow.value = false;
      }
      close()
    })
    return
  }
  editShow.value = false;
}
// 获取选中的文件
let getCeleck = (arr) => {
  arr = arr.filter(item => item.checked === true)
  seleckArr.value = arr
}
//刷新列表
let updateList = (obj = {}) => {
  // 如果有传路径则跳转到指定目录，否则刷新目录
  if (obj.arr) {
    pathArrStore.setPathArr(obj.arr)
  }
  fileList.value.renderList(obj.isDelFile)
}
let dragClose;
let con = ref();
onMounted(() => {
  dragClose = myDrag({
    trigger: con.value,
    target: con.value
  })
})
onUnmounted(() => {
  dragClose();
})
</script>

<style lang="less" scoped>
.home {
  width: 100%;
  height: 100%;
  max-width: 1200px;
  padding: 10px;
  box-sizing: border-box;
  margin: auto;
  overflow: hidden;
  display: flex;
  flex-flow: column;

  .userBox {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--mask-color);
    display: flex;
    justify-content: center;
    align-items: center;

    .con {
      position: absolute;
      width: 90%;
      max-height: 80%;
      max-width: 600px;
      display: flex;
      flex-flow: column;
      border: 1px solid var(--border-color);
      background-color: var(--main-background-color);
      border-radius: 5px;
      box-sizing: border-box;
      padding: 50px 0px 20px 20px;

      .icon-guanbi {
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
          color: var(--hover-text-color);
          font-weight: bold;
        }
      }

      .bott {
        flex: auto;
        overflow-y: auto;

        h1 {
          box-sizing: border-box;
          padding: 20px 0;
          text-align: center;
          font-size: 30px;

          .icon-bianji {
            cursor: pointer;
            font-size: 22px;
            margin-left: 4px;

            &:hover {
              color: #4370b7;
              font-weight: bold;
            }
          }
        }

        div {
          box-sizing: border-box;
          padding: 5px;
          word-break: break-all;
          display: flex;

          span {
            flex: none;
            display: inline-block;
            width: 100px;
            text-align: right;
            margin-top: 16px;
          }

          div {
            flex: auto;
            display: flex;
            flex-flow: row wrap;
          }
        }

      }
    }
  }

  .top {
    flex: none;
    display: flex;
    border: 1px solid var(--border-color);
    overflow: hidden;

    .left {
      flex: auto;
      padding: 6px 0;
      display: flex;
      flex-flow: row wrap;
      border-radius: 4px;
      width: 0;

      input {
        flex: auto;
        outline: 0;
        margin: 5px;
        max-width: 200px;
        min-width: 80px;
        font-size: 16px;
        width: 0;
        height: 34px;
        text-align: center;
        box-sizing: border-box;
      }

    }

    .right {
      flex: none;
      padding: 10px;
      text-align: center;

      span {
        padding: 5px;
        font-size: 30px;
        display: block;
        cursor: pointer;

        &:hover {
          color: var(--hover-text-color);
        }
      }
    }
  }

  .hideTop {
    flex: none;
    line-height: 20px;
    text-align: center;
    font-weight: bold;
    cursor: pointer;

    &:hover {
      color: rgb(79, 192, 207);
    }
  }

  .main {
    flex: auto;
    overflow: hidden;
    overflow-x: auto;
    border: 1px solid var(--border-color);
  }

  .bottom {
    overflow: hidden;
    flex: none;
    border: 1px solid var(--border-color);
    margin-top: 20px;
  }
}

.top-enter-from,
.top-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.top-enter-active {
  transition: .5s ease-in-out;
}

.top-enter-to,
.top-leave-from {
  opacity: 1;
  transform: none;
}

.bottom-enter-from,
.bottom-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.bottom-enter-active {
  transition: .5s ease-in-out;
}

.bottom-enter-to,
.bottom-leave-from {
  opacity: 1;
  transform: none;
}

.userCon-enter-from,
.userCon-leave-to {
  opacity: 0;
  transform: translateY(-50px);
}

.userCon-enter-active,
.userCon-leave-active {
  transition: 0.5s ease-in-out;
}

.userCon-enter-to,
.userCon-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.userBox-enter-from,
.userBox-leave-to {
  opacity: 0;
}

.userBox-enter-active,
.userBox-leave-active {
  transition: 0.5s ease-in-out;
}

.userBox-enter-to,
.userBox-leave-from {
  opacity: 1;
}
</style>