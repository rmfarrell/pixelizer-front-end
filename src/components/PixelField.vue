<template lang="pug">
div
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'PixelField',
  props: {
    renderAlgorithm: {
      type: String,
      required: true
    },
    imageData: {
      type: Array,
      required: true
    },
    options: {
      type: Object,
      required: true,
      default: {
        unitSize: 1,
        funkiness: 0
      }
    }
  },
  data () {
    return {
      ctx: null,
      canvas: null
    }
  },
  methods: {
    draw () {
      this.reset()
      let x = 0
      let y = 0
      let row = 0
      let rgb = []
      for (var i = 0; i < this.imageData.length; i++) {
        if (i % this.width === 0) {
          row++
        }
        x = i % this.width * this.pxDensity
        y = (row - 1) * this.pxDensity
        rgb = this.imageData[i]
        this[this.renderAlgorithm](x, y, rgb[0], rgb[1], rgb[2], i)
      }
    },
    getFunky () {
      if (this.options.funkiness === 0) {
        return 0
      }
      let r = this.pxDensity * (this.options.funkiness * 0.01)
      let x = Math.floor(Math.random() * r) + 1
      let p = (Math.floor(Math.random() * 2) === 0) ? 1 : -1
      return x * p
    },
    triangles (x, y, red, green, blue, iteration) {
      let c = this.ctx
      let p = this.pxDensity
      c.fillStyle = `rgb(${red}, ${green}, ${blue})`
      c.beginPath()
      if (iteration % 2 === 0) {
        c.moveTo(x + p / 2 + this.getFunky(), y + this.getFunky())
        c.lineTo(x + (p * 1.5) + this.getFunky(), y + p + this.getFunky())
        c.lineTo(x - (p * 0.5) + this.getFunky(), y + p + this.getFunky())
        c.closePath()
      } else {
        c.moveTo(x - (p * 0.5) + this.getFunky(), y + this.getFunky())
        c.lineTo(x + (p * 1.5) + this.getFunky(), y + this.getFunky())
        c.lineTo(x + p / 2 + this.getFunky(), y + p + this.getFunky())
        c.closePath()
      }
      c.fill()
    },
    squares (x, y, red, green, blue, iteration) {
      let c = this.ctx
      c.fillStyle = `rgb(${red}, ${green}, ${blue})`
      c.fillRect(
        x + this.getFunky(),
        y + this.getFunky(),
        this.pxDensity + this.getFunky(),
        this.pxDensity + this.getFunky()
      )
    },
    circles (x, y, red, green, blue, iteration) {
      let c = this.ctx
      c.beginPath()
      c.arc(
        x + (this.pxDensity / 2) + this.getFunky(),
        y + (this.pxDensity / 2) + this.getFunky(),
        this.pxDensity / 2 + Math.abs(this.getFunky()) * this.options.unitSize,
        0,
        2 * Math.PI, false
      )
      c.fillStyle = `rgb(${red}, ${green}, ${blue})`
      c.fill()
    },
    reset () {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
  },
  mounted () {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.$bus.$on('input-updated', () => {
      this.canvas.height = this.renderHeight
      this.canvas.width = this.renderWidth
      this.$nextTick(this.draw)
      this.$nextTick(() => {
        this.$bus.$emit('canvas-drawn', this.canvas)
      })
    })
  },
  computed: {
    ...mapGetters([
      'height',
      'width',
      'renderHeight',
      'renderWidth',
      'pxDensity'
    ])
  }
}
</script>
