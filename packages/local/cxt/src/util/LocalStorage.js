/**
 * Created by cRazy on 2016/8/31.
 */
Ext.define('Cxt.util.LocalStorage', function () {
    var me; // holds our singleton instance
    var localStorage = window.localStorage;

    return {
        singleton: true,

        constructor: function () {
            me = this; // we are a singleton, so cache our this pointer in scope
        },
        
        /**
         * 本地存储
         * @param key
         * @param value
         */
        set: function (key, value) {
            localStorage.setItem(key, value);
        },

        /**
         * 获取存储的内容
         * @param key
         */
        get: function (key) {
            return localStorage.getItem(key);
        }
    }

});