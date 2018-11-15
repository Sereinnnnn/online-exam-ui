import request from '@/router/axios'

export function loginByUsername(username, password, code, randomStr) {
  const grant_type = 'password'
  const scope = 'server'
  return request({
    url: '/auth/oauth/token',
    headers: {
      'Authorization': 'Basic b25saW5lLWV4YW06b25saW5lLWV4YW0='
    },
    method: 'post',
    params: { username, password, randomStr, code, grant_type, scope }
  })
}

export function logout(accesstoken, refreshToken) {
  return request({
    url: '/auth/authentication/removeToken',
    method: 'post',
    params: { accesstoken, refreshToken }
  })
}

export function getUserInfo(token) {
  return request({
    url: '/admin/user/info',
    method: 'get'
  })
}