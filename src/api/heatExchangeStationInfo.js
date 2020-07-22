import request from '@/utils/request'

export function getDevList() {
  const query = { page: 0, size: 0 }
  return request({
    url: '/tag/hdb/newest',
    method: 'get',
    params: query
  })
}

export function getDevHisData(query, filter) {
  return request({
    url: '/tagHdbHistory/list',
    method: 'post',
    params: query,
    data: filter
  })
}

