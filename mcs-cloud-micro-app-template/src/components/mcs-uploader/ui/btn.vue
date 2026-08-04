<template>
  <div  ref="btn" v-show="support" style="display: inline-block;vertical-align: top;">
    <slot></slot>
  </div>
</template>

<script>
  import { inject, nextTick, ref, onMounted } from 'vue'

  const COMPONENT_NAME = 'uploader-btn'

  export default {
    name: COMPONENT_NAME,
    props: {
      directory: {
        type: Boolean,
        default: false
      },
      single: {
        type: Boolean,
        default: false
      },
      attrs: {
        type: Object,
        default () {
          return {}
        }
      }
    },
    setup (props) {
      const btn = ref(null)
      const uploader = inject('uploader').uploader
      const support = uploader.support
      onMounted(() => {
        nextTick(() => {
          uploader.assignBrowse(btn.value, props.directory, props.single, props.attrs)
        })
      })
      return {
        btn,
        support
      }
    }
  }
</script>

<style>

</style>
