/**
 * Created by cRazy on 2016/6/18.
 */
Ext.define('Cxt.util.Window', function () {
    var me; // holds our singleton instance

    return {
        singleton: true,

        constructor: function () {
            me = this; // we are a singleton, so cache our this pointer in scope
        },

        //关闭当前标签页
        close: function () {
            window.top.close();
        },

        //设置当前浏览器标签页标题
        setTitle: function (title) {
            window.top.document.title = title || "HEADING® CRE™";
        },

        /**
         * 浏览器后退
         */
        back: function () {
            if (window.top.history.length == 1)
                return false;
            window.top.history.go(-1);// 后退
        },

        parseModuleId: function (url) {
            if (!url)
                return;

            url = decodeURIComponent(url);
            return url.indexOf('#') >= 0 && url.indexOf('?') >= 0 ? url.substring(url.indexOf('#') + 1, url.indexOf('?')) : '';
        },

        parseParams: function (url) {
            var params = {},
                index;

            if (!url)
                return params;

            url = decodeURIComponent(url);
            index = url.indexOf('?');
            if (index < 0) {
                return params;
            }
            return Ext.Object.fromQueryString(url.substring(index + 1));
        },

        /**
         * 打开新标签
         */
        open: function (url, params) {
            if (Ext.isEmpty(url)) {
                Ext.raise("You must specify a url config.");
            }
            if (!!params) {
                var list = url.split('?');
                list[1] = list[1] ? list[1] + '&' + Ext.Object.toQueryString(params) : Ext.Object.toQueryString(params);
                url = list.join('?');
            }

            window.open(url);
        },

        /**
         * 当前标签打开
         */
        navigate: function (url, params) {
            if (Ext.isEmpty(url)) {
                Ext.raise("You must specify a url config.");
            }
            if (!!params) {
                var list = url.split('?');
                list[1] = list[1] ? list[1] + '&' + Ext.Object.toQueryString(params) : Ext.Object.toQueryString(params);
                url = list.join('?');
            }

            window.location.href = url;
        },

        /**
         * 提供给view使用。控制器应仍然使用基类提供的方法。
         *
         * Update the hash. By default, it will not execute the routes if the current token and the
         * token passed are the same.
         *
         * @param {String/Ext.data.Model} token The token to redirect to.  Can be either a String
         * or a {@link Ext.data.Model Model} instance - if a Model instance is passed it will
         * internally be converted into a String token by calling the Model's
         * {@link Ext.data.Model#toUrl toUrl} function.
         *
         * @param {Boolean} force Force the update of the hash regardless of the current token.
         *
         * @return {Boolean} Will return `true` if the token was updated.
         */
        redirectTo: function (token, force) {
            if (token.isModel) {
                token = token.toUrl();
            }
            if (!force) {
                var currentToken = Ext.util.History.getToken();

                if (currentToken === token) {
                    return false;
                }
            } else {
                Ext.app.route.Router.onStateChange(token);
            }

            Ext.util.History.add(token);

            return true;
        },

        moduleRedirectTo: function (moduleId, node, params, force) {
            params = Ext.apply({}, params, {
                node: node,
                jsessionid: Ext.util.Format.date(new Date(), 'YmdHisu')
            });
            return me.redirectTo(moduleId + '?' + Ext.Object.toQueryString(params), force);
        },

        moduleOpen: function (moduleId, node, params) {
            params = Ext.apply({}, params, {
                node: node,
                jsessionid: Ext.util.Format.date(new Date(), 'YmdHisu')
            });
            return me.open(window.location.origin + window.location.pathname + '#' + moduleId + '?' + Ext.Object.toQueryString(params));
        },


        // 设置指定url中param的值，返回处理后的url
        setUrlParam: function (url, param, value) {
            var newUrl = '';
            var reg = new RegExp('(^|)' + param + '=([^&]*)(|$)');
            var tmp = param + '=' + value;
            if (url.match(reg) !== null) {
                newUrl = url.replace(reg, tmp);
            } else {
                if (url.match('[\?]')) {
                    newUrl = url + '&' + tmp;
                } else {
                    newUrl = url + '?' + tmp;
                }
            }
            return newUrl;
        },

        // 设置当前窗口url中param的值
        setParam: function (param, value) {
            location.href = this.setUrlParam(location.href, param, value);
        },

        // 设置当前窗口url中param的值
        setParamNoRefresh: function (param, value) {
            var url = me.setUrlParam(location.href, param, value);
            history.replaceState('tabChanged', '', url);
        }
    }
});