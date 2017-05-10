import Vue from 'vue';
import VueRouter from 'vue-router';
import $ from 'webpack-zepto';
import routes from './routers';
import Alert from './libs/alert';
import store from './vuex/user';
import FastClick from 'fastclick';
import filters from './filters';
Vue.use(VueRouter);
Vue.use(Alert);

$.ajaxSettings.crossDomain = true;

Object.keys(filters).forEach(k => Vue.filter(k, filters[k]));

const router = new VueRouter({
  base: 'cnode/dist',
  mode: 'history',
  routes
});
FastClick.attach(document.body);

if (window.sessionStorage.user) {
  store.dispatch('setUserInfo', JSON.parse(window.sessionStorage.user));
}

router.beforeEach((to, from, next) => {
  $('html, body, #page').removeClass('scroll-hide');
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (store.state.userInfo.userId) {
      next();
    } else {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    }
  } else {
    next();
  }
});

new Vue({
  router,
  store
}).$mount('#app');
