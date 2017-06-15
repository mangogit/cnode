<template>
    <div>
      <nv-head page-type="主题"
               :show="showMenu"
               :fix-head="true"
               :need-add="true">
      </nv-head>
      <div id="page" :class="{'show-menu': showMenu}" v-if="topic.title">
        <h2 class="topic-title" v-text="topic.title"></h2>
        <section class="author-info">
          <img :src="topic.author.avatar_url" class="avatar">
          <div class="col">
            <span>{{ topic.author.loginname }}</span>
            <time>发布于:{{topic.create_at | getLastTimeStr(true)}}
            </time>
          </div>
          <div class="right">
            <span class="tag" :class="getTabInfo(topic.tab, topic.good, topic.top, true)" v-text="getTabInfo(topic.tab, topic.good, topic.top, false)"></span>
            <span class="name">{{topic.visit_count}}次浏览</span>
          </div>
        </section>
        <section class="topic-content markdown-body" v-html="topic.content">
        </section>
        <h3 class="topic_reply">
          <strong>{{topic.reply_count}}</strong>回复
        </h3>
        <section class="reply-list">
          <ul>
            <li v-for="item in topic.replies">
              <section class="user">
                <router-link :to="{name: 'user', params: {loginname: item.author.loginname}}">
                  <img :src="item.author.avatar_url" class="head">
                </router-link>
                <div class="info">
                  <span class="cl">
                    <span class="name" v-text="item.author.loginname">
                    </span>
                    <span class="name mt10">
                      发布于:{{item.create_at | getLastTimeStr(true)}}
                    </span>
                  </span>
                  <span class="cr">
                    <span class="iconfont icon" :class="{'uped': isUps(item.ups)}" @click="upReply(item)">&#xe608;</span>{{item.ups.length}}
                    <span class="iconfont icon" @click="addReply(item.id)">&#xe609;</span>
                  </span>
                </div>
              </section>
              <div class="reply-content" v-html="item.content"></div>
              <nv-reply :topic.sync="topic" :topic-id="topicId" :reply-id="item.id" :reply-to="item.author.loginname" :show.sync="curReplyId" @close="hideItemReply" v-if="userInfo.userId && curReplyId === item.id"></nv-reply>
              </nv-reply>
            </li>
          </ul>
        </section>
        <nv-top></nv-top>
        <nv-reply v-if="userInfo.userId" :topic="topic" :topic-id="topicId"></nv-reply>
      </div>
      <div class="no-data" v-if="noData">
        <i class="iconfont icon-empty">&#xe60a;</i>
        该话题不存在
      </div>
    </div>
</template>

<script>
    const $ = require('webpack-zepto');
    const utils = require('../libs/utils');
    const nvHead = require('components/header.vue');
    const nvTop = require('components/backtotop.vue');
    const nvReply = require('components/reply.vue');
    const { mapGetters } = require('vuex');
    export default {
      data() {
        return {
          showMenu: false,
          topic: {},
          noData: false,
          topicId: '',
          curReplyId: ''
        };
      },
      computed: {
        ...mapGetters({
          userInfo: 'getUserInfo'
        })
      },
      mounted() {
        this.showMenu = false;
        this.topicId = this.$route.params.id;
        $.get('https://cnodejs.org/api/v1/topic/' + this.topicId, (d) => {
          if (d && d.data) {
            this.topic = d.data;
            // console.log(this.topic);
          } else {
            this.noData = true;
          }
        });
      },
      methods: {
        getTabInfo(tab, good = false, top, isClass) {
          return utils.getTabInfo(tab, good, top, isClass);
        },
        getLastTimeStr(time, ago) {
          return utils.getLastTimeStr(time, ago);
        },
        isUps(ups) {
          return $.inArray(this.userInfo.userId, ups) >= 0;
        },
        addReply(id) {
          this.curReplyId = id;
          if (!this.userInfo.userId) {
            this.$router.push({
              name: 'login',
              params: {
                redirect: encodeURIComponent(this.$route.path)
              }
            });
          }
        },
        hideItemReply() {
          this.curReplyId = '';
        },
        upReply(item) {
          if (!this.userInfo.userId) {
            this.$router.push({
              name: 'login',
              path: {
                redirect: encodeURIComponent(this.$route.path)
              }
            });
          } else {
            $.ajax({
              type: 'POST',
              url: 'https://cnodejs.org/api/v1/reply/' + item.id + '/ups',
              data: {
                accesstoken: this.userInfo.token
              },
              datatype: 'json',
              success: (res) => {
                if (res.success) {
                  if (res.action === 'down') {
                    let index = $.inArray(this.userInfo.userId, item.ups);
                    item.ups.splice(index, 1);
                  } else {
                    item.ups.push(this.userInfo.userId);
                  }
                }
              },
              error: (res) => {
                let error = JSON.parse(res.responseText);
                this.$alert(error.error_msg);
                return false;
              }
            });
          }
        }
      },
      components: {
        nvHead,
        nvTop,
        nvReply
      }
    };
</script>

