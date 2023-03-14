import SparkMD5 from 'spark-md5'
// 本地储存
export function _setData(key, data) {
  data = JSON.stringify({ data });
  localStorage.setItem("hello_" + key, encodeURIComponent(data));
}
//本地读取
export function _getData(key) {
  let d = localStorage.getItem("hello_" + key);
  return d && JSON.parse(decodeURIComponent(d)).data;
}
export function _delData(key) {
  if (key) {
    localStorage.removeItem("hello_" + key)
  } else {
    localStorage.clear()
  }
}
// 处理标题
export function updateTitle() {
  document.title = `hello ${_getData('username') || ''}`
}
// 页面加载进度条效果
// class LoadingBar {
//   constructor(options) {
//     this.num = 0;
//     this.loadnum = 0;
//     this.randomnum = 0;
//     this.timer = null;
//     this.init(options);
//   }
//   init(options) {
//     let defaultobj = {
//       color: 'red',
//       size: '3',
//       setStart: null,
//       setEnd: null
//     }
//     this.options = Object.assign(defaultobj, options);
//     this.render()
//   }
//   render() {
//     this.el = document.createElement('div');
//     let { color, size } = this.options;
//     this.el.style.cssText = `
//     height: ${size}px;
//     background-color: ${color};
//     position: fixed;
//     bottom: 0;
//     left: 0;
//     border-radio:20px;
//     pointer-events: none;
//     z-index: 100;
//     background-image: linear-gradient(to right, Green, Orange, red);
//     opacity: 0;`
//     document.body.appendChild(this.el)
//   }
//   start() {
//     this.num++;
//     if (this.num === 1) {
//       this.el.style.opacity = '1';
//       this.el.style.transition = 'none';
//       this.el.style.width = '0px';
//       this.randomnum = Math.round(Math.random() * (95 - 70) + 70)
//       this.animate();
//       this.options.setStart && this.options.setStart()
//     }
//   }
//   end() {
//     this.num--;
//     this.num <= 0 ? this.num = 0 : null;
//     if (this.num === 0) {
//       this.loadnum = 0
//       this.el.style.width = '100%';
//       this.el.style.transition = 'opacity 1.5s';
//       this.el.style.opacity = 0;
//       if (this.timer !== null) {
//         cancelAnimationFrame(this.timer);
//         this.timer = null;
//       }
//       this.options.setEnd && this.options.setEnd()
//     }
//   }
//   animate() {
//     this.loadnum += 1;
//     this.el.style.width = this.loadnum + "%";
//     if (this.loadnum >= this.randomnum) {
//       if (this.timer !== null) {
//         cancelAnimationFrame(this.timer);
//         this.timer = null;
//       }
//       return;
//     }
//     this.timer = requestAnimationFrame(this.animate.bind(this));
//   }
// }
export const _loadingBar = function () {
  let num = 0;
  let box = document.createElement('div')
  box.style.cssText = `
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  background-color: rgb(0 0 0 / 10%);
  `
  let box1 = document.createElement('div');
  box1.style.cssText = `
  width: 100px;
  height: 100px;
  position: absolute;
  top: 50%;
  left: 50%;
  background-image: url(/img/loading.gif);
  background-repeat: no-repeat;
  background-size: cover;
  transform: translate(-50%, -50%);
  `
  box.appendChild(box1)
  document.body.appendChild(box)
  function start() {
    num++;
    if (num === 1) {
      box.style.display = 'block'
    }
  }
  function end() {
    num--;
    num <= 0 ? num = 0 : null;
    if (num === 0) {
      box.style.display = 'none'
    }
  }
  return {
    start,
    end
  }
}();
// export const _loadingBar = new LoadingBar({
//   color: 'red',//进度条颜色
//   size: '4',//进度条粗细（px）
//   setStart() {//自定义开始回调
//     showloading()
//   },
//   setEnd() {//自定义结束回调
//     hideloading()
//   }
// })
export const loginValidate = function (win) {
  let l = 42, //滑块边长
    r = 10, //滑块半径
    w, //canvas宽度
    h = 200, //canvas高度
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
          transition: 1s;
          user-select: none;
          background-color: #000000b8;          
      `
      let box = createElement('div');
      box.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background-color: rgb(255, 255, 255);
        padding: 20px;
        display: flex;
        border-radius: 10px;
        place-items: center;
        width: 90%;
        box-sizing: border-box;
        max-width: 400px;
        z-index: 999;
      `
      let cbox = createElement('div');
      cbox.style.cssText = `
        position: relative;
        width: 100%;
      `
      box.appendChild(cbox)
      validateBox.appendChild(box)
      document.body.appendChild(validateBox)
      w = cbox.clientWidth
      let canvas = createCanvas(w, h),
        block = canvas.cloneNode(true);
      block.style.cssText = `
        position: absolute;
        left: 0;
        top: 0;
      `
      let sliderContainer = createElement('div');
      sliderContainer.style.cssText = `
        position: relative;
        text-align: center;
        height: 40px;
        line-height: 40px;
        margin-top: 15px;
        background-color: #f7f9fa;
        color: #717172;
      `
      let sliderMask = createElement('div');
      sliderMask.style.cssText = `
        position: absolute;
        left: 0;
        top: 0;
        height: 40px;
        background-color: #ccc;
      `
      let slider = createElement('div');
      slider.innerText = '>>'
      slider.style.cssText = `
        position: absolute;
        left: 0px;
        top: 0px;
        width: 40px;
        height: 40px;
        text-align: center;
        font-weight: bold;
        color: rgb(204, 204, 204);
        line-height: 40px;
        background: rgb(177, 177, 177);
        cursor: pointer;
      `
      let text = createElement('span');
      text.innerHTML = '右滑补全拼图';
      text.style.cssText = `
        color:'#aaa';
      `

      cbox.appendChild(canvas);
      cbox.appendChild(block);
      sliderMask.appendChild(slider);
      sliderContainer.appendChild(sliderMask);
      sliderContainer.appendChild(text);
      cbox.appendChild(sliderContainer);
      validateBox.style.opacity = 1
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
        blockCtx: block.getContext('2d')
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
      let originX, isMouseDown = false;
      this.slider.addEventListener('mousedown', (e) => {
        originX = e.clientX;
        isMouseDown = true;
      })
      this.slider.addEventListener('touchstart', (e) => {
        e = e.targetTouches[0];
        originX = e.clientX;
        isMouseDown = true;
      })
      document.addEventListener('mousemove', (e) => {
        e.preventDefault();
        if (!isMouseDown) {
          return false;
        }
        let moveX = e.clientX - originX;
        moveX < 0 ? moveX = 0 : (moveX > w - 40 ? moveX = w - 40 : null)
        this.slider.style.left = moveX + 'px';
        this.sliderMask.style.width = moveX + 'px';
        this.block.style.left = (w - 40 - 20) / (w - 40) * moveX + 'px';
        this.text.style.display = 'none'
      })
      this.slider.addEventListener('touchmove', (e) => {
        e.preventDefault();
        e = e.targetTouches[0];
        if (!isMouseDown) {
          return false;
        }
        let moveX = e.clientX - originX;
        moveX < 0 ? moveX = 0 : (moveX > w - 40 ? moveX = w - 40 : null)
        this.slider.style.left = moveX + 'px';
        this.sliderMask.style.width = moveX + 'px';
        this.block.style.left = (w - 40 - 20) / (w - 40) * moveX + 'px';
        this.text.style.display = 'none'
      })
      document.addEventListener('mouseup', (e) => {
        if (!isMouseDown) {
          return false;
        }
        isMouseDown = false;
        if (this.verify()) {
          this.sliderMask.style.backgroundColor = '#d2f4ef'
          this.slider.style.backgroundColor = '#52ccba'
          this.validateBox.remove()
          this.success && this.success();
        } else {
          this.sliderMask.style.backgroundColor = '#fce1e1'
          this.slider.style.backgroundColor = '#f57a7a'
          this.fail && this.fail();
          setTimeout(() => {
            this.reset();
          }, 500);
        }
      })
      this.slider.addEventListener('touchend', (e) => {
        if (!isMouseDown) {
          return false;
        }
        isMouseDown = false;
        if (this.verify()) {
          this.sliderMask.style.backgroundColor = '#d2f4ef'
          this.slider.style.backgroundColor = '#52ccba'
          this.validateBox.remove()
          this.success && this.success();
        } else {
          this.sliderMask.style.backgroundColor = '#fce1e1'
          this.slider.style.backgroundColor = '#f57a7a'
          this.fail && this.fail();
          setTimeout(() => {
            this.reset();
          }, 500);
        }
      })
    }

    // 重置
    reset() {
      this.text.style.display = 'block'
      this.sliderMask.style.backgroundColor = '#ccc'
      this.slider.style.backgroundColor = 'rgb(177, 177, 177)'
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
    }
  }
}(window)
// 数据类型
export function checkedType(target) {
  return Object.prototype.toString.call(target).slice(8, -1)
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
          result[key] = null
          continue
        }
        // 递归调用
        result[key] = deepClone(obj[key]);   //递归复制
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
  sound.src = src
  sound.play()
  sound.onended = function () {
    sound.onended = null
    sound = null
  }
}
// 操作提示弹窗
export const { _success, _err } = function () {
  let timer = null;
  let box = document.createElement('div'),
    textbox = document.createElement('div');
  box.style.cssText = `
    width: 100%;
    min-height: 100px;
    position: fixed;
    top: 30px;
    transform: translateY(-100%);
    font-size: 18px;
    opacity: 0;
    text-align: center;
    z-index: 101;
    pointer-events: none;`
  textbox.style.cssText = `
    display: inline-block;
    max-height: 100%;
    max-width: 80%;
    line-height: 30px;
    overflow: hidden;
    font-weight: bold;
    box-sizing: border-box;
    padding: 5px 10px;
    border-radius: 10px;
    background-color: rgba(0, 0, 0, 0.6);`
  box.appendChild(textbox);
  document.body.appendChild(box);
  function mstc(flag, str, again) {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    str = str || (flag ? '操作成功~' : '操作失败~')
    let color = flag ? 'white' : 'rgba(245,27,112,1)';
    if (!again) {
      box.style.transition = '0s';
      box.style.transform = 'translateY(-100%)'
      box.style.opacity = '0'
      box.clientWidth
    }

    textbox.innerText = str;
    textbox.style.color = color;
    box.style.transition = '0.5s ease-out';
    box.style.transform = 'none'
    box.style.opacity = '1'

    timer = setTimeout(() => {
      clearTimeout(timer)
      timer = null
      box.style.transition = '1s ease-out';
      box.style.transform = 'translateY(-100%)'
      box.style.opacity = '0'
    }, 5000);
  }
  function _success(str, again) {
    mstc(true, str, again)
  }
  function _err(str, again) {
    playSound(`/img/error.mp3`)
    mstc(false, str, again)
  }
  return {
    _success,
    _err
  }
}()
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
    fn && fn()
    myimg.onload = null;
    myimg.onerror = null;
  };
  myimg.onerror = function () {
    fnn && fnn()
    myimg.onload = null;
    myimg.onerror = null;
  };
}
// 是否汉字
export function isChinese(str) {
  if (/^[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]+/.test(str)) {
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
    return a.localeCompare(b, 'zh-CN')
  } else {
    return a.localeCompare(b, 'en');
  }
}
// 格式化当前日期或时间戳日期
export function newDate(templete, timestamp) {
  templete ? null : (templete = "{0}年{1}月{2}日 {3}时{4}分{5}秒 星期{6}");
  let currentDate = timestamp ? new Date(+timestamp) : new Date();
  let year = currentDate.getFullYear(),
    month = currentDate.getMonth() + 1,
    date = currentDate.getDate(),
    hour = currentDate.getHours(),
    minute = currentDate.getMinutes(),
    second = currentDate.getSeconds(),
    weekArr = ["日", "一", "二", "三", "四", "五", "六"],
    n_day = currentDate.getDay();
  let formattedDateString = `${year}-${month}-${date}-${hour}-${minute}-${second}-${n_day}`,
    timeArr = formattedDateString.match(/\d+/g);
  return templete.replace(/\{(\d+)\}/g, (...arg) => {
    if (arg[1] === "6") {
      return weekArr[timeArr[arg[1]]];
    } else {
      let time = timeArr[arg[1]] || "00";
      return time.length < 2 ? "0" + time : time;
    }
  });
}
// 文件大小计算
export function computeSize(fsize) {
  fsize = Number(fsize);
  if (fsize == 0) return "--";
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
      target = target.parentNode
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
export function imgPreview(u1, u2) {
  let num = 0
  let box = document.createElement('div')
  box.style.cssText = `
  display: none;
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 99;
  background-color: rgba(0, 0, 0, 0.8);
  opacity: 0;
  overflow: auto;
  user-select: none;
  `
  let zoomBox = document.createElement('div')
  zoomBox.style.cssText = `
  display: none;
  position: fixed;
  bottom:60px;
  left:50%;
  transform:translateX(-50%);
  `
  let zoomItem1 = document.createElement('span')
  zoomItem1.className = "iconfont icon-jiajian1"
  zoomItem1.setAttribute('cursor', '')
  let zoomItem2 = document.createElement('span')
  zoomItem2.className = "iconfont icon-jiajian"
  zoomItem2.setAttribute('cursor', '')
  zoomItem1.style.cssText = zoomItem2.style.cssText = `
  padding: 10px;
  font-size: 50px;
  margin: 0 20px;
  color: #aaa;
  `
  zoomBox.appendChild(zoomItem1)
  zoomBox.appendChild(zoomItem2)
  let img = document.createElement('img')
  img.style.cssText = `
  max-width: 100%;
  margin: auto;
  flex-shrink: 0;
  `
  box.appendChild(img)
  box.appendChild(zoomBox)
  document.body.append(box)
  box.style.display = "flex"
  box.clientHeight

  _loadingBar.start()
  box.style.transition = '.2s'
  box.style.opacity = 1
  if (u2) {
    imgjz(u2, () => {
      img.src = u2
    })
  }
  imgjz(u1, () => {
    _loadingBar.end()
    img.src = u1
    zoomBox.style.display = 'block'
  }, () => {
    _err('图片加载失败~')
    close()
  })
  let imgW = 0
  let imgH = 0
  function hdScroll() {
    let top = box.scrollTop
    let left = box.scrollLeft
    let iw = img.clientWidth
    let ih = img.clientHeight

    box.scrollTop = top + (ih - imgH) / 2
    box.scrollLeft = left + (iw - imgW) / 2
  }
  function hdClick(e) {
    imgW = img.clientWidth
    imgH = img.clientHeight
    num = imgW
    if (_getTarget(e, '.icon-jiajian1')) {
      let w = window.innerWidth;
      num += 200
      img.style.width = `${num}px`
      hdScroll()
      if (num > w) {
        img.style.maxWidth = null
      }
    } else if (_getTarget(e, '.icon-jiajian')) {
      num -= 200
      num <= 50 ? num = 50 : null
      img.style.width = `${num}px`
      hdScroll()
    } else {
      close()
    }
  }
  box.addEventListener('click', hdClick)
  function close() {
    box.removeEventListener('click', hdClick)
    _loadingBar.end()
    box.style.transition = '.5s'
    box.style.opacity = 0
    _setTimeout(() => {
      box.remove()
    }, 500)
  }
}
// 上传进度
export const UpProgress = function () {
  let upProgressbox = document.createElement('div');
  upProgressbox.style.cssText = `
  position: fixed;
  top: 60px;
  right: 20px;
  transform: translateX(100%);
  width: 80%;
  max-width: 400px;
  pointer-events: none;
  transition: 0.5s;
  z-index: 99;
  `;
  document.body.appendChild(upProgressbox)

  class UpProgress {
    constructor(name) {
      this.loadnum = 0
      this.name = name
      this.create()
    }
    create() {
      this.box = document.createElement('div')
      this.box1 = document.createElement('div')
      this.box2 = document.createElement('div')
      this.box.style.cssText = `
                  position: relative;
                  background-color: rgb(255 255 255 / 83%);
                  margin-bottom: 5px;
                  border-radius: 5px;
                  border: 1px solid #1389a7;
                  overflow: hidden;`
      this.box1.style.cssText = `
                  position: relative;
                  width: 100%;
                  height: 40px;
                  line-height: 40px;
                  text-indent: 10px;
                  text-overflow: ellipsis;
                  overflow: hidden;
                  white-space: nowrap;`
      this.box2.style.cssText = `
                  position: absolute;
                  height: 100%;
                  line-height: 40px;
                  text-align: center;
                  color: #fff;
                  width: 0;
                  transition: 0.5s;
                  text-overflow: ellipsis;
                  overflow: hidden;
                  white-space: nowrap; 
                  `
      this.box1.innerText = this.name;
      this.box.appendChild(this.box2)
      this.box.appendChild(this.box1)
      upProgressbox.appendChild(this.box)
      upProgressbox.style.transform = 'none'
    }
    update(pes) {//上传进度
      this.box1.innerText = this.name;
      this.box2.style.backgroundColor = '#4595d5ba'
      this.box2.style.width = pes * 100 + '%'
    }
    loading(pes) {
      this.box1.innerText = `加载中...${parseInt(pes * 100)}%`
    }
    close(title) {
      this.box1.innerText = this.name;
      this.box2.style.width = 100 + '%'
      this.box2.style.backgroundColor = 'green'
      this.box2.style.opacity = '0.8'
      this.box2.style.zIndex = '2'
      this.box2.innerText = title || '上传成功'
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
      this.timer = setTimeout(() => {
        clearTimeout(this.timer)
        this.timer = null
        this.animate()
      }, 1000)
    }
    fail(title) {
      this.box1.innerText = this.name;
      this.box2.style.width = 100 + '%'
      this.box2.style.backgroundColor = 'red'
      this.box2.style.opacity = '0.8'
      this.box2.style.zIndex = '2'
      this.box2.innerText = title || '上传失败'
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
      this.timer = setTimeout(() => {
        clearTimeout(this.timer)
        this.timer = null
        this.animate()
      }, 4000)
    }
    animate() {
      this.loadnum += 5;
      this.box.style.transform = `translateX(${this.loadnum}%)`;
      this.box.style.opacity = 1 - this.loadnum / 100;
      if (this.loadnum >= 100) {
        if (this.animation !== null) {
          cancelAnimationFrame(this.animation);
          this.animation = null;
          this.box.remove()
          if (upProgressbox.innerHTML === '') {
            upProgressbox.style.transform = `translateX(100%)`
          }
        }
        return;
      }
      this.animation = requestAnimationFrame(this.animate.bind(this));
    }
  }
  return UpProgress
}();
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
      num++
      handleChunk()
    }
    fileReader.onerror = function () {
      reject()
    };
    handleChunk()
    function handleChunk() {
      if (num >= count) {
        let HASH = spark.end()
        resolve({
          HASH,
          chunks,
          count,
          suffix
        })
        return
      }
      callback && callback(count === 1 ? 1 : num / (count - 1))
      let chunk = file.slice(num * chunkSize, (num + 1) * chunkSize);
      chunks.push({
        file: chunk,
        filename: `_${num}`,
      });
      fileReader.readAsArrayBuffer(chunk);
    }
  })
}
// 下载文件
export function downloadFile(url, fileName) {
  let a = document.createElement('a');
  a.href = url;
  if (fileName) {
    a.download = 'hello_' + fileName;
  }
  document.body.appendChild(a);
  a.click();
  a.remove();
}
// 是否子文件夹
export function isSubfolder(from, to) {
  return from === to.slice(0, from.length)
}
// 随机数
export function randomNum(x, y) {
  return Math.round(Math.random() * (y - x) + x)
}
// 随机颜色
export function randomColor() {
  return `rgb(${randomNum(0, 256)},${randomNum(0, 256)},${randomNum(0, 256)})`
}
//鼠标点击效果
~function () {
  function handle(e) {
    let box = document.createElement("div");
    box.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      z-index: 200;
      pointer-events: none;
      `
    document.body.appendChild(box);
    let randomc = randomColor()
    box.style.left = e.clientX - 20 / 2 + "px";
    box.style.top = e.clientY - 20 / 2 + "px";
    box.style.backgroundColor = randomc;
    box.clientHeight
    box.style.transition = '.8s';
    box.style.opacity = 0;
    box.style.transform = 'scale(2)';
    // 心形状
    let box1 = document.createElement("div");
    let box2 = document.createElement("div");
    let box3 = document.createElement("div");
    box1.style.cssText = `
          position: fixed;
          width: 16px;
          height: 16px;
          z-index: 200;
          pointer-events: none;
          transform: rotate(-45deg);
          `
    box2.style.cssText = `
          position: absolute;
          top: -8px;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          `
    box3.style.cssText = `
          position: absolute;
          left: 8px;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          `
    box1.appendChild(box2);
    box1.appendChild(box3);
    document.body.appendChild(box1);
    box1.style.left = e.clientX - 16 / 2 + "px";
    box1.style.top = e.clientY - 16 / 2 + "px";
    box1.style.backgroundColor = randomc;
    box2.style.backgroundColor = randomc;
    box3.style.backgroundColor = randomc;
    box1.clientHeight
    box1.style.transition = '2s';
    box1.style.opacity = 0;
    box1.style.transform = 'rotate(-55deg) translateY(-600%) scale(1.5)';
    _setTimeout(() => {
      box.remove()
      box1.remove()
    }, 2000)
  }
  let _handle = debounce(handle, 100, true)
  document.addEventListener('mouseup', _handle);
  document.addEventListener('touchend', function (e) {
    let ev = e.changedTouches[0]
    _handle(ev)
  });
}();
// 定时器
export function _setTimeout(callback, time) {
  let timer = setTimeout(() => {
    clearTimeout(timer)
    timer = null;
    callback()
  }, time);
  return timer;
}
~function () {
  let img = document.createElement('img')
  img.src = '/img/hechang.png'
  img.style.cssText = `
  width: 100px;
  height: 100px;
  position: fixed;
  right: 0;
  bottom: 0;
  opacity: .6;
  pointer-events: none;
  z-index: 300;
  `
  document.body.appendChild(img)
}();
export function isUserName(str) {
  let reg = /^[\u2E80-\u2FDF\u3040-\u318F\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FFF\uA960-\uA97F\uAC00-\uD7FF\w -]+$/g;
  return str && reg.test(str)
}
export function isFileName(str) {
  let reg = /[\/\\\:\*\"\<\>\|\？]/g;
  return str && !reg.test(str)
}
// 文件logo类型
export function fileLogoType(obj) {
  let { type, name } = obj;
  if (type === "file") {
    if (/(\.JPG|\.PNG|\.GIF|\.JPEG)$/gi.test(name)) {
      return "icon-tupian";
    } else if (/(\.wmv|\.asf|\.asx|\.rm|\.rmvb|\.3gp|\.mov|\.mp4|\.m4v|\.avi|\.dat|\.mkv|\.flv|\.vob)$/gi.test(name)) {
      return "icon-shipin1";
    } else if (/(\.mp3|\.wma|\.wav|\.mid|\.ape|\.flac)$/gi.test(name)) {
      return "icon-yinle";
    } else if (/(\.docx|\.doc|\.dot|\.RTF|\.rtf)$/gi.test(name)) {
      return "icon-Word";
    } else if (/(\.json)$/gi.test(name)) {
      return "icon-json";
    } else if (/(\.js)$/gi.test(name)) {
      return "icon-js";
    } else if (/(\.css)$/gi.test(name)) {
      return "icon-css";
    } else if (/(\.html)$/gi.test(name)) {
      return "icon-html";
    } else if (/(\.vue)$/gi.test(name)) {
      return "icon-vue";
    } else if (/(\.db)$/gi.test(name)) {
      return "icon-database";
    } else if (/(\.xltx|\.xls|\.xlsm|\.xlsb|\.csv|\.xml)$/gi.test(name)) {
      return "icon-Excel";
    } else if (/(\.pptx|\.ppt|\.xps)$/gi.test(name)) {
      return "icon-ppt";
    } else if (/(\.rar|\.7z|\.zip|\.ar|\.bz|\.car|\.dar|\.cpgz|\.f|\.ha)$/gi.test(name)) {
      return "icon-filezip";
    } else if (/(\.md)$/gi.test(name)) {
      return 'icon-financial_markdown'
    } else if (/(\.exe)$/gi.test(name)) {
      return 'icon-exe1'
    } else if (/(\.txt)$/gi.test(name)) {
      return 'icon-TXTtubiao'
    } else if (/(\.ios)$/gi.test(name)) {
      return 'icon-ios'
    } else {
      return "icon-24gl-fileText";
    }
  } else {
    return "icon-24gl-folderOpen";
  }
}
// 一键复制
export function copyText(content) {
  content = content.trim()
  if (navigator.clipboard) {
    navigator.clipboard.writeText(content).then(_ => {
      _success('复制成功')
    }).catch(_ => {
      _err("复制失败");
    })
  } else {
    if (typeof document.execCommand !== "function") {
      _err("复制失败");
      return;
    }
    window.getSelection().removeAllRanges();
    let div = document.createElement('div'),
      range = document.createRange();
    div.innerText = content;
    div.setAttribute('style', 'position: fixed;height: 1px;fontSize: 1px;overflow: hidden;');
    document.body.appendChild(div)
    range.selectNode(div);
    window.getSelection().addRange(range);
    document.execCommand('copy');
    div.remove()
    _success('复制成功')
  }
}
export function _myOpen(url, _blank) {
  if (!_blank && !url) return window.location.href
  let a = document.createElement("a");
  a.href = url;
  _blank && (a.target = '_blank')
  document.body.appendChild(a);
  a.click();
  a.remove();
}
export function isios() {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua);
}