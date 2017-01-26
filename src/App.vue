<template lang="pug">
  #app
    #thumbnails(
      v-show="isImage",
      :class="isForceThumbnails ? 'force-open' : '' "
      @mouseleave="isForceThumbnails = false"
    )
      render(v-for="r in frameCount", :index="r")
      a.new-frame.big-button(v-if="isNextButton", @click="createFrame()")
        .label
          strong &plus;
          small Add Frame
          small {{frameCount + 1}}/{{maxFrames}}

    label.upload-button.big-button(v-if="!isImage")
      strong &blk14;
      small Select image
      input(
        type="file",
        accept="image/*",
        @change="fileUploaded($event)"
      )
    #overlay
      slider(v-model="width", :lazy="true", setValue="setWidth", ref="widthSlider")
      p {{currentFrame}} / {{frameCount}}
      canvas#input-canvas(:width="width", :height="height", style="display:none")
      form#controls
        div
          label Width:
          input(type="number", v-model="width", @change="updateWidth($event)")
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

    #stage(v-show="isImage")
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
  import slider from './components/Slider.vue'

  export default {
    name: 'app',
    data () {
      return {
        renderAlgorithm: 'squares',
        ctx: null,
        img: new window.Image(),
        imageData: [],
        width: this.$store.getters.width,
        isImage: false,
        maxFrames: window.Globals.maxFrames,
        secondaryOptions: {
          unitSize: 1,
          funkiness: 0
        },
        isForceThumbnails: true
      }
    },
    mounted () {
      // Set the ctx on the input canvas
      this.ctx = document.getElementById('input-canvas').getContext('2d')
    },
    watch: {
      renderAlgorithm () {
        this.$bus.$emit('input-updated')
      },
      width () {
        this.$store.commit('setWidth', this.width)
        this.$nextTick(this.updateInput)
      }
    },
    methods: {
      setWidth () {
        console.log('called')
      },
      createFrame () {
        this.$store.commit('addFrame')
        this.goToFrame(this.frameCount)
        this.updateInput()
      },
      updateWidth (val) {
        this.$store.commit('setWidth', val.target.value)
        this.updateInput()
      },
      goToFrame (frame) {
        this.$store.commit('goToFrame', frame)
      },
      fileUploaded (val) {
        this.img.onload = () => {
          this.setDimensions()
          this.updateInput()
        }
        this.img.src = window.URL.createObjectURL(val.target.files[0])
        this.isImage = true
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
        'ratio',
        'orientation',
        'frameCount',
        'currentFrame'
      ]),
      isNextButton () {
        return (this.frameCount < this.maxFrames &&
          (this.frameCount > 0 && this.isImage))
      }
    },
    components: {
      pixelField,
      render,
      slider
    }
  }
</script>
