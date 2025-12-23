const state = {
  dateRange: []
}

const mutations = {
  SET_DATE_RANGE(state, dateRange) {
    state.dateRange = dateRange
  }
}

const actions = {
  setDateRange({ commit }, dateRange) {
    commit('SET_DATE_RANGE', dateRange)
  }
}

const getters = {
  dateRange: state => state.dateRange
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
} 