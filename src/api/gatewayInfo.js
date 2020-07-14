import request from '@/utils/request'

export function getGatewayInfo() {
  return request({
    url: '/gateway/queryGatewayInfo',
    method: 'post'
  })
}
