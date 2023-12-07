<template>
  <div class="login">
    <div class="box-card">
      <h1>Hello {{ form.username }}</h1>
      <input @keyup.enter="submit" @blur="ruleUsername" v-model.trim="form.username" placeholder="用户名" type="text" />
      <p>{{ uerr }}</p>
      <input @keyup.enter="submit" v-model.trim="form.password" placeholder="密码" type="password" />
      <p></p>
      <input @keyup.enter="submit" v-if="!islogin" v-model.trim="form.repassword" placeholder="确认密码" type="password"
        @blur="rulePassword" />
      <p v-if="!islogin">{{ perr }}</p>
      <button @click="submit">{{ islogin ? "登录" : "注册" }}</button>
      <span v-if="isreg === 'y'" @click="islogin = !islogin">
        {{
          islogin ? "注册" : "登录"
        }}
      </span>
    </div>
  </div>
  <Loading :isShow="loadingShow"></Loading>
</template>

<script setup>
//组件
import Loading from '../components/Loading.vue'
// API
import { loginReq, registerReq, getisregisterReq } from "../api";
//路由
import { useRouter } from 'vue-router'
//密码加密
import md5 from 'md5'
//工具
import { _getData, _setData, _success, imgjz, updateTitle, _err, debounce, loginValidate, deepClone, isUserName } from "../utils/utils";
import { onMounted, reactive, toRefs } from "vue"
let router = useRouter()
let data = reactive({
  form: {
    username: _getData("username") || "",
    password: "",
    repassword: ""
  },
  islogin: true,
  uerr: "",
  perr: "",
  loadingShow: true,
  isreg: "n",
  valiFlag: "n"
})
let { form, islogin, uerr, perr, loadingShow, isreg, valiFlag } = toRefs(data);
//用户名验证
let ruleUsername = () => {
  if (form.value.username === "") {
    uerr.value = "请输入用户名";
    return false;
  } else if (!isUserName(form.value.username)) {
    uerr.value = "用户名格式错误";
    return false;
  } else if (form.value.username.length > 20) {
    uerr.value = "用户名不能超过20字符";
    return false;
  } else {
    uerr.value = "";
    return true;
  }
}
// 密码验证
let rulePassword = () => {
  if (!islogin.value) {
    if (form.value.password !== form.value.repassword) {
      perr.value = "密码输入不同";
      return false;
    } else {
      perr.value = "";
      return true;
    }
  } else {
    perr.value = "";
    return true;
  }
}
//提交
let submit = debounce(() => {
  if (!ruleUsername() || !rulePassword()) return;
  let obj = deepClone(form.value);
  obj.password = md5(obj.password);
  if (valiFlag.value === "y") return;
  valiFlag.value = "y";
  // 机器人验证
  loginValidate.init(
    () => {
      valiFlag.value = "n";
      if (islogin.value) {
        loginReq(obj).then(res => {
          if (res.code == 0) {
            _success(res.codeText);
            _setData("username", res.data.username);
            _setData("id", res.data.id);
            updateTitle();
            router.replace("/");
          }
        }).catch(err => { })
      } else {
        registerReq(obj).then(res => {
          if (res.code == 0) {
            _success(res.codeText);
            _setData("username", res.data.username);
            _setData("id", res.data.id);
            updateTitle();
            router.replace("/");
          }
        }).catch(err => { })
      }
    },
    () => {
      _err("验证失败");
    }
  );
}, 500, true)
onMounted(() => {
  imgjz("/img/bg.svg", () => {
    loadingShow.value = false;
  })
  getisregisterReq().then(res => {
    if (res.code == 0) {
      isreg.value = res.data;
    }
  }).catch(err => { })
})
</script>

<style lang="less" scoped>
.login {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .box-card {
    width: 90%;
    max-width: 400px;
    background-color: var(--main-background-color);
    text-align: center;
    padding: 20px 0 50px 0;
    position: relative;
    border-radius: 6px;
    border: 1px solid var(--border-color);

    h1 {
      font-weight: bold;
      font-size: 20px;
      margin-bottom: 20px;
    }

    button {
      width: 50%;
      cursor: pointer;
    }

    input {
      width: 80%;
      text-align: center;
      padding: 10px;
      font-size: 18px;
      outline: none;
    }

    p {
      height: 25px;
      line-height: 25px;
    }

    span {
      position: absolute;
      right: 35px;
      bottom: 14px;
      font-size: 20px;
      cursor: pointer;

      &:hover {
        color: var(--hover-text-color);
      }
    }
  }
}
</style>