/**
 * 为设置了必填的表单字段，添加<span style="color: red">*</span>。
 */
Ext.define('overrides.form.FieldContainer', {
    override: 'Ext.form.FieldContainer',

    requires: [
        'Ext.container.Container'
    ],

    msgTarget: 'side',

    labelWidth: 120,
    /**
     * @cfg {boolean} fieldborder
     * 用于表单中时，可设置field部分带边框。
     */
    fieldBorder: false,

    /**
     * @cfg {boolean} compare
     * 比较模式
     */
    compare: false,

    compareCls: Ext.baseCSSPrefix + 'field-compare-changed',

    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            fieldSubTpl: [
                '<div id="{id}-containerEl" data-ref="containerEl" class="' + (me.fieldBorder ? Ext.baseCSSPrefix + 'form-fieldcontainer-container-border' : ''),
                '<tpl if="ariaAttributes">',
                '<tpl foreach="ariaAttributes"> {$}="{.}"</tpl>',
                '<tpl else>',
                ' role="presentation"',
                '</tpl>',
                '>',
                '{%this.renderContainer(out,values)%}',
                '</div>'
            ]
        });

        me.fieldCaption = me.fieldLabel;
        if (me.allowBlank !== undefined && !me.allowBlank) {
            if (me.fieldLabel && me.fieldLabel.indexOf('<span style="color: red">*</span>') < 0) {
                me.fieldLabel = '<span style="color: red"> * </span>' + me.fieldLabel;
            }
        }

        me.callParent(arguments);
    },

    afterRender: function () {
        var me = this;
        me.callParent(arguments);
        me.refreshCompare();
    },

    /**
     *  设置是否必填
     */
    setAllowBlank: function (allowBlank) {
        var me = this,
            fieldLabel = me.fieldCaption;
        me.allowBlank = allowBlank;

        if (me.rendered && fieldLabel) {
            if (allowBlank == false && fieldLabel.indexOf('<span style="color: red">*</span>') < 0) {
                me.setFieldLabel('<span style="color: red"> * </span>' + fieldLabel);
            } else {
                me.setFieldLabel(fieldLabel);
            }
        }
    },

    setValue: function (value) {
        var me = this;
        me.value = value;
        me.refreshCompare();
    },

    setCompareValue: function (compareValue) {
        var me = this;
        me.compareValue = compareValue;
        me.refreshCompare();
    },

    refreshCompare: function () {
        if (!this.compare || !this.rendered) {
            return;
        }
        var me = this,
            labelEl = me.labelEl,
            value = me.renderer.call(me.scope || me, me.value, me),
            compareValue = me.renderer.call(me.scope || me, me.compareValue, me);

        if (value != compareValue) {
            if (labelEl && !labelEl.hasCls(me.compareCls))
                me.labelEl.addCls(me.compareCls);
        } else if (labelEl.hasCls(me.compareCls)) {
            me.labelEl.removeCls(me.compareCls);
        }
    },

    renderer: function (value) {
        return value;
    },

    focusOnNext: function (field, focusUp, event) {
        var me = this,
            flag = me.callParent(arguments);
        if (flag === false) {// 组合控件通常是需要再往上找一级的
            var up = me.up();
            if (!!up && up instanceof Ext.container.Container) {
                return up.focusOnNext(me);
            }
        }
        return flag;
    }
});