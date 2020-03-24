/**
 * Created by cRazy on 2016/9/22.
 */
Ext.define('overrides.picker.Date', {
    override: 'Ext.picker.Date',

    /**
     * @inheritdoc
     * @private
     */
    onShow: function () {
        var me = this,
            eDate = Ext.Date,
            min = me.minDate ? eDate.clearTime(me.minDate, true) : Number.NEGATIVE_INFINITY,
            max = me.maxDate ? eDate.clearTime(me.maxDate, true) : Number.POSITIVE_INFINITY,
            ddMatch = me.disabledDatesRE,
            ddays = me.disabledDays ? me.disabledDays.join('') : false,
            format = me.format,
            disableToday, tempDate;

        me.callParent(arguments);

        if (me.showToday) {
            tempDate = eDate.clearTime(new Date());
            disableToday = (tempDate < min || tempDate > max ||
            (ddMatch && format && ddMatch.test(eDate.dateFormat(tempDate, format))) ||
            (ddays && ddays.indexOf(tempDate.getDay()) !== -1));

            if (!me.disabled) {
                me.todayBtn.setDisabled(disableToday);
            }
        }

        if (me.pickerField) {
            me.pickerField.suspendEvent('blur');
        }
    },

    onHide: function () {
        var me = this;
        me.callParent(arguments);

        if (me.pickerField) {
            me.pickerField.resumeEvent('blur');
        }
    }
});