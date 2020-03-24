/**
 * Created by cRazy on 2016/6/14.
 */
Ext.define('Cxt.form.field.DateTime', {
    extend: 'Ext.form.field.Date',
    alias: 'widget.datetimefield',

    requires: [
        'Cxt.picker.DateTime',
        'Ext.form.field.Date'
    ],

    timepart: true,
    format: "Y-m-d H:i:s",

    createPicker: function () {
        var me = this,
            minValue = me.minValue,
            maxValue = me.maxValue,
            current = new Date();

        if (!me.timepart) {
            current = Ext.Date.clearTime(current);
            maxValue = Ext.Date.clearTime(maxValue);
            minValue = Ext.Date.clearTime(minValue);
        }
        if (!!maxValue && me.maxEquals === false) {
            maxValue = Ext.Date.add(maxValue, me.timepart ? Ext.Date.SECOND : Ext.Date.DAY, -1);// 不允许相等，往前移一秒
        }
        if (!!minValue && me.minEquals === false) {
            minValue = Ext.Date.add(minValue, me.timepart ? Ext.Date.SECOND : Ext.Date.DAY, 1);// 不允许相等，往后移一秒
        }
        if (me.currentLimit === 'min') {
            if (me.currentEquals === false) {
                current = Ext.Date.add(current, me.timepart ? Ext.Date.SECOND : Ext.Date.DAY, 1);// 不允许相等，往前移一秒
            }
            if (!minValue || minValue.getTime() < current.getTime()) {
                minValue = current;
            }
        }
        if (me.currentLimit === 'max') {
            if (me.currentEquals === false) {
                current = Ext.Date.add(current, me.timepart ? Ext.Date.SECOND : Ext.Date.DAY, -1);// 不允许相等，往前移一秒
            }
            if (!maxValue || maxValue.getTime() > current.getTime()) {
                maxValue = current;
            }
        }

        return Ext.create({
            xtype: 'datetimepicker',
            pickerField: me,
            floating: true,
            preventRefocus: true,
            hidden: true,
            minDate: minValue,
            maxDate: maxValue,
            disabledDatesRE: me.disabledDatesRE,
            disabledDatesText: me.disabledDatesText,
            ariaDisabledDatesText: me.ariaDisabledDatesText,
            disabledDays: me.disabledDays,
            disabledDaysText: me.disabledDaysText,
            ariaDisabledDaysText: me.ariaDisabledDaysText,
            format: me.format,
            showToday: me.showToday,
            startDay: me.startDay,
            listeners: {
                scope: me,
                select: me.onSelect
            },
            keyNavConfig: {
                esc: function () {
                    me.inputEl.focus();
                    me.collapse();
                }
            }
        });
    },

    onExpand: function () {
        var me = this;
        me.callParent(arguments);
        if (Ext.isFunction(me.doExpend) && me.doExpend() == false) {
            return;
        }
        var value = me.getValue();
        if (!value) {
            value = new Date();
        }
        if (me.isValid()) {
            me.getPicker().hour.setValue(value.getHours());
            me.getPicker().minute.setValue(value.getMinutes());
            me.getPicker().second.setValue(value.getSeconds());
            me.getPicker().selectedUpdate(Ext.Date.clearTime(value));
        } else {
            var curDate = new Date();
            me.getPicker().hour.setValue(curDate.getHours());
            me.getPicker().minute.setValue(curDate.getMinutes());
            me.getPicker().second.setValue(curDate.getSeconds());
            me.getPicker().selectedUpdate(Ext.Date.clearTime(curDate));
        }
    }
});