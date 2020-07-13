<template>
  <div class="dashboard-editor-container">
    <!-- <github-corner class="github-corner" /> -->

    <panel-group @handleSetLineChartData="handleSetLineChartData" />

    <el-row v-if="lineChartData" style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" />
    </el-row>

    <el-row :gutter="8">
      <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 12}" :xl="{span: 12}" style="padding-right:8px;margin-bottom:30px;">
        <transaction-table />
      </el-col>
      <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}" style="margin-bottom:30px;">
        <todo-list />
      </el-col>
      <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}" style="margin-bottom:30px;">
        <box-card />
      </el-col>
    </el-row>

    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <raddar-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <bar-chart />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
// import GithubCorner from '@/components/GithubCorner'
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
import RaddarChart from './components/RaddarChart'
import PieChart from './components/PieChart'
import BarChart from './components/BarChart'
import TransactionTable from './components/TransactionTable'
import TodoList from './components/TodoList'
import BoxCard from './components/BoxCard'
import { getPowerPlantHeatNumHis } from '@/api/powerPlantInfo.js'

export default {
  name: 'DashboardAdmin',
  components: {
    // GithubCorner,
    PanelGroup,
    LineChart,
    RaddarChart,
    PieChart,
    BarChart,
    TransactionTable,
    TodoList,
    BoxCard
  },
  data() {
    return {
      HeatNumHis: null,
      lineChartData: null
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    handleSetLineChartData(type) {
      this.lineChartData = this.HeatNumHis ? this.HeatNumHis[type] : null
    },
    fetchData() {
      getPowerPlantHeatNumHis().then(response => {
        console.log(response)

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
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
