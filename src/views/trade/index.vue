<template>
  <div class="app-container">
    <el-row class="filter-container" :gutter="10">

      <el-col :xs="{span: 12}" :sm="{span: 12}" :md="{span: 5}" :lg="{span: 4}" :xl="{span: 4}">
        <el-autocomplete
          ref="input"
          v-model="inputDevName"
          :fetch-suggestions="devnameSuggestions"
          :select-when-unmatched="true"
          class="filter-item"
          clearable
          style="width:100%;"
          placeholder="请输入电磁流量计名称"
          :disabled="!devlist"
          @select="handleInputDevName"
          @clear="handleClearDevName"
        />
      </el-col>

      <el-col :xs="{span: 12}" :sm="{span: 12}" :md="{span: 5}" :lg="{span: 4}" :xl="{span: 4}">

        <el-autocomplete
          ref="input"
          v-model="inputDtuId"
          :fetch-suggestions="dtuIdSuggestions"
          :select-when-unmatched="true"
          class="filter-item"
          clearable
          style="width:100%;"
          placeholder="请输入DTU ID"
          :disabled="!devlist"
          @select="handleInputDtuId"
          @clear="handleClearDtuId"
        />
      </el-col>

      <el-col :xs="{span: 21}" :sm="{span: 16}" :md="{span: 10}" :lg="{span: 12}" :xl="{span: 12}">
        <el-tooltip :content="'流速: ' + (flowRateFilter.range[0] === undefined ? '' : flowRateFilter.range[0]) + '~' + (flowRateFilter.range[1] === undefined ? '' : flowRateFilter.range[1]) " placement="top">
          <el-dropdown
            split-button
            :type="flowRateFilter.switch ? 'primary' : 'info'"
            class="filter-item"
            style="margin-right:10px;"
            trigger="click"
            @click="function() {flowRateFilter.switch = !flowRateFilter.switch}"
          >
            流速
            <el-dropdown-menu slot="dropdown">
              <span style="margin:10px">
                <el-input-number v-model="flowRateFilter.range[0]" :disabled="!flowRateFilter.switch" controls-position="right" /> ~
                <el-input-number v-model="flowRateFilter.range[1]" :disabled="!flowRateFilter.switch" controls-position="right" />
              </span>
              <el-switch v-model="flowRateFilter.switch" class="filter-item" style="margin-right:40px;" active-color="#13ce66" inactive-color="#ff4949" />
            </el-dropdown-menu>
          </el-dropdown>
        </el-tooltip>

        <el-tooltip :content="'功率: ' + (powerFilter.range[0] === undefined ? '' : powerFilter.range[0]) + '~' + (powerFilter.range[1] === undefined ? '' : powerFilter.range[1]) " placement="top">
          <el-dropdown
            split-button
            :type="powerFilter.switch ? 'primary' : 'info'"
            class="filter-item"
            style="margin-right:10px;"
            trigger="click"
            @click="function() {powerFilter.switch = !powerFilter.switch}"
          >
            功率
            <el-dropdown-menu slot="dropdown">
              <span style="margin:10px">
                <el-input-number v-model="powerFilter.range[0]" :disabled="!powerFilter.switch" controls-position="right" /> ~
                <el-input-number v-model="powerFilter.range[1]" :disabled="!powerFilter.switch" controls-position="right" />
              </span>
              <el-switch v-model="powerFilter.switch" class="filter-item" style="margin-right:40px;" active-color="#13ce66" inactive-color="#ff4949" />
            </el-dropdown-menu>
          </el-dropdown>
        </el-tooltip>

        <el-tooltip :content="tempFilter.type + ': ' + (tempFilter.range[0] === undefined ? '' : tempFilter.range[0]) + '~' + (tempFilter.range[1] === undefined ? '' : tempFilter.range[1]) " placement="top">
          <el-dropdown
            split-button
            :type="tempFilter.switch ? 'primary' : 'info'"
            class="filter-item"
            trigger="click"
            @click="function() {tempFilter.switch = !tempFilter.switch}"
          >
            水温
            <el-dropdown-menu slot="dropdown">
              <span style="margin:10px">
                <el-radio v-model="tempFilter.type" :disabled="!tempFilter.switch" label="供水">供水</el-radio>
                <el-radio v-model="tempFilter.type" :disabled="!tempFilter.switch" label="回水">回水</el-radio>
                <el-radio v-model="tempFilter.type" :disabled="!tempFilter.switch" label="温差">温差</el-radio>
                <el-input-number v-model="tempFilter.range[0]" :disabled="!tempFilter.switch" controls-position="right" :min="-100" :max="100" /> ~
                <el-input-number v-model="tempFilter.range[1]" :disabled="!tempFilter.switch" controls-position="Wright" :min="-100" :max="100" />
              </span>
              <el-switch v-model="tempFilter.switch" class="filter-item" style="margin-right:40px;" active-color="#13ce66" inactive-color="#ff4949" />
            </el-dropdown-menu>
          </el-dropdown>
        </el-tooltip>
      </el-col>

      <el-col :xs="{span: 3}" :sm="{span: 8}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}" align="right">
        <el-button
          type="warning"
          icon="el-icon-refresh"
          style="margin-bottom:15px"
          :disabled="!devlist"
          circle
          @click="handleReset"
        />

        <el-button
          v-if="device!=='mobile'"
          :loading="downloadLoading"
          :disabled="!devlist"
          type="primary"
          icon="el-icon-download"
          style="margin-bottom:15px"
          circle
          @click="handleDownload"
        />
      </el-col>
    </el-row>

    <el-table
      ref="filterTable"
      v-loading="loading"
      :data="tableData"
      border
      fit
      stripe
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column prop="id" label="序号" width="62px" align="center" fixed>
        <template slot-scope="{$index}">
          <span>{{ $index + 1 + (query.page - 1) * query.size }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="devname" label="名称" min-width="100" align="center" show-overflow-tooltip fixed />
      <el-table-column prop="devname" label="描述" min-width="100" align="center" show-overflow-tooltip />
      <el-table-column prop="dtuid" label="DTU" align="center" min-width="100" sortable="custom" />
      <el-table-column prop="curheatnum" label="累计热量" align="center" min-width="100" sortable="custom" />
      <el-table-column prop="curwaterflow" label="累计流量" align="center" min-width="100" sortable="custom" />
      <el-table-column prop="flowrate" label="流速" align="center" min-width="90" sortable="custom" />
      <el-table-column prop="heatpower" label="功率" align="center" min-width="90" sortable="custom" />
      <el-table-column prop="supplywatertmp" label="供水温度" align="center" min-width="100" sortable="custom" />
      <el-table-column prop="returnwatertmp" label="回水温度" align="center" min-width="100" sortable="custom" />
      <el-table-column prop="lastupdatetime" label="抄表时间" align="center" min-width="100" :formatter="timeFormatter" sortable="custom" show-overflow-tooltip />
      <el-table-column prop="elapsedTime" label="抄表时间" align="center" min-width="90" :formatter="elapsedTimeFormatter" />
    </el-table>
    <pagination
      v-if="devlist"
      v-show="total > 0"
      :auto-scroll="false"
      :total="total"
      :page.sync="query.page"
      :limit.sync="query.size"
      :page-sizes="[12, 30, 50, 100, 200]"
      @pagination="handleFilter"
    />
  </div>
</template>

<script>
import { getDevList } from '@/api/tradeSysInfo'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const theSmallHours = new Date(new Date().setHours(0, 0, 0, 0)).getTime()

export default {
  components: { Pagination },

  data() {
    return {
      loading: false,

      tableData: [],
      devlist: null,
      total: 0,

      inputDevName: '',
      inputDtuId: '',

      query: {
        page: 1,
        size: 12
      },

      flowRateFilter: {
        switch: false,
        range: [undefined, undefined]
      },

      powerFilter: {
        switch: false,
        range: [undefined, undefined]
      },

      tempFilter: {
        switch: false,
        type: '供水',
        range: [undefined, undefined]
      },

      filter: {
        devname: '',
        dtuid: '',
        endBackupTime: '',
        endCurHeatnum: '',
        endCurwaterflow: '',
        endFlowrate: '',
        endHeatpower: '',
        endReturnwatertmp: '',
        endSupplywatertmp: '',
        orderColumn: '',
        orderRule: '', // 1:降序，0：升序
        startBackupTime: '',
        startCurHeatnum: '',
        startCurwaterflow: '',
        startFlowrate: '',
        startHeatpower: '',
        startReturnwatertmp: '',
        startSupplywatertmp: '',
        startWdc: '',
        endWdc: ''
      },

      downloadLoading: false
    }
  },
  computed: {
    device() {
      return this.$store.state.app.device
    }
  },
  watch: {
    tempFilter: {
      deep: true,
      handler(val) {
        [this.filter.startSupplywatertmp, this.filter.endSupplywatertmp, this.filter.startReturnwatertmp, this.filter.endReturnwatertmp, this.filter.startWdc, this.filter.endWdc] =
           ['', '', '', '', '', '']
        if (!val.switch) {
          return
        }

        if (val.type === '供水') {
          [this.filter.startSupplywatertmp, this.filter.endSupplywatertmp] = [typeof val.range[0] !== 'number' ? '' : val.range[0].toString(), typeof val.range[1] !== 'number' ? '' : val.range[1].toString()]
        } else if (val.type === '回水') {
          [this.filter.startReturnwatertmp, this.filter.endReturnwatertmp] = [typeof val.range[0] !== 'number' ? '' : val.range[0].toString(), typeof val.range[1] !== 'number' ? '' : val.range[1].toString()]
        } else {
          [this.filter.startWdc, this.filter.endWdc] = [typeof val.range[0] !== 'number' ? '' : val.range[0].toString(), typeof val.range[1] !== 'number' ? '' : val.range[1].toString()]
        }

        this.handleFilter()
      }
    },

    flowRateFilter: {
      deep: true,
      handler(val) {
        [this.filter.startFlowrate, this.filter.endFlowrate] = val.switch
          ? [typeof val.range[0] !== 'number' ? '' : val.range[0].toString(),
            typeof val.range[1] !== 'number' ? '' : val.range[1].toString()]
          : ['', '']
        this.handleFilter()
      }
    },

    powerFilter: {
      deep: true,
      handler(val) {
        [this.filter.startHeatpower, this.filter.endHeatpower] = val.switch
          ? [typeof val.range[0] !== 'number' ? '' : val.range[0].toString(),
            typeof val.range[1] !== 'number' ? '' : val.range[1].toString()]
          : ['', '']
        this.handleFilter()
      }
    },

    filter: {
      deep: true,
      handler(val) {
        this.handleFilter()
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.loading = true
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // 获取所有小区信息，用于建立模糊搜索
          getDevList({ page: 0, size: 0 }, this.filter).then(response => {
            this.tableData = response.data.list.slice(0, this.query.size)
            this.total = response.data.total
            this.devlist = response.data.list.map((v, i) => {
              return { id: i, devname: v.devname, dtuid: v.dtuid }
            })
            this.loading = false
            resolve()
          }).catch(error => {
            this.loading = false
            reject(error)
          })
        }, 300)
      })
    },

    // 时间戳转日期，格式2020/08/08 22:11:59
    timeFormatter(row, column) {
      return new Date(row.lastupdatetime + 28800000).toJSON().substr(0, 19).replace('T', ' ').replace(/-/g, '/')
    },

    // 计算未上线天数
    elapsedTimeFormatter(row, column) {
      return Math.floor((theSmallHours - row.lastupdatetime) / (24 * 3600 * 1000)) + '天'
    },

    // 按条件筛选数据
    handleFilter() {
      if (this.loading) {
        return
      }

      this.loading = true
      setTimeout(() => {
        return new Promise((resolve, reject) => {
          getDevList(this.query, this.filter).then(response => {
            console.log(response)
            this.tableData = response.data.list
            this.total = response.data.total
            this.loading = false
            resolve()
          }).catch(error => {
            this.loading = false
            reject(error)
          })
        })
      }, 1000)
    },

    // devname模糊搜索
    devnameSuggestions(queryString, callback) {
      if (typeof queryString !== 'string') {
        queryString = ''
      } else {
        queryString = queryString.trim()
      }
      console.log(queryString)
      var suggestions = []
      for (var i = 0; i < this.devlist.length; i++) {
        if (this.devlist[i].devname.indexOf(queryString) >= 0) {
          suggestions.push({ id: this.devlist[i].id, value: this.devlist[i].devname })
        }
      }
      callback(suggestions)
    },
    handleClearDevName() {
      this.filter.devname = ''
      this.inputDevName = ''
    },
    handleInputDevName(item) {
      this.filter.devname = item.value
      this.inputDevName = item.value
    },

    // dtuid模糊搜索
    dtuIdSuggestions(queryString, callback) {
      if (typeof queryString !== 'string') {
        queryString = ''
      } else {
        queryString = queryString.trim()
      }

      var suggestions = []
      for (var i = 0; i < this.devlist.length; i++) {
        if (this.devlist[i].dtuid.indexOf(queryString) >= 0) {
          suggestions.push({ id: this.devlist[i].id, value: this.devlist[i].dtuid })
        }
      }
      callback(suggestions)
    },
    handleClearDtuId() {
      this.filter.dtuid = ''
      this.inputDtuId = ''
    },
    handleInputDtuId(item) {
      this.filter.dtuid = item.value
      this.inputDtuId = item.value
    },

    sortChange(data) {
      const { prop, order } = data
      this.filter.orderColumn = (order === null ? '' : prop)
      this.filter.orderRule = (order === null ? '' : order === 'ascending' ? '0' : '1')
      this.handleFilter()
    },

    // 重置搜索条件
    handleReset() {
      this.handleClearDtuId()
      this.handleClearDevName()

      this.flowRateFilter.switch = false
      this.tempFilter.switch = false
      this.tempFilter.switch = false

      this.filter.orderColumn = ''
      this.filter.orderRule = ''
    },

    // 导出数据
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['序号', '名称', 'DTU ID', '累计热量', '累计流量', '流速', '功率', '供水温度', '回水温度', '更新时间']

        getDevList({ page: 0, size: 0 }, this.filter).then(response => {
          const data = response.data.list.map((v, i) => {
            return [i + 1,
              v.devname,
              v.dtuid,
              v.curheatnum,
              v.curwaterflow,
              v.flowrate,
              v.heatpower,
              v.supplywatertmp,
              v.returnwatertmp,
              this.timeFormatter(v)]
          })
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '贸易系统实时数据 ' + new Date().toJSON().substr(0, 19).replace('T', '_')
          })
          this.downloadLoading = false
        }).catch(error => {
          this.downloadLoading = false
          this.$message.error('导出贸易系统数据失败' + error)
          console.log('导出贸易系统数据失败' + error)
        })
      })
    }
  }

}
</script>

