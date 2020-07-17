<template>
  <el-table
    :data="communityTableData"
    style="width: 100%;"
    :height="447"
  >
    <el-table-column label="小区" min-width="100" show-overflow-tooltip>
      <template slot-scope="scope">
        {{ scope.row.c_BoroughName | nameFilter }}
      </template>
    </el-table-column>
    <el-table-column label="户数" min-width="60" align="center">
      <template slot-scope="scope">
        {{ scope.row.totalMeter | numFilter }}
      </template>
    </el-table-column>
    <el-table-column label="昨日用量" min-width="75" align="center">
      <template slot-scope="scope">
        {{ scope.row.heatNumSum | numFilter }}
      </template>
    </el-table-column>
    <el-table-column label="户均用量" min-width="75" align="center">
      <template slot-scope="scope">
        <el-tag :type="(scope.row.heatNumSum / scope.row.totalMeter) | statusFilter">
          {{ parseInt(scope.row.heatNumSum / scope.row.totalMeter) }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
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
      default: '316px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    communityTableData: {
      type: Array,
      required: true
    }
  }
}
</script>
