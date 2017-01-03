<template lang="pug">
div#renderer(:class="orientation")
  canvas(:height="height * pxDensity", :width="width * pxDensity")
</template>

<script>
export default {
  name: 'PixelField',
  props: {
    orientation: {
      type: String,
      required: false,
      default: 'landscape'
    },
    renderAlgorithm: {
      type: String,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    width: {
      type: Number,
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
        unitSize: 1
      }
    }
  },
  data () {
    return {
      ctx: null,
      pxDensity: 100,
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
        this[this.renderAlgorithm](x, y, rgb[0], rgb[1], rgb[2])
      }
    },
    squares (x, y, red, green, blue) {
      let c = this.ctx
      c.fillStyle = `rgb(${red}, ${green}, ${blue})`
      c.fillRect(x, y, this.pxDensity, this.pxDensity)
    },
    circles (x, y, red, green, blue) {
      let c = this.ctx
      c.beginPath()
      c.arc(
        x + (this.pxDensity / 2),
        y + (this.pxDensity / 2),
        (this.pxDensity / 2) * this.options.unitSize,
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
    this.canvas = this.$el.querySelector('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.$bus.$on('input-updated', () => {
      this.$nextTick(this.draw)
    })
  }
}
</script>
