/**
 * Created by cRazy on 2016/7/3.
 */
Ext.define('Cxt.form.field.BizStateLabel', {
    extend: 'Ext.form.Label',
    alias: 'widget.bizstatelabel',

    /**
     * @cfg {String} value
     * bizState
     */

    style: 'padding:0 10px',


    /**
     * @cfg {String} styleMapping
     * 默认默认的bizState样式
     * # Example styleMapping
     *      @example
     *      styleMapping:{
     *           ineffect: 'cre-state-unavailable'
     *      }
     */
    styleMapping: {
        ineffect: 'cre-state-unavailable',
        submit: 'cre-state-unavailable',
        reject: 'cre-state-danger',
        effect: 'cre-state-available',
        finished: 'cre-state-available',
        aborted: 'cre-state-invalid',
        reded: 'cre-state-invalid',

        using: 'cre-state-available',
        deleted: 'cre-state-danger',
        disabled: 'cre-state-danger',
        checked: 'cre-state-available',
        stoped: 'cre-state-danger',
    },

    /**
     * @cfg {String} captionMapping
     * 默认使用BizStates中的标题设置。可以增加额外的设置。例如：
     * # Example captionMapping
     *      @example
     *      captionMapping:{
     *          approved:'已审核'
     *      }
     */
    captionMapping: {},

    config: {
        value: undefined
    },

    getValue: function () {
        return this.value;
    },

    setValue: function (value) {
        var me = this;
        me.value = value;
        me.refreshDisplay();
    },

    setStyleMapping: function (styleMapping) {
        var me = this;
        me.styleMapping = Ext.apply({}, styleMapping, {
            ineffect: 'cre-state-unavailable',
            submit: 'cre-state-unavailable',
            reject: 'cre-state-danger',
            effect: 'cre-state-available',
            finished: 'cre-state-available',
            aborted: 'cre-state-invalid',

            using: 'cre-state-available',
            deleted: 'cre-state-danger',
            disabled: 'cre-state-danger',
            checked: 'cre-state-available'
        });
        me.refreshDisplay();
    },

    setCaptionMapping: function (captionMapping) {
        var me = this;
        me.captionMapping = Ext.valueFrom(captionMapping, {});
        me.refreshDisplay();
    },

    refreshDisplay: function () {
        var me = this,
            value = me.value,
            caption;
        if (me.captionMapping.hasOwnProperty(value)) {
            caption = me.captionMapping[value];
        } else {
            caption = Ext.util.Format.bizState(value);
        }

        if (!Ext.isEmpty(me.stateCls)) {
            me.removeCls(me.stateCls);
        }
        if (me.styleMapping.hasOwnProperty(value)) {
            me.stateCls = me.styleMapping[value];
            me.addCls(me.stateCls);
        }
        me.setText(caption);
    }
});