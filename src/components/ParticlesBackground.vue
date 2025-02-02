<template>
  <div id="tsparticles" class="particles-container" style="pointer-events: none;">
    <div class="particles-wrapper" style="pointer-events: none;"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { tsParticles } from "tsparticles-engine"
import { loadSlim } from "tsparticles-slim"

onMounted(async () => {
  await loadSlim(tsParticles)
  
  await tsParticles.load("tsparticles", {
    fullScreen: {
      enable: false,
      zIndex: -1
    },
    particles: {
      number: {
        value: 30,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: {
        value: ["#87CEEB", "#ffffff"]
      },
      opacity: {
        value: 0.3,
        random: false
      },
      size: {
        value: 2,
        random: true
      },
      links: {
        enable: true,
        distance: 150,
        color: "#87CEEB",
        opacity: 0.4,
        width: 1
      },
      move: {
        enable: true,
        speed: 1.5,
        direction: "none",
        random: false,
        straight: false,
        outModes: {
          default: "bounce"
        }
      }
    },
    interactivity: {
      detectsOn: "window",
      events: {
        onHover: {
          enable: true,
          mode: "grab"
        }
      },
      modes: {
        grab: {
          distance: 140,
          links: {
            opacity: 1
          }
        }
      }
    },
    detectRetina: true
  })
})
</script>

<style scoped>
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
}

.particles-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

#tsparticles canvas {
  pointer-events: none !important;
}
</style> 