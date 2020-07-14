<template>
  <div :class="className" :style="{height:height,width:width,background:'white'}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
// import resize from './mixins/resize'

const animationDuration = 6000

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
      default: '447px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    communityChartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    communityChartData: {
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
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.communityChartData)
    },
    setOptions(communityChartData) {
      if (!communityChartData || typeof communityChartData.name === 'undefined') {
        return
      }

      this.chart.setOption({
        title: {
          text: communityChartData.name.trim() + '近7日用量',
          left: 'center',
          textStyle: {
            color: '#000',
            fontSize: 15
          },
          top: 20
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        grid: {
          top: '60',
          left: '20',
          right: '40',
          bottom: '20',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          data: communityChartData.times,
          axisTick: {
            alignWithLabel: true
          }
        }],
        yAxis: [{
          type: 'value',
          axisTick: {
            show: false
          }
        }],
        series: [{
          name: 'pageA',
          type: 'bar',
          stack: 'vistors',
          barWidth: '60%',
          data: communityChartData.data,
          animationDuration
        }]
      })
    }
  }
}
</script>
