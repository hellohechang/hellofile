import SeleckPath from './SeleckPath.vue'
import { createApp } from 'vue'

function seleckPath(option, callback = () => { }) {
  let box = document.createElement('div')
  let app = createApp(SeleckPath, {
    ...option,
    close: () => {
      app.unmount(box)
      document.body.removeChild(box)
    },
    callback
  })
  document.body.appendChild(box)
  app.mount(box)
}

export default seleckPath