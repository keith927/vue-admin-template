<template>
  <div class="dashboard-editor-container">

    <panel-group @handleSetLineChartData="handleSetLineChartData" />

    <el-row v-if="lineChartData" style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" />
    </el-row>

    <el-row v-if="communityInfo" :gutter="16">
      <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 8}" :xl="{span: 8}" style="margin-bottom:30px;">
        <community-info-table :community-table-data="communityTableData" />
      </el-col>
      <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 16}" :xl="{span: 16}" style="margin-bottom:30px;">
        <bar-chart :community-chart-data="communityChartData" />
      </el-col>
    </el-row>

    <el-row v-if="communityInfo" :gutter="16">
      <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 16}" :xl="{span: 16}" style="margin-bottom:30px;">
        <scatter-chart :community-info="communityInfo" />
      </el-col>
      <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 8}" :xl="{span: 8}" style="margin-bottom:30px;">
        <div class="chart-wrapper">
          <pie-chart />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
import PieChart from './components/PieChart'
import BarChart from './components/BarChart'
import CommunityInfoTable from './components/CommunityInfoTable'
import ScatterChart from './components/ScatterChart'
import { getPowerPlantHeatNumHis } from '@/api/powerPlantInfo.js'
import { getCommunityHeatUsageHis } from '@/api/conmunityInfo.js'
import { getCommunityInfo } from '@/api/conmunityInfo'

export default {
  name: 'DashboardAdmin',
  components: {
    PanelGroup,
    LineChart,
    PieChart,
    BarChart,
    CommunityInfoTable,
    ScatterChart
  },
  data() {
    return {
      HeatNumHis: null,
      lineChartData: null,
      communityIndex: 0,
      communityInfo: null,
      communityChartData: {},
      communityTableData: []
    }
  },
  created() {
    this.fetchData()
  },
  mounted() {
    const timer = setInterval(() => {
      if (!this.communityInfo) {
        return
      }

      var communityTableData = []
      var communityIndex = this.communityIndex

      // console.log('from ' + this.communityIndex + ' to ' + ((this.communityIndex + 7) % this.communityInfo.length))

      for (var i = 0; i < 7; i++) {
        communityTableData.push(this.communityInfo[communityIndex % this.communityInfo.length])
        communityIndex += 1
      }
      this.communityTableData = communityTableData
      this.handleShowCommunityDetailInfo(this.communityTableData[0].i_BoroughID, this.communityTableData[0].c_BoroughName)
      this.communityIndex += 1
      if (this.communityIndex >= this.communityInfo.length) {
        this.communityIndex = 0
      }
    }, 5000)
    this.$once('hook:beforeDestroy', () => {
      clearInterval(timer)
    })
  },
  methods: {
    handleSetLineChartData(type) {
      this.lineChartData = this.HeatNumHis ? this.HeatNumHis[type] : null
    },
    fetchData() {
      getPowerPlantHeatNumHis().then(response => {
        var times = []
        var powerPlantHeatNum = []
        var powerPlantHeatUsage = []
        var heatExchangeHeatUsage = []
        var supplyTemp = []
        var airTemp = []

        response.data.forEach(element => {
          times.push(new Date(element.currenttime + 28800000).toJSON().substr(11, 2) + ':00')
          powerPlantHeatNum.push(parseInt(element.dcheatnum))
          powerPlantHeatUsage.push(parseInt(element.dcgrow))
          heatExchangeHeatUsage.push(parseInt(element.hrzgrow))
          supplyTemp.push(Math.round(element.dc_Supplytemp))
          airTemp.push(parseInt(element.temp))
        })

        var heatNumRange = [Math.min(...powerPlantHeatNum), Math.max(...powerPlantHeatNum)]
        var usageRange = [Math.min(...powerPlantHeatUsage, ...heatExchangeHeatUsage), Math.max(...powerPlantHeatUsage, ...heatExchangeHeatUsage)]
        var tempRange = [Math.min(...airTemp, ...supplyTemp), Math.max(...airTemp, ...supplyTemp)]

        // 范围整形
        heatNumRange[0] = Math.floor(heatNumRange[0] / 5) * 5
        heatNumRange[1] = 5 + heatNumRange[0] + Math.ceil((heatNumRange[1] - heatNumRange[0]) / 5) * 5
        usageRange[0] = Math.floor(usageRange[0] / 5) * 5
        usageRange[1] = 5 + usageRange[0] + Math.ceil((usageRange[1] - usageRange[0]) / 5) * 5
        tempRange[0] = Math.floor(tempRange[0] / 5) * 5
        tempRange[1] = 5 + tempRange[0] + Math.ceil((tempRange[1] - tempRange[0]) / 5) * 5

        this.HeatNumHis = {
          heatNum: {
            serial: [powerPlantHeatNum, supplyTemp, airTemp],
            serialName: ['电厂热量', '电厂供水温度', '气温'],
            serialAxisIndex: [0, 1, 1],

            yAxisRange: [heatNumRange, tempRange],
            xAxis: [times]
          },

          powerPlantHeatUsage: {
            serial: [powerPlantHeatUsage, supplyTemp, airTemp],
            serialName: ['电厂用量', '电厂供水温度', '气温'],
            serialAxisIndex: [0, 1, 1],

            yAxisRange: [usageRange, tempRange],
            xAxis: [times]
          },

          heatExchangeHeatUsage: {
            serial: [powerPlantHeatUsage, heatExchangeHeatUsage, airTemp],
            serialName: ['电厂用量', '换热站用量', '气温'],
            serialAxisIndex: [0, 0, 1],

            yAxisRange: [usageRange, tempRange],
            xAxis: [times]
          }
        }

        this.lineChartData = this.HeatNumHis['heatNum']
      })
      getCommunityInfo().then(response => {
        this.communityInfo = response.data
      })
    },
    handleShowCommunityDetailInfo(id, name) {
      getCommunityHeatUsageHis(id).then(response => {
        var timeBase = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
        var startTimestamp = timeBase - 7 * 86400000
        var endTimestamp = timeBase - 1

        var times = []
        var heatNum = []

        for (var i = 0; i < 7; i++) {
          times.push(new Date(startTimestamp + i * 86400000 + 28800000).toJSON().substr(0, 10))
          heatNum.push(0)
        }

        for (var j = 0; j < response.data.length; j++) {
          var item = response.data[j]
          if (item.date <= endTimestamp && item.date > startTimestamp) {
            heatNum[Math.floor((item.date - startTimestamp) / 86400000)] = parseInt(item.heatNumSum)
          }
        }

        this.communityChartData = { 'name': name, 'times': times, 'data': heatNum }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    // padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    // padding: 8px;
  }
}
</style>
