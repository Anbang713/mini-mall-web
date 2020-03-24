/**
 * Created by cRazy on 2016/10/21.
 */
Ext.define('overrides.form.CheckboxGroup', {
    override: 'Ext.form.CheckboxGroup',

    initComponent: function () {
        var me = this;
        me.initUnitary();
        me.callParent(arguments);
    },

    /**
     * String joinConnector
     * 连接符。配置后，发布的unitary是使用连接符拼接的字符串
     */
    joinConnector: undefined,

    /**
     * @cfg {String} unitary
     * 可设置为某一name值，设置后可根据该name获取或设置
     */

    initUnitary: function () {
        var me = this;
        if (!me.unitary)
            return;

        Ext.Array.each(me.items, function (item) {
            item.name = me.unitary;
            item.subgroup = me.id;
        });

        var capitalizedName = me.unitary.charAt(0).toUpperCase() + me.unitary.substr(1);
        me['get' + capitalizedName] = function () {
            var value = me.getValue();
            return value[me.unitary];
        };

        me['set' + capitalizedName] = function (value) {
            if (Ext.encode(me['get' + capitalizedName]()) == Ext.encode(value)) {
                return;
            }
            var obj = {};

            if (me.joinConnector && Ext.isString(value)) {
                value = Ext.Array.string2List(value, me.joinConnector);
            }
            obj[me.unitary] = value;
            me.setValue(obj);
        }
    },

    isBlankValue: function () {
        return Ext.isEmpty(this.getValue());
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

    /**
     * Publish the value of this field.
     *
     * @private
     */
    publishValue: function () {
        var me = this,
            value = me.getValue();

        if (me.rendered && !me.getErrors().length) {
            me.publishState('value', value);
            if (me.unitary && value) {
                value = value[me.unitary];
                if (me.joinConnector) {
                    value = Ext.Array.list2String(value, me.joinConnector);
                }
                me.publishState(me.unitary, value);
            }
        }
    },

    setValue: function (value) {
        var me = this;
        if (me.joinConnector && Ext.isString(value)) {

        }
        me.callParent(arguments);
    }
});