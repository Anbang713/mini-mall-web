/**
 * 下链接控件
 * Created by libin on 2017/4/7.
 */
Ext.define('Cpnt.investment.tenant.TenatLinkField', {
    extend: 'Ext.form.field.Display',
    xtype: 'cpnt.investment.tenant.link',

    requires: [
        'Cxt.util.Window'
    ],

    fieldLabel: '商户',
    linkable: false,
    renderer: Ext.util.Format.ucnRenderer(),

    setEntityId: function (entityId) {
        var me = this;
        Ext.Ajax.request({
            url: 'api/invest/tenant/' + entityId,
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
        Cxt.util.Window.open('../invest/index.html#invest.tenant', {
            node: 'view',
            uuid: me.entityId
        });
    }
});