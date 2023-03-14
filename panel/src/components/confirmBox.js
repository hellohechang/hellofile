import ConfirmBox from './ConfirmBox.vue'
import { createApp } from 'vue'


function confirm(option, callback = () => { }) {
  let box = document.createElement('div')
  let app = createApp(ConfirmBox, {
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
export default confirm;