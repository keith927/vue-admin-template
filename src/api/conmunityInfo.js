import request from '@/utils/request'

export function getCommunityInfo() {
  return request({
    url: '/meter/borough/gps',
    method: 'post'
  })
}

export function getCommunityDetailInfo() {
  var timeBase = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
  var startTime = new Date(timeBase - 7 * 86400000).toLocaleString('chinese', { hour12: false })
  var endTime = new Date(timeBase - 1).toLocaleString('chinese', { hour12: false })

  return request({
    url: '/through/DetailOfThrough?startDate=' + startTime + '&endDate=' + endTime,
    method: 'post'
  })
}

export function getSingeCommunityDetailInfo(name) {
  var timeBase = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
  var startTime = new Date(timeBase - 7 * 86400000).toLocaleString('chinese', { hour12: false })
  var endTime = new Date(timeBase - 1).toLocaleString('chinese', { hour12: false })

  return request({
    url: '/through/DetailOfThrough?startDate=' + startTime + '&endDate=' + endTime + '&boroughName=' + name,
    method: 'post'
  })
}

export function getCommunityHeatUsageHis(communityId) {
  var timeBase = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
  var startTime = new Date(timeBase - 7 * 86400000).toLocaleString('chinese', { hour12: false })
  var endTime = new Date(timeBase - 1).toLocaleString('chinese', { hour12: false })

  return request({
    url: '/meter/boroughHeatNum?boroughId=' + communityId + '&startDate=' + startTime + '&endDate=' + endTime,
    method: 'post'
  })
}

export function setCommunityGpsAndDesc(id, lng, lat, desc) {
  var data = [{
    'boroughId': id,
    'latitude': lat,
    'longitude': lng,
    'remark': desc
  }]
  return request({
    url: '/through/batchModifyBoroughGpsAndRemark',
    method: 'post',
    data
  })
}
