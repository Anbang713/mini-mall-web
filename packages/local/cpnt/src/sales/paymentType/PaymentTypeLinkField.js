/**
 * Created by Anbang713 on 2020/3/22.
 */
Ext.define('Cpnt.sales.paymentType.PaymentTypeLinkField', {
    extend: 'Ext.form.field.Display',
    xtype: 'cpnt.sales.paymenttype.link',

    requires: [
        'Cxt.util.Window'
    ],

    fieldLabel: '付款方式',

    linkable: false,
    renderer: Ext.util.Format.ucnRenderer(),

    setEntityId: function (entityId) {
        var me = this;
        Ext.Ajax.request({
            url: 'api/sales/paymenttype/' + entityId,
            method: 'GET',
            failureToast: true
        }).then(function (response) {
            me.setValue(Ext.JSON.decode(response.responseText, true));
        });
    },

    setValue: function (value) {
        var me = this;
        me.callParent(arguments);
        if (value && value.uuid) {
            me.entityId = value.uuid;
            me.setLinkable(!!me.entityId);
        }
    },

    onClick: function () {
        var me = this;
        if (!me.entityId)
            return;

        Cxt.util.Window.open('../sales/index.html#sales.paymenttype', {
            node: 'view',
            uuid: me.entityId
        });

    }
});