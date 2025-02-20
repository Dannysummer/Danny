import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://localhost:8088',
  withCredentials: true  // 允许发送 cookie
})

export default instance 