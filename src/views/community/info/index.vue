<template>
  <div class="app-container">
    <el-row v-loading.lock="dataLoading" style="margin-bottom:50px;">
      <el-card class="box-card">
        <el-form label-width="40px">
          <el-row>
            <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 12}" :xl="{span: 12}">
              <el-form-item label="名称">
                <el-select v-if="communityList" v-model="inputName" filterable placeholder="请选择小区" style="width:100%" @change="handleSelectCommunity">
                  <el-option v-for="item in communityList" :key="item.boroughId" :label="item.boroughName" :value="item.boroughId" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 12}" :xl="{span: 12}" align="right">
              <el-tooltip class="item" effect="dark" content="上个小区" placement="top-start">
                <el-button v-waves icon="el-icon-arrow-left" type="primary" style="width:89px" :disabled="(dataLoading || loadingMeterRateData || loadingAbnormalList)" @click="showPrevCommunity" />
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="下个小区" placement="top-start">
                <el-button v-waves icon="el-icon-arrow-right" type="primary" style="width:89px" :disabled="(dataLoading || loadingMeterRateData || loadingAbnormalList)" @click="showNextCommunity" />
              </el-tooltip>
            </el-col>
          </el-row>

          <el-row v-if="community" style="margin-top:15px;">
            <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 12}" :xl="{span: 12}">
              <el-form-item label="描述">
                <el-input v-model="community.remark" :disabled="!canModify" clearable style="width:100%" />
              </el-form-item>
            </el-col>

            <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 12}" :xl="{span: 12}" align="right">
              <el-tooltip class="item" effect="dark" content="修改小区描述和经纬度" placement="top-start">
                <el-button v-if="!canModify" v-waves icon="el-icon-edit" type="primary" :disabled="dataLoading" @click="setModifyStatus">修改</el-button>
                <el-button v-if="canModify" v-waves icon="el-icon-circle-check" type="success" :disabled="dataLoading " @click="onSubmitCommunityInfo">提交</el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="重置为已保存数据" placement="top-start">
                <el-button v-waves icon="el-icon-refresh" type="warning" @click="onCancelCommunityInfo">取消</el-button>
              </el-tooltip>
            </el-col>
          </el-row>
        </el-form>

        <el-row v-if="community" style="margin-top:15px;">
          <baidu-map
            style="height:450px;"
            :center="mapCenter"
            :zoom="mapZoom"
            :max-zoom="18"
            :min-zoom="8"
            :map-click="false"
            :double-click-zoom="false"
            :dragging="canModify"
            :scroll-wheel-zoom="canModify"
            @ready="onMapReady"
            @resize="onMapResize"
            @dblclick="setCommunityLocation"
          >
            <bm-navigation anchor="BMAP_ANCHOR_TOP_LEFT" />
            <bm-map-type :map-types="['BMAP_NORMAL_MAP', 'BMAP_HYBRID_MAP']" anchor="BMAP_ANCHOR_TOP_RIGHT" />
            <bm-scale anchor="BMAP_ANCHOR_TOP_RIGHT" :offset="{width: 100, height: 8}" />
            <bm-control :offset="{width: 70, height: 10}">
              <el-tooltip class="item" effect="dark" content="搜索地图" placement="top-start">
                <el-input v-model="searchKeyword" placeholder="请输入地图搜索条件" clearable :disabled="!canModify">
                  <i slot="prefix" class="el-input__icon el-icon-search" />
                </el-input>
              </el-tooltip>
            </bm-control>
            <bm-marker v-if="map" :position="mapCenter" :dragging="canModify" @dragend="setCommunityLocation" />
            <bm-local-search v-if="canModify" :keyword="searchKeyword" :auto-viewport="true" :panel="false" :select-first-result="true" location="开封" />

            <!-- 小区300米范围内网关信息 -->
            <bm-marker
              v-for="(item, index) in inBoundsGwList"
              :key="item.id"
              :icon="{url:require(item.online ? '../../../assets/images/gw_green.png' : '../../../assets/images/gw_red.png'),size:{width:25,height:25}}"
              :position="{lng: item.lng, lat: item.lat}"
              @click="onClickGwEntity($event, index)"
            />

            <!-- 网关详情 -->
            <bm-info-window
              v-if="gwInfoWindow.show"
              :position="{lng: gwInfoWindow.lng, lat: gwInfoWindow.lat}"
              title=" "
              :show="gwInfoWindow.show"
              :width="360"
              @close="onGwInIfoWindowClose"
              @open="onGwInIfoWindowOpen"
            >
              <p>网关编号: &nbsp;&nbsp;{{ gwInfoWindow.gatewayID }}</p>
              <p>当前状态: &nbsp;&nbsp;{{ new Date(((gwInfoWindow.online ? gwInfoWindow.lastShowTimeBegin : gwInfoWindow.lastOfftime) + 28800000)).toJSON().substr(0, 19).replace('T', ' ').replace(/-/g, '/') }}  至今{{ gwInfoWindow.online ? '在线': '离线' }} </p>
              <p>网关位置: &nbsp;&nbsp;{{ gwInfoWindow.location }}</p>
              <p>抄通数量: &nbsp;&nbsp;{{ gwInfoWindow.throughNum }}</p>
              <p>直线距离: &nbsp;&nbsp;{{ gwInfoWindow.distance }}米</p>
            </bm-info-window>
          </baidu-map>
        </el-row>

        <el-row v-if="community" style="margin-top:15px;">
          <div ref="meterNumStatisticDiv" style="height:60px;width:100%" />
        </el-row>

      </el-card>
    </el-row>

    <el-tabs v-if="community" v-model="activeName" type="card" style="padding-top:15px;" @tab-click="handleTabClick">
      <el-tab-pane name="meter">
        <span slot="label"><i class="el-icon-finished" /> 抄通情况</span>

        <el-row v-loading="loadingMeterRateData" style="margin-bottom:15px;">
          <div ref="meterRateDiv" style="height:450px;width:100%" />
        </el-row>

        <el-row v-loading="loadingMeterRateData" style="margin-bottom:15px;">
          <el-table
            v-if="missedMeterByMeterNo"
            :data="missedMeterByMeterNo"
            border
            fit
            highlight-current-row
            style="width: 100%;"
            height="598"
            :show-summary="true"
            :default-sort="{prop: 'totalNum', order: 'descending'}"
            :summary-method="getMissedMeterSummaries"
          >
            <el-table-column fixed label="序号" width="60px" prop="id" align="center">
              <template slot-scope="{$index}">
                <span>{{ $index + 1 }}</span>
              </template>
            </el-table-column>

            <el-table-column fixed label="表号" min-width="95px" prop="meterNo" sortable align="center">
              <template slot-scope="{row}">
                <span>{{ row.meterNo }}</span>
              </template>
            </el-table-column>

            <el-table-column label="次数" min-width="75px" prop="totalNum" sortable align="center">
              <template slot-scope="{row}">
                <span>{{ row.total }}</span>
              </template>
            </el-table-column>

            <el-table-column v-for="(item, dindex) in dateArray" :key="dindex" :label="item.substr(5,5)" min-width="60px" align="center">
              <template slot-scope="{row}">
                <el-progress :show-text="false" :stroke-width="24" :percentage="100" :status="row.map[dindex] ? 'exception' : 'success'" />
              </template>
            </el-table-column>
          </el-table>
        </el-row>
      </el-tab-pane>

      <el-tab-pane name="stastics">
        <span slot="label"><i class="el-icon-warning-outline" /> 故障统计</span>

        <el-row v-loading="loadingAbnormalList" style="margin-bottom:15px;">
          <el-date-picker
            v-model="timeRange"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="~"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"
          />
        </el-row>

        <el-row v-loading="loadingAbnormalList" style="margin-bottom:15px;">
          <el-table
            v-if="abnormalList"
            :data="abnormalList.list"
            border
            fit
            highlight-current-row
            style="width: 100%;"
          >
            <el-table-column label="序号" width="60px" align="center">
              <template slot-scope="{$index}">
                <span>{{ $index + 1 }}</span>
              </template>
            </el-table-column>

            <el-table-column label="户主信息" align="center">
              <el-table-column label="楼栋" min-width="60px" align="center" show-overflow-tooltip>
                <template slot-scope="{row}">
                  <span>{{ row.c_BuildingName }}</span>
                </template>
              </el-table-column>

              <el-table-column label="单元" min-width="60px" align="center" show-overflow-tooltip>
                <template slot-scope="{row}">
                  <span>{{ row.i_cell }}</span>
                </template>
              </el-table-column>

              <el-table-column label="房间" min-width="60px" align="center">
                <template slot-scope="{row}">
                  <span>{{ row.c_roomnum }}</span>
                </template>
              </el-table-column>

              <el-table-column label="户主" min-width="60px" align="center" show-overflow-tooltip>
                <template slot-scope="{row}">
                  <span>{{ row.c_ownername }}</span>
                </template>
              </el-table-column>

              <el-table-column label="卡号" min-width="60px" align="center">
                <template slot-scope="{row}">
                  <span>{{ row.c_cardnum }}</span>
                </template>
              </el-table-column>

              <el-table-column label="表号" min-width="60px" align="center">
                <template slot-scope="{row}">
                  <span>{{ row.meterno }}</span>
                </template>
              </el-table-column>
            </el-table-column>

            <el-table-column label="计量信息" align="center">
              <el-table-column label="累计热量" min-width="60px" align="center">
                <template slot-scope="{row}">
                  <span>{{ row.totalHeat }}</span>
                </template>
              </el-table-column>

              <el-table-column label="累计流量" min-width="60px" align="center">
                <template slot-scope="{row}">
                  <span>{{ row.totalFlow }}</span>
                </template>
              </el-table-column>

              <el-table-column label="流速" min-width="60px" align="center">
                <template slot-scope="{row}">
                  <span>{{ row.flowRate }}</span>
                </template>
              </el-table-column>

              <el-table-column label="功率" min-width="75px" align="center">
                <template slot-scope="{row}">
                  <span>{{ row.power }}</span>
                </template>
              </el-table-column>

              <el-table-column label="供水" min-width="75px" align="center">
                <template slot-scope="{row}">
                  <span>{{ row.supplyTemp }}</span>
                </template>
              </el-table-column>

              <el-table-column label="回水" min-width="75px" align="center">
                <template slot-scope="{row}">
                  <span>{{ row.returnTemp }}</span>
                </template>
              </el-table-column>

              <el-table-column label="温差" min-width="75px" align="center">
                <template slot-scope="{row}">
                  <span>{{ row.wdc }}</span>
                </template>
              </el-table-column>

              <el-table-column label="抄表时间" min-width="75px" align="center" show-overflow-tooltip>
                <template slot-scope="{row}">
                  <span>{{ row.receiveTime | filterTimestamp }}</span>
                </template>
              </el-table-column>
            </el-table-column>

          </el-table>
          <pagination
            v-if="abnormalList"
            v-show="abnormalList.total>0"
            :total="abnormalList.total"
            :page.sync="listQuery.page"
            :limit.sync="listQuery.size"
            :page-sizes="[15, 30, 50, 100]"
            @pagination="handleFilter"
          />
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import { getCommunityDetailInfo, setCommunityGpsAndDesc, getSingeCommunityDetailInfo } from '@/api/conmunityInfo'
import { getGatewayInfo } from '@/api/gatewayInfo'
import echarts from 'echarts'
import resize from '../../dashboard/admin/components/mixins/resize'
import { getCommunityAbnormalInfo } from '@/api/abnormalInfo'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const startTimestamp = new Date(new Date().setHours(0, 0, 0, 0)).getTime() - 7 * 86400000

export default {
  name: 'CommunityInfo',
  components: { Pagination },
  directives: { waves },
  filters: {
    filterTimestamp(val) {
      return new Date(val + 28800000).toJSON().substr(0, 19).replace('T', ' ').replace(/-/g, '/')
    }
  },
  mixins: [resize],
  data() {
    return {
      activeName: 'meter',
      dataLoading: true,

      boroughId: null,
      inputName: '',
      communityList: null,
      community: null,
      canModify: false,

      map: '',
      BMap: null,
      searchKeyword: '',
      settingZoom: false,
      mapCenter: { lng: 114.3150, lat: 34.8012 },
      mapZoom: 17,

      gatewayList: null,
      inBoundsGwList: [],
      gwInfoWindow: [],
      dateArray: [],

      missedMeterByMeterNo: null,
      missedMeterByMeterSummary: null,
      loadingMeterRateData: true,

      // 故障统计相关
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
      },
      timeRange: null,
      abnormalList: null,
      listQuery: {
        page: 1,
        size: 15,
        // sort: 'boroughId',
        // order: 'ascending',
        // inputName: '',
        templeteId: null,
        startDate: null,
        endDate: null,
        notThroughDays: null
      },
      loadingAbnormalList: true
    }
  },
  watch: {
    timeRange: {
      handler: function(val) {
        this.listQuery.startDate = val[0] ? new Date(val[0] + 28800000).toJSON().substr(0, 10).replace(/-/g, '/') + ' 07:00:00' : null
        this.listQuery.endDate = val[1] ? new Date(val[1] + 28800000).toJSON().substr(0, 10).replace(/-/g, '/') + ' 07:00:00' : null
      }
    },
    communityList: {
      deep: true,
      handler: function(val) {
        // console.log(this.$route.query, typeof this.$route.query)
        var id = null
        if (typeof this.$route.query.boroughId === 'number') {
          id = this.$route.query.boroughId
        } else if (typeof this.$route.query.boroughId === 'string') {
          id = parseInt(this.$route.query.boroughId)
        } else {
          id = this.boroughId
        }

        this.handleSelectCommunity(id)
      }
    },
    'community.longitude': {
      handler(val) {
        this.resetMap()
      }
    },
    'community.latitude': {
      handler(val) {
        this.resetMap()
      }
    },
    gatewayList: {
      deep: true,
      handler(val) {
        this.updateInBoundsGwList()
      }
    }
  },
  created() {
    this.dateArray = [0, 1, 2, 3, 4, 5, 6].map(v => {
      return new Date(startTimestamp + v * 86400000 + 28800000).toJSON().substr(0, 10)
    })

    this.timeRange = [new Date() - 3600 * 1000 * 24 * 1, new Date()]

    // 获取小区清单及概要信息
    getCommunityDetailInfo().then(response => {
      this.communityList = response.data.map(v => {
        v.longitude = parseFloat(v.longitude)
        v.latitude = parseFloat(v.latitude)
        v.boroughName = v.boroughName.trim()
        return v
      })
      this.communityList.sort(this.compare('boroughId', 'ascending'))
      if (this.communityList && this.gatewayList) {
        // Just to simulate the time of the request
        setTimeout(() => {
          this.dataLoading = false
        }, 0.5 * 1000)
      }
    }).catch(error => {
      this.$message('获取小区信息失败，' + error)
      console.log('获取小区信息失败，' + error)
      this.dataLoading = false
    })

    // 获取网关清单
    getGatewayInfo().then(response => {
      this.gatewayList = response.data.list
      if (this.communityList && this.gatewayList) {
        // Just to simulate the time of the request
        setTimeout(() => {
          this.dataLoading = false
        }, 0.5 * 1000)
      }
    }).catch(error1 => {
      this.$message('获取网关信息失败，' + error1)
      console.log('获取网关信息失败，' + error1)
      this.dataLoading = false
    })
  },

  methods: {
    compare(property, order) {
      return function(a, b) {
        var value1 = window.isNaN(a[property]) ? 0 : a[property]
        var value2 = window.isNaN(b[property]) ? 0 : b[property]
        return order === 'ascending' ? value1 - value2 : value2 - value1
      }
    },
    handleTabClick(tab, event) {
      console.log(tab, event)
    },
    onMapReady({ BMap, map }) {
      this.map = map
      this.BMap = BMap
      map.setMapStyle({ style: 'midnight' })
      this.resetMap()
    },
    onMapResize() {
      this.resetMap()
    },
    // 判断坐标点是否在区域内
    isPointInBounds(point, point2, distance) {
      var lat1 = (Math.PI / 180) * point.lat
      var lat2 = (Math.PI / 180) * point2.latitude

      // 经度
      var lon1 = (Math.PI / 180) * point.lng
      var lon2 = (Math.PI / 180) * point2.longitude

      // 地球半径，单位米
      var R = 6371000

      // 两点间距离，单位米
      var d = Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)) * R

      return { 'distance': Math.round(d), 'isInBound': d <= distance }
    },
    resetMap() {
      if (!this.BMap || !this.map || !this.community.longitude || !this.community.latitude) {
        return
      }

      // 结合timer避免频繁渲染地图
      if (this.settingZoom) {
        return
      }

      this.settingZoom = true

      // 拖动marker时，中心点未变，但marker不在中心，需要通过临时变更中心点坐标等待一段时间后再恢复让marker回到中心，同时利用timer收敛地图渲染
      // 此处注意经纬度都必须为浮点数而非字符串
      // console.log(this.mapCenter.lng, this.mapCenter.lat, typeof this.mapCenter.lat)
      // console.log(this.community.longitude, this.community.latitude, typeof this.community.latitude)
      if (this.mapCenter.lng === this.community.longitude &&
        this.mapCenter.lat === this.community.latitude) {
        this.mapCenter.lat = this.community.latitude + 0.00000001
      }

      // 利用timer收敛地图渲染
      setTimeout(() => {
        this.mapCenter.lng = this.community.longitude
        this.mapCenter.lat = this.community.latitude
        this.mapZoom = 17
        this.settingZoom = false
      }, 200)
    },
    setCommunityLocation({ type, target, point, pixel, overlay }) {
      if (this.canModify) {
        this.$confirm('修改小区经纬度？', '确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
          this.community.longitude = point.lng
          this.community.latitude = point.lat
          this.resetMap()
        }).catch(() => {
          this.resetMap()
          this.$message({ type: 'info', message: '已取消设置经纬度!' })
        })
      }
    },
    setModifyStatus() {
      this.canModify = !this.canModify
    },

    updateInBoundsGwList() {
      var inBoundsGwList = []
      if (this.gatewayList && this.community) {
        this.gatewayList.forEach(element => {
          const { distance, isInBound } = this.isPointInBounds(element, this.community, 600)
          if (isInBound) {
            element.distance = distance
            inBoundsGwList.push(element)
          }
        })
      }
      this.inBoundsGwList = inBoundsGwList
    },

    // 提交修改
    onSubmitCommunityInfo() {
      if (!this.community) {
        return
      }

      setCommunityGpsAndDesc(this.community.boroughId, this.community.longitude, this.community.latitude, this.community.remark).then(res => {
        this.$message({ message: '提交成功', type: 'success' })
        this.canModify = false

        // 提交成功后同步修改本地记录
        for (var i = 0; i < this.communityList.length; i++) {
          if (this.communityList[i].boroughId === this.community.boroughId) {
            this.communityList[i].longitude = this.community.longitude
            this.communityList[i].latitude = this.community.latitude
            this.communityList[i].remark = this.community.remark
            this.updateInBoundsGwList()
          }
        }
      }).catch(error => {
        this.$message.error(error)
      })
    },

    // 取消修改小区信息
    onCancelCommunityInfo() {
      this.handleSelectCommunity(this.boroughId)
    },

    // 选择小区事件
    handleSelectCommunity(id) {
      var index = 0

      if (!this.communityList || id === null) {
        return
      }

      // 根据id从本地缓存中查找小区信息
      for (index = 0; index < this.communityList.length; index++) {
        if (this.communityList[index].boroughId === id) {
          this.community = Object.assign({}, this.communityList[index]) // 深拷贝
          this.inputName = this.communityList[index].boroughName
          break
        }
      }
      if (index >= this.communityList.length) {
        this.$message.error('未找到该小区!')
        return
      }

      // 禁用修改，重置地图
      this.canModify = false
      this.searchKeyword = ''
      this.resetMap()

      if (this.boroughId === id) {
        return
      }

      // 切换小区，重置参数
      this.boroughId = id
      this.missedMeterByMeterNo = null
      this.missedMeterByMeterSummary = null
      this.abnormalList = null

      // 更新周边网关信息
      this.updateInBoundsGwList()

      // 获取小区抄通率详细信息
      this.loadingMeterRateData = true
      getSingeCommunityDetailInfo(this.inputName).then(response => {
        // 填充未抄通表号到missedMeterByMeterNo中
        var temObj = []
        var tempSummary = [0] // 0,合计，1~7依次为每天没抄通个数
        this.dateArray.forEach((d, dIndex) => {
          tempSummary.push(response.data[0][d].notThroughMeterNoList.length)
          response.data[0][d].notThroughMeterNoList.forEach(m => {
            if (typeof temObj[m] === 'undefined') {
              temObj[m] = { meterNo: m, map: [0, 0, 0, 0, 0, 0, 0], total: 0 }
            }
            temObj[m].map[dIndex] = 1
            temObj[m].total++
          })
        })
        var tempList = []
        for (const meterNo in temObj) {
          tempList.push(temObj[meterNo])
        }

        // 求总的没抄通次数
        tempSummary.forEach(v => {
          tempSummary[0] += v
        })

        this.missedMeterByMeterNo = tempList
        this.missedMeterByMeterSummary = tempSummary

        // 更新用户数量数据
        this.community.sevenThrough = response.data[0].sevenThrough
        this.community.sevenThroughRate = response.data[0].sevenThroughRate
        this.community.totalValidMeternoNum = response.data[0].totalValidMeternoNum
        this.community.totalCardNum = response.data[0].totalCardNum
        this.community.meternoIsZero = response.data[0].meternoIsZero
        this.community.totalMeter = response.data[0].totalMeter
        this.setMeterNumStatisticOptions(this.community)
        this.setMeterRateOptions(this.community)

        console.log(response.data[0])
        console.log(index, this.community, this.communityList[index], this.missedMeterByMeterNo)

        // Just to simulate the time of the request
        setTimeout(() => {
          this.loadingMeterRateData = false
        }, 0.1 * 1000)
      }).catch(error => {
        this.$message.error('获取小区抄通率详情失败，' + error)
        console.log('获取小区抄通率详情失败，' + error)
        this.loadingMeterRateData = false
      })

      this.handleFilter()
    },

    // 查看前一个小区
    showPrevCommunity() {
      var id = null
      if (this.boroughId === 1) {
        id = this.communityList[this.communityList.length - 1].boroughId
      } else {
        for (var index = 0; index < this.communityList.length; index++) {
          if (this.communityList[index].boroughId >= this.boroughId) {
            id = this.communityList[index - 1].boroughId
            break
          }
        }
      }
      this.handleSelectCommunity(id)
    },

    // 查看后一个小区
    showNextCommunity() {
      var id = null
      if (this.boroughId === this.communityList[this.communityList.length - 1].boroughId) {
        id = 1
      } else {
        for (var index = 0; index < this.communityList.length; index++) {
          if (this.communityList[index].boroughId >= this.boroughId) {
            id = this.communityList[index + 1].boroughId
            break
          }
        }
      }
      this.handleSelectCommunity(id)
    },

    // 点击网关图标事件
    onClickGwEntity(event, index) {
      this.gwInfoWindow = Object.assign({}, this.inBoundsGwList[index]) // 深拷贝
      this.gwInfoWindow.show = true
      console.log(this.gwInfoWindow)
    },
    // 网关详情窗口打开事件
    onGwInIfoWindowOpen(e) {
      this.gwInfoWindow.show = true
    },
    // 关闭网关图标事件
    onGwInIfoWindowClose(e) {
      this.gwInfoWindow = []
    },

    // 小区用户数量柱状图配置
    setMeterNumStatisticOptions(community) {
      // dom不存在时不初始化
      if (!this.$refs.meterNumStatisticDiv) {
        return
      }

      // 不要重复初始化
      let chart = echarts.getInstanceByDom(this.$refs.meterNumStatisticDiv)
      if (chart) {
        echarts.dispose(chart)
        chart = null
      }

      chart = echarts.init(this.$refs.meterNumStatisticDiv, 'light')

      // 释放echarts对象，避免内存泄漏
      this.$once('hook:beforeDestroy', function() {
        echarts.dispose(chart)
      })

      // 值很小（例如1000户里有1户没表）时几乎不显示，需要补偿
      var num = Math.round(community.totalCardNum * 0.02)
      var legendData = ['表号正常', '表号为零', '表号为空']
      var color = ['#34bfa3', '#36a3f7', '#f4516c']
      var oriSerialData = [community.totalValidMeternoNum, community.meternoIsZero, community.totalCardNum - community.totalMeter]
      var compensateVal = oriSerialData.map(v => { return v ? num : 0 })
      var xAxisMax = community.totalCardNum + compensateVal[0] + compensateVal[1] + compensateVal[2]
      var selected = { '表号正常': (oriSerialData[0] !== 0), '表号为零': (oriSerialData[1] !== 0), '表号为空': (oriSerialData[2] !== 0) }
      var formatterStr = community.boroughName + '<br>' +
                         '<span style="font-size:22px;color:' + color[0] + ';"> ● </span>表号正常: ' + oriSerialData[0] + '<br>' +
                         '<span style="font-size:22px;color:' + color[1] + ';"> ● </span>表号为零: ' + oriSerialData[1] + '<br>' +
                         '<span style="font-size:22px;color:' + color[2] + ';"> ● </span>表号为空: ' + oriSerialData[2]

      var option = {
        color: color,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'none'
          },
          formatter: function(params) {
            return formatterStr
          }
        },
        legend: {
          data: legendData,
          selected: selected
        },
        grid: {
          top: 25,
          x: 0,
          y: 0,
          x2: 0,
          y2: 0,
          height: 40
        },
        xAxis: {
          show: false,
          max: xAxisMax
        },
        yAxis: {
          data: [community.boroughName + '用户概况'],
          axisLine: {
            show: false
          }
        },
        series: [
          {
            name: '表号正常',
            type: 'bar',
            stack: '总量',
            label: {
              show: true,
              position: 'inside',
              formatter: function(params) {
                return oriSerialData[0]
              }
            },
            data: [compensateVal[0] + oriSerialData[0]]
          },
          {
            name: '表号为零',
            type: 'bar',
            stack: '总量',
            label: {
              show: true,
              position: 'inside',
              formatter: function(params) {
                return oriSerialData[1]
              }
            },
            data: [compensateVal[1] + oriSerialData[1]]
          },
          {
            name: '表号为空',
            type: 'bar',
            stack: '总量',
            label: {
              show: true,
              position: 'inside',
              formatter: function(params) {
                return oriSerialData[2]
              }
            },
            data: [compensateVal[2] + oriSerialData[2]]
          }
        ]
      }
      chart.setOption(option)
    },

    setMeterRateOptions(community) {
      // dom不存在时不初始化
      if (!this.$refs.meterRateDiv) {
        return
      }

      // 不要重复初始化
      let chart = echarts.getInstanceByDom(this.$refs.meterRateDiv)
      if (chart) {
        echarts.dispose(chart)
        chart = null
      }

      chart = echarts.init(this.$refs.meterRateDiv, 'light')

      // 释放echarts对象，避免内存泄漏
      this.$once('hook:beforeDestroy', function() {
        echarts.dispose(chart)
      })

      var xAxisData = []
      var data0 = []
      var data1 = []
      var data2 = []
      this.dateArray.forEach(d => {
        xAxisData.push(d.substr(5, 5))
        data0.push(community[d].through)
        data1.push(Math.round(community[d].throughRate * 10000) / 100)
        data2.push(Math.round(community.sevenThroughRate * 10000) / 100)
      })

      var option = {
        xAxis: {
          data: xAxisData,
          boundaryGap: false,
          axisTick: {
            show: false
          }
        },
        grid: {
          left: 10,
          right: 20,
          bottom: 20,
          top: 30,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          formatter: function(params) {
            return community.boroughName + ' ' + params[0].axisValue + '<br>' +
                   params[0].marker + params[0].seriesName + ': ' + data0[params[0].dataIndex] + ' (' + params[0].value + '%)<br>' +
                   params[1].marker + params[1].seriesName + ': ' + community.sevenThrough + ' (' + params[1].value + '%)<br>'
          }
        },
        yAxis: [
          {
            axisTick: {
              show: false
            },
            max: 100,
            interval: 20
          }
        ],
        legend: {
          data: ['单日抄通', '七日抄通']
        },

        series: [{
          name: '单日抄通',
          itemStyle: {
            normal: {
              color: '#40c9c6',
              lineStyle: {
                color: '#40c9c6',
                width: 2
              },
              areaStyle: {
                color: '#40c9c6'
              }
            }
          },
          smooth: true,
          type: 'line',
          data: data1,
          animationDuration: 2800,
          animationEasing: 'cubicInOut'
        },
        {
          name: '七日抄通',
          itemStyle: {
            normal: {
              color: '#36a3f7',
              lineStyle: {
                color: '#36a3f7',
                width: 2
              }
            }
          },
          showSymbol: false,
          smooth: true,
          type: 'line',
          data: data2,
          animationDuration: 100,
          animationEasing: 'quadraticOut'
        }]
      }
      chart.setOption(option)
    },

    getMissedMeterSummaries() {
      return ['合计', '', ...this.missedMeterByMeterSummary]
    },

    handleFilter() {
      console.log(this.listQuery)
      // 获取故障统计
      this.loadingAbnormalList = true
      getCommunityAbnormalInfo(this.boroughId, this.listQuery).then(response => {
        this.abnormalList = response.data
        console.log(this.abnormalList)
        // Just to simulate the time of the request
        setTimeout(() => {
          this.loadingAbnormalList = false
        }, 0.1 * 1000)
      }).catch(error => {
        this.loadingAbnormalList = false
        this.$message.error('获取小区故障列表失败，' + error)
        console.log('获取小区故障列表失败，' + error)
      })
    }
  }
}
</script>

<style lang="scss" >
.box-card-component{
  .el-card__header {
    padding: 0px!important;
  }
}

.anchorBL{
  display:none;
}

.BMap_scaleTxt{
  color:lightgray !important;
  text-align: center;
  width: 100%;
  cursor: default;
  line-height: 18px;
}

</style>
