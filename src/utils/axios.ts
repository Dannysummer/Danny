import axios from 'axios'
import { config } from '../config/index'

const instance = axios.create({
  baseURL: config.api.baseUrl,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true  // 允许发送 cookie
})

export default instance 