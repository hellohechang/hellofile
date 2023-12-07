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
          <div class="editor" @keydown.ctrl.s.prevent="hdClick('save')" ref="textarea"></div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import ace from 'ace-builds';
import workerJavascriptUrl from "ace-builds/src-noconflict/worker-javascript?url";
import workerCssUrl from "ace-builds/src-noconflict/worker-css?url";
import workerHtmlUrl from "ace-builds/src-noconflict/worker-html?url";
import workerJsonUrl from "ace-builds/src-noconflict/worker-json?url";
import workerPhpUrl from "ace-builds/src-noconflict/worker-php?url";
import workerYamlUrl from "ace-builds/src-noconflict/worker-yaml?url";
ace.config.setModuleUrl('ace/mode/javascript_worker', workerJavascriptUrl);
ace.config.setModuleUrl('ace/mode/css_worker', workerCssUrl);
ace.config.setModuleUrl('ace/mode/html_worker', workerHtmlUrl);
ace.config.setModuleUrl('ace/mode/json_worker', workerJsonUrl);
ace.config.setModuleUrl('ace/mode/php_worker', workerPhpUrl);
ace.config.setModuleUrl('ace/mode/yaml_worker', workerYamlUrl);

import "ace-builds/src-noconflict/theme-chrome";
import "ace-builds/src-noconflict/theme-github_dark";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-text";
import "ace-builds/src-noconflict/mode-less";
import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/mode-nginx";
import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/mode-sh";
import "ace-builds/src-noconflict/ext-searchbox";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/snippets/javascript";
import "ace-builds/src-noconflict/snippets/markdown";
import "ace-builds/src-noconflict/snippets/css";
import "ace-builds/src-noconflict/snippets/html";
import "ace-builds/src-noconflict/snippets/json";
import "ace-builds/src-noconflict/snippets/less";
import "ace-builds/src-noconflict/snippets/text";
import "ace-builds/src-noconflict/snippets/php";
import "ace-builds/src-noconflict/snippets/nginx";
import "ace-builds/src-noconflict/snippets/yaml";
import "ace-builds/src-noconflict/snippets/sql";
import "ace-builds/src-noconflict/snippets/sh";
import { savefileReq } from '../api'
import { nextTick, onMounted, reactive, ref, toRefs, watch } from "vue"
import { deepClone, _getData, getSuffix } from '../utils/utils';
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
let { text, path, isChange } = toRefs(edata);
let editor = null;

ace.require("ace/ext/language_tools");
onMounted(() => {
  if (editor) return;
  editor = ace.edit(textarea.value, {
    tabSize: 2
  });
  editor.getSession().setMode("ace/mode/javascript");
  editor.setTheme("ace/theme/chrome");
  // 补全
  editor.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
  });
  // 打印边距
  editor.setShowPrintMargin(false);
  // 自动换行
  editor.session.setUseWrapMode(true);
  // 行高亮
  // editor.setHighlightActiveLine(false);
  // 语法检查
  editor.getSession().setUseWorker(false);
  editor.getSession().on('change', function () {
    text.value = editor.getValue();
  });
});


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
      }).catch(err => { })
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
    editor.setValue(props.data);
    editor.gotoLine(1);
    nextTick(() => {
      editor.focus();
    })
    let pathArr = deepClone(props.filePath);
    path.value = pathArr;
    let type = getSuffix(pathArr[pathArr.length - 1])[1].toLowerCase();
    if (type == 'js' || type == 'vue' || type == 'jsx') {
      editor.getSession().setMode("ace/mode/javascript");
    } else if (type == 'md') {
      editor.getSession().setMode("ace/mode/markdown");
    } else if (type == 'css') {
      editor.getSession().setMode("ace/mode/css");
    } else if (type == 'html') {
      editor.getSession().setMode("ace/mode/html");
    } else if (type == 'json') {
      editor.getSession().setMode("ace/mode/json");
    } else if (type == 'less') {
      editor.getSession().setMode("ace/mode/less");
    } else if (type == 'php') {
      editor.getSession().setMode("ace/mode/php");
    } else if (type == 'conf') {
      editor.getSession().setMode("ace/mode/nginx");
    } else if (type == 'yaml' || type == 'yml') {
      editor.getSession().setMode("ace/mode/yaml");
    } else if (type == 'sql') {
      editor.getSession().setMode("ace/mode/sql");
    } else if (type == 'sh') {
      editor.getSession().setMode("ace/mode/sh");
    } else {
      editor.getSession().setMode("ace/mode/text");
    };
    let dark = _getData('dark') || 'r';
    if (dark === 'y') {
      editor.setTheme("ace/theme/github_dark");
    } else if (dark === 'n') {
      editor.setTheme("ace/theme/chrome");
    } else if (dark === 'r') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        editor.setTheme("ace/theme/github_dark");
      } else {
        editor.setTheme("ace/theme/chrome");
      }
    }
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
  // background-color: var(--main-background-color);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  // background-image: url('/img/bg.svg');
  color: var(--text-color);
  z-index: 5;

  .textEdit {
    width: 100%;
    height: 100%;
    max-width: 1200px;
    padding: 10px;
    box-sizing: border-box;
    overflow: hidden;
    background-color: var(--main-background-color);

    .box {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-flow: column;
      border: 1px solid var(--border-color);

      .head {
        flex: none;
        padding: 10px;
        box-sizing: border-box;
        border-bottom: 1px solid var(--border-color);


        button {
          &:nth-child(2) {
            border-color: var(--hover-border-color);
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

      .editor {
        flex: auto;
        width: 100%;
        height: 100%;
        // padding: 20px;
        box-sizing: border-box;
        overflow-y: auto;
        line-height: 26px;
        border: none;
        outline: none;
        font-size: 16px;
        resize: none;
        color: var(--text-color);
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
  transition: .5s ease-in-out;
}

.box-enter-to,
.box-leave-from {
  transform: translateY(0);
}
</style>