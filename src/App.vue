<template lang="pug">
  #app
    #overlay
      p {{currentFrame}} / {{frameCount}}
      canvas#input-canvas(:width="width", :height="height", style="display:none")
      input(type="file" accept="image/*" @change="fileUploaded($event)")
      form#controls
        div
          label Width:
          input(type="number", v-model="width", @change="updateWidth($event)")
          p Height: {{height}}
          p {{orientation}}

      form#algorithm-selector
        p: a(@click="addFrame()") +++++++New Frame+++++++
        p: a(@click="nextFrame()")  ->-->-->Next Frame-->-->-->
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

    #thumbnails
      render(v-for="r in frameCount", :index="r")

    #stage
      render(v-for="r in frameCount", :index="r", v-show="r === currentFrame")

    pixel-field(
      :render-algorithm="renderAlgorithm",
      :image-data="imageData",
      :options="secondaryOptions"
    )
    div
</template>

<script>
  import { mapGetters } from 'vuex'
  import pixelField from './components/PixelField'
  import render from './components/render.vue'

  export default {
    name: 'app',
    data () {
      return {
        renderAlgorithm: 'squares',
        ctx: null,
        img: new window.Image(),
        imageData: [],
        secondaryOptions: {
          unitSize: 1,
          funkiness: 0
        }
      }
    },
    mounted () {
      // Set the ctx on the input canvas
      this.ctx = document.getElementById('input-canvas').getContext('2d')
    },
    watch: {
      renderAlgorithm () {
        this.$bus.$emit('input-updated')
      }
    },
    methods: {
      updateWidth (val) {
        this.$store.commit('setWidth', val.target.value)
        this.updateInput()
        // this.emitInputUpdated()
      },
      goToFrame (frame) {
        console.log('gotoframe')
        this.$store.commit('goToFrame', frame)
      },
      addFrame () {
        this.$store.commit('addFrame')
      },
      nextFrame () {
        this.$store.commit('goToFrame', this.currentFrame + 1)
      },
      fileUploaded (val) {
        this.img.onload = () => {
          this.setDimensions()
          this.updateInput()
        }
        this.img.src = window.URL.createObjectURL(val.target.files[0])
      },
      updateInput () {
        this.$nextTick(this.placeImage)
        this.$nextTick(this.sample)
        this.$nextTick(() => this.$bus.$emit('input-updated'))
      },
      setDimensions () {
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
        'orientation',
        'frameCount',
        'currentFrame'
      ])
    },
    components: {
      pixelField,
      render
    }
  }
</script>
