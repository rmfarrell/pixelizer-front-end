<template lang="pug">
  #app
    #overlay
      canvas#input-canvas(:width="width", :height="height", style="display:none")
      input(type="file" accept="image/*" @change="fileUploaded($event)")
      form#controls
        div
          label Width:
          input(type="number", v-model="width" @change="updateInput()")
          p Height: {{height}}
          p {{orientation}}

      form#algorithm-selector
        ul#primary
          li
            input(type="radio" v-model="renderAlgorithm" value="squares")
            label Squares
          li
            input(type="radio" v-model="renderAlgorithm" value="circles")
            label Circles
          li
            input(type="radio" v-model="renderAlgorithm" value="triangle")
            label Triangles
        ul#secondary
          li(v-if="renderAlgorithm === 'circles'")
            input(
              type="number",
              v-model="secondaryOptions.unitSize",
              @change="emitInputUpdated"
            )

    pixel-field(
      :render-algorithm="renderAlgorithm",
      :height="height",
      :width="width",
      :image-data="imageData",
      :options="secondaryOptions",
      :orientation="orientation"
    )
</template>

<script>
  import pixelField from './components/PixelField'

  export default {
    name: 'app',
    data () {
      return {
        orientation: 'landscape',
        renderAlgorithm: 'circles',
        ctx: null,
        width: 50,
        height: 0,
        ratio: 0,
        img: new window.Image(),
        imageData: [],
        secondaryOptions: {
          unitSize: 1
        }
      }
    },
    mounted () {
      this.ctx = document.getElementById('input-canvas').getContext('2d')
    },
    watch: {
      renderAlgorithm () {
        this.$bus.$emit('input-updated')
      }
    },
    methods: {
      fileUploaded (val) {
        this.img.onload = () => {
          this.setRatio()
          this.setOrientation()
          this.updateInput()
        }
        this.img.src = window.URL.createObjectURL(val.target.files[0])
      },
      updateInput () {
        this.setResolution()
        this.$nextTick(this.placeImage)
        this.$nextTick(this.sample)
        this.$nextTick(() => this.$bus.$emit('input-updated'))
      },
      setRatio () {
        this.ratio = this.img.naturalHeight / this.img.naturalWidth
      },
      setOrientation () {
        this.orientation = (this.ratio > 1) ? 'portrait' : 'landscape'
      },
      setResolution () {
        this.height = Math.round(this.width * this.ratio)
      },
      placeImage () {
        this.ctx.drawImage(this.img, 0, 0, this.width, this.height)
      },
      emitInputUpdated () {
        this.$bus.$emit('input-updated')
      },
      sample () {
        if (this.width === 0 || this.height === 0) {
          return
        }
        let imageData = this.ctx.getImageData(0, 0, this.width, this.height)
        let dat = imageData.data
        let out = []
        let counter = 0
        for (let x = 0; x < dat.length; x = x + 4) {
          out[counter] = [dat[x], dat[x + 1], dat[x + 2]]
          counter++
        }
        this.imageData = out
      }
    },
    components: {
      pixelField
    }
  }
</script>
