export const state = () => ({
  preferAudio: false
})

export const mutations = {
  setPreferAudio(state, payload) {
    state.preferAudio = payload
    localStorage.setItem('preferAudio', payload)
  },
  loadPreferAudioFromStorage(state) {
    state.preferAudio = !!JSON.parse(localStorage.getItem('preferAudio'))
  }
}
