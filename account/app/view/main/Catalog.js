/**
 * Created by cRazy on 2016/10/11.
 */
Ext.define('account.view.main.Catalog', {
    extend: 'Ext.panel.Panel',
    xtype: 'catalog',

    requires: [
        'Cxt.util.Window',
        'Ext.button.Button',
        'Ext.layout.container.Column',
        'Ext.panel.Panel'
    ],

    layout: 'column',
    bodyPadding: 10,

    items: [{
        xtype: 'panel',
        title: '账务管理',
        width: '100%',
        columnWidth: 0.5,
        bodyPadding: 10,
        layout: 'column',
        defaults: {
            margin: 5
        },
        items: [{
            xtype: 'button',
            text: '科目',
            handler: function () {
                Cxt.util.Window.moduleRedirectTo(account.view.subject.Subject.moduleId, 'search');
            }
        }]
    }]
});