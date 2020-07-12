<template>
  <div class="dashboard-editor-container">
    <!-- <github-corner class="github-corner" /> -->

    <panel-group @handleSetLineChartData="handleSetLineChartData" />

    <el-row v-if="lineChartData" style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" />
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
        var temp = []

        response.data.forEach(element => {
          times.push(new Date(element.currenttime + 28800000).toJSON().substr(11, 2) + ':00')
          powerPlantHeatNum.push(parseInt(element.dcheatnum))
          powerPlantHeatUsage.push(parseInt(element.dcgrow))
          heatExchangeHeatUsage.push(parseInt(element.hrzgrow))
          temp.push(element.temp)
        })

        var tempRange = [Math.min(...temp), Math.max(...temp)]
        var powerPlantHeatNumRange = [Math.min(...powerPlantHeatNum), Math.max(...powerPlantHeatNum)]
        var powerPlantHeatUsageRange = [Math.min(...powerPlantHeatUsage), Math.max(...powerPlantHeatUsage)]
        var heatExchangeHeatUsageRange = [Math.min(...heatExchangeHeatUsage), Math.max(...heatExchangeHeatUsage)]

        // 范围整形
        tempRange[0] = Math.floor(tempRange[0] / 5) * 5
        tempRange[1] = 5 + tempRange[0] + Math.ceil((tempRange[1] - tempRange[0]) / 5) * 5
        powerPlantHeatNumRange[0] = Math.floor(powerPlantHeatNumRange[0] / 5) * 5
        powerPlantHeatNumRange[1] = 5 + powerPlantHeatNumRange[0] + Math.ceil((powerPlantHeatNumRange[1] - powerPlantHeatNumRange[0]) / 5) * 5
        powerPlantHeatUsageRange[0] = Math.floor(powerPlantHeatUsageRange[0] / 5) * 5
        powerPlantHeatUsageRange[1] = 5 + powerPlantHeatUsageRange[0] + Math.ceil((powerPlantHeatUsageRange[1] - powerPlantHeatUsageRange[0]) / 5) * 5
        heatExchangeHeatUsageRange[0] = Math.floor(heatExchangeHeatUsageRange[0] / 5) * 5
        heatExchangeHeatUsageRange[1] = 5 + heatExchangeHeatUsageRange[0] + Math.ceil((heatExchangeHeatUsageRange[1] - heatExchangeHeatUsageRange[0]) / 5) * 5

        this.HeatNumHis = {
          heatNum: {
            serial: [powerPlantHeatNum, temp],
            serialRange: [powerPlantHeatNumRange, tempRange],
            serialIndex: [0, 1],
            serialName: ['电厂热量', '温度'],
            xAxis: [times]
          },

          powerPlantHeatUsage: {
            serial: [powerPlantHeatUsage, temp],
            serialRange: [powerPlantHeatUsageRange, tempRange],
            serialIndex: [0, 1],
            serialName: ['电厂用量', '温度'],
            xAxis: [times]
          },

          heatExchangeHeatUsage: {
            serial: [powerPlantHeatUsage, heatExchangeHeatUsage],
            serialRange: [powerPlantHeatUsageRange, heatExchangeHeatUsageRange],
            serialIndex: [0, 1],
            serialName: ['电厂用量', '换热站用量'],
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
