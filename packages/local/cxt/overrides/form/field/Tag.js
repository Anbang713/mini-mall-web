/**
 * Created by cRazy on 2016/9/28.
 */
Ext.define('overrides.form.field.Tag', {
    override: 'Ext.form.field.Tag',

    /**
     * @private
     * @cfg
     */
    fieldSubTpl: [
        '<div id="{cmpId}-listWrapper" data-ref="listWrapper" class="' + Ext.baseCSSPrefix + 'tagfield {fieldCls} {typeCls} {typeCls}-{ui}" style="{wrapperStyle}">',
        '<ul id="{cmpId}-itemList" data-ref="itemList" class="' + Ext.baseCSSPrefix + 'tagfield-list{itemListCls}">',
        '<li id="{cmpId}-inputElCt" data-ref="inputElCt" class="' + Ext.baseCSSPrefix + 'tagfield-input">',
        '<input id="{cmpId}-inputEl" data-ref="inputEl" type="{type}" ',
        '<tpl if="name">name="{name}" </tpl>',
        '<tpl if="value"> value="{[Ext.util.Format.htmlEncode(values.value)]}"</tpl>',
        '<tpl if="size">size="{size}" </tpl>',
        '<tpl if="tabIdx != null">tabindex="{tabIdx}" </tpl>',
        '<tpl if="disabled"> disabled="disabled"</tpl>',
        'class="' + Ext.baseCSSPrefix + 'tagfield-input-field {inputElCls}" autocomplete="off">',
        '</li>',
        '</ul>',
        '</div>',
        {
            disableFormats: true
        }
    ],

    getSubTplData: function (fieldData) {
        var me = this,
            data = me.callParent(arguments),
            emptyText = me.emptyText,
            isEmpty = emptyText && data.value.length < 1,
            growMin = me.growMin,
            growMax = me.growMax,
            wrapperStyle = '';

        data.value = '';
        data.emptyText = isEmpty ? emptyText : '';
        data.emptyCls = '';
        data.inputElCls = '';
        data.itemListCls = '';

        if (me.grow) {
            if (Ext.isNumber(growMin) && growMin > 0) {
                wrapperStyle += 'min-height:' + growMin + 'px;';
            }
            if (Ext.isNumber(growMax) && growMax > 0) {
                wrapperStyle += 'max-height:' + growMax + 'px;';
            }
        }

        data.wrapperStyle = wrapperStyle;

        if (me.stacked === true) {
            data.itemListCls += ' ' + Ext.baseCSSPrefix + 'tagfield-stacked';
        }

        if (!me.multiSelect) {
            data.itemListCls += ' ' + Ext.baseCSSPrefix + 'tagfield-singleselect';
        }

        return data;
    },

    afterRender: function () {
        var me = this;
        me.callParent(arguments);
        me.applyEmptyText();
    },

    findRecord: function(field, value) {
        var matches = this.getStore().queryRecords(field, value);
        return matches.length ? matches[0] : false;
    },

    // Private internal setting of value when records are added to the valueCollection
    // setValue itself adds to the valueCollection.
    updateValue: function () {
        var me = this,
            valueArray = me.valueCollection.getRange(),
            len = valueArray.length,
            i;
        for (i = 0; i < len; i++) {
            if (me.valueField === '.') {
                valueArray[i] = valueArray[i].getData();
            } else {
                valueArray[i] = valueArray[i].get(me.valueField);
            }
        }
        // Set the value of this field. If we are multi-selecting, then that is an array.
        me.setHiddenValue(valueArray);
        me.value = me.multiSelect ? valueArray : valueArray[0];
        if (!Ext.isDefined(me.value)) {
            me.value = undefined;
        }
        me.applyMultiselectItemMarkup();
        me.checkChange();
        me.applyEmptyText();
    },

    isValid: function () {
        var me = this,
            isValid = me.callParent(arguments);
        if (me.isExpanded && me.picker && me.matchFieldWidth) {
            me.picker.setWidth(me.bodyEl.getWidth());
        }
        return isValid;
    },
    
    /**
     * Overridden to use value (selection) instead of raw value and to avoid the use of placeholder
     */
    applyEmptyText: function () {
        var me = this;

        if (me.rendered) {
            me.inputEl.dom.placeholder = '';
            if (me.emptyText && Ext.supports.Placeholder && !me.getValueRecord()) {
                me.inputEl.dom.placeholder = me.emptyText;
            }
        }
    }
});