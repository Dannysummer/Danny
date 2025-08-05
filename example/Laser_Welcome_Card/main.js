// 获取类名为card-wrapper的元素
const $wrap = document.querySelector(".card-wrapper");
// 获取id为card的元素
const $card = document.querySelector("#card");

// 定义一个函数cardUpdate，用于更新卡片的位置和样式
const cardUpdate = (e) => {
  // 获取鼠标或触摸点的位置
  var pos = [e.offsetX, e.offsetY];
  // 如果是触摸事件，则阻止默认行为
  if (e.pointerType === "touch") {
    e.preventDefault;
  }
  // 获取卡片的位置和尺寸
  var dimensions = $card.getBoundingClientRect();
  var l = pos[0];
  var t = pos[1];
  var h = dimensions.height;
  var w = dimensions.width;
  // 计算鼠标或触摸点在卡片中的位置百分比
  var px = clamp(Math.abs((100 / w) * l), 0, 100);
  var py = clamp(Math.abs((100 / h) * t), 0, 100);
  // 计算鼠标或触摸点相对于卡片中心的位置百分比
  var cx = px - 50;
  var cy = py - 50;

  // 设置卡片的位置和样式
  $wrap.setAttribute(
    "style",
    `
      --pointer-x: ${px}%;
      --pointer-y: ${py}%;
      --background-x: ${adjust(px, 0, 100, 35, 65)}%;
      --background-y: ${adjust(py, 0, 100, 35, 65)}%;
      --pointer-from-center: ${clamp(
        Math.sqrt((py - 50) * (py - 50) + (px - 50) * (px - 50)) / 50,
        0,
        1
      )};
      --pointer-from-top: ${py / 100};
      --pointer-from-left: ${px / 100};
      --rotate-x: ${round(-(cx / 5))}deg;
      --rotate-y: ${round(cy / 4)}deg;
    `
  );
};

// 定义一个函数ease，用于计算x的缓动值
function ease(x) {
  // 如果x小于0.5，则返回4 * x * x * x，否则返回1 - Math.pow(-2 * x + 2, 3) / 2
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// 定义一个函数，用于创建一个带有缓动效果的函数
function easedFunc(durationMs, onProgress, onComplete, onCancel) {
  // 获取当前时间
  let startTime = performance.now();
  // 定义一个变量，用于标记是否取消
  let canceled = false;

  // 定义一个循环函数
  function loop() {
    // 如果已经取消，则返回
    if (canceled) return;
    // 获取当前时间
    const currentTime = performance.now();
    // 计算进度
    const progress = (currentTime - startTime) / durationMs;
    // 计算缓动进度
    const easedProgress = ease(progress);
    // 调用进度回调函数
    onProgress(easedProgress);
    // 如果进度小于1，则继续循环
    if (progress < 1) {
      requestAnimationFrame(loop);
    } else {
      // 如果进度等于1，则调用完成回调函数
      if (onComplete) onComplete();
    }
  }

  // 调用循环函数
  loop();

  // 返回一个对象，包含取消函数
  return {
    cancel: () => {
      // 设置取消标记为true
      canceled = true;
    },
  };
}

// 定义一个函数round，用于将一个数值四舍五入到指定的小数位数
// 参数value为要四舍五入的数值，precision为要保留的小数位数，默认为3
const round = (value, precision = 3) => parseFloat(value.toFixed(precision));

// 定义一个函数clamp，用于将一个值限制在指定的最小值和最大值之间
const clamp = (value, min = 0, max = 100) => {
  // 使用Math.max函数将value和min比较，取较大的值
  // 再使用Math.min函数将上一步的结果和max比较，取较小的值
  return Math.min(Math.max(value, min), max);
};

// 定义一个函数adjust，用于将一个值从一个范围映射到另一个范围
const adjust = (value, fromMin, fromMax, toMin, toMax) => {
  // 返回一个四舍五入后的值，该值是将value从fromMin到fromMax的范围映射到toMin到toMax的范围
  return round(
    toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin)
  );
};

// 获取包裹元素的宽度的一半
const halfW = $wrap.clientWidth / 2;
// 获取包裹元素的高度的一半
const halfH = $wrap.clientHeight / 2;
// 声明一个变量easer
let easer;

$card.addEventListener("pointerenter", () => {
  // 当鼠标进入卡片时，取消之前的动画
  if (easer) {
    easer?.cancel?.();
  }
});
$card.addEventListener("pointermove", cardUpdate);
$card.addEventListener("pointerout", (e) => {
  // 当鼠标离开卡片时，开始动画
  easer = easedFunc(
    1000,
    (p) => {
      // 计算鼠标离开时的位置
      let x = adjust(p, 0, 1, e.offsetX, halfW);
      let y = adjust(p, 0, 1, e.offsetY, halfH);
      cardUpdate({ offsetX: x, offsetY: y });
    },
    () => {
      // 动画结束后，移除active类
      $card.classList.remove("active");
      $wrap.classList.remove("active");
    }
  );
});

// 更新卡片的位置
cardUpdate({ offsetX: $wrap.clientWidth - 70, offsetY: 60 });

// 设置定时器，1秒后执行
setTimeout(() => {
  // 定义缓动函数
  easer = easedFunc(
    3000,
    (p) => {
      // 根据缓动函数的参数p，计算卡片的位置
      let x = adjust(p, 0, 1, $wrap.clientWidth - 70, halfW);
      let y = adjust(p, 0, 1, 60, halfH);
      // 更新卡片的位置
      cardUpdate({ offsetX: x, offsetY: y });
    },
    () => {
      // 动画结束后，移除active类
      $card.classList.remove("active");
      $wrap.classList.remove("active");
    }
  );
}, 1000);
