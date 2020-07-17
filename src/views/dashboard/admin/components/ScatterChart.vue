<template>
  <div :class="className" :style="{height:height,width:width,background:'white'}" />
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
      default: '460px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    communityInfo: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    communityInfo: {
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
      this.setOptions(this.communityInfo)
    },
    setOptions(communityInfo) {
      if (!communityInfo) {
        return
      }

      var minWaterTemp = 99
      var maxWaterTemp = 0

      var scatterData = communityInfo.map(
        (item, index, arr) => {
          minWaterTemp = minWaterTemp < item.currentAvgReturnTemp ? minWaterTemp : item.currentAvgReturnTemp
          maxWaterTemp = maxWaterTemp > item.currentAvgSupplyTemp ? maxWaterTemp : item.currentAvgSupplyTemp
          return [item.currentAvgReturnTemp, item.currentAvgSupplyTemp, item.totalMeter, item.i_BoroughID, item.c_BoroughName]
        }
      )

      minWaterTemp = Math.floor(minWaterTemp / 5) * 5
      minWaterTemp = minWaterTemp < 5 ? minWaterTemp : minWaterTemp - 5
      maxWaterTemp = Math.ceil(maxWaterTemp / 5) * 5 + 5

      this.chart.setOption({
        color: ['#c23531'],

        grid: {
          top: '40',
          bottom: '10',
          left: '10',
          right: '50',
          containLabel: true
        },
        xAxis: {
          name: '回水',
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          },
          max: maxWaterTemp,
          min: minWaterTemp,
          interval: (maxWaterTemp - minWaterTemp) / 5
        },
        yAxis: {
          name: '供水',
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          },
          max: maxWaterTemp,
          min: minWaterTemp,
          interval: (maxWaterTemp - minWaterTemp) / 5
        },
        emphasis: {
          label: {
            show: true,
            formatter: function(param) {
              return param.data[3]
            },
            position: 'top'
          }
        },
        series: [{
          data: scatterData,
          type: 'scatter',
          symbolSize: function(data) {
            return Math.sqrt(data[2]) / 2
          },
          emphasis: {
            label: {
              show: true,
              formatter: function(param) {
                return param.data[4]
              },
              position: 'top'
            }
          },
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(120, 36, 50, 0.1)',
            shadowOffsetY: 5,
            color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [{
              offset: 0,
              color: 'rgb(251, 118, 123)'
            }, {
              offset: 1,
              color: 'rgb(204, 46, 72)'
            }])
          },
          animationEasing: 'cubicInOut',
          animationDuration: 2600
        }]
      })
    }
  }
}
</script>
