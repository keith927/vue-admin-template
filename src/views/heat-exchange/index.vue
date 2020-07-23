<template>
  <div class="app-container">
    <el-row class="filter-container" :gutter="10">

      <el-col :xs="{span: 8}" :sm="{span: 8}" :md="{span: 8}" :lg="{span: 4}" :xl="{span: 4}">
        <el-autocomplete
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

      <el-col :xs="{span: 16}" :sm="{span: 16}" :md="{span: 16}" :lg="{span: 6}" :xl="{span: 8}">
        <el-row style="margin-bottom:15px;">
          <el-date-picker
            v-model="timeRange"
            type="daterange"
            align="right"
            unlink-panels
            clearable
            range-separator="~"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"
            style="width:100%"
          />
        </el-row>
      </el-col>

      <el-col :xs="{span: 20}" :sm="{span: 20}" :md="{span: 20}" :lg="{span: 10}" :xl="{span: 8}">
        <el-tooltip :content="'流量: ' + (flowFilter.range[0] === undefined ? '' : flowFilter.range[0]) + '~' + (flowFilter.range[1] === undefined ? '' : flowFilter.range[1]) " placement="top">
          <el-dropdown
            split-button
            :type="flowFilter.switch ? 'primary' : 'info'"
            class="filter-item"
            style="margin-right:10px;"
            trigger="click"
            @click="function() {flowFilter.switch = !flowFilter.switch}"
          >
            流量
            <el-dropdown-menu slot="dropdown">
              <span style="margin:10px">
                <el-input-number v-model="flowFilter.range[0]" :disabled="!flowFilter.switch" controls-position="right" /> ~
                <el-input-number v-model="flowFilter.range[1]" :disabled="!flowFilter.switch" controls-position="right" />
              </span>
              <el-switch v-model="flowFilter.switch" class="filter-item" style="margin-right:40px;" active-color="#13ce66" inactive-color="#ff4949" />
            </el-dropdown-menu>
          </el-dropdown>
        </el-tooltip>

        <el-tooltip :content="'热量: ' + (powerFilter.range[0] === undefined ? '' : powerFilter.range[0]) + '~' + (powerFilter.range[1] === undefined ? '' : powerFilter.range[1]) " placement="top">
          <el-dropdown
            split-button
            :type="powerFilter.switch ? 'primary' : 'info'"
            class="filter-item"
            style="margin-right:10px;"
            trigger="click"
            @click="function() {powerFilter.switch = !powerFilter.switch}"
          >
            热量
            <el-dropdown-menu slot="dropdown">
              <span style="margin:10px">
                <el-input-number v-model="powerFilter.range[0]" :disabled="!powerFilter.switch" controls-position="right" /> ~
                <el-input-number v-model="powerFilter.range[1]" :disabled="!powerFilter.switch" controls-position="right" />
              </span>
              <el-switch v-model="powerFilter.switch" class="filter-item" style="margin-right:40px;" active-color="#13ce66" inactive-color="#ff4949" />
            </el-dropdown-menu>
          </el-dropdown>
        </el-tooltip>

        <el-tooltip :content="pressureFilter.type + ': ' + (pressureFilter.range[0] === undefined ? '' : pressureFilter.range[0]) + '~' + (pressureFilter.range[1] === undefined ? '' : pressureFilter.range[1]) " placement="top">
          <el-dropdown
            split-button
            :type="pressureFilter.switch ? 'primary' : 'info'"
            class="filter-item"
            style="margin-right:10px;"
            trigger="click"
            @click="function() {pressureFilter.switch = !pressureFilter.switch}"
          >
            压力
            <el-dropdown-menu slot="dropdown">
              <span style="margin:10px">
                <el-radio v-model="pressureFilter.type" :disabled="!pressureFilter.switch" label="供水压力">供水</el-radio>
                <el-radio v-model="pressureFilter.type" :disabled="!pressureFilter.switch" label="回水压力">回水</el-radio>
                <el-radio v-model="pressureFilter.type" :disabled="!pressureFilter.switch" label="压差">压差</el-radio>
                <el-input-number v-model="pressureFilter.range[0]" :disabled="!pressureFilter.switch" controls-position="right" /> ~
                <el-input-number v-model="pressureFilter.range[1]" :disabled="!pressureFilter.switch" controls-position="right" />
              </span>
              <el-switch v-model="pressureFilter.switch" class="filter-item" style="margin-right:40px;" active-color="#13ce66" inactive-color="#ff4949" />
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
                <el-radio v-model="tempFilter.type" :disabled="!tempFilter.switch" label="供水温度">供水</el-radio>
                <el-radio v-model="tempFilter.type" :disabled="!tempFilter.switch" label="回水温度">回水</el-radio>
                <el-radio v-model="tempFilter.type" :disabled="!tempFilter.switch" label="温差">温差</el-radio>
                <el-input-number v-model="tempFilter.range[0]" :disabled="!tempFilter.switch" controls-position="right" :min="-100" :max="100" /> ~
                <el-input-number v-model="tempFilter.range[1]" :disabled="!tempFilter.switch" controls-position="right" :min="-100" :max="100" />
              </span>
              <el-switch v-model="tempFilter.switch" class="filter-item" style="margin-right:40px;" active-color="#13ce66" inactive-color="#ff4949" />
            </el-dropdown-menu>
          </el-dropdown>
        </el-tooltip>
      </el-col>

      <el-col :xs="{span: 4}" :sm="{span: 4}" :md="{span: 4}" :lg="{span: 4}" :xl="{span: 4}" align="right">
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
      <el-table-column prop="devname" label="名称" min-width="102" align="center" show-overflow-tooltip fixed />
      <!-- <el-table-column prop="remarks" label="描述" min-width="102" align="center" show-overflow-tooltip /> -->
      <el-table-column prop="rl_Sum" label="累计热量" align="center" min-width="102" sortable="custom" />
      <el-table-column prop="fi_Sum" label="累计热量" align="center" min-width="102" sortable="custom" />
      <el-table-column prop="rl" label="瞬时热量" align="center" min-width="102" sortable="custom" />
      <el-table-column prop="fi" label="瞬时流量" align="center" min-width="102" sortable="custom" />
      <el-table-column prop="pgs1" label="供水压力" align="center" min-width="102" sortable="custom" />
      <el-table-column prop="phs1" label="回水压力" align="center" min-width="102" sortable="custom" />
      <el-table-column prop="tgs1" label="供水温度" align="center" min-width="102" sortable="custom" />
      <el-table-column prop="ths1" label="回水温度" align="center" min-width="102" sortable="custom" />
      <el-table-column prop="synctime" label="抄表时间" align="center" min-width="102" :formatter="timeFormatter" sortable="custom" show-overflow-tooltip />
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
import { getDevList, getDevHisData } from '@/api/heatExchangeStationInfo'
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

      flowFilter: {
        switch: false,
        range: [undefined, undefined]
      },

      powerFilter: {
        switch: false,
        range: [undefined, undefined]
      },

      pressureFilter: {
        switch: false,
        type: '供水压力',
        range: [undefined, undefined]
      },

      tempFilter: {
        switch: false,
        type: '供水温度',
        range: [undefined, undefined]
      },

      timeRange: null,

      filter: {
        devname: '',
        gtFi: '',
        gtFiSum: '',
        gtPgs1: '',
        gtPhs1: '',
        gtRl: '',
        gtRlSum: '',
        gtSyncTime: '',
        gtTgs1: '',
        gtThs1: '',
        ltFi: '',
        ltFiSum: '',
        ltPgs1: '',
        ltPhs1: '',
        ltRl: '',
        ltRlSum: '',
        ltSyncTime: '',
        ltTgs1: '',
        ltThs1: '',
        orderColumn: '',
        orderRule: ''
      },

      downloadLoading: false,

      pickerOptions: {
        shortcuts: [{
          text: '最近1天',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 1)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近7天',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近30天',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }]
      }
    }
  },
  computed: {
    device() {
      return this.$store.state.app.device
    }
  },
  watch: {
    timeRange: {
      handler: function(val) {
        this.filter.ltSyncTime = (val && val[0]) ? new Date(val[0] + 28800000).toJSON().substr(0, 10).replace(/-/g, '/') + ' 07:00:00' : ''
        this.filter.gtSyncTime = (val && val[1]) ? new Date(val[1] + 28800000).toJSON().substr(0, 10).replace(/-/g, '/') + ' 07:00:00' : ''
      }
    },

    flowFilter: {
      deep: true,
      handler(val) {
        [this.filter.ltFi, this.filter.gtFi] = val.switch
          ? [typeof val.range[0] !== 'number' ? '' : val.range[0].toString(),
            typeof val.range[1] !== 'number' ? '' : val.range[1].toString()]
          : ['', '']
      }
    },

    powerFilter: {
      deep: true,
      handler(val) {
        [this.filter.ltRl, this.filter.gtRl] = val.switch
          ? [typeof val.range[0] !== 'number' ? '' : val.range[0].toString(),
            typeof val.range[1] !== 'number' ? '' : val.range[1].toString()]
          : ['', '']
      }
    },

    pressureFilter: {
      deep: true,
      handler(val) {
        [this.filter.ltPgs1, this.filter.gtPgs1, this.filter.ltPhs1, this.filter.gtPhs1, this.filter.ltPc1, this.filter.gtPc1] = ['', '', '', '', '', '']
        if (!val.switch) {
          return
        }

        var range = [typeof val.range[0] !== 'number' ? '' : val.range[0].toString(), typeof val.range[1] !== 'number' ? '' : val.range[1].toString()]
        if (val.type === '供水压力') {
          [this.filter.ltPgs1, this.filter.gtPgs1] = range
        } else if (val.type === '回水压力') {
          [this.filter.ltPhs1, this.filter.gtPhs1] = range
        } else {
          [this.filter.ltPhs1, this.filter.gtPhs1] = range // TODO
        }
      }
    },

    tempFilter: {
      deep: true,
      handler(val) {
        [this.filter.ltTgs1, this.filter.gtTgs1, this.filter.ltThs1, this.filter.gtThs1, this.filter.ltThs1, this.filter.gtThs1] = ['', '', '', '', '', '']
        if (!val.switch) {
          return
        }

        var range = [typeof val.range[0] !== 'number' ? '' : val.range[0].toString(), typeof val.range[1] !== 'number' ? '' : val.range[1].toString()]
        if (val.type === '供水温度') {
          [this.filter.ltTgs1, this.filter.gtTgs1] = range
        } else if (val.type === '回水温度') {
          [this.filter.ltThs1, this.filter.gtThs1] = range
        } else {
          [this.filter.ltThs1, this.filter.gtThs1] = range // TODO
        }
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
              return { id: i, devname: v.devname }
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
      return new Date(row.synctime + 28800000).toJSON().substr(0, 19).replace('T', ' ').replace(/-/g, '/')
    },

    // 计算未上线天数
    elapsedTimeFormatter(row, column) {
      return Math.floor((theSmallHours - row.synctime) / (24 * 3600 * 1000)) + '天'
    },

    // 按条件筛选数据
    handleFilter() {
      if (this.loading) {
        return
      }

      this.loading = true
      setTimeout(() => {
        return new Promise((resolve, reject) => {
          getDevHisData(this.query, this.filter).then(response => {
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

    sortChange(data) {
      const { prop, order } = data
      this.filter.orderColumn = (order === null ? '' : prop)
      this.filter.orderRule = (order === null ? '' : order === 'ascending' ? '0' : '1')
      this.handleFilter()
    },

    // 重置搜索条件
    handleReset() {
      this.handleClearDevName()

      this.flowFilter.switch = false
      this.powerFilter.switch = false
      this.pressureFilter.switch = false
      this.tempFilter.switch = false

      this.filter.orderColumn = ''
      this.filter.orderRule = ''
      this.timeRange = null
    },

    // 导出数据
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['序号', '名称', '累计热量', '累计流量', '瞬时热量', '瞬时流量', '供水压力', '回水压力', '供水温度', '回水温度', '抄表时间']

        getDevList({ page: 0, size: 0 }, this.filter).then(response => {
          const data = response.data.list.map((v, i) => {
            return [i + 1,
              v.devname,
              // v.remarks,
              v.rl_Sum,
              v.fi_Sum,
              v.rl,
              v.fi,
              v.pgs1,
              v.phs1,
              v.tgs1,
              v.ths1,
              this.timeFormatter(v)]
          })
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '热力站数据 ' + new Date().toJSON().substr(0, 19).replace('T', '_')
          })
          this.downloadLoading = false
        }).catch(error => {
          this.downloadLoading = false
          this.$message.error('导出热力站数据失败' + error)
          console.log('导出热力站数据失败' + error)
        })
      })
    }
  }

}
</script>

