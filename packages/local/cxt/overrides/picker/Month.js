/**
 * 月份选择器。
 * 增加年禁用，月禁用功能。
 * 禁用后，对应部分将隐藏。
 * Created by cRazy on 2016/9/20.
 */
Ext.define('overrides.picker.Month', {
    override: 'Ext.picker.Month',

    monthSelectable: true,
    yearNewOffset:6,
    //设置默认显示月份
    defultMonth:undefined,
    activeNewYear:undefined,
    config: {

        /**
         * @cfg {boolean} maxEquals
         * 针对于maxValue的补充限定，是否允许等于最大日期。
         */
        maxEquals: true,

        /**
         * @cfg {boolean} minEquals
         * 针对于minValue的补充限定，是否允许等于最小日期。
         */
        minEquals: true
    },

    renderTpl: [
        '<div id="{id}-bodyEl" data-ref="bodyEl" class="{baseCls}-body">',
        '<div id="{id}-monthEl" data-ref="monthEl" class="{baseCls}-months">',
        '<tpl for="months">',
        '<div class="{parent.baseCls}-item {parent.baseCls}-month">',
        '<a style="{parent.monthStyle}" role="button" hidefocus="on" class="{parent.baseCls}-item-inner">{.}</a>',
        '</div>',
        '</tpl>',
        '</div>',
        '<div id="{id}-yearEl" data-ref="yearEl" class="{baseCls}-years">',
        '<div class="{baseCls}-yearnav">',
        '<div class="{baseCls}-yearnav-button-ct">',
        '<a id="{id}-prevEl" data-ref="prevEl" class="{baseCls}-yearnav-button {baseCls}-yearnav-prev" hidefocus="on" role="button"></a>',
        '</div>',
        '<div class="{baseCls}-yearnav-button-ct" style="float:right">',
        '<a id="{id}-nextEl" data-ref="nextEl" class="{baseCls}-yearnav-button {baseCls}-yearnav-next" hidefocus="on" role="button"></a>',
        '</div>',
        '</div>',
        '<tpl for="years">',
        '<div class="{parent.baseCls}-item {parent.baseCls}-year">',
        '<a hidefocus="on" class="{parent.baseCls}-item-inner" role="button">{.}</a>',
        '</div>',
        '</tpl>',
        '</div>',
        '<div class="' + Ext.baseCSSPrefix + 'clear"></div>',
        '<tpl if="showButtons">',
        '<div class="{baseCls}-buttons">{%',
        'var me=values.$comp, okBtn=me.okBtn, cancelBtn=me.cancelBtn;',
        'okBtn.ownerLayout = cancelBtn.ownerLayout = me.componentLayout;',
        'okBtn.ownerCt = cancelBtn.ownerCt = me;',
        'Ext.DomHelper.generateMarkup(okBtn.getRenderTree(), out);',
        'Ext.DomHelper.generateMarkup(cancelBtn.getRenderTree(), out);',
        '%}</div>',
        '</tpl>',
        '</div>'
    ],

    initComponent: function () {
        var me = this;
        me.disabledCellCls = me.baseCls + '-disabled';

        if (me.monthSelectable === false) {
            me.yearOffset = me.yearNewOffset;
            me.totalYears = 10;
        }
        me.callParent(arguments);
        if(!Ext.isEmpty(me.activeNewYear)){
            me.activeYear =parseInt(me.activeNewYear);
        }


    },

    afterRender: function () {
        var me = this;
        me.callParent(arguments);

        if (me.monthSelectable === false) {
            // me.setWidth(me.getWidth()-me.monthEl.getWidth());
            me.monthEl.setDisplayed('none');
            me.yearEl.setWidth('100%');
            me.bodyEl.select('.' + me.baseCls + '-buttons').setDisplayed('none');
        }
    },

    /**
     * Get an array of years to be pushed in the template. It is not in strict
     * numerical order because we want to show them in columns.
     * @private
     * @return {Number[]} An array of years
     */
    getYears: function () {
        var me = this,
            offset = me.yearOffset,
            start = parseInt(me.activeYear), // put the "active" year on the left
            end = start + offset,
            i = start,
            years = [];

        if (me.monthSelectable === false) {
            for (i = 0; i < offset; i++) {
                years.push(start + i * 2, start + i * 2 + 1);
            }
        } else {
            for (i = 0; i < offset; i++) {
                years.push(start + i, start + i + offset);
            }
        }

        return years;
    },

    setValue: function (value) {
        var me  =this;
        if(!Ext.isEmpty(value)){
            if(!Ext.isEmpty(me.defultMonth)){
                value.setMonth(value.getMonth()-1);
            }
        }
        return this.callParent(arguments);
    },

    /**
     * React to a year being clicked
     * @private
     * @param {HTMLElement} target The element that was clicked
     * @param {Boolean} isDouble True if the event was a doubleclick
     */
    onYearClick: function (target, isDouble) {
        var me = this,
            year, date;
        if (me.monthSelectable) {
            year = me.activeYear + me.resolveOffset(me.years.indexOf(target), me.yearOffset);
        } else {
            year = me.activeYear + me.years.indexOf(target);
        }
        if (me.minValue && year < me.minValue.getFullYear()) {
            return;
        } else if (me.maxValue && year > me.maxValue.getFullYear()) {
            return;
        }

        me.value[1] = year;
        date = new Date(year, me.value[0]);
        if (me.minValue && date < me.minValue) {
            me.value[0] = me.minEquals ? me.minValue.getMonth() : (me.minValue.getMonth() + 1);
        } else if (me.maxValue && date > me.maxValue) {
            me.value[0] = me.maxValue ? me.maxValue.getMonth() : (me.maxValue.getMonth() - 1);
        }

        me.updateBody();
        me.fireEvent('year' + (isDouble ? 'dbl' : '') + 'click', me, me.value);
        me.fireEvent('select', me, me.value);
        if (!me.monthSelectable) {
            me.value[0] = undefined;
            me.fireEvent('okclick', this, this.value);
        }
    },

    onMouseDown: function (e) {
        e.preventDefault(); // 不设置的话，作为下拉框会异常的收回去
    },

    /**
     * React to a month being clicked
     * @private
     * @param {HTMLElement} target The element that was clicked
     * @param {Boolean} isDouble True if the event was a doubleclick
     */
    onMonthClick: function (target, isDouble) {
        var me = this,
            month = me.resolveOffset(me.months.indexOf(target), me.monthOffset),
            date = new Date(me.getYear(), month);
        if (me.minValue && date < me.minValue) {
            return;
        } else if (me.maxValue && date > me.maxValue) {
            return;
        }

        me.value[0] = me.resolveOffset(me.months.indexOf(target), me.monthOffset);
        me.updateBody();
        me.fireEvent('month' + (isDouble ? 'dbl' : '') + 'click', me, me.value);
        me.fireEvent('select', me, me.value);
    },

    setMinValue: function (minValue, minEquals) {
        var me = this;
        if (minEquals === true || minEquals === false) {
            me.minEquals = minEquals;
        }
        me.minValue = Ext.Date.truncate(Ext.Date.parse(minValue, 'Ym'), Ext.Date.MONTH);
        if (me.minEquals === false) {
            me.minValue = Ext.Date.add(me.minValue, Ext.Date.MONTH, 1);
        }
    },

    setMaxValue: function (maxValue, maxEquals) {
        var me = this;
        if (maxEquals === true || maxEquals === false) {
            me.maxEquals = maxEquals;
        }
        me.maxValue = Ext.Date.truncate(Ext.Date.parse(maxValue, 'Ym'), Ext.Date.MONTH);
        if (me.maxEquals === false) {
            me.maxValue = Ext.Date.add(me.maxValue, Ext.Date.MONTH, -1);
        }
    },

    /**
     * Update the years in the body based on any change
     * @private
     */
    updateBody: function () {
        var me = this,
            years = me.years,
            months = me.months,
            yearNumbers = me.getYears(),
            selectedCls = me.selectedCls,
            disabledCls = me.disabledCellCls,
            monthOffset = me.monthOffset,
            month, m,
            yearValue = me.getYear(),
            year, yearItems, y, yLen,
            date, el;

        if (me.rendered) {
            years.removeCls(selectedCls);
            months.removeCls(selectedCls);
            years.removeCls(disabledCls);
            months.removeCls(disabledCls);

            yearItems = years.elements;
            yLen = yearItems.length;

            for (y = 0; y < yLen; y++) {
                el = Ext.fly(yearItems[y]);

                year = yearNumbers[y];
                el.dom.innerHTML = year;
                if (year === yearValue) {
                    el.addCls(selectedCls);
                }
                if (me.minValue && year < me.minValue.getFullYear()) {
                    el.addCls(disabledCls);
                } else if (me.maxValue && year > me.maxValue.getFullYear()) {
                    el.addCls(disabledCls);
                }
            }
            for (month = 0; month < 12; month++) {
                if (month < monthOffset) {
                    m = month * 2;
                } else {
                    m = (month - monthOffset) * 2 + 1;
                }
                if (month == me.value[0]) {
                    months.item(m).addCls(selectedCls);
                }
                date = new Date(me.value[1], month);
                if (me.minValue && date < me.minValue) {
                    months.item(m).addCls(disabledCls);
                } else if (me.maxValue && date > me.maxValue) {
                    months.item(m).addCls(disabledCls);
                }
            }
        }
    }
});