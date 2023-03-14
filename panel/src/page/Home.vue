<template>
  <div @click="hdUserConfig" class="home">
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
          <span v-show="!showUse" @click="showUse = !showUse">{{ userObj.username }}</span>
          <div class="userConfig" v-show="showUse">
            <button @click="changeName">修改用户名</button>
            <button @click="changePass">修改密码</button>
            <button @click="router.push('/sharelist')">分享列表</button>
            <button @click="logOut">退出</button>
            <button @click="deleteAccount">删除账号</button>
            <button v-if="userObj.id === 'root'" @click="router.push('/log')">日志</button>
            <button v-if="userObj.id === 'root'" @click="router.push('/admin')">Admin</button>
          </div>
        </div>
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
import { deepClone, UpProgress, _err, _getData, _getTarget, _success, updateTitle, _loadingBar, fileSlice, _setData, isUserName, isFileName, _delData } from '../utils/utils';
import { reactive, ref, toRefs } from "vue"
let router = useRouter()
const store = usepathArrStore()
let { pathArr } = storeToRefs(store)
let data = reactive({
  searchText: '',
  seleckArr: [],
  topShow: true,
  showUse: false,
  editShow: false,
  editText: '',
  editPath: [],
  userObj: { username: _getData('username') || 'hello', id: _getData('id') }
})
let { editShow, userObj, editText, editPath, searchText, seleckArr, topShow, showUse } = toRefs(data)
let fileList = ref()//获取显示列表组件实例
// 清空搜索框
let clearSearch = () => {
  searchText.value = ''
}
let hdUserConfig = (e) => {
  if (!_getTarget(e, '.right')) {
    showUse.value = false
  }
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
        _err('目录名格式有误~')
        return
      };
      adddirReq({ path: pathArr.value, name: data[0] }).then(res => {
        if (res.code == 0) {
          close()
          _success('新建目录成功~')
          fileList.value.renderList()
        }
      });
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
        _err('文件名格式有误~')
        return
      };
      addfileReq({ path: pathArr.value, name: data[0] }).then(res => {
        if (res.code == 0) {
          close()
          _success('新建文本成功~')
          let path = deepClone(pathArr.value)
          path.push(data[0])
          editPath.value = path;
          editText.value = '';
          editShow.value = true;
          fileList.value.renderList()
        }
      });
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
        _err(`文件名格式有误~`);
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
            mergefileReq({ HASH, count, name, path: pathArr.value }).then(
              res => {
                if (res.code == 0) {
                  pro.close();
                } else {
                  pro.fail();
                }
                num++;
                next(num);
              }
            );
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
      let fpath = [...pathArr.value, ...webkitRelativePath.split('/')]
      fpath.pop()
      let pro = new UpProgress(name);
      if (!isFileName(name)) {
        pro.fail()
        _err(`文件名格式有误~`);
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
            );
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
        _err('用户名格式错误~')
        return
      }
      if (data[0].length > 20) {
        _err('用户名不能超过20字符~')
        return
      }
      changeuserReq({ username: data[0] }).then(res => {
        if (res.code == 0) {
          close()
          _success('用户名修改成功~')
          userObj.value.username = data[0];
          _setData("username", data[0]);
          updateTitle()
        }
      });
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
        _err('密码不一致~')
        return
      }
      changepdReq({ password: md5(b), oldpassword: md5(a) }).then(res => {
        if (res.code == 0) {
          close()
          _success('密码修改成功~')
        }
      });
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
          _success('退出登录成功~')
          _delData('id')
          router.replace("/login");
        }
      });
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
          _success('删除账号成功~')
          router.replace("/login");
        }
      });
    }
    close()
  })
}
// 保存文本文件
let saveText = (flag) => {
  if (flag) {
    fileList.value.renderList(true)
    _success('保存成功~')
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
    store.$patch({
      pathArr: obj.arr
    })
  }
  fileList.value.renderList(obj.isDelFile)
}
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

  .top {
    flex: none;
    display: flex;
    border: 1px solid #ccc;
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
        border: 1px solid #ccc;
        height: 34px;
        text-align: center;
        box-sizing: border-box;

        &:focus {
          border: 1px solid #7b7b7b;
        }
      }

    }

    .right {
      flex: none;
      padding: 10px;
      text-align: center;

      span {
        padding: 5px;
        display: block;
        cursor: pointer;
      }

      .userConfig {
        button {
          display: block;
          width: 110px;
        }
      }
    }
  }

  .hideTop {
    flex: none;
    line-height: 20px;
    text-align: center;
    font-weight: bold;
    color: #aaa;
    cursor: pointer;

    &:hover {
      color: rgb(79, 192, 207);
    }
  }

  .main {
    flex: auto;
    overflow: hidden;
    overflow-x: auto;
    border: 1px solid #ccc;
  }

  .bottom {
    overflow: hidden;
    flex: none;
    border: 1px solid #ccc;
    margin-top: 20px;
  }
}

.top-enter-from,
.top-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.top-enter-active {
  transition: .5s;
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
  transition: .5s;
}

.bottom-enter-to,
.bottom-leave-from {
  opacity: 1;
  transform: none;
}
</style>