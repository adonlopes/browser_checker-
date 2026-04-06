import axios from 'axios'

const API_BASE = '/api'

export const api = {
  /**
   * Start a new cross-browser test.
   * @param {string} url
   * @param {string[]} browsers
   */
  runTest: (url, browsers) =>
    axios.post(`${API_BASE}/run-test`, { url, browsers }).then(r => r.data),

  /**
   * Poll for test results by ID.
   * @param {string} testId
   */
  getResults: (testId) =>
    axios.get(`${API_BASE}/results/${testId}`).then(r => r.data),

  /**
   * Get all past tests.
   */
  listTests: () =>
    axios.get(`${API_BASE}/tests`).then(r => r.data),
}
