/**
 * LoadMark遮罩优化处理，主要为避免多次实例化LoadMark造成内存浪费
 * Created by cRazy on 2016/7/18.
 */
Ext.define('Cxt.util.LoadMask', function () {
    var me; // holds our singleton instance

    var mark;

    return {
        singleton: true,
        loadingText: '正在加载...',

        constructor: function () {
            me = this; // we are a singleton, so cache our this pointer in scope
        },

        isDisabled: function () {
            return me.disabled;
        },

        disable: function () {
            me.disabled = true;
        },

        enable: function () {
            me.disabled = false;
        },

        initMark: function (target) {
            if (!!mark)
                return;

            if (Ext.isEmpty(target)) {
                Ext.raise("You must specify a target config.");
            }
            mark = new Ext.LoadMask({
                msg: me.loadingText,
                target: target
            });
        },

        /**
         * 显示遮罩，如果fun不为空，则不需要手动关闭遮罩。
         *
         * @param {String} html
         *          显示的文字，可以包含HTML标记，默认为{@link #loadingText}
         * upon Component resize, and the message box will be kept centered.
         * @param fun 遮罩期间需要执行的逻辑
         * @param delay 延时时长，单位毫秒
         * @param autoHide 是否自动隐藏遮罩
         */
        show: function (html, fun, delay, autoHide) {
            if (me.disabled)
                return;

            if (html) {
                mark.msg = html;
            } else {
                mark.msg = me.loadingText;
            }
            mark.show();
            if (Ext.isEmpty(fun) == false) {
                if (Ext.isEmpty(delay)) {
                    if (Ext.isFunction(fun)) {
                        fun();
                    }
                    if (autoHide === true) {
                        mark.hide();
                    }
                } else {
                    new Ext.util.DelayedTask(function () {
                        if (Ext.isFunction(fun)) {
                            fun();
                        }
                        if (autoHide === true) {
                            mark.hide();
                        }
                    }).delay(delay);
                }
            }
        },

        hide: function () {
            mark.hide();
        }
    }
});