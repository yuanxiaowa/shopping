/**
 * @returns {import('vue').VueConstructor}
 */
function getVue() {
  return Vue
}
var _Vue = getVue()
new _Vue({
  el: '#app',
  data:{
      tab: 'taobao'
    }
})