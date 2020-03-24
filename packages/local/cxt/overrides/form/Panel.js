/**
 * 为设置了必填的表单字段，添加<span style='color: red'>*</span>。
 * Created by cRazy on 2016/8/26.
 */
Ext.define('overrides.form.Panel', {
    override: 'Ext.form.Panel',

    requires: [
        'Ext.layout.container.Column'
    ],

    ui: 'form',
    width: '100%',
    layout: 'column',
    bodyPadding: 10,

    defaultType: 'displayfield',

    itemDefaults: {
        columnWidth: .33,
        labelAlign: 'right',
        margin: 3,
        showTip: true
    },

    /**
     * 验证容器中的所有字段正确性
     * @return {Boolean} True if it is valid, else false
     * 调整原有Ext.form.Panel的isValid规则，暂不知道是否有何异样
     */
    isValid: function (skipBlank) {
        var me = this,
            validator = me.validator;
        if (me.collapsed && !me.validOnCollapsed) {
            return true;
        }

        if (Ext.isFunction(validator)) {
            if (validator.call(me) !== true) {
                return false;
            }
        }
        return me.form.isValid(skipBlank);
    }
});