<template>
  <el-table
    :data="list"
    style="width: 100%;padding-top: 15px;"
    :max-height="460"
  >
    <el-table-column label="小区" min-width="100">
      <template slot-scope="scope">
        {{ scope.row.C_BoroughName | nameFilter }}
      </template>
    </el-table-column>
    <el-table-column label="户数" min-width="60" align="center">
      <template slot-scope="scope">
        {{ scope.row.totalMeter | numFilter }}
      </template>
    </el-table-column>
    <el-table-column label="昨日用量" min-width="80" align="center">
      <template slot-scope="scope">
        {{ scope.row.heatNumSum | numFilter }}
      </template>
    </el-table-column>
    <el-table-column label="昨日户均用量" min-width="80" align="center">
      <template slot-scope="scope">
        <el-tag :type="(scope.row.heatNumSum / scope.row.totalMeter) | statusFilter">
          {{ parseInt(scope.row.heatNumSum / scope.row.totalMeter) }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="供水温度" min-width="60" align="center">
      <template slot-scope="scope">
        {{ scope.row.avgSupplyTemp | numFilter }}
      </template>
    </el-table-column>
    <el-table-column label="回水温度" min-width="60" align="center">
      <template slot-scope="scope">
        {{ scope.row.avgReturnTemp | numFilter }}
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { getCommunityInfo } from '@/api/conmunityInfo'

export default {
  filters: {
    statusFilter(status) {
      var usage = parseInt(status)
      if (usage <= 0) {
        return 'danger'
      } else if (usage < 100) {
        return 'warning'
      } else if (usage < 500) {
        return 'success'
      } else {
        return 'info'
      }
    },
    nameFilter(str) {
      return str.trim()
    },
    numFilter(str) {
      return parseInt(str)
    }
  },
  data() {
    return {
      list: null
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      getCommunityInfo().then(response => {
        this.list = response.data
        console.log(response)
      })
    }
  }
}
</script>
