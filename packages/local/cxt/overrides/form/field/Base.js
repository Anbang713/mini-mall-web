/**
 * 为设置了必填的表单字段，添加<span style="color: red">*</span>。
 */
Ext.define('overrides.form.field.Base', {
    override: 'Ext.form.field.Base',

    labelWidth: 120,

    /**
     * @cfg {String} fieldCaption
     * 因为fieldLabel需要对allowBlank=false时加*处理。所以额外使用fieldCaption 来保存字段标题以便冲突。
     * 在通过setFieldCaption来设置fieldCaption 的时候，会更新fieldLabel。如果不需要显示fieldLabel，应该直接对fieldCaption赋值。
     */
    fieldCaption:undefined,

    initComponent: function () {
        var me = this;

        if (!me.fieldCaption)
            me.fieldCaption = me.fieldLabel;
        if (me.allowBlank !== undefined && !me.allowBlank) {
            if (me.fieldLabel && me.fieldLabel.indexOf('<span style="color: red">*</span>') < 0) {
                me.fieldLabel = '<span style="color: red"> * </span>' + me.fieldLabel;
            }
        }

        Ext.apply(me, {
            onBindNotify: function (value, oldValue, binding) {
                binding.syncing = (binding.syncing + 1) || 1;
                // 绑定设值的时候，不需要触发change事件。有相关操作的时候，应该有调用者自行处理
                this.suspendEvent('change');
                this[binding._config.names.set](value);
                this.resumeEvent('change');
                --binding.syncing;
            }
        });
        me.callParent(arguments);
    },

    /**
     * Sets a data value into the field and runs the change detection and validation. To set the value directly
     * without these inspections see {@link #setRawValue}.
     * @param {Object} value The value to set
     * @param {[boolean]} suspendEvent 当为true的时候，不发送change事件
     * @return {Ext.form.field.Field} this
     */
    setValue: function (value, suspendEvent) {
        var me = this;

        if (suspendEvent === true) {
            me.suspendEvent('change');
            me.callParent(arguments);
            me.resumeEvent('change');
        } else {
            me.callParent(arguments);
        }
        return me;
    },

    getFieldCaption: function () {
        return this.fieldCaption;
    },

    setFieldCaption: function (fieldCaption) {
        var me = this,
            fieldLabel = fieldCaption;

        me.fieldCaption = fieldCaption;
        if (me.allowBlank !== undefined && !me.allowBlank) {
            fieldLabel = '<span style="color: red"> * </span>' + fieldCaption;
        }
        me.setFieldLabel(fieldLabel);
    },

    publishValue: function () {
        var me = this;

        if (!me.rendered)
            return;

        if (!me.getErrors().length) { // 验证报错的时候，不发送
            me.publishState('value', me.getValue());
        } else if (Ext.isEmpty(me.getValue())) {// 当值为空的时候，也需要publishState
            me.publishState('value', null);
        }
    },

    isBlankValue: function () {
        return Ext.isEmpty(this.getRawValue());
    },

    isValid: function (skipBlank) {
        var me = this;
        if (skipBlank === true && me.isBlankValue()) {
            return true;
        }
        return me.callParent(arguments);
    }
});