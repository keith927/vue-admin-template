<template>
  <div class="app-container">
    <div class="filter-container">
      <el-row style="margin-bottom:15px;">
        <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 19}" :lg="{span: 19}" :xl="{span: 19}">
          <el-autocomplete
            ref="input"
            v-model="listQuery.inputName"
            :fetch-suggestions="nameSuggestions"
            :select-when-unmatched="true"
            class="filter-item"
            clearable
            placeholder="请输入小区名"
            style="margin-right:30px;"
            @select="handleInputName"
            @clear="handleClearName"
          />

          <div class="filter-item" style="margin-right:30px;">
            <div style="display:flex;flex:1;font-size:14px;color:#606266;">
              <span style="margin-right:15px;line-height:40px">7日抄通率:</span>
              <el-slider
                v-model="listQuery.meterRateRange"
                style="width:160px"
                range
              />
            </div>
          </div>

          <el-switch
            v-model="showMissedMeterNum"
            class="filter-item"
            style="margin-right:30px;"
            inactive-color="#13ce66"
            active-color="#ff4949"
            inactive-text="抄通"
            active-text="未抄通"
            @change="tableKey=tableKey+1"
          />

          <el-checkbox v-model="showPrecent" class="filter-item" style="margin-right:30px;" @change="tableKey=tableKey+1">
            显示百分比
          </el-checkbox>

          <el-checkbox v-model="showMeterRateHis" class="filter-item" style="margin-right:30px;" @change="tableKey=tableKey+1">
            显示每日抄通率
          </el-checkbox>

          <el-checkbox v-model="showDescription" class="filter-item" style="margin-right:30px;" @change="tableKey=tableKey+1">
            显示备注
          </el-checkbox>
        </el-col>

        <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 5}" :lg="{span: 5}" :xl="{span: 5}" align="right">
          <el-button v-waves type="warning" icon="el-icon-refresh" @click="handleReset">重置</el-button>
          <el-button v-waves :loading="downloadLoading" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button>
        </el-col>

      </el-row>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      :default-sort="{prop: listQuery.sort, order: listQuery.order}"
      show-summary
      :summary-method="getSummaries"
      @sort-change="sortChange"
    >
      <el-table-column label="序号" min-width="80px" prop="boroughId" sortable="custom" align="center">
        <template slot-scope="{row}">
          <span>{{ row.boroughId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="小区" min-width="120px" align="center" show-overflow-tooltip>
        <template slot-scope="{row}">
          <span class="link-type" @click="handleShowCommunityDetails(row)">{{ row.boroughName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="户数" min-width="80px" prop="totalMeter" sortable="custom" align="center">
        <template slot-scope="{row}">
          <span>{{ row.totalMeter }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="!showMeterRateHis" label="昨日户均用量" min-width="120px" prop="avgUsage" sortable="custom" align="center">
        <template slot-scope="{row}">
          <span>{{ row.avgUsage | heatNumFilter }} </span>
        </template>
      </el-table-column>
      <el-table-column v-if="!showMeterRateHis" label="当前供水温度" min-width="120px" prop="currentAvgSupplyTemp" sortable="custom" align="center">
        <template slot-scope="{row}">
          <span>{{ row.currentAvgSupplyTemp | tempFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="!showMeterRateHis" label="当前回水温度" min-width="120px" prop="currentAvgReturnTemp" sortable="custom" align="center">
        <template slot-scope="{row}">
          <span>{{ row.currentAvgReturnTemp | tempFilter }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'近7日' + lableSuffix" min-width="100px" prop="meterRate" sortable="custom" align="center">
        <template slot-scope="{row}">
          <span v-if="!showPrecent">{{ showMissedMeterNum ? row.totalMeter - row.sevenThrough : row.sevenThrough }}</span>
          <el-progress
            v-else
            :text-inside="true"
            :stroke-width="16"
            :percentage="showMissedMeterNum ? (1 - row.sevenThroughRate) : row.sevenThroughRate | rateFilter "
            :status=" row.sevenThroughRate | rateStatusFilter "
          />
        </template>
      </el-table-column>

      <template v-if="showMeterRateHis">
        <el-table-column v-for="(item, dindex) in dateArray" :key="dindex" :label="item.substr(5,5) + lableSuffix" min-width="100px" align="center">
          <template slot-scope="{row}">
            <span v-if="!showPrecent">{{ showMissedMeterNum ? row.totalMeter - row.throughHis[dindex] : row.throughHis[dindex] }}</span>
            <el-progress
              v-else
              :text-inside="true"
              :stroke-width="20"
              :percentage="showMissedMeterNum ? (1 - row.throughRateHis[dindex]) : row.throughRateHis[dindex] | rateFilter "
              :status=" row.throughRateHis[dindex] | rateStatusFilter "
            />
          </template>
        </el-table-column>
      </template>

      <el-table-column v-if="showDescription" label="备注" min-width="120px" align="center" show-overflow-tooltip>
        <template slot-scope="{row}">
          <span>{{ row.remark | remarkFilter }}</span>
        </template>
      </el-table-column>

    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      :page-sizes="[15, 50, 100, 300]"
    />

  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { getCommunityDetailInfo } from '@/api/conmunityInfo'

const startTimestamp = new Date(new Date().setHours(0, 0, 0, 0)).getTime() - 7 * 86400000

export default {
  name: 'CommunityInfo',
  components: { Pagination },
  directives: { waves },
  filters: {
    heatNumFilter(val) {
      return val === 0 ? '-' : val
    },
    tempFilter(val) {
      return window.isNaN(val) ? '-' : val + '℃'
    },
    rateFilter(val) {
      return Math.round(val * 10000) / 100
    },
    rateStatusFilter(rate) {
      rate = Math.round(rate * 10000) / 100
      if (rate <= 80) {
        return 'exception'
      } else if (rate <= 90) {
        return 'warning'
      } else if (rate === 100) {
        return 'success'
      }
    },
    remarkFilter(str) {
      return typeof str === 'string' ? str.trim() : '-'
    }
  },
  data() {
    return {
      tableKey: 0,
      communities: null,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 15,
        sort: 'boroughId',
        order: 'ascending',
        inputName: '',
        meterRateRange: [0, 100]
      },
      downloadLoading: false,
      matchingName: [],
      dateArray: [], // 近7日日期数组
      showMeterRateHis: false,
      showMissedMeterNum: false,
      showPrecent: true,
      showDescription: false,
      lableSuffix: '抄通',
      communitySummary: null
    }
  },
  watch: {
    showMissedMeterNum: {
      handler(val) {
        this.lableSuffix = val ? '未抄通' : '抄通'
      }
    },
    listQuery: {
      deep: true,
      handler(val) {
        this.handleFilter()
      }
    }
  },
  created() {
    this.dateArray = [0, 1, 2, 3, 4, 5, 6].map(v => {
      return new Date(startTimestamp + v * 86400000 + 28800000).toJSON().substr(0, 10)
    })
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      var communitySummary = { totalMeter: 0, through: 0, throughHis: [0, 0, 0, 0, 0, 0, 0] }

      getCommunityDetailInfo().then(response => {
        this.communities = response.data.map(v => {
          v.boroughName = v.boroughName.trim()
          v.throughHis = [0, 1, 2, 3, 4, 5, 6].map(d => {
            communitySummary.throughHis[d] += v[this.dateArray[d]].through
            return v[this.dateArray[d]].through
          })
          v.throughRateHis = [0, 1, 2, 3, 4, 5, 6].map(d => {
            return v[this.dateArray[d]].throughRate
          })
          v.avgUsage = typeof v.heatNumSum === 'undefined' ? 0 : Math.round(v.heatNumSum / v.totalMeter)
          v.currentAvgSupplyTemp = parseInt(v.currentAvgSupplyTemp)
          v.currentAvgReturnTemp = parseInt(v.currentAvgReturnTemp)

          communitySummary.totalMeter += v.totalMeter
          communitySummary.through += v.sevenThrough

          return v
        })

        // 更新合计信息
        communitySummary.throughRateHis = communitySummary.throughHis.map(v => {
          return Math.round(v * 10000 / communitySummary.totalMeter) / 100
        })
        communitySummary.throughRate = Math.round(communitySummary.through * 10000 / communitySummary.totalMeter) / 100
        this.communitySummary = communitySummary

        // 默认排序与筛选
        this.communities.sort(this.compare(this.listQuery.sort, this.listQuery.order, this.showPrecent, this.showMissedMeterNum))
        this.handleFilter()

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.1 * 1000)
      }).catch(error => {
        this.$message(error)
        this.listLoading = false
      })
    },
    compare(property, order, showPrecent, showMissedMeterNum) {
      return function(a, b) {
        var value1
        var value2
        if (property !== 'meterRate') {
          value1 = window.isNaN(a[property]) ? 0 : a[property]
          value2 = window.isNaN(b[property]) ? 0 : b[property]
        } else {
          value1 = showPrecent ? (showMissedMeterNum ? 1 - a['sevenThroughRate'] : a['sevenThroughRate'])
            : (showMissedMeterNum ? a['totalMeter'] - a['sevenThrough'] : a['sevenThrough'])
          value2 = showPrecent ? (showMissedMeterNum ? 1 - b['sevenThroughRate'] : b['sevenThroughRate'])
            : (showMissedMeterNum ? b['totalMeter'] - b['sevenThrough'] : b['sevenThrough'])
        }
        return order === 'ascending' ? value1 - value2 : value2 - value1
      }
    },
    handleFilter() {
      if (!this.communities) {
        return
      }

      // this.listQuery.page = 1
      var matchedList = []

      // 过滤小区名
      if (this.listQuery.id) {
        for (var i = 0; i < this.communities.length; i++) {
          if (this.communities[i].boroughId === this.listQuery.id) {
            matchedList.push(this.communities[i])
          }
        }
      } else {
        [...matchedList] = this.communities // 深拷贝
      }

      // 按抄通率过滤
      const range = [this.listQuery.meterRateRange[0] / 100, this.listQuery.meterRateRange[1] / 100]
      for (let i = 0; i < matchedList.length; i++) {
        if (matchedList[i].sevenThroughRate < range[0] || matchedList[i].sevenThroughRate > range[1]) {
          matchedList.splice(i--, 1)
        }
      }

      // 排序
      if (this.listQuery.order) {
        matchedList.sort(this.compare(this.listQuery.sort, this.listQuery.order, this.showPrecent, this.showMissedMeterNum))
      }

      // 分页
      var pageOffset = (this.listQuery.page - 1) * this.listQuery.limit
      this.list = matchedList.slice(pageOffset, pageOffset + this.listQuery.limit)
      this.total = matchedList.length
    },
    sortChange(data) {
      const { prop, order } = data
      this.listQuery.sort = prop
      this.listQuery.order = order
    },
    handleReset() {
      this.listQuery = {
        page: 1,
        limit: 15,
        sort: 'boroughId',
        order: 'ascending',
        inputName: '',
        meterRateRange: [0, 100]
      }
      this.showMeterRateHis = false
      this.showMissedMeterNum = false
      this.showPrecent = true
      this.showDescription = false
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['小区ID', '小区名', '户数', '7日抄通数', '7日抄通率']
        const startTimestamp = new Date(new Date().setHours(0, 0, 0, 0)).getTime() - 7 * 86400000
        for (var i = 0; i < 7; i++) {
          var date = new Date(startTimestamp + i * 86400000 + 28800000).toJSON().substr(0, 10)
          tHeader.push(date + '抄通数')
          tHeader.push(date + '抄通率')
        }
        const data = this.formatJson()
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '小区抄通率统计 ' + new Date(startTimestamp + 6 * 86400000 + 28800000).toJSON().substr(0, 10)
        })
        this.downloadLoading = false
      })
    },
    formatJson() {
      return this.communities.map(v => {
        return [v.boroughId,
          v.boroughName,
          v.totalMeter,
          v.sevenThrough,
          v.sevenThroughRate,
          v.throughHis[0], v.throughRateHis[0], v.throughHis[1], v.throughRateHis[1],
          v.throughHis[2], v.throughRateHis[2], v.throughHis[3], v.throughRateHis[3],
          v.throughHis[4], v.throughRateHis[4], v.throughHis[5], v.throughRateHis[5],
          v.throughHis[6], v.throughRateHis[6]]
      })
    },

    nameSuggestions(queryString, callback) {
      if (typeof queryString !== 'string') {
        queryString = ''
      } else {
        queryString = queryString.trim()
      }

      var suggestions = []
      for (var i = 0; i < this.communities.length; i++) {
        if (this.communities[i].boroughName.indexOf(queryString) >= 0) {
          suggestions.push({ id: this.communities[i].boroughId, value: this.communities[i].boroughName })
        }
      }
      callback(suggestions)
    },
    handleClearName() {
      this.listQuery.id = null
    },
    handleInputName(item) {
      this.listQuery.id = item.id
    },
    handleShowCommunityDetails(row) {
      this.$router.push({
        path: '/data/community/info',
        query: { boroughId: row.boroughId }
      })
    },
    getSummaries(param) {
      const { columns } = param
      const sums = []
      columns.forEach((column, index) => {
        sums[index] = ''
      })

      if (!this.communitySummary) {
        return sums
      }

      sums[0] = '合计'
      sums[2] = this.communitySummary.totalMeter

      if (this.showMissedMeterNum) {
        if (this.showMeterRateHis) {
          sums[3] = this.showPrecent ? (100 - this.communitySummary.throughRate) + '%' : this.communitySummary.totalMeter - this.communitySummary.through
          for (let i = 4; i < columns.length && i <= 10; i++) {
            sums[i] = this.showPrecent ? (100 - this.communitySummary.throughRateHis[i - 4]) + '%' : this.communitySummary.totalMeter - this.communitySummary.throughHis[i - 4]
          }
        } else {
          sums[6] = this.showPrecent ? (100 - this.communitySummary.throughRate) + '%' : this.communitySummary.totalMeter - this.communitySummary.through
        }
      } else {
        if (this.showMeterRateHis) {
          sums[3] = this.showPrecent ? this.communitySummary.throughRate + '%' : this.communitySummary.through
          for (let i = 4; i < columns.length && i <= 10; i++) {
            sums[i] = this.showPrecent ? this.communitySummary.throughRateHis[i - 4] + '%' : this.communitySummary.throughHis[i - 4]
          }
        } else {
          sums[6] = this.showPrecent ? this.communitySummary.throughRate + '%' : this.communitySummary.through
        }
      }

      return sums
    }
  }
}
</script>
