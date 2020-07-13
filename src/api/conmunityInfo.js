import request from '@/utils/request'

export function getCommunityInfo() {
  return request({
    url: '/meter/borough/gps',
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

