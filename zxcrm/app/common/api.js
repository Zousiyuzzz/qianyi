import { http } from './http'

export function login (data) {
  return http.post('/sys/login', data)
}

export function phoneLogin (data) {
  return http.post('/sys/phoneLogin', data)
}

export function requestSmsCaptcha (data) {
  return http.post('/sys/sms', data)
}
