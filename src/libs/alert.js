const Vue = require('vue');
const $ = require('webpack-zepto');
export default {
  install() {
    let timer = null;
    Vue.prototype.$alert = (msg) => {
      $('alertweek').remove();
      let $alert = ('<div class="weekalert" id="alertweek"> </div>');
      $('body').append($alert);
      $alert.html(msg);
      $alert.addClass('alert-show');
      clearTimeout(timer);
      timer = setTimeout(() => {
        $alert.remove();
      }, 2000);
    };
  }
};
