<template>
  <div class="longmao-container">
    <img src="/elements/big-longmao.png" alt="Big Longmao" class="big-longmao" />
    <img src="/elements/little-longmao.png" alt="Little Longmao" class="little-longmao" />
  </div>
</template>

<style scoped>
.longmao-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: visible;
}

.big-longmao {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 150px;
  height: auto;
  animation: breathe 3s ease-in-out infinite;
}

.little-longmao {
  position: absolute;
  bottom: 7px;
  width: 50px;
  height: auto;
  animation: run 6s linear infinite;
}

@keyframes breathe {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes run {
  0% {
    left: -50px;
    transform: scaleX(1);
  }
  45% {
    left: calc(100% - 50px);
    transform: scaleX(1);
  }
  50% {
    left: calc(100% - 50px);
    transform: scaleX(-1);
  }
  95% {
    left: -50px;
    transform: scaleX(-1);
  }
  100% {
    left: -50px;
    transform: scaleX(1);
  }
}
</style> 