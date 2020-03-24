/**
 * 为Container 提供额外的方法。
 * clearValue：清除容器中所有控件的取值
 * isValid：判断容器中所有控件的验证情况
 * getErrors：取的容器中所有控件的错误消息
 * clearInvalid：清除容器中所有控件的验证信息。
 * focusOnFirst：将光标定位在容器重的第一个可聚焦的控件上。
 *
 * Created by cRazy on 2016-8-9-0009.
 */
Ext.define('overrides.draw.Container', {
    override: 'Ext.draw.Container',

    /**
     * @cfg {boolean} enterTab
     * 表单回车处理
     */
    enterTab: false,

    clearValue: function () {
    },

    isValid: function () {
        return true;
    },

    getErrors: function () {
        return [];
    },

    clearInvalid: function () {
    },

    /**
     * 定位在容器中的第一个可聚焦的控件上
     */
    focusOnFirst: function () {
        return false;
    },

    focusOnNext: function (field, event) {
        return false;
    },

    focusOnPrev: function (field, event) {
        return false;
    }
});