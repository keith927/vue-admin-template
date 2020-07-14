<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
// import resize from './mixins/resize'
import { getGatewayInfo } from '@/api/gatewayInfo'

export default {
  // mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '460px'
    }
  },
  data() {
    return {
      chart: null,
      charData: null
    }
  },
  watch: {
    charData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  created() {
    this.fetchData()
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.charData)
    },

    setOptions(charData) {
      if (!charData) {
        return
      }
      console.log(this.charData)

      this.chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          left: 'center',
          bottom: '10',
          data: ['在线网关', '离线网关']
        },
        series: [
          {
            name: '网关概况',
            type: 'pie',
            roseType: 'radius',
            radius: [15, 95],
            center: ['50%', '38%'],
            data: [
              { value: this.charData[0], name: '在线网关' },
              { value: this.charData[1], name: '离线网关' }
            ],
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      })
    },

    fetchData() {
      getGatewayInfo().then(response => {
        var onlineNum = 0
        var offlineNum = 0
        response.data.list.map(
          (item, index, arr) => {
            if (item.online) {
              onlineNum++
            } else {
              offlineNum++
            }
          })
        this.charData = [onlineNum, offlineNum]
      })
    }
  }
}
</script>
