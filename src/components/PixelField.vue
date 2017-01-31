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
    funkiness: {
      type: Number,
      default: 0
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
    getFunky (modifier = 1) {
      if (this.funkiness === 0) {
        return 0
      }
      let f = Math.pow(this.funkiness, 1.5)
      let r = this.pxDensity * (f * 0.01)
      let x = Math.floor(Math.random() * r) + 1
      let p = (Math.floor(Math.random() * 2) === 0) ? 1 : -1
      return x * p * modifier
    },
    triangles (x, y, red, green, blue, iteration) {
      let c = this.ctx
      let p = this.pxDensity * (1 + (this.funkiness * 0.05))
      let m = 1
      c.globalCompositeOperation = 'overlay'
      c.fillStyle = `rgba(${red}, ${green}, ${blue}, 1)`
      c.beginPath()
      if (iteration % 2 === 0) {
        c.moveTo(x + p / 2 + this.getFunky(m), y + this.getFunky(m))
        c.lineTo(x + (p * 1.5) + this.getFunky(m), y + p + this.getFunky(m))
        c.lineTo(x - (p * 0.5) + this.getFunky(m), y + p + this.getFunky(m))
      } else {
        c.moveTo(x - (p * 0.5) + this.getFunky(m), y + this.getFunky(m))
        c.lineTo(x + (p * 1.5) + this.getFunky(m), y + this.getFunky(m))
        c.lineTo(x + p / 2 + this.getFunky(m), y + p + this.getFunky(m))
      }
      c.closePath()
      c.fill()
    },
    multiChannel (x, y, red, green, blue, iteration) {
      let c = this.ctx
      c.globalCompositeOperation = 'screen'
      let inks = {
        red: {
          color: 'rgba(225,0,0,1)',
          offset: -(this.funkiness),
          strength: red
        },
        green: {
          color: 'rgba(0,225,0,1)',
          offset: this.funkiness,
          strength: green
        },
        blue: {
          color: 'rgba(0,0,225,1)',
          offset: 0,
          strength: blue
        }
      }
      for (var k in inks) {
        c.fillStyle = inks[k].color
        c.beginPath()
        c.arc(
          x + (this.pxDensity / 2) + inks[k].offset,
          y + (this.pxDensity / 2) + inks[k].offset,
          this.pxDensity / 2 * (inks[k].strength / 255),
          0,
          2 * Math.PI, false
        )
        c.closePath()
        c.fill()
      }
    },
    squares (x, y, red, green, blue, iteration) {
      let c = this.ctx
      let m = 0.2
      let pxd = this.pxDensity * 2
      c.fillStyle = `rgb(${red}, ${green}, ${blue})`
      c.beginPath()
      c.moveTo(x + this.getFunky(m), y + this.getFunky(m))
      c.lineTo(x + pxd + this.getFunky(m), y + this.getFunky(m))
      c.lineTo(x + pxd + this.getFunky(m), y + pxd + this.getFunky(m))
      c.lineTo(x + this.getFunky(m), y + pxd + this.getFunky(m))
      c.closePath()
      c.fill()
    },
    circles (x, y, red, green, blue, iteration) {
      let c = this.ctx
      c.globalCompositeOperation = 'screen'
      c.beginPath()
      c.arc(
        x + (this.pxDensity / 2) + this.getFunky(),
        y + (this.pxDensity / 2) + this.getFunky(),
        this.pxDensity / 2 + Math.abs(this.getFunky()),
        0,
        2 * Math.PI, false
      )
      c.fillStyle = `rgb(${red}, ${green}, ${blue})`
      c.fill()
    },
    hexagons (x, y, red, green, blue, iteration) {
      let c = this.ctx
      let p = this.pxDensity
      c.fillStyle = `rgb(${red}, ${green}, ${blue})`
      c.beginPath()
      if (iteration % 2 === 0) {
        c.moveTo(x - p / 3, y + p)
        c.lineTo(x, y + p / 2)
        c.lineTo(x + p - p / 3, y + p / 2)
        c.lineTo(x + p, y + p)
        c.lineTo(x + p - p / 3, y + p + p / 2)
        c.lineTo(x, y + p + p / 2)
      } else {
        c.moveTo(x - p / 3, y + p / 2)
        c.lineTo(x, y)
        c.lineTo(x + p - p / 3, y)
        c.lineTo(x + p, y + p / 2)
        c.lineTo(x + p - p / 3, y + p)
        c.lineTo(x, y + p)
      }
      c.closePath()
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
