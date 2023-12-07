import SparkMD5 from 'spark-md5';
// 本地储存
export function _setData(key, data) {
  data = JSON.stringify({ data });
  localStorage.setItem('hello_' + key, encodeURIComponent(data));
}
//本地读取
export function _getData(key) {
  let d = localStorage.getItem('hello_' + key);
  return d && JSON.parse(decodeURIComponent(d)).data;
}
export function _delData(key) {
  if (key) {
    localStorage.removeItem('hello_' + key);
  } else {
    localStorage.clear();
  }
}
// 处理标题
export function updateTitle() {
  document.title = `hello ${_getData('username') || ''}`;
}
export const _loadingBar = (function () {
  let num = 0;
  let box = document.createElement('div');
  box.style.cssText = `
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  background-color: var(--mask-color);
  `;
  let box1 = document.createElement('div');
  box1.style.cssText = `
  width: 100px;
  height: 100px;
  position: absolute;
  top: 50%;
  left: 50%;
  background-image: url(/img/loading.svg);
  background-repeat: no-repeat;
  background-size: cover;
  transform: translate(-50%, -50%);
  `;
  box.appendChild(box1);
  let timer = null;
  document.body.appendChild(box);
  function start() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    num++;
    if (num === 1) {
      box.style.display = 'block';
      box.style.opacity = 1;
    }
  }
  function end() {
    num--;
    num <= 0 ? (num = 0) : null;
    if (num === 0) {
      box.style.transition = '.8s ease-in-out';
      box.style.opacity = 0;
      timer = setTimeout(() => {
        clearTimeout(timer);
        timer = null;
        box.style.display = 'none';
      }, 800);
    }
  }
  return {
    start,
    end,
  };
})();
export const loginValidate = (function (win) {
  let l = 50, //滑块边长
    r = 12, //滑块半径
    w, //canvas宽度
    h, //canvas高度
    PI = Math.PI;
  let ll = l + r * 2; //滑块的实际边长

  // 获取指定区间内的随机数
  function getRandomNumberByRange(start, end) {
    return Math.round(Math.random() * (end - start) + start);
  }

  // 创建元素
  function createElement(tagName) {
    return document.createElement(tagName);
  }

  // 创建画布
  function createCanvas(width, height) {
    const canvas = createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  // 创建图片
  function createImg(onload) {
    let img = createElement('img');
    img.src = '/img/validate.jpg';
    img.crossOrigin = 'Anonymous';
    img.onload = onload;
    return img;
  }
  // 绘制
  function draw(ctx, operation, x, y) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + l / 2, y);
    ctx.arc(x + l / 2, y - r + 2, r, 0, 2 * PI);
    ctx.lineTo(x + l / 2, y);
    ctx.lineTo(x + l, y);
    ctx.lineTo(x + l, y + l / 2);
    ctx.arc(x + l + r - 2, y + l / 2, r, 0, 2 * PI);
    ctx.lineTo(x + l, y + l / 2);
    ctx.lineTo(x + l, y + l);
    ctx.lineTo(x, y + l);
    ctx.lineTo(x, y);
    ctx.fillStyle = '#fff';
    ctx[operation]();
    ctx.beginPath();
    ctx.arc(x, y + l / 2, r, 1.5 * PI, 0.5 * PI);
    ctx.globalCompositeOperation = 'xor';
    ctx.fill();
  }
  class Validate {
    // 构造器
    constructor(success, fail) {
      this.success = success;
      this.fail = fail;
    }

    // 初始化
    init() {
      this.initDOM();
      this.initImg();
      this.draw();
      this.bindEvents();
    }

    // 初始化DOM
    initDOM() {
      let validateBox = createElement('div');
      validateBox.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          opacity: 0;
          transition: 1s ease-in-out;
          user-select: none;
          background-color: var(--mask-color);          
      `;
      let box = createElement('div');
      box.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background-color: var(--main-background-color);
        padding: 20px;
        display: flex;
        border-radius: 10px;
        place-items: center;
        width: 90%;
        box-sizing: border-box;
        max-width: 500px;
        z-index: 999;
      `;
      let cbox = createElement('div');
      cbox.style.cssText = `
        position: relative;
        width: 100%;
      `;
      box.appendChild(cbox);
      validateBox.appendChild(box);
      document.body.appendChild(validateBox);
      w = cbox.clientWidth;
      h = (w / 4) * 3;
      let canvas = createCanvas(w, h),
        block = canvas.cloneNode(true);
      block.style.cssText = `
        position: absolute;
        left: 0;
        top: 0;
      `;
      let sliderContainer = createElement('div');
      sliderContainer.style.cssText = `
        position: relative;
        text-align: center;
        height: 50px;
        line-height: 50px;
        margin-top: 15px;
        background-color: #f7f9fa;
        color: #717172;
      `;
      let sliderMask = createElement('div');
      sliderMask.style.cssText = `
        position: absolute;
        left: 0;
        top: 0;
        height: 50px;
        background-color: #ccc;
      `;
      let slider = createElement('div');
      slider.innerText = '>>';
      slider.style.cssText = `
        position: absolute;
        left: 0px;
        top: 0px;
        width: 50px;
        height: 50px;
        text-align: center;
        font-weight: bold;
        color: rgb(204, 204, 204);
        line-height: 50px;
        background: rgb(177, 177, 177);
        cursor: pointer;
      `;
      let text = createElement('span');
      text.innerHTML = '右滑补全拼图';
      text.style.cssText = `
        color:'#aaa';
      `;

      cbox.appendChild(canvas);
      cbox.appendChild(block);
      sliderMask.appendChild(slider);
      sliderContainer.appendChild(sliderMask);
      sliderContainer.appendChild(text);
      cbox.appendChild(sliderContainer);
      validateBox.style.opacity = 1;
      Object.assign(this, {
        validateBox,
        box,
        cbox,
        canvas,
        block,
        sliderContainer,
        slider,
        sliderMask,
        text,
        canvasCtx: canvas.getContext('2d'),
        blockCtx: block.getContext('2d'),
      });
    }

    // 初始化图像
    initImg() {
      const img = createImg(() => {
        this.canvasCtx.drawImage(img, 0, 0, w, h);
        this.blockCtx.drawImage(img, 0, 0, w, h);
        const y = this.y - r * 2 + 2;
        const imageData = this.blockCtx.getImageData(this.x, y, ll, ll);
        this.block.width = ll;
        this.blockCtx.putImageData(imageData, 0, y);
      });
      this.img = img;
    }

    // 绘画
    draw() {
      this.x = getRandomNumberByRange(ll + 10, w - (ll + 10));
      this.y = getRandomNumberByRange(10 + r * 2, h - (ll + 10));
      draw(this.canvasCtx, 'fill', this.x, this.y);
      draw(this.blockCtx, 'clip', this.x, this.y);
    }

    // 清除
    clean() {
      this.canvasCtx.clearRect(0, 0, w, h);
      this.blockCtx.clearRect(0, 0, w, h);
      this.block.width = w;
    }

    // 绑定事件
    bindEvents() {
      let originX,
        isMouseDown = false;
      this.slider.addEventListener('mousedown', (e) => {
        originX = e.clientX;
        isMouseDown = true;
      });
      this.slider.addEventListener('touchstart', (e) => {
        e = e.targetTouches[0];
        originX = e.clientX;
        isMouseDown = true;
      });
      document.addEventListener('mousemove', (e) => {
        e.preventDefault();
        if (!isMouseDown) {
          return false;
        }
        let moveX = e.clientX - originX;
        moveX < 0 ? (moveX = 0) : moveX > w - 50 ? (moveX = w - 50) : null;
        this.slider.style.left = moveX + 'px';
        this.sliderMask.style.width = moveX + 'px';
        this.block.style.left = ((w - 50 - 24) / (w - 50)) * moveX + 'px';
        this.text.style.display = 'none';
      });
      this.slider.addEventListener('touchmove', (e) => {
        e.preventDefault();
        e = e.targetTouches[0];
        if (!isMouseDown) {
          return false;
        }
        let moveX = e.clientX - originX;
        moveX < 0 ? (moveX = 0) : moveX > w - 50 ? (moveX = w - 50) : null;
        this.slider.style.left = moveX + 'px';
        this.sliderMask.style.width = moveX + 'px';
        this.block.style.left = ((w - 50 - 24) / (w - 50)) * moveX + 'px';
        this.text.style.display = 'none';
      });
      document.addEventListener('mouseup', (e) => {
        if (!isMouseDown) {
          return false;
        }
        isMouseDown = false;
        if (this.verify()) {
          this.sliderMask.style.backgroundColor = '#d2f4ef';
          this.slider.style.backgroundColor = '#52ccba';
          this.validateBox.remove();
          this.success && this.success();
        } else {
          this.sliderMask.style.backgroundColor = '#fce1e1';
          this.slider.style.backgroundColor = '#f57a7a';
          this.fail && this.fail();
          setTimeout(() => {
            this.reset();
          }, 500);
        }
      });
      this.slider.addEventListener('touchend', (e) => {
        if (!isMouseDown) {
          return false;
        }
        isMouseDown = false;
        if (this.verify()) {
          this.sliderMask.style.backgroundColor = '#d2f4ef';
          this.slider.style.backgroundColor = '#52ccba';
          this.validateBox.remove();
          this.success && this.success();
        } else {
          this.sliderMask.style.backgroundColor = '#fce1e1';
          this.slider.style.backgroundColor = '#f57a7a';
          this.fail && this.fail();
          setTimeout(() => {
            this.reset();
          }, 500);
        }
      });
    }

    // 重置
    reset() {
      this.text.style.display = 'block';
      this.sliderMask.style.backgroundColor = '#ccc';
      this.slider.style.backgroundColor = 'rgb(177, 177, 177)';
      this.slider.style.left = 0;
      this.block.style.left = 0;
      this.sliderMask.style.width = 0;
      this.clean();
      this.img.src = '/img/validate.jpg';
      this.draw();
    }
    // 验证
    verify() {
      const left = parseInt(this.block.style.left);
      return Math.abs(left - this.x) < 10;
    }
  }

  return {
    init: function (success, fail) {
      new Validate(success, fail).init();
    },
  };
})(window);
// 数据类型
export function checkedType(target) {
  return Object.prototype.toString.call(target).slice(8, -1);
}
// 深拷贝
export function deepClone(obj) {
  //判断传入对象为数组或者对象
  let result = Array.isArray(obj) ? [] : {};
  // for in遍历
  for (let key in obj) {
    // 判断是否为自身的属性值（排除原型链干扰）
    if (obj.hasOwnProperty(key)) {
      // 判断对象的属性值中存储的数据类型是否为对象
      if (typeof obj[key] === 'object') {
        // 有可能等于null
        if (obj[key] === null) {
          result[key] = null;
          continue;
        }
        // 递归调用
        result[key] = deepClone(obj[key]); //递归复制
      }
      // 不是的话直接赋值
      else {
        result[key] = obj[key];
      }
    }
  }
  // 返回新的对象
  return result;
}
// 提示音
export function playSound(src) {
  let sound = document.createElement('audio');
  sound.src = src;
  sound.play();
  sound.onended = function () {
    sound.onended = null;
    sound = null;
  };
}
//黑暗模式
export function darkMode(flag) {
  if (flag) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
// 操作提示弹窗
export const { _success, _err } = (function () {
  let msgArr = [];
  let zIndex = 999;
  class Msg {
    constructor(opt, callback) {
      this.message = opt.message;
      this.type = opt.type || 'info';
      this.callback = callback;
      this.duration = opt.duration || 3000;
      this.timer = null;
      this.init();
    }
    init() {
      this.el = document.createElement('div');
      let t = '';
      switch (this.type) {
        case 'info':
          t = `color: #0c5460;background-color: #d1ecf1;border-color: #bee5eb;`;
          break;
        case 'success':
          t = `background-color: #d1e7dd;color: #146c43;border-color: #c3e6cb;`;
          break;
        case 'danger':
          t = `color: #721c24;background-color: #f8d7da;border-color: #f5c6cb;`;
          break;
        case 'warning':
          t = `color: #856404;background-color: #fff3cd;border-color: #ffeeba;`;
        default:
          break;
      }
      this.el.style.cssText = `
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        width: 80%;
        max-width: 400px;
        opacity: 0;
        padding: 10px;
        border-radius: 5px;
        line-height: 1.5;
        font-size: 16px;
        border: solid 1px;
        z-index: ${zIndex};
        ${t}`;
      this.el.innerText = this.message;
      this.show();
      this.bind();
    }
    bind() {
      this._hdEnter = this.hdEnter.bind(this);
      this._hdLeave = this.hdLeave.bind(this);
      this._hdClick = this.hdClick.bind(this);
      this.el.addEventListener('mouseenter', this._hdEnter);
      this.el.addEventListener('mouseleave', this._hdLeave);
      this.el.addEventListener('click', this._hdClick);
    }
    unbind() {
      this.el.removeEventListener('mouseenter', this._hdEnter);
      this.el.removeEventListener('mouseleave', this._hdLeave);
      this.el.removeEventListener('click', this._hdClick);
    }
    hdClick() {
      this.callback && this.callback('click');
      this.close();
    }
    hdEnter() {
      this.el.isCheck = true;
      this.el.style.zIndex = zIndex + 1;
      this.el.style.opacity = 1;
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    }
    hdLeave() {
      this.el.style.zIndex = zIndex;
      this.el.style.opacity = 0.9;
      this.el.isCheck = false;
      this.hide();
    }
    show() {
      let top = 0;
      msgArr.forEach((item) => {
        top += item.offsetHeight + 20;
      });
      document.body.appendChild(this.el);
      msgArr.push(this.el);
      this.el.style.top = top + 'px';
      this.el.clientHeight;
      this.el.style.transition = '0.5s ease-in-out';
      this.el.style.marginTop = '20px';
      this.el.style.opacity = 0.9;
      this.hide();
    }
    hide() {
      this.timer = setTimeout(() => {
        clearTimeout(this.timer);
        this.timer = null;
        this.close();
      }, this.duration);
    }
    close() {
      this.unbind();
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      let idx = msgArr.findIndex((item) => item === this.el);
      msgArr.splice(idx, 1);
      let h = this.el.offsetHeight + 20;
      this.el.style.transition = '.5s ease-in-out';
      this.el.style.marginTop = `-${h}px`;
      this.el.style.opacity = 0;
      let timer = setTimeout(() => {
        clearTimeout(timer);
        timer = null;
        this.el.remove();
        this.callback && this.callback('close');
      }, 500);
      msgArr.forEach((item, i) => {
        if (item.isCheck || i < idx) return;
        let t = parseInt(item.style.top);
        item.style.transition = '0.5s ease-in-out';
        item.style.top = t - h + 'px';
      });
    }
  }
  function _success(message = '操作成功', callback) {
    new Msg({ message, type: 'success' }, callback);
  }
  function _err(message = '操作失败', callback) {
    new Msg({ message, type: 'danger', duration: 5000 }, callback);
  }
  function warning(message, callback) {
    new Msg({ message, type: 'warning', duration: 8000 }, callback);
  }
  function info(message, callback) {
    new Msg({ message }, callback);
  }
  function msg(opt, callback) {
    new Msg(opt, callback);
  }
  return {
    _success,
    _err,
  };
})();
//节流
export function throttle(callback, wait) {
  let timer = null,
    pretime = 0,
    res = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    let now = Date.now(),
      tt = wait - (now - pretime);
    if (tt <= 0) {
      res = callback.call(this, ...args);
      pretime = now;
    } else {
      timer = setTimeout(() => {
        timer = null;
        res = callback.call(this, ...args);
        pretime = now;
      }, tt);
    }
    return res;
  };
}
//防抖
export function debounce(callback, wait, immedia) {
  let timer = null,
    res = null;
  return function (...args) {
    if (timer) {
      clearTimeout(timer);
    } else {
      if (immedia) res = callback.call(this, ...args);
    }
    timer = setTimeout(() => {
      timer = null;
      if (!immedia) res = callback.call(this, ...args);
    }, wait);
    return res;
  };
}
//图片或背景加载完毕后显示
export function imgjz(url, fn, fnn) {
  let myimg = new Image();
  myimg.src = url;
  myimg.onload = function () {
    fn && fn();
    myimg.onload = null;
    myimg.onerror = null;
  };
  myimg.onerror = function () {
    fnn && fnn();
    myimg.onload = null;
    myimg.onerror = null;
  };
}
// 是否汉字
export function isChinese(str) {
  if (
    /^[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]+/.test(
      str
    )
  ) {
    return true;
  } else {
    return false;
  }
}
// 混合排序
export function mixedSort(a, b) {
  if (/^\d+/.test(a) && /^\d+/.test(b)) {
    return /^\d+/.exec(a) - /^\d+/.exec(b);
  } else if (isChinese(a) && isChinese(b)) {
    return a.localeCompare(b, 'zh-CN');
  } else {
    return a.localeCompare(b, 'en');
  }
}
// 格式化当前日期或时间戳日期
export function newDate(templete, timestamp) {
  templete ? null : (templete = '{0}年{1}月{2}日 {3}时{4}分{5}秒 星期{6}');
  let currentDate = timestamp ? new Date(+timestamp) : new Date();
  let year = currentDate.getFullYear(),
    month = currentDate.getMonth() + 1,
    date = currentDate.getDate(),
    hour = currentDate.getHours(),
    minute = currentDate.getMinutes(),
    second = currentDate.getSeconds(),
    weekArr = ['日', '一', '二', '三', '四', '五', '六'],
    n_day = currentDate.getDay();
  let formattedDateString = `${year}-${month}-${date}-${hour}-${minute}-${second}-${n_day}`,
    timeArr = formattedDateString.match(/\d+/g);
  return templete.replace(/\{(\d+)\}/g, (...arg) => {
    if (arg[1] === '6') {
      return weekArr[timeArr[arg[1]]];
    } else {
      let time = timeArr[arg[1]] || '00';
      return time.length < 2 ? '0' + time : time;
    }
  });
}
// 文件大小计算
export function computeSize(fsize) {
  fsize = Number(fsize);
  if (fsize == 0) return '--';
  if (fsize >= 1024 * 1024 * 1024) {
    fsize = `${(fsize / 1024 / 1024 / 1024).toFixed(2)}G`;
  } else if (fsize >= 1024 * 1024) {
    fsize = `${(fsize / 1024 / 1024).toFixed(2)}M`;
  } else if (fsize >= 1024) {
    fsize = `${(fsize / 1024).toFixed(2)}kb`;
  } else if (fsize < 1024) {
    fsize = `${fsize.toFixed(2)}b`;
  }
  return fsize;
}
// 事件委派获取点击目标
export function _getTarget(e, targetStr, current) {
  let target = e.target,
    reg = new RegExp(`\\b${targetStr.replace(/^[\.#]/g, '')}\\b`, 'g');
  if (targetStr.startsWith('.')) {
    if (current) {
      if (reg.test(target.className)) {
        return target;
      } else {
        return null;
      }
    }
    while (target && !reg.test(target.className)) {
      target = target.parentNode;
    }
  } else if (targetStr.startsWith('#')) {
    if (current) {
      if (reg.test(target.id)) {
        return target;
      } else {
        return null;
      }
    }
    while (target && !reg.test(target.id)) {
      target = target.parentNode;
    }
  } else {
    if (current) {
      if (targetStr.toUpperCase() === target.tagName) {
        return target;
      } else {
        return null;
      }
    }
    while (target && targetStr.toUpperCase() !== target.tagName) {
      target = target.parentNode;
    }
  }
  return target;
}
// 预览图片
export function imgPreview(arr, idx = 0) {
  let result, //图片宽高
    x, //偏移
    y,
    scale = 1, //缩放
    maxScale = 10, //最大缩放
    minScale = 0.5; //最小缩放//移动状态
  let pointers = [], // 触摸点数组
    point1 = { x: 0, y: 0 }, // 第一个点坐标
    point2 = { x: 0, y: 0 }, // 第二个点坐标
    diff = { x: 0, y: 0 }, // 相对于上一次pointermove移动差值
    lastPointermove = { x: 0, y: 0 }, // 用于计算diff
    lastPoint1 = { x: 0, y: 0 }, // 上一次第一个触摸点坐标
    lastPoint2 = { x: 0, y: 0 }, // 上一次第二个触摸点坐标
    lastCenter; // 上一次中心点坐标
  let box = document.createElement('div');
  box.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  overflow: hidden;
  color: #ccc;
  opacity: 0;
  z-index: 99;
  `;
  let image = document.createElement('img');
  // 禁止移动端默认触摸事件
  image.style.cssText = `
  opacity: 0;
  touch-action: none;
  `;
  let image1 = document.createElement('img');
  image1.style.cssText = `
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  max-width: 100%;
  display: none;
  `;
  box.appendChild(image);
  box.appendChild(image1);
  let pre = document.createElement('div');
  pre.style.cssText = `
  display: none;
  position: absolute;
  left: 10px;
  top: 50%;
  padding: 10px;
  font-size: 40px;
  border-radius: 10px;
  background-color: rgb(0 0 0 / 40%);
  transform: translateY(-50%);
  cursor: pointer;
  `;
  let next = document.createElement('div');
  next.style.cssText = `
  display: none;
  position: absolute;
  right: 10px;
  top: 50%;
  padding: 10px;
  font-size: 40px;
  border-radius: 10px;
  background-color: rgb(0 0 0 / 40%);
  transform: translateY(-50%);
  cursor: pointer;
  `;
  let close = document.createElement('div');
  close.style.cssText = `
  position: absolute;
  left: 0;
  top: 0;
  padding: 10px;
  font-size: 40px;
  border-radius: 0 0 50% 0;
  background-color: rgb(0 0 0 / 40%);
  cursor: pointer;
  `;
  close.innerHTML = '&times;';
  pre.innerText = '<';
  next.innerText = '>';
  pre.setAttribute('cursor', '');
  next.setAttribute('cursor', '');
  close.setAttribute('cursor', '');
  box.appendChild(pre);
  box.appendChild(next);
  box.appendChild(close);
  document.body.appendChild(box);
  box.style.transition = '.2s ease-in-out';
  box.style.opacity = 1;
  if (arr.length > 1) {
    pre.style.display = 'block';
    next.style.display = 'block';
  }

  function cut(idx) {
    scale = 1;
    image.style.opacity = 0;
    image1.style.display = 'none';
    _loadingBar.end();
    let { u1, u2 } = arr[idx];
    _loadingBar.start();
    if (u2) {
      image1.src = u2;
      image1.style.display = 'block';
    }
    image.src = u1;
  }
  cut(idx);
  function hdLoad() {
    result = getImgSize(
      image.naturalWidth,
      image.naturalHeight,
      window.innerWidth,
      window.innerHeight
    );
    image.style.width = result.width + 'px';
    image.style.height = result.height + 'px';
    x = (window.innerWidth - result.width) * 0.5;
    y = (window.innerHeight - result.height) * 0.5;
    image.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0) scale(1)';
    image1.style.display = 'none';
    image.style.opacity = 1;
    _loadingBar.end();
  }
  function hdError() {
    _loadingBar.end();
    image.style.opacity = 0;
    _msg.error('图片加载失败');
  }
  function hdMove(e) {
    if (e.target !== image) return;
    handlePointers(e);
    const current1 = { x: pointers[0].clientX, y: pointers[0].clientY };
    if (pointers.length === 1) {
      diff.x = current1.x - lastPointermove.x;
      diff.y = current1.y - lastPointermove.y;
      lastPointermove = { x: current1.x, y: current1.y };
      x += diff.x;
      y += diff.y;
      image.style.transform =
        'translate3d(' + x + 'px, ' + y + 'px, 0) scale(' + scale + ')';
    } else if (pointers.length === 2) {
      const current2 = { x: pointers[1].clientX, y: pointers[1].clientY };
      // 计算相对于上一次移动距离比例 ratio > 1放大，ratio < 1缩小
      let ratio =
        getDistance(current1, current2) / getDistance(lastPoint1, lastPoint2);
      // 缩放比例
      const _scale = scale * ratio;
      if (_scale > maxScale) {
        scale = maxScale;
        ratio = maxScale / scale;
      } else if (_scale < minScale) {
        scale = minScale;
        ratio = minScale / scale;
      } else {
        scale = _scale;
      }
      // 计算当前双指中心点坐标
      const center = getCenter(current1, current2);
      // 计算图片中心偏移量，默认transform-origin: 50% 50%
      // 如果transform-origin: 0% 0%，那origin.x = (ratio - 1) * result.width * 0
      // origin.y = (ratio - 1) * result.height * 0
      // 如果transform-origin: 30% 40%，那origin.x = (ratio - 1) * result.width * 0.3
      // origin.y = (ratio - 1) * result.height * 0.4
      const origin = {
        x: (ratio - 1) * result.width * 0.5,
        y: (ratio - 1) * result.height * 0.5,
      };
      // 计算偏移量
      x -= (ratio - 1) * (center.x - x) - origin.x - (center.x - lastCenter.x);
      y -= (ratio - 1) * (center.y - y) - origin.y - (center.y - lastCenter.y);
      image.style.transform =
        'translate3d(' + x + 'px, ' + y + 'px, 0) scale(' + scale + ')';
      lastCenter = { x: center.x, y: center.y };
      lastPoint1 = { x: current1.x, y: current1.y };
      lastPoint2 = { x: current2.x, y: current2.y };
    }
    e.preventDefault();
  }
  function hdUp(e) {
    pointers = [];
    box.removeEventListener('pointermove', hdMove);
    box.removeEventListener('pointerup', hdUp);
  }
  function hdClick(e) {
    if (e.target === pre) {
      idx -= 1;
      idx < 0 ? (idx = arr.length - 1) : null;
      cut(idx);
      return;
    } else if (e.target === next) {
      idx += 1;
      idx >= arr.length ? (idx = 0) : null;
      cut(idx);
      return;
    } else if (e.target === close) {
      box.removeEventListener('click', hdClick);
      box.removeEventListener('pointerdown', hdDown);
      image.removeEventListener('wheel', hdWheel);
      image.removeEventListener('load', hdLoad);
      image.removeEventListener('error', hdError);
      box.style.transition = '.5s ease-in-out';
      box.style.opacity = 0;
      _loadingBar.end();
      let timer = setTimeout(() => {
        clearTimeout(timer);
        timer = null;
        box.remove();
      }, 500);
    }
  }
  box.addEventListener('click', hdClick);
  function hdWheel(e) {
    let ratio = 1.1;
    // 缩小
    if (e.deltaY > 0) {
      ratio = 1 / 1.1;
    }
    const _scale = scale * ratio;
    if (_scale > maxScale) {
      ratio = maxScale / scale;
      scale = maxScale;
    } else if (_scale < minScale) {
      ratio = minScale / scale;
      scale = minScale;
    } else {
      scale = _scale;
    }
    // 目标元素是img说明鼠标在img上，以鼠标位置为缩放中心，否则默认以图片中心点为缩放中心
    if (e.target.tagName === 'IMG') {
      const origin = {
        x: (ratio - 1) * result.width * 0.5,
        y: (ratio - 1) * result.height * 0.5,
      };
      // 计算偏移量
      x -= (ratio - 1) * (e.clientX - x) - origin.x;
      y -= (ratio - 1) * (e.clientY - y) - origin.y;
    }
    image.style.transform =
      'translate3d(' + x + 'px, ' + y + 'px, 0) scale(' + scale + ')';
    e.preventDefault();
  }
  function hdDown(e) {
    // 绑定 pointerup
    box.addEventListener('pointerup', hdUp);
    if (e.target !== image) return;
    pointers.push(e);
    point1 = { x: pointers[0].clientX, y: pointers[0].clientY };
    if (pointers.length === 1) {
      image.setPointerCapture(e.pointerId);
      lastPointermove = { x: pointers[0].clientX, y: pointers[0].clientY };
    } else if (pointers.length === 2) {
      point2 = { x: pointers[1].clientX, y: pointers[1].clientY };
      lastPoint2 = { x: pointers[1].clientX, y: pointers[1].clientY };
      lastCenter = getCenter(point1, point2);
    }
    lastPoint1 = { x: pointers[0].clientX, y: pointers[0].clientY };
    // 绑定 pointermove
    box.addEventListener('pointermove', hdMove);
  }
  // 图片加载完成后再操作，否则naturalWidth为0
  image.addEventListener('load', hdLoad);
  image.addEventListener('error', hdError);
  // 绑定 pointerdown
  box.addEventListener('pointerdown', hdDown);
  // 滚轮缩放
  image.addEventListener('wheel', hdWheel);

  /**
   * 更新指针
   * @param {PointerEvent} e
   * @param {string} type
   */
  function handlePointers(e) {
    for (let i = 0; i < pointers.length; i++) {
      if (pointers[i].pointerId === e.pointerId) {
        pointers[i] = e;
      }
    }
  }

  /**
   * 获取两点间距离
   * @param {object} a 第一个点坐标
   * @param {object} b 第二个点坐标
   * @returns
   */
  function getDistance(a, b) {
    const x = a.x - b.x;
    const y = a.y - b.y;
    return Math.hypot(x, y); // Math.sqrt(x * x + y * y);
  }
  /**
   * 获取中点坐标
   * @param {object} a 第一个点坐标
   * @param {object} b 第二个点坐标
   * @returns
   */
  function getCenter(a, b) {
    const x = (a.x + b.x) / 2;
    const y = (a.y + b.y) / 2;
    return { x: x, y: y };
  }

  /**
   * 获取图片缩放尺寸
   * @param {number} naturalWidth
   * @param {number} naturalHeight
   * @param {number} maxWidth
   * @param {number} maxHeight
   * @returns
   */
  function getImgSize(naturalWidth, naturalHeight, maxWidth, maxHeight) {
    const imgRatio = naturalWidth / naturalHeight;
    const maxRatio = maxWidth / maxHeight;
    let width, height;
    // 如果图片实际宽高比例 >= 显示宽高比例
    if (imgRatio >= maxRatio) {
      if (naturalWidth > maxWidth) {
        width = maxWidth;
        height = (maxWidth / naturalWidth) * naturalHeight;
      } else {
        width = naturalWidth;
        height = naturalHeight;
      }
    } else {
      if (naturalHeight > maxHeight) {
        width = (maxHeight / naturalHeight) * naturalWidth;
        height = maxHeight;
      } else {
        width = naturalWidth;
        height = naturalHeight;
      }
    }
    return { width: width, height: height };
  }
}
// 上传进度
export const UpProgress = (function () {
  let upProgressbox = document.createElement('div');
  upProgressbox.style.cssText = `
  position: fixed;
  top: 60px;
  right: 20px;
  transform: translateX(100%);
  width: 80%;
  max-width: 400px;
  pointer-events: none;
  transition: 0.5s ease-in-out;
  color: var(--text-color);
  z-index: 1000;
  `;
  document.body.appendChild(upProgressbox);

  class UpProgress {
    constructor(name) {
      this.loadnum = 0;
      this.name = name;
      this.create();
    }
    create() {
      this.box = document.createElement('div');
      this.box1 = document.createElement('div');
      this.box2 = document.createElement('div');
      this.box.style.cssText = `
                  position: relative;
                  background-color: var(--main-background-color);
                  margin-bottom: 5px;
                  border-radius: 5px;
                  border: 1px solid var(--border-color);
                  overflow: hidden;`;
      this.box1.style.cssText = `
                  position: relative;
                  width: 100%;
                  height: 40px;
                  line-height: 40px;
                  text-indent: 10px;
                  text-overflow: ellipsis;
                  overflow: hidden;
                  white-space: nowrap;`;
      this.box2.style.cssText = `
                  position: absolute;
                  height: 100%;
                  line-height: 40px;
                  text-align: center;
                  width: 0;
                  transition: 0.5s ease-in-out;
                  text-overflow: ellipsis;
                  overflow: hidden;
                  white-space: nowrap; 
                  color: #fff;
                  `;
      this.box1.innerText = this.name;
      this.box.appendChild(this.box2);
      this.box.appendChild(this.box1);
      upProgressbox.appendChild(this.box);
      upProgressbox.style.transform = 'none';
    }
    update(pes) {
      //上传进度
      this.box1.innerText = this.name;
      this.box2.style.backgroundColor = 'var(--scrollbar-color)';
      this.box2.style.width = pes * 100 + '%';
    }
    loading(pes) {
      this.box1.innerText = `加载中...${parseInt(pes * 100)}%`;
    }
    close(title) {
      this.box1.innerText = this.name;
      this.box2.style.width = 100 + '%';
      this.box2.style.backgroundColor = 'green';
      this.box2.style.opacity = '0.8';
      this.box2.style.zIndex = '2';
      this.box2.innerText = title || '上传成功';
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(() => {
        clearTimeout(this.timer);
        this.timer = null;
        this.animate();
      }, 1000);
    }
    fail(title) {
      this.box1.innerText = this.name;
      this.box2.style.width = 100 + '%';
      this.box2.style.backgroundColor = 'red';
      this.box2.style.opacity = '0.8';
      this.box2.style.zIndex = '2';
      this.box2.innerText = title || '上传失败';
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(() => {
        clearTimeout(this.timer);
        this.timer = null;
        this.animate();
      }, 4000);
    }
    animate() {
      this.loadnum += 5;
      this.box.style.transform = `translateX(${this.loadnum}%)`;
      this.box.style.opacity = 1 - this.loadnum / 100;
      if (this.loadnum >= 100) {
        if (this.animation !== null) {
          cancelAnimationFrame(this.animation);
          this.animation = null;
          this.box.remove();
          if (upProgressbox.innerHTML === '') {
            upProgressbox.style.transform = `translateX(100%)`;
          }
        }
        return;
      }
      this.animation = requestAnimationFrame(this.animate.bind(this));
    }
  }
  return UpProgress;
})();
// 大文件切片
export function fileSlice(file, callback) {
  return new Promise((resolve, reject) => {
    let chunkSize = 3 * 1024 * 1024,
      suffix = file.name.slice(file.name.lastIndexOf('.') + 1),
      count = Math.ceil(file.size / chunkSize),
      spark = new SparkMD5.ArrayBuffer(),
      fileReader = new FileReader();
    let num = 0,
      chunks = [];
    fileReader.onload = function (e) {
      let buffer = e.target.result;
      spark.append(buffer);
      num++;
      handleChunk();
    };
    fileReader.onerror = function () {
      reject();
    };
    handleChunk();
    function handleChunk() {
      if (num >= count) {
        let HASH = spark.end();
        resolve({
          HASH,
          chunks,
          count,
          suffix,
        });
        return;
      }
      callback && callback(count === 1 ? 1 : num / (count - 1));
      let chunk = file.slice(num * chunkSize, (num + 1) * chunkSize);
      chunks.push({
        file: chunk,
        filename: `_${num}`,
      });
      fileReader.readAsArrayBuffer(chunk);
    }
  });
}
// 下载文件
export function downloadFile(url, fileName) {
  let a = document.createElement('a');
  a.href = url;
  if (fileName) {
    a.download = fileName;
  }
  document.body.appendChild(a);
  a.click();
  a.remove();
}
// 是否子文件夹
export function isSubfolder(from, to) {
  return from === to.slice(0, from.length);
}
// 随机数
export function randomNum(x, y) {
  return Math.round(Math.random() * (y - x) + x);
}
// 随机颜色
export function randomColor() {
  return `rgb(${randomNum(0, 256)},${randomNum(0, 256)},${randomNum(0, 256)})`;
}
//鼠标点击效果
~(function () {
  function handle(e) {
    let box = document.createElement('div');
    box.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      z-index: 200;
      pointer-events: none;
      `;
    document.body.appendChild(box);
    let randomc = randomColor();
    box.style.left = e.clientX - 20 / 2 + 'px';
    box.style.top = e.clientY - 20 / 2 + 'px';
    box.style.backgroundColor = randomc;
    box.clientHeight;
    box.style.transition = '.8s ease-in-out';
    box.style.opacity = 0;
    box.style.transform = 'scale(2)';
    _setTimeout(() => {
      box.remove();
    }, 2000);
  }
  let _handle = debounce(handle, 100, true);
  document.addEventListener('mouseup', _handle);
  document.addEventListener('touchend', function (e) {
    let ev = e.changedTouches[0];
    _handle(ev);
  });
})();
// 定时器
export function _setTimeout(callback, time) {
  let timer = setTimeout(() => {
    clearTimeout(timer);
    timer = null;
    callback();
  }, time);
  return timer;
}
~(function () {
  let img = document.createElement('img');
  img.src = '/img/hechang.png';
  img.style.cssText = `
  width: 100px;
  height: 100px;
  position: fixed;
  right: 0;
  bottom: 0;
  opacity: .6;
  pointer-events: none;
  z-index: 300;
  `;
  document.body.appendChild(img);
})();
export function isUserName(str) {
  let reg =
    /^[\u2E80-\u2FDF\u3040-\u318F\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FFF\uA960-\uA97F\uAC00-\uD7FF\w -]+$/g;
  return str && reg.test(str);
}
export function isFileName(str) {
  let reg = /[\/\\\:\*\"\<\>\|\？]/g;
  return str && !reg.test(str);
}
export function isImgFile(name) {
  return /(\.jpg|\.jpeg|\.png|\.ico|\.webp|\.gif)$/gi.test(name);
}
// 文件logo类型
export function fileLogoType(obj) {
  let { type, name } = obj;
  if (type === 'file') {
    if (isImgFile(name)) {
      return 'icon-tupian';
    } else if (/(\.rmvb|\.3gp|\.mp4|\.m4v|\.avi|\.mkv|\.flv)$/gi.test(name)) {
      return 'icon-shipin1';
    } else if (/(\.mp3|\.wma|\.wav|\.ape|\.flac|\.ogg|\.aac)$/gi.test(name)) {
      return 'icon-yinle';
    } else if (/(\.rar|\.7z|\.zip|\.tar|\.gz)$/gi.test(name)) {
      return 'icon-yasuobao';
    } else {
      return 'icon-24gl-fileText';
    }
  } else {
    return 'icon-24gl-folderOpen';
  }
}
// 一键复制
export async function copyText(content, obj = {}) {
  let { success, error } = obj;
  content = content.trim();
  try {
    if (!navigator.clipboard) {
      throw new Error();
    }
    await navigator.clipboard.writeText(content);
    _success(success || '复制成功');
  } catch (err) {
    if (typeof document.execCommand !== 'function') {
      _err(error || '复制失败');
      return;
    }
    window.getSelection().removeAllRanges();
    let div = document.createElement('div'),
      range = document.createRange();
    div.innerText = content;
    div.setAttribute(
      'style',
      'position: fixed;height: 1px;fontSize: 1px;overflow: hidden;'
    );
    document.body.appendChild(div);
    range.selectNode(div);
    window.getSelection().addRange(range);
    document.execCommand('copy');
    div.remove();
    _success(success || '复制成功');
  }
}
export function _myOpen(url, _blank) {
  if (!_blank && !url) return window.location.href;
  let a = document.createElement('a');
  a.href = url;
  _blank && (a.target = '_blank');
  document.body.appendChild(a);
  a.click();
  a.remove();
}
export function isios() {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua);
}
export function getSuffix(str) {
  let idx = str.lastIndexOf('.'),
    a = '',
    b = '';
  if (idx < 0) {
    a = str;
  } else {
    a = str.slice(0, idx);
    b = str.slice(idx + 1);
  }
  return [a, b];
}
export function myDrag(opt) {
  let { trigger, target, callback, flag } = opt;
  callback && callback('create', opt);
  let ol, ot;
  function down(e) {
    if ((flag && window.innerWidth <= 800) || e.target != trigger) return;
    let l = target.offsetLeft,
      t = target.offsetTop;
    if (e.type == 'touchstart') {
      ol = e.touches[0].clientX - l;
      ot = e.touches[0].clientY - t;
    } else if (e.type == 'mousedown') {
      ol = e.clientX - l;
      ot = e.clientY - t;
    }
    trigger.addEventListener('touchmove', move);
    trigger.addEventListener('touchend', up);
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    callback && callback('down', opt);
  }
  function move(e) {
    if (flag && window.innerWidth <= 800) return;
    let l, t;
    if (e.type == 'touchmove') {
      e.preventDefault();
      l = e.touches[0].clientX - ol;
      t = e.touches[0].clientY - ot;
    } else if (e.type == 'mousemove') {
      l = e.clientX - ol;
      t = e.clientY - ot;
    }
    target.style.left = l + 'px';
    target.style.top = t + 'px';
    callback && callback('move', opt);
  }
  function up() {
    if (flag && window.innerWidth <= 800) return;
    target.removeEventListener('touchmove', move);
    target.removeEventListener('touchend', up);
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
    callback && callback('up', opt);
  }
  trigger.addEventListener('mousedown', down);
  trigger.addEventListener('touchstart', down);
  return function () {
    trigger.removeEventListener('mousedown', down);
    trigger.removeEventListener('touchstart', down);
  };
}
