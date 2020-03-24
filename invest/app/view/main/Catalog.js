/**
 * Created by cRazy on 2016/10/11.
 */
Ext.define('invest.view.main.Catalog', {
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
        title: '招商管理',
        width: '100%',
        columnWidth: 0.8,
        bodyPadding: 10,
        layout: 'column',
        defaults: {
            margin: 5
        },
        items: [{
            xtype: 'button',
            text: '项目管理',
            handler: function () {
                Cxt.util.Window.moduleRedirectTo(invest.view.store.Store.moduleId, 'search');
            }
        }, {
            xtype: 'button',
            text: '楼宇管理',
            handler: function () {
                Cxt.util.Window.moduleRedirectTo(invest.view.building.Building.moduleId, 'search');
            }
        }, {
            xtype: 'button',
            text: '楼层管理',
            handler: function () {
                Cxt.util.Window.moduleRedirectTo(invest.view.floor.Floor.moduleId, 'search');
            }
        }, {
            xtype: 'button',
            text: '铺位管理',
            handler: function () {
                Cxt.util.Window.moduleRedirectTo(invest.view.position.Position.moduleId, 'search');
            }
        }, {
            xtype: 'button',
            text: '品牌管理',
            handler: function () {
                Cxt.util.Window.moduleRedirectTo(invest.view.brand.Brand.moduleId, 'search');
            }
        }, {
            xtype: 'button',
            text: '业态管理',
            handler: function () {
                Cxt.util.Window.moduleRedirectTo(invest.view.biztype.BizType.moduleId, 'search');
            }
        }, {
            xtype: 'button',
            text: '商户管理',
            handler: function () {
                Cxt.util.Window.moduleRedirectTo(invest.view.tenant.Tenant.moduleId, 'search');
            }
        }, {
            xtype: 'button',
            text: '合同管理',
            handler: function () {
                Cxt.util.Window.moduleRedirectTo(invest.view.contract.Contract.moduleId, 'search');
            }
        }, {
            xtype: 'button',
            text: '合同结算明细',
            handler: function () {
                Cxt.util.Window.moduleRedirectTo(invest.view.settledetail.SettleDetail.moduleId, 'search');
            }
        }]
    }]
});