/**
 * Created by cRazy on 2017/1/19.
 */
Ext.define('Cxt.form.field.Ratio', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.ratiofield',

    requires: [
        'Cxt.window.Ratio',
        'Ext.tip.QuickTipManager',
        'Ext.util.Format'
    ],

    triggers: {
        picker: {
            cls: 'fa fa-edit',
            handler: 'onTriggerClick',
            scope: 'this'
        }
    },

    /**
     * 设置后，ratioType唯一，不允许操作者修改
     */
    ratioTypeOnly: false,
    /**
     * 设置ratioType
     */
    ratioType: false,

    /**
     * 是否含税，当设置为false时，为不含税。根据去税计算含税
     */
    taxInclusive: true,

    config: {
        /**
         * 小数位数
         */
        scale: 4,
        /**
         * @param roundingMode
         *          舍入处理
         */
        roundingMode: Ext.ROUND_HALF_UP,
        /**
         * 税率，自动计算使用。
         */
        taxRate: {
            rate: 0
        }
    },

    /**
     *  只读
     */
    editable: false,

    onTriggerClick: function () {
        var me = this;
        me.rateWindow = Ext.widget({
            xtype: 'ratiowindow',
            title: me.fieldCaption,
            ratioTypeOnly: me.ratioTypeOnly,
            ratioType: me.ratioType,
            taxInclusive: me.taxInclusive,
            taxRate: me.taxRate,
            scale: me.scale,
            listeners: {
                change: function (window, value) {
                    me.setValue(value);
                }
            }
        });

        me.rateWindow.setValue(me.getValue());
        me.rateWindow.show();
    },

    setValue: function (value) {
        var me = this, tip;
        me.value = value;
        me.callParent(arguments);

        if (me.value && me.value['@class'] != 'com.hd123.m3.commons.biz.ratio.NormalRatio') {
            var lines = [],
                tpl = new Ext.XTemplate('({low} ～ {high}] {rate}'),
                tpl2 = new Ext.XTemplate('{low}元+,{rate}');
            Ext.Array.each(value.lines, function (line, index) {
                lines.push({
                    low: Ext.util.Format.number(line.low, ',#.00'),
                    high: index == value.lines.length - 1 ? '∞' : Ext.util.Format.number(line.high, ',#.00'),
                    rate: Ext.util.Format.percent(line.rate, ',#.####')
                });
            });

            if (value['@class'] == 'com.hd123.m3.commons.biz.ratio.AbovePieceRatio') {
                tip = Ext.util.Format.list(lines, '<br>', tpl2);
            } else {
                tip = Ext.util.Format.list(lines, '<br>', tpl);
            }
        }
        if (!tip) {
            Ext.tip.QuickTipManager.unregister(me.getId());
        } else {
            Ext.tip.QuickTipManager.register({
                target: me.getId(),
                text: tip
            })
        }
    },

    getValue: function () {
        return this.value;
    },

    valueToRaw: function (value) {
        if (!value)
            return;
        if (value['@class'] == 'com.hd123.m3.commons.biz.ratio.NormalRatio')
            return '固定比例\t' + Ext.util.Format.percent(value.rate, '#.####');

        var abbreviation = '',
            line;
        if (value.lines && value.lines.length) {
            line = value.lines[0];

            abbreviation = '(' +
                Ext.util.Format.number(line.low, ',#.00') + ' ～ ' +
                Ext.util.Format.number(line.high, ',#.00') + ' ] ' +
                Ext.util.Format.percent(line.rate, ',#.####');

            if (value['@class'] == 'com.hd123.m3.commons.biz.ratio.AbovePieceRatio') {
                abbreviation = Ext.util.Format.number(line.low, ',#.00') + '元+,' + Ext.util.Format.percent(line.rate, ',#.####');
            }

        }
        if (value['@class'] == 'com.hd123.m3.commons.biz.ratio.PieceRatio')
            return '分段比例\t' + abbreviation;
        if (value['@class'] == 'com.hd123.m3.commons.biz.ratio.AbovePieceRatio')
            return '超额分段比例\t' + abbreviation;
        return value;
    },

    rawToValue: function (rawValue) {
        // 无法转换
    },

    /**
     * @private
     * Treat undefined and null values as equal to an empty string value.
     */
    isEqual: function (value1, value2) {
        value1 = Ext.encode(value1, true);
        value2 = Ext.encode(value2, true);
        return this.isEqualAsString(value1, value2);
    },

    beforeDestroy: function () {
        var me = this;
        if (me.rateWindow) {
            Ext.destroy(me.rateWindow);
            delete me.rateWindow;
        }
        me.callParent(arguments);
    }
});