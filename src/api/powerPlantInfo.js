import request from '@/utils/request'

export function getPowerPlantCurHeatNum() {
  return request({
    url: '/meter/queryDCHearNum',
    method: 'post'
  })
}

export function getPowerPlantHeatNumHis() {
  var timeBase = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
  var startTime = new Date(timeBase).toLocaleString('chinese', { hour12: false })
  var endTime = new Date(timeBase + 86400000 - 1).toLocaleString('chinese', { hour12: false })
  return request({
    url: '/meter/powerIncrement?startDate=' + startTime + '&endDate=' + endTime,
    method: 'post'
  })
}

