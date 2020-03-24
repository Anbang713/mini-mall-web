/**
 * 项目链接控件
 * Created by cRazy on 2016/6/20.
 */
Ext.define('Cpnt.investment.building.BuildingLinkField', {
    extend: 'Ext.form.field.Display',
    xtype: 'cpnt.investment.building.link',

    requires: [
        'Cxt.util.Window'
    ],

    fieldLabel: '楼宇',
    linkable: false,
    renderer: Ext.util.Format.ucnRenderer(),

    setEntityId: function (entityId) {
        var me = this;
        Ext.Ajax.request({
            url: 'api/invest/building/' + entityId,
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
            me.entityId = value.uuid;
            me.setLinkable(!!me.entityId);
        }
    },

    onClick: function () {
        var me = this;
        if (!me.entityId)
            return;

        Cxt.util.Window.open('../invest/index.html#invest.building', {
            node: 'view',
            uuid: me.entityId
        });

    }
});