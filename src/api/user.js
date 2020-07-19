import request from '@/utils/request'

export function login(data) {
  console.log(data, typeof data)
  return request({
    url: '/login?username=' + data.username + '&password=' + data.password,
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/refreshToken',
    method: 'post',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/vue-admin-template/user/logout',
    method: 'post'
  })
}
