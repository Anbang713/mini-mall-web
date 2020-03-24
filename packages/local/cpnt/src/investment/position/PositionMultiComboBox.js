/**
 * 位置多选下拉框
 *
 * Created by libin on 2016/9/6.
 */
Ext.define('Cpnt.investment.position.PositionMultiComboBox', {
    extend: 'Cxt.form.field.MultiTagField',
    xtype: 'cpnt.investment.position.multi.combo',

    requires: [
        'Cxt.data.reader.QueryResultReader',
        'Cxt.util.ModuleContext',
        'Cxt.util.Window',
        'Ext.button.Button',
        'Ext.data.proxy.Ajax'
    ],

    /**
     * @cfg {String[]} states
     * 位置状态限制
     * 可选值：ineffect("未生效"), using("使用中"), deleted("已删除"), splitted("已拆分"), merged("已合并");
     * 默认为ineffect & using。
     */
    state: ['ineffect', 'using'],

    /**
     * 产权所属，可选值：market(商场)、proprietor('业主')。为空时表示不做限制。
     */
    allRight: undefined,

    /**
     * 项目限制。当storeLimit=true时，未设置storeUuid将无法查询数据
     */
    storeUuid: undefined,

    /**
     * @cfg {boolean} storeLimit
     * 项目限制，启用后未设置项目将无法查询
     */
    storeLimit: false,

    /**
     * @cfg {String} positionType
     * 位置类型限制
     */
    positionType: undefined,

    /**
     * @cfg {String[]}使用情况
     * 位置类型限制
     */
    usages: undefined,

    /**
     * @cfg {boolean} positionTypeLimit
     * 类型限制，启用后未设置类型将无法查询
     */
    positionTypeLimit: false,

    /**
     * @cfg {String} storeLimit
     * 位置子类型限制
     */
    positionSubType: undefined,

    /**
     * 用于uuid in...查询
     */
    uuids: undefined,


    moduleId: undefined,
    largePropertyPermId: undefined,

    //</locale>
    queryMode: 'remote',
    minChars: 1,
    queryParam: 'keyword',

    labelTpl: new Ext.XTemplate(
        '<tpl if="name">',
        '{name}',
        '<tpl else>',
        '',
        '</tpl>'
    ),

    tpl: new Ext.XTemplate(
        '<tpl for=".">',
        '<tpl if="code">',
        '<li role="option" unselectable="on" class="', Ext.baseCSSPrefix, 'boundlist-item ', Ext.baseCSSPrefix + 'overflow-ellipsis">{name}[{code}]</li>',
        '<tpl else>',
        '<li role="option" unselectable="on" class="', Ext.baseCSSPrefix, 'boundlist-item">{name}</li>',
        '</tpl>',
        '</tpl>'
    ),

    valueField: 'uuid',
    valueParam: 'id',
    pageSize: 10,

    store: {
        type: 'store',
        remoteFilter: true,
        remoteSort: true,
        proxy: {
            type: 'ajax',
            url: 'investment/position/query.hd',
            limitParam: 'pageSize',
            pageParam: 'page',
            startParam: '',
            paramsAsJson: true,
            extraParams: {},
            actionMethods: {
                read: 'POST'
            },
            reader: {
                type: 'queryResult',
                rootProperty: 'records',
                totalProperty: 'recordCount'
            }
        },
        sorters: [{
            property: 'code',
            direction: 'ASC'
        }]
    },

    initComponent: function () {
        var me = this;
        if (!Ext.isEmpty(me.moduleId)) {
            me.permissions = Cxt.util.ModuleContext.getModuleContextValue(me.moduleId, 'userAuthorizedPermissions');
        }

        me.callParent(arguments);

        me.getStore().on('beforeload', function () {
            if (!!me.storeLimit && !me.storeUuid) {
                me.getStore().removeAll();
                me.getStore().fireEvent('load', me.getStore());
                return false;
            }
            if (!!me.positionTypeLimit && !me.positionType) {
                me.getStore().removeAll();
                me.getStore().fireEvent('load', me.getStore());
                return false;
            }
        });
    },

    setPositionType: function (positionType) {
        var me = this;
        if (me.positionType == positionType)
            return;
        me.positionType = positionType;
        if (me.permissions && me.picker && me.picker.fbar) {
            me.picker.fbar.down('#createShoppeBtn').setHidden(!me.containPositionType('shoppe') || !Ext.Array.contains(me.permissions, me.largePropertyPermId + '.shoppe.create'));
            me.picker.fbar.down('#createBoothBtn').setHidden(!me.containPositionType('booth') || !Ext.Array.contains(me.permissions, me.largePropertyPermId + '.booth.create'));
            me.picker.fbar.down('#createAdPlaceBtn').setHidden(!me.containPositionType('adPlace') || !Ext.Array.contains(me.permissions, me.largePropertyPermId + '.adPlace.create'));
            me.picker.fbar.down('#createOfficeBtn').setHidden(!me.containPositionType('office') || !Ext.Array.contains(me.permissions, me.largePropertyPermId + '.office.create'));
        }
        delete me.lastQuery;
    },

    setPositionSubType: function (positionSubType) {
        var me = this;
        if (me.positionSubType == positionSubType)
            return;
        me.positionSubType = positionSubType;
        delete me.lastQuery;
    },

    setStoreUuid: function (storeUuid) {
        var me = this;
        me.storeUuid = storeUuid;
        delete me.lastQuery;
    },

    setUuids: function (uuids) {
        var me = this;
        me.uuids = uuids;
        delete me.lastQuery;
    },

    buildFilter: function () {
        var me = this;
        return {
            state: me.state,
            positionType: me.positionType,
            positionSubType: me.positionSubType,
            storeUuid: me.storeUuid,
            uuids: me.uuids,
            allRight: me.allRight
        };
    },

    setValue: function (value) {
        var me = this,
            list1 = [], list2 = [];
        Ext.Array.each(me.getValueData(), function (valueData) {
            list1.push(me.valueField == '.' ? valueData : valueData[me.valueField]);
        });
        Ext.Array.each(value, function (valueData) {
            list2.push(me.valueField == '.' ? valueData : valueData[me.valueField]);
        });
        if (Ext.Array.equals(list1, list2)) {
            return;
        }
        me.callParent(arguments);
    },

    containPositionType: function (positionType) {
        var me = this;
        if (me.permissions && Ext.Array.contains(me.permissions, me.largePropertyPermId + '.' + positionType + '.create')) {
            if (me.positionType == undefined) {
                return true;
            } else if (me.positionType == positionType) {
                return true;
            } else if (me.positionType.indexOf(positionType) >= 0) {
                return true;
            }
        }
    },

    createPicker: function () {
        var me = this;
        Ext.apply(me, {
            listConfig: {
                fbar: [{
                    xtype: 'button',
                    itemId: 'createShoppeBtn',
                    hidden: !me.containPositionType('shoppe'),
                    text: '新建铺位',
                    handler: function () {
                        Cxt.util.Window.open('../invest/index.html#invest.largeproperty', {
                            node: 'positionCreate'
                        });
                    }
                }, {
                    xtype: 'button',
                    itemId: 'createBoothBtn',
                    text: '新建场地',
                    hidden: !me.containPositionType('booth'),
                    handler: function () {
                        Cxt.util.Window.open('../invest/index.html#invest.largeproperty', {
                            node: 'boothCreate'
                        });
                    }
                }, {
                    xtype: 'button',
                    itemId: 'createAdPlaceBtn',
                    text: '新建广告位',
                    hidden: !me.containPositionType('adPlace'),
                    handler: function () {
                        Cxt.util.Window.open('../invest/index.html#invest.largeproperty', {
                            node: 'adPlaceCreate'
                        });
                    }
                }, {
                    xtype: 'button',
                    itemId: 'createOfficeBtn',
                    text: '新建单元',
                    hidden: !me.containPositionType('office'),
                    handler: function () {
                        Cxt.util.Window.open('../invest/index.html#invest.largeproperty', {
                            node: 'officeCreate'
                        });
                    }
                }]
            }
        });

        return me.callParent(arguments);
    },

    expand: function () {
        var me = this;
        me.callParent();

        if (me.rendered && !me.destroyed) {
            var width = 10;
            Ext.Array.each(['shoppe', 'booth', 'adPlace', 'office'], function (positionType) {
                if (me.containPositionType(positionType)) {
                    width = width.add(80);
                }
            });
            if (width > me.getPicker().getWidth()) {
                me.getPicker().setWidth(width);
            }
        }
    }
});