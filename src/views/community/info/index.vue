<template>
  <div class="app-container">
    <el-tabs v-model="activeName" @tab-click="handleTabClick">
      <el-tab-pane label="基本信息" name="summary">

        <el-row>
          <el-card class="box-card">
            <div style="margin-bottom:50px;">
              <el-form label-width="80px">

                <el-form-item label="小区名称">
                  <el-col :xs="{span: 24}" :sm="{span: 6}" :md="{span: 5}" :lg="{span: 4}" :xl="{span: 4}">
                    <el-autocomplete
                      ref="input"
                      v-model="inputName"
                      :fetch-suggestions="nameSuggestions"
                      :select-when-unmatched="true"
                      class="filter-item"
                      clearable
                      placeholder="请输入小区名"
                      style="margin-right:30px;width:100%"
                      @select="handleInputName"
                    />
                  </el-col>
                </el-form-item>

                <el-form-item v-if="community" label="用户量">
                  <el-col :xs="{span: 24}" :sm="{span: 6}" :md="{span: 5}" :lg="{span: 4}" :xl="{span: 4}">
                    <el-input v-model="community.totalMeter" :disabled="true" />
                  </el-col>
                </el-form-item>

                <el-form-item v-if="community" label="地理位置" style="height:605px;">
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

                  <el-col :span="24" style="margin-bottom:15px;">
                    <el-col :xs="{span: 24}" :sm="{span: 6}" :md="{span: 5}" :lg="{span: 4}" :xl="{span: 4}">
                      <el-tooltip class="item" effect="dark" content="搜索地图" placement="top-start">
                        <el-input v-model="searchKeyword" placeholder="请输入地图搜索条件" clearable :disabled="!canModify">
                          <i slot="prefix" class="el-input__icon el-icon-search" />
                        </el-input>
                      </el-tooltip>
                    </el-col>
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

      <el-tab-pane label="抄通情况" name="meter">计量数据</el-tab-pane>
      <el-tab-pane label="故障统计" name="stastics">故障统计</el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import { getCommunityDetailInfo, setCommunityGpsAndDesc } from '@/api/conmunityInfo'

export default {
  name: 'CommunityInfo',
  directives: { waves },

  data() {
    return {
      activeName: 'summary',

      inputName: '',
      map: '',
      BMap: null,
      communityList: null,
      community: null,
      canModify: false,
      searchKeyword: '',
      settingZoom: false,
      mapCenter: { lng: '114.3150', lat: '34.8012' },
      mapZoom: 17
    }
  },
  watch: {
    boroughId: {
      handler(val) {
        this.updateCommunityInfo()
      }
    },
    communityList: {
      deep: true,
      handler: function(val) {
        this.updateCommunityInfo()
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
    }
  },
  created() {
    getCommunityDetailInfo().then(response => {
      this.communityList = response.data
    })

    if (typeof this.$route.query.boroughId === 'string') {
      this.boroughId = this.$route.query.boroughId
    }

    this.updateCommunityInfo()
  },

  methods: {
    handleTabClick(tab, event) {
      console.log(tab, event)
    },
    onMapReady({ BMap, map }) {
      this.map = map
      this.BMap = BMap
      map.setMapStyle({ style: 'midnight' })

      if (this.community) {
        this.resetMap()
      } else {
        map.centerAndZoom('开封', 15)
      }
    },
    onMapResize() {
      this.resetMap()
    },
    resetMap() {
      if (!this.BMap || !this.map || !this.community.longitude || !this.community.latitude) {
        return
      }

      if (this.settingZoom) {
        return
      }
      this.settingZoom = true

      // console.log(this.mapCenter.lng, this.mapCenter.lat, typeof this.mapCenter.lat)
      // console.log(this.community.longitude, this.community.latitude, typeof this.community.latitude)

      // 拖动marker时，中心点未变，但marker不在中心，需要通过临时变更中心点坐标再恢复让marker回到中心
      // 此处注意经纬度都必须为浮点数而非字符串
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
      }, 100)
    },
    setCommunityLocation({ type, target, point, pixel, overlay }) {
      if (this.canModify) {
        this.$confirm('修改小区经纬度？', '确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
          this.community.longitude = point.lng
          this.community.latitude = point.lat
          this.resetMap()
          this.$message({ type: 'success', message: '已设置小区经纬度!' })
        }).catch(() => {
          this.resetMap()
          this.$message({ type: 'info', message: '已取消设置经纬度!' })
        })
      }
    },
    updateCommunityInfo() {
      if (!this.communityList || !this.boroughId) {
        return
      }
      for (var i = 0; i < this.communityList.length; i++) {
        if (this.communityList[i].boroughId === this.boroughId) {
          this.community = Object.assign({}, this.communityList[i]) // 深拷贝
          console.log('found community', this.community)
        }
      }
    },
    setModifyStatus() {
      this.canModify = !this.canModify
    },
    onSubmitCommunityInfo() {
      if (!this.community) {
        return
      }
      setCommunityGpsAndDesc(this.community.boroughId, this.community.longitude, this.community.latitude, this.community.remark).then(res => {
        this.$message({ message: '提交成功', type: 'success' })
        this.canModify = false
      }).catch(error => {
        this.$message.error(error)
      })
    },
    onCancelCommunityInfo() {
      this.updateCommunityInfo()
      this.canModify = false
      this.searchKeyword = ''
      this.resetMap()
    },
    nameSuggestions(queryString, callback) {
      var suggestions = []
      queryString = typeof queryString === 'string' ? queryString.trim() : ''

      if (this.communityList) {
        for (var i = 0; i < this.communityList.length; i++) {
          if (this.communityList[i].boroughName.indexOf(queryString) >= 0) {
            suggestions.push({ id: this.communityList[i].boroughId, value: this.communityList[i].boroughName })
          }
        }
      } else {
        this.$message.error('未获取到小区信息')
      }

      callback(suggestions)
    },
    handleInputName(item) {
      this.boroughId = item.id
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
