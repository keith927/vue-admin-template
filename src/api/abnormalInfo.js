import request from '@/utils/request'

export function getCommunityAbnormalInfo(id, filter) {
  const data = { boroughIdList: [id], buildIdList: [], centerIdList: [], roomIdList: [], unitIdList: [] }
  // const filter = { page: 1, size: null, templeteId: null, startDate: startTimeStr, endDate: endTimeStr, notThroughDays: null }

  return request({
    url: '/through/queryByErrorCondition',
    method: 'post',
    params: filter,
    data
  })
}
