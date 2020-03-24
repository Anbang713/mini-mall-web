/**
 * 典型的模块标题栏。提供了左侧的搜索处理方案
 * Created by cRazy on 2016/7/1.
 */
Ext.define('Cxt.titlebar.TypicalModuleTitleBar', {
    extend: 'Cxt.titlebar.ModuleTitleBar',
    xtype: 'typicalmoduletitlebar',

    requires: [
        'Cxt.util.Window',
        'Ext.button.Button'
    ],

    viewModel: {},
    /**
     * @cfg {String} router (required)
     * 返回搜索的路由节点。对应模块应该支持{router}.search与{router}.view的hash
     */

    /**
     * @cfg {String/Object} searchXtype (required)
     * 用于提供搜索的下拉型控件
     */

    /**
     * @cfg {String} viewNode
     * 非默认view情况下的查看节点
     */

    backParams: {localSearch: true},

    leftItemBtnText: '返回列表',

    initComponent: function () {
        var me = this,
            leftItems = [{
                xtype: 'button',
                text: me.leftItemBtnText,
                ui: 'bulge',
                iconCls: 'fa fa-level-up fa-flip-horizontal',
                listeners: {
                    click: function () {
                        if (me.fireEvent('backlist', me, me.backParams) == false) {
                            return;
                        }
                        Cxt.util.Window.moduleRedirectTo(me.router, 'search', me.backParams);
                    },
                    scope: me
                }
            }];

        if (me.searchXtype) {
            var searchXtype = Ext.apply({}, me.searchXtype, {xtype: me.searchXtype});
            Ext.applyIf(searchXtype, {
                extraParams: me.backParams,
                width: 180,
                hidden: true,
                labelTpl: me.labelTpl == null ? new Ext.XTemplate(
                    '<tpl if="billNumber">',
                    '{billNumber}',
                    '<tpl elseif="code">',
                    '{name}[{code}]',
                    '<tpl elseif="name">',
                    '{name}',
                    '<tpl else>',
                    '',
                    '</tpl>'
                ) : me.labelTpl,
                bind: {
                    hidden: '{!showSearch}'
                },
                listeners: {
                    select: function (combo, record) {
                        var id = record.get('uuid') ? record.get('uuid') : record.get('id') ? record.get('id'):null
                        me.backParams.uuid = id;
                        if (Ext.isEmpty(me.backParams.uuid)) {
                            return;
                        }
                        if (me.fireEvent('lineSelect', me, me.backParams) == false) {
                            return;
                        }
                        Cxt.util.Window.moduleRedirectTo(me.router, Ext.valueFrom(me.viewNode, 'view'), me.backParams);
                    }
                }
            });

            leftItems.push({
                xtype: 'button',
                ui: 'bulge',
                iconCls: 'fa fa-search',
                listeners: {
                    click: function () {
                        var viewModel = me.getViewModel();
                        viewModel.set('showSearch', !viewModel.get('showSearch'));
                    }
                }
            }, searchXtype)
        }

        me.leftItems = Ext.Array.merge(leftItems, me.leftItems);
        me.callParent(arguments);
    },

    setBackParam: function (key, value) {
        var me = this;
        me.backParams[key] = value;
    }
});