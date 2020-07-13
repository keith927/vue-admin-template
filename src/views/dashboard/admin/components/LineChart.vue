<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

export default {
  mixins: [resize],
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
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
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
    chartData: {
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
      this.setOptions(this.chartData)
    },
    setOptions(chartData) {
      if (!chartData) {
        return
      }

      this.chart.setOption({
        xAxis: {
          data: chartData.xAxis[0],
          boundaryGap: false,
          axisTick: {
            show: false
          }
        },
        grid: {
          left: 10,
          right: 10,
          bottom: 20,
          top: 30,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          padding: [5, 10]
        },
        yAxis: [
          {
            axisTick: {
              show: false
            },
            min: chartData.yAxisRange[0][0],
            max: chartData.yAxisRange[0][1],
            interval: (chartData.yAxisRange[0][1] - chartData.yAxisRange[0][0]) / 5
          },
          {
            axisTick: {
              show: false
            },
            min: chartData.yAxisRange[1][0],
            max: chartData.yAxisRange[1][1],
            interval: (chartData.yAxisRange[1][1] - chartData.yAxisRange[1][0]) / 5
          }
        ],
        legend: {
          data: [chartData.serialName[0], chartData.serialName[1], chartData.serialName[2]]
        },

        series: [{
          name: chartData.serialName[0],
          itemStyle: {
            normal: {
              color: '#f4516c',
              lineStyle: {
                color: '#f4516c',
                width: 2
              },
              areaStyle: {
                color: '#f4516c'
              }
            }
          },
          smooth: true,
          type: 'line',
          yAxisIndex: chartData.serialAxisIndex[0],
          data: chartData.serial[0],
          animationDuration: 2800,
          animationEasing: 'cubicInOut'
        },
        {
          name: chartData.serialName[1],
          itemStyle: {
            normal: {
              color: '#36a3f7',
              lineStyle: {
                color: '#36a3f7',
                width: 2
              }
            }
          },
          smooth: true,
          type: 'line',
          yAxisIndex: chartData.serialAxisIndex[1],
          data: chartData.serial[1],
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        },
        {
          name: chartData.serialName[2],
          itemStyle: {
            normal: {
              color: '#34bfa3',
              lineStyle: {
                color: '#34bfa3',
                width: 2
              }
            }
          },
          smooth: true,
          type: 'line',
          yAxisIndex: chartData.serialAxisIndex[2],
          data: chartData.serial[2],
          animationDuration: 2800,
          animationEasing: 'cubicInOut'
        }]
      })
    }
  }
}
</script>
