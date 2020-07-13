<template>
  <el-row :gutter="40" class="panel-group">
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="fetchData('heatNum')">
        <div class="card-panel-icon-wrapper icon-power-plant-cur-num">
          <svg-icon icon-class="power-plant" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            电厂实时读数
          </div>
          <count-to :start-val="0" :end-val="powerPlatnInfo.curHeatNum" :duration="2600" class="card-panel-num" />
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="fetchData('powerPlantHeatUsage')">
        <div class="card-panel-icon-wrapper icon-water-temp">
          <svg-icon icon-class="water-temp" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            电厂出水温度
          </div>
          <count-to :start-val="0" :end-val="powerPlatnInfo.supplyTemp" :duration="1000" class="card-panel-num" />
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="fetchData('heatExchangeHeatUsage')">
        <div class="card-panel-icon-wrapper icon-heat-num">
          <svg-icon icon-class="heat-num" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            电厂今日用量
          </div>
          <count-to :start-val="0" :end-val="powerPlatnInfo.todayHeatNum" :duration="2200" class="card-panel-num" />
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="fetchData('heatExchangeHeatUsage')">
        <div class="card-panel-icon-wrapper icon-heat-exchange">
          <svg-icon icon-class="heat-exchange" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            换热站今日用量
          </div>
          <count-to :start-val="0" :end-val="powerPlatnInfo.todayHeatExcHeatNum" :duration="2000" class="card-panel-num" />
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'
import { getPowerPlantCurHeatNum } from '@/api/powerPlantInfo.js'

export default {
  components: {
    CountTo
  },
  data() {
    return {
      powerPlatnInfo: { curHeatNum: 0, todayHeatNum: 0, todayHeatExcHeatNum: 0, temp: 0 }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData(type) {
      this.$emit('handleSetLineChartData', type)
      getPowerPlantCurHeatNum().then(response => {
        const { dcheatnum, dcgrow, hrzgrow, dc_Supplytemp } = response.data
        this.powerPlatnInfo = { curHeatNum: parseInt(dcheatnum), todayHeatNum: parseInt(dcgrow), todayHeatExcHeatNum: parseInt(hrzgrow), supplyTemp: Math.round(dc_Supplytemp) }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-power-plant-cur-num {
        background: #40c9c6;
      }

      .icon-water-temp {
        background: #f4516c;
      }

      .icon-heat-num {
        background: #36a3f7;
      }

      .icon-heat-exchange {
        background: #34bfa3
      }
    }

    .icon-power-plant-cur-num {
      color: #40c9c6;
    }

    .icon-water-temp {
      color: #f4516c;
    }

    .icon-heat-num {
      color: #36a3f7;
    }

    .icon-heat-exchange {
      color: #34bfa3
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width:550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
