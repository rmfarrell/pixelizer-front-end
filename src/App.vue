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
            input(type="radio" v-model="renderAlgorithm" value="triangles")
            label Triangles
        ul#secondary
          li(v-if="['circles'].includes(renderAlgorithm)")
            input(
              type="number",
              v-model="secondaryOptions.unitSize",
              @change="emitInputUpdated"
            )
          li(v-if="['triangles', 'circles', 'squares'].includes(renderAlgorithm)")
            input(
              type="number",
              v-model="secondaryOptions.funkiness",
              @change="emitInputUpdated"
            )

    #rendered-container
      canvas.rendered(v-for="r in frameCount")

    pixel-field(
      :render-algorithm="renderAlgorithm",
      :image-data="imageData",
      :options="secondaryOptions",
      :px-density="pxDensity"
    )
    div
</template>

<script>
  import { mapGetters } from 'vuex'
  import pixelField from './components/PixelField'

  export default {
    name: 'app',
    data () {
      return {
        renderAlgorithm: 'squares',
        ctx: null,
        pxDensity: 100,
        img: new window.Image(),
        imageData: [],
        frameCount: 1,
        secondaryOptions: {
          unitSize: 1,
          funkiness: 0
        }
      }
    },
    mounted () {
      // Set the ctx on the input canvas
      this.ctx = document.getElementById('input-canvas').getContext('2d')

      // listen for canvas drawn and update the rendered cavnas with a snapshot
      this.$bus.$on('canvas-drawn', (idx, context) => {
        this.copyContext(idx, context)
      })
    },
    watch: {
      renderAlgorithm () {
        this.$bus.$emit('input-updated')
      }
    },
    methods: {
      copyContext (idx, src) {
        let w = 200
        let canvas = this.findRenderedCanvas(idx)
        let newCtx = canvas.getContext('2d')
        canvas.width = w
        canvas.height = w * this.$store.ratio
        newCtx.drawImage(src, 0, 0)
      },
      findRenderedCanvas (idx) {
        return this.$el.querySelector('#rendered-container').children[idx - 1]
      },
      fileUploaded (val) {
        this.img.onload = () => {
          this.setRatio()
          this.updateInput()
        }
        this.img.src = window.URL.createObjectURL(val.target.files[0])
      },
      updateInput () {
        this.$nextTick(this.placeImage)
        this.$nextTick(this.sample)
        this.$nextTick(() => this.$bus.$emit('input-updated'))
      },
      setRatio () {
        this.$store.commit(
          'setRatio',
          this.img.naturalHeight / this.img.naturalWidth
        )
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
    computed: {
      ...mapGetters([
        'height',
        'width',
        'ratio',
        'orientation'
      ])
    },
    components: {
      pixelField
    }
  }
</script>
