<template>
    <div>
        <nv-head :page-type="getTitleStr(searchKey.tab)"
                ref="head"
                :fix-head="true"
                :need-add="true">
        </nv-head>
        <section id="page">
            <ul class="posts-list">
                <li v-for="item in topics" :key="item.id">
                    <router-link :to="{name:'topic',params:{id:item.id}}">
                    <h3 v-text="item.title"
                            :class="getTabInfo(item.tab, item.good, item.top, true)"
                            :title="getTabInfo(item.tab, item.good, item.top, false)">
                    </h3>
                    <div class="content">
                        <img class="avatar" :src="item.author.avatar_url" />
                        <div class="info">
                            <p>
                                <span class="name">
                                    {{item.author.loginname}}
                                </span>
                                <span class="status" v-if="item.reply_count > 0">
                                    <b>{{item.reply_count}}</b>
                                    /{{item.visit_count}}
                                </span>
                            </p>
                            <p>
                                <time>{{item.create_at | getLastTimeStr(true)}}</time>
                                <time>{{item.last_reply_at | getLastTimeStr(true)}}</time>
                            </p>
                        </div>
                    </div>
                    </router-link>
                </li>
            </ul>
        </section>
        <nv-top></nv-top>
    </div>
</template>

<script>
    const $ = require('webpack-zepto');
    const utils = require('../libs/utils.js');
    const nvHead = require('components/header.vue');
    const nvTop = require('components/backtotop.vue');

    export default {
        filters: {
            getLastTimeStr(time, isFromNow) {
                return utils.getLastTimeStr(time, isFromNow);
            }
        },
        data() {
            return {
                scroll: true,
                topics: [],
                index: {},
                searchKey: {
                    page: 1,
                    limit: 20,
                    tab: 'all',
                    mdrender: true
                },
                searchDataStr: ''
            };
        },
        mounted() {
            if (this.$route.query && this.$route.query.tab) {
                this.searchKey.tab = this.$route.query.tab;
            }
            if (window.window.sessionStorage.searchKey && window.window.sessionStorage.tab === this.searchKey.tab) {
                this.topics = JSON.parse(window.window.sessionStorage.topics);
                this.searchKey = JSON.parse(window.window.sessionStorage.searchKey);
                this.$nextTick(() => $(window).scrollTop(window.window.sessionStorage.scrollTop));
            } else {
                this.getTopics();
            }
            $(window).on('scroll', utils.throttle(this.getScrollData, 300, 1000));
        },
        beforeRouteLeave(to, from, next) {
            if (to.name === 'topic') {
                window.window.sessionStorage.scrollTop = $(window).scrollTop();
                window.window.sessionStorage.topics = JSON.stringify(this.topics);
                window.window.sessionStorage.searchKey = JSON.stringify(this.searchKey);
                window.window.sessionStorage.tab = from.query.tab || 'all';
            }
            $(window).off('scroll');
            next();
        },
        beforeRouteEnter(to, from, next) {
            if (from.name !== 'topic') {
                if (window.window.sessionStorage.tab) {
                    window.window.sessionStorage.removeItem('topics');
                    window.window.sessionStorage.removeItem('searchKey');
                    window.window.sessionStorage.removeItem('tab');
                }
            }
            next();
        },
        methods: {
            getTitleStr(tab) {
                let str = '';
                switch (tab) {
                    case 'share':
                        str = '分享';
                        break;
                    case 'ask':
                        str = '问答';
                        break;
                    case 'job':
                        str = '招聘';
                        break;
                    case 'good':
                        str = '精华';
                        break;
                    default:
                        str = '全部';
                        break;
                }
                return str;
            },
            getTabInfo(tab, good, top, isClass) {
                return utils.getTabInfo(tab, good, top, isClass);
            },
            getTopics() {
                let params = $.param(this.searchKey);
                $.get('https://cnodejs.org/api/v1/topics?' + params, (d) => {
                    this.scroll = true;
                    if (d && d.data) {
                        d.data.forEach(this.mergeTopics);
                    }
                });
            },
            mergeTopics(topic) {
                if (typeof this.index[topic.id] === 'number') {
                    const topicsIndex = this.index[topic.id];
                    this.topics[topicsIndex] = topic;
                } else {
                    this.index[topic.id] = this.topics.length;
                    this.topics.push(topic);
                }
            },
            getScrollData() {
                if (this.scroll) {
                    let totalheight = parseInt($(window).height(), 20) + parseInt($(window).scrollTop(), 20);
                    if ($(document).height() <= totalheight + 200) {
                        this.scroll = false;
                        this.searchKey.page += 1;
                        this.getTopics();
                    }
                }
            }
        },
        watch: {
            '$route' (to, from) {
                if (to.query && to.query.tab) {
                    this.searchKey.tab = to.query.tab;
                    this.topics = [];
                    this.index = {};
                }
                this.searchKey.page = 1;
                this.getTopics();
                this.$refs.head.show = false;
            }
        },
        components: {
            nvHead,
            nvTop
        }
    };
</script>
