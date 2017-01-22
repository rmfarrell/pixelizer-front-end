<template lang="pug">
.render-container(
  :class="[orientation, isActive]",
  @click="goToFrame(index)"
)
  canvas.render(
    :width="renderWidth",
    :height="renderHeight"
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
        this.copyContext(src)
      }
    })
  },
  data () {
    return {}
  },
  methods: {
    isCurrent () {
      return this.currentFrame === this.index
    },
    goToFrame (frame) {
      this.$store.commit('goToFrame', frame)
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
