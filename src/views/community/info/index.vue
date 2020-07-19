<template>
  <div class="app-container">
    <el-tabs v-model="activeName" @tab-click="handleTabClick">
      <el-tab-pane label="基本信息" name="summary">

        <el-row v-loading="dataLoading">
          <el-card class="box-card">
            <div style="margin-bottom:50px;">
              <el-form label-width="80px">

                <el-form-item label="小区名称">
                  <el-col :xs="{span: 24}" :sm="{span: 6}" :md="{span: 5}" :lg="{span: 4}" :xl="{span: 4}">
                    <el-select v-if="communityList" v-model="inputName" filterable placeholder="请选择小区" @change="handleSelectCommunity">
                      <el-option v-for="item in communityList" :key="item.boroughId" :label="item.boroughName" :value="item.boroughId" />
                    </el-select>
                  </el-col>
                </el-form-item>

                <el-form-item v-if="community" label="用户量">
                  <el-col :xs="{span: 24}" :sm="{span: 6}" :md="{span: 5}" :lg="{span: 4}" :xl="{span: 4}">
                    <el-input v-model="community.totalMeter" :disabled="true" />
                  </el-col>
                </el-form-item>

                <el-form-item v-if="community" label="地理位置" style="height:545px;">
                  <el-col :xs="{span: 24}" :sm="{span: 6}" :md="{span: 5}" :lg="{span: 4}" :xl="{span: 4}" style="margin-bottom:15px;">
                    <el-tooltip class="item" effect="dark" content="经度, 可双击地图或拖动图标修改" placement="top-start">
                      <el-input-number v-model="community.longitude" :precision="4" :step="0.0001" :disabled="!canModify" style="width:100%" />
                    </el-tooltip>
                  </el-col>
                  <el-col class="line" :xs="{span: 0}" :sm="{span: 1}" :md="{span: 1}" :lg="{span: 1}" :xl="{span: 1}" align="center">/</el-col>
                  <el-col :xs="{span: 24}" :sm="{span: 6}" :md="{span: 5}" :lg="{span: 4}" :xl="{span: 4}">
                    <el-tooltip class="item" effect="dark" content="纬度, 可双击地图或拖动图标修改" placement="top-start">
                      <el-input-number v-model="community.latitude" :precision="4" :step="0.0001" :disabled="!canModify" style="width:100%" />
                    </el-tooltip>
                  </el-col>

                  <el-col v-if="community" :span="24" style="margin-bottom:15px;">
                    <baidu-map
                      style="height:500px;"
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
                      <bm-map-type :map-types="['BMAP_NORMAL_MAP', 'BMAP_HYBRID_MAP']" anchor="BMAP_ANCHOR_TOP_RIGHT" />
                      <bm-scale anchor="BMAP_ANCHOR_BOTTOM_LEFT" />
                      <bm-control :offset="{width: 10, height: 10}">
                        <el-tooltip class="item" effect="dark" content="搜索地图" placement="top-start">
                          <el-input v-model="searchKeyword" placeholder="请输入地图搜索条件" clearable :disabled="!canModify">
                            <i slot="prefix" class="el-input__icon el-icon-search" />
                          </el-input>
                        </el-tooltip>
                      </bm-control>
                      <bm-marker v-if="map" :position="mapCenter" :dragging="canModify" @dragend="setCommunityLocation" />
                      <bm-local-search v-if="canModify" :keyword="searchKeyword" :auto-viewport="true" :panel="false" :select-first-result="true" location="开封" />
                    </baidu-map>
                  </el-col>

                </el-form-item>

                <el-form-item v-if="community" label="备注" style="margin-bottom:50px;">
                  <el-input v-model="community.remark" type="textarea" :rows="4" :disabled="!canModify" clearable />
                </el-form-item>

                <el-form-item v-if="community" align="center">
                  <el-button v-if="!canModify" icon="el-icon-edit" type="primary" @click="setModifyStatus">修改</el-button>
                  <el-button v-if="canModify" icon="el-icon-circle-check" type="success" @click="onSubmitCommunityInfo">提交</el-button>
                  <el-button icon="el-icon-refresh" type="warning" @click="onCancelCommunityInfo">取消</el-button>
                </el-form-item>

              </el-form>
            </div>
          </el-card>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="抄通情况" name="meter">

        <el-row v-loading="dataLoading">
          <el-card class="box-card">
            <div style="margin-bottom:50px;">
              <el-form label-width="80px">

                <el-form-item label="小区名称">
                  <el-col :xs="{span: 24}" :sm="{span: 6}" :md="{span: 5}" :lg="{span: 4}" :xl="{span: 4}">
                    <el-select v-if="communityList" v-model="inputName" filterable placeholder="请选择小区" @change="handleSelectCommunity">
                      <el-option v-for="item in communityList" :key="item.boroughId" :label="item.boroughName" :value="item.boroughId" />
                    </el-select>
                  </el-col>
                </el-form-item>

                <el-col v-if="community" :span="24" style="margin-bottom:15px;">
                  <baidu-map
                    style="height:450px;"
                    :center="mapCenter"
                    :zoom="mapZoom"
                    :max-zoom="18"
                    :min-zoom="8"
                    :map-click="false"
                    :double-click-zoom="false"
                    :dragging="false"
                    :scroll-wheel-zoom="false"
                    @ready="onMapReady"
                    @resize="onMapResize"
                  >
                    <bm-navigation anchor="BMAP_ANCHOR_TOP_LEFT" />
                    <bm-map-type :map-types="['BMAP_NORMAL_MAP', 'BMAP_HYBRID_MAP']" anchor="BMAP_ANCHOR_TOP_RIGHT" />
                    <bm-scale anchor="BMAP_ANCHOR_BOTTOM_LEFT" />
                    <bm-marker v-if="map" :position="mapCenter" :dragging="canModify" @dragend="setCommunityLocation" />

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
                    <bm-point-collection :points="inBoundsGwList" shape="BMAP_POINT_SHAPE_STAR" color="red" size="BMAP_POINT_SIZE_SMALL" />
                  </baidu-map>
                </el-col>

                <el-col v-if="community" :span="24" style="margin-bottom:15px;">
                  <template>
                    <el-col v-if="community" :span="24" style="margin-bottom:15px;">
                      <div ref="meterNumStatisticDiv" style="height:60px;width:100%" />
                    </el-col>
                  </template>
                </el-col>

                <el-col v-if="community" :span="24" style="margin-bottom:15px;">
                  <template>
                    <el-col v-if="community" :span="24" style="margin-bottom:15px;">
                      <div ref="meterRateDiv" style="height:450px;width:100%" />
                    </el-col>
                  </template>
                </el-col>

                <el-col v-if="community" :span="24" style="margin-bottom:15px;">
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
                </el-col>

              </el-form>
            </div>
          </el-card>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="故障统计" name="stastics">故障统计</el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import { getCommunityDetailInfo, setCommunityGpsAndDesc, getSingeCommunityDetailInfo } from '@/api/conmunityInfo'
import { getGatewayInfo } from '@/api/gatewayInfo'
import echarts from 'echarts'
import resize from '../../dashboard/admin/components/mixins/resize'

const startTimestamp = new Date(new Date().setHours(0, 0, 0, 0)).getTime() - 7 * 86400000

export default {
  name: 'CommunityInfo',
  directives: { waves },
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
      missedMeterByMeterSummary: null
    }
  },
  watch: {
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

    // 获取小区清单及概要信息
    getCommunityDetailInfo().then(response => {
      this.communityList = response.data.map(v => {
        v.longitude = parseFloat(v.longitude)
        v.latitude = parseFloat(v.latitude)
        v.boroughName = v.boroughName.trim()
        return v
      })
      this.communityList.sort(this.compare('boroughId', 'ascending'))
      this.dataLoading = false
    }).catch(error => {
      this.$message('获取小区信息失败，' + error)
      console.log('获取小区信息失败，' + error)
      this.dataLoading = false
    })

    // 获取网关清单
    getGatewayInfo().then(response => {
      this.gatewayList = response.data.list
    }).catch(error1 => {
      this.$message('获取网关信息失败，' + error1)
      console.log('获取网关信息失败，' + error1)
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

      // 更新周边网关信息
      this.updateInBoundsGwList()

      // 获取小区抄通率详细信息
      this.dataLoading = true
      getSingeCommunityDetailInfo(this.inputName).then(response => {
        this.dataLoading = false

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
      }).catch(error => {
        this.$message.error('获取小区抄通率详情失败，' + error)
        console.log('获取小区抄通率详情失败，' + error)
        this.dataLoading = false
      })
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
      var formatterStr = '用户概况<br>' +
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
          data: ['用户概况'],
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
        data1.push(community[d].throughRate * 100)
        data2.push(community.sevenThroughRate * 100)
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
            return params[0].axisValue + '<br>' +
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
</style>
