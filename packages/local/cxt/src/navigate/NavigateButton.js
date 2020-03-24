/**
 * Created by cRazy on 2016/6/24.
 */
Ext.define('Cxt.navigate.NavigateButton', {
    extend: 'Ext.container.Container',
    xtype: 'navigate',

    requires: [
        'Cxt.util.Window',
        'Ext.button.Button'
    ],

    width: 80,
    type: 'table',
    column: 2,

    /**
     * @cfg {String} moduleId
     * 模块id
     */

    /**
     * @cfg {String} objectKey
     * objectKey
     */

    /**
     * @cfg {String} navigateParam
     * 跳转参数设置键
     */
    navigateParam: 'uuid',

    /**
     * @cfg {String} positionType
     * 跳转参数位置类型化
     */
    positionType: undefined,

    /**
     * @cfg {String} entityId
     * 设置用于导航的参数
     */
    entityId: undefined,

    initComponent: function () {
        var me = this;

        if (Ext.isEmpty(me.moduleId)) {
            Ext.raise("You must specify a moduleId config.");
        }
        var module = Ext.syncRequire(Ext.ClassManager.getNameByAlias(me.moduleId));
        me.servicePath = module.servicePath;
        if (!me.objectKey) {
            me.objectKey = module.moduleId;
        }

        me.items = [{
            xtype: 'button',
            itemId: 'prevBtn',
            iconCls: 'fa fa-chevron-left',
            tooltipType: 'title',
            disabled: true,
            ui: 'bulge',
            listeners: {
                click: function () {
                    var me = this;
                    if (me.fireEvent('prev', me.value.last) !== false) {
                        var params = {};
                        params[me.navigateParam] = me.value.last.uuid;
                        if (me.positionType) params['positionType'] = me.positionType;
                        Cxt.util.Window.moduleRedirectTo(me.moduleId, 'view', params);
                    }
                },
                scope: me
            }
        }, {
            xtype: 'button',
            itemId: 'nextBtn',
            iconCls: 'fa fa-chevron-right',
            tooltipType: 'title',
            disabled: true,
            ui: 'bulge',
            listeners: {
                click: function () {
                    var me = this;
                    if (me.fireEvent('next', me.value.next) !== false) {
                        var params = {};
                        params[me.navigateParam] = me.value.next.uuid;
                        if (me.positionType) params['positionType'] = me.positionType;
                        Cxt.util.Window.moduleRedirectTo(me.moduleId, 'view', params);
                    }
                },
                scope: me
            }
        }];

        me.callParent(arguments);
    },

    getEntityId: function () {
        return this.entityId;
    },
    /**
     * Sets the tooltip for this Button.
     *
     * @param {String/Object} entityId This may be:
     */
    setEntityId: function (entityId) {
        var me = this;
        me.setHidden(true);

        me.entityId = entityId;
        if (Ext.isEmpty(me.servicePath) || Ext.isEmpty(entityId)) {
            return;
        }
        Ext.Ajax.request({
            url: me.servicePath + '/adjacentEntity.hd',
            method: 'GET',
            failureToast: true,
            params: {
                key: me.objectKey,
                id: entityId
            },
            success: function (response) {
                var value = Ext.isEmpty(response.responseText) ? null : Ext.decode(response.responseText);
                me.refresh(value);
            }
        })
    },

    refresh: function (value) {
        var me = this;
        if (!me.rendered || me.destroyed)
            return;

        if (Ext.isEmpty(value)) {
            me.hide();
            return;
        }
        me.value = value;
        me.show();

        var prevBtn = me.down('#prevBtn'),
            nextBtn = me.down('#nextBtn');

        if (Ext.isEmpty(value.last)) {
            prevBtn.setDisabled(true);
        } else {
            prevBtn.setDisabled(false);
            prevBtn.setTooltip('上一单：' + value.last.caption);
        }


        if (Ext.isEmpty(value.next)) {
            nextBtn.setDisabled(true);
        } else {
            nextBtn.setDisabled(false);
            nextBtn.setTooltip('下一单：' + value.next.caption);
        }
    }
});