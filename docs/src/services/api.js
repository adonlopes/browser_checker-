import axios from 'axios'

const API_BASE = 'https://allbrow.onrender.com'

export const api = {
  runTest: (url, browsers) =>
    axios.post(`${API_BASE}/run-test`, { url, browsers }).then(r => r.data),

  getResults: (testId) =>
    axios.get(`${API_BASE}/results/${testId}`).then(r => r.data),

  listTests: () =>
    axios.get(`${API_BASE}/tests`).then(r => r.data),
}