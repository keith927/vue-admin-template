import request from '@/utils/request'

export function getPowerPlantCurHeatNum() {
  return request({
    url: '/meter/queryDCHearNum',
    method: 'post'
  })
}

export function getPowerPlantHeatNumHis() {
  var timeBase = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
  var startTime = new Date(timeBase + 28800000).toJSON().substr(0, 19).replace('T', ' ').replace(/-/g, '/')
  var endTime = new Date(timeBase + 86400000 + 28800000 - 1).toJSON().substr(0, 19).replace('T', ' ').replace(/-/g, '/')

  return request({
    url: '/meter/powerIncrement?startDate=' + startTime + '&endDate=' + endTime,
    method: 'post'
  })
}

