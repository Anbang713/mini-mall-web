/**
 * 合同下拉选择控件
 * Created by cRazy on 2016/6/20.
 */
Ext.define('Cpnt.investment.contract.ContractLinkField', {
    extend: 'Ext.form.field.Display',
    xtype: 'cpnt.investment.contract.link',

    requires: [
        'Cxt.util.Window'
    ],

    fieldLabel: '合同',

    linkable: false,
    renderer: function (value) {
        if (!value) {
            return value;
        }
        return value['signboard'] + '[' + value['serialNumber'] + ']';
    },

    setEntityId: function (entityId) {
        var me = this;
        Ext.Ajax.request({
            url: 'api/invest/contract/' + entityId,
            method: 'GET',
            failureToast: true,
            params: {
                fetchPropertyInfo: false
            }
        }).then(function (response) {
            me.setValue(Ext.JSON.decode(response.responseText, true));
        });
    },

    setValue: function (value) {
        var me = this;
        me.callParent(arguments);
        if (value && value.uuid) {
            me.contractId = value.uuid;
            me.setLinkable(!!me.contractId);
        }
    },

    onClick: function () {
        var me = this;
        if (!me.contractId)
            return;

        Cxt.util.Window.open('../invest/index.html#invest.contract', {
            node: 'view',
            uuid: me.contractId
        });

    }
});