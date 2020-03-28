/**
 * Created by Anbang713 on 2020/3/28.
 */
Ext.define('Cpnt.account.subject.SubjectLinkField', {
    extend: 'Ext.form.field.Display',
    xtype: 'cpnt.account.subject.link',

    requires: [
        'Cxt.util.Window'
    ],

    fieldLabel: '科目',

    linkable: false,
    renderer: Ext.util.Format.ucnRenderer(),

    setEntityId: function (entityId) {
        var me = this;
        Ext.Ajax.request({
            url: 'api/account/subject/' + entityId,
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

        Cxt.util.Window.open('../account/account.html#account.subject', {
            node: 'view',
            uuid: me.entityId
        });

    }
});