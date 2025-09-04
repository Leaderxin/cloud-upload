import Vue from 'vue'
import App from '@/App.vue'

//import '@/assets/css/main.css'

Vue.config.productionTip = false
Vue.config.devtools = true

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
})
