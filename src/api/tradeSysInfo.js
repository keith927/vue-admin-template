import request from '@/utils/request'

export function getDevList(query, filter) {
  return request({
    url: '/devlasteststate/condition',
    method: 'post',
    params: query,
    data: filter
  })
}

