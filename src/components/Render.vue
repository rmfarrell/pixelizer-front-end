<template lang="pug">
.render-container(
  :class="[orientation, isActive]",
  @click="goToFrame(index)"
)
  canvas.render(
    :width="width",
    :height="height"
  )
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'PixelField',
  props: {
    index: {
      type: Number,
      required: true
    }
  },
  mounted () {
    this.$bus.$on('canvas-drawn', (src) => {
      if (this.isCurrent()) {
        this.setDimensions()
        this.$nextTick(() => {
          this.copyContext(src)
        })
      }
    })
  },
  data () {
    return {
      height: 0,
      width: 0
    }
  },
  methods: {
    isCurrent () {
      return this.currentFrame === this.index
    },
    goToFrame (frame) {
      this.$store.commit('goToFrame', frame)
    },
    setDimensions () {
      this.height = this.renderHeight
      this.width = this.renderWidth
    },
    copyContext (src) {
      let canvas = this.$el.querySelector('canvas')
      let ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(src, 0, 0)
    }
  },
  computed: {
    ...mapGetters([
      'renderHeight',
      'renderWidth',
      'orientation',
      'currentFrame'
    ]),
    isActive () {
      return (this.currentFrame === this.index) ? 'active' : ''
    }
  }
}
</script>
