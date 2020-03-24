/**
 * 支持缩略的文本显示控件
 * Created by cRazy on 2016/6/24.
 */
Ext.define('overrides.form.field.Checkbox', {
    override: 'Ext.form.field.Checkbox',

    /**
     *默认值，空白
     */
    boxLabel: '&nbsp;',

    /**
     * @cfg {boolean} compare
     * 比较模式
     */
    compare: false,

    compareCls: Ext.baseCSSPrefix + 'field-compare-changed',

    /**
     * @private Handle click on the checkbox button
     */
    onBoxClick: function () {
        var me = this;
        if (me.fireEvent('beforechange', me, !me.checked) === false)
            return;
        if (!me.disabled && !me.readOnly) {
            me.setValue(!me.checked);
        }
    },

    /**
     * @private
     * Called when the checkbox's checked state changes. Invokes the {@link #handler} callback
     * function if specified.
     */
    onChange: function (newVal, oldVal) {
        var me = this;
        me.callParent(arguments);
        me.refreshCompare();
    },

    setCompareValue: function (compareValue) {
        var me = this;
        if (Ext.isString(compareValue)) {
            me.compareValue = compareValue == 'false' ? false : compareValue == 'true' ? true : compareValue;
        } else {
            me.compareValue = compareValue;
        }
        me.refreshCompare();
    },

    refreshCompare: function () {
        if (!this.compare || !this.rendered) {
            return;
        }
        var me = this,
            labelEl = me.el,
            value;
        // if (!labelEl.isVisible() && me.boxLabelEl.isVisible()) {
        //     labelEl = me.boxLabelEl;
        // }

        if (Ext.isString(me.value)) {
            value = me.value == 'false' ? false : me.value == 'true' ? true : me.value;
        } else {
            value = me.value;
        }

        if (value != me.compareValue) {
            if (labelEl && !labelEl.hasCls(me.compareCls))
                labelEl.addCls(me.compareCls);
        } else if (labelEl.hasCls(me.compareCls)) {
            labelEl.removeCls(me.compareCls);
        }
    }
});