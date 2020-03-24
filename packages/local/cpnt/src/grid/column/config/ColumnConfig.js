/**
 * 列显示设置对话框
 * Created by cRazy on 2016/7/15.
 */
Ext.define('Cpnt.grid.column.config.ColumnConfig', {
    extend: 'Ext.window.Window',
    alias: 'widget.columnconfig',

    requires: [
        'Cpnt.grid.column.config.ColumnConfigTag',
        'Cxt.util.Toast',
        'Ext.button.Button',
        'Ext.dd.DDProxy',
        'Ext.dd.DragDropManager',
        'Ext.form.FieldContainer',
        'Ext.form.FieldSet',
        'Ext.form.Label',
        'Ext.grid.column.Column',
        'Ext.layout.container.Column',
        'Ext.layout.container.HBox',
        'Ext.layout.container.VBox',
        'Ext.panel.Panel',
        'Ext.toolbar.Fill'
    ],

    modal: true,
    title: '列显示设置',
    width: 800, // 宽度
    layout: 'vbox',// 默认布局，使用者不应该修改
    closable: false,

    /**
     * @cfg {String} filterGroupId
     * 列设置分组id
     */
    filterGroupId: undefined,

    /**
     * @cfg {boolean}用户是否有列显示设置全局配置权限
     * 默认使用多选
     */
    systemControl: false,

    /**
     * @cfg {Object[]} defaultsColumns
     * 默认列显示配置
     */
    defaultColumns: undefined,

    /**
     * @cfg {Object[]} columns
     * 当前列显示配置
     */
    columns: undefined,

    value: {
        locked: [],
        unlocked: [],
        hidden: []
    },

    initComponent: function () {
        var me = this,
            cfg = me.setupConfig();

        Ext.apply(me, cfg);
        me.callParent(arguments);
        me.setColumns(me.columns);
    },

    setupConfig: function () {
        var me = this;
        return {
            items: [{
                xtype: 'fieldset',
                title: '显示列',
                width: '100%',
                layout: 'vbox',
                items: [{
                    xtype: 'fieldcontainer',
                    itemId: 'lockedContainer',
                    fieldLabel: '固定列',
                    labelWidth: 80,
                    border: true,
                    style: 'border: 1px solid transparent',
                    width: '100%',
                    minHeight: 34,
                    layout: 'column',
                    flex: 1,
                    columnConfig: {
                        hidden: false,
                        locked: true
                    },
                    defaults: {
                        margin: 3
                    }
                }, {
                    xtype: 'fieldcontainer',
                    itemId: 'unlockedContainer',
                    fieldLabel: '非固定列',
                    labelWidth: 80,
                    minHeight: 34,
                    border: true,
                    style: 'border: 1px solid transparent',
                    width: '100%',
                    layout: 'column',
                    flex: 1,
                    margin: '5 0 15 0',
                    columnConfig: {
                        hidden: false,
                        locked: false
                    },
                    defaults: {
                        margin: 3
                    }
                }]
            }, {
                xtype: 'fieldset',
                itemId: 'hiddenSet',
                title: '隐藏列',
                width: '100%',
                layout: 'vbox',
                items: [{
                    xtype: 'fieldcontainer',
                    itemId: 'hiddenContainer',
                    fieldLabel: '&nbsp;',
                    labelSeparator: '&nbsp;',
                    labelWidth: 80,
                    border: true,
                    style: 'border: 1px solid transparent',
                    width: '100%',
                    layout: 'column',
                    columnConfig: {
                        hidden: true
                    },
                    defaults: {
                        margin: 3
                    }
                }, {
                    xtype: 'fieldcontainer',
                    itemId: 'tempContainer',
                    margin: '0 0 0 85px',
                    width: '100%',
                    hidden: true,
                    layout: 'column',
                    defaults: {
                        margin: 3
                    }
                }, {
                    xtype: 'panel',
                    itemId: 'hideTip',
                    width: '100%',
                    layout: {
                        type: 'hbox',
                        align: 'middle ',
                        pack: 'center'
                    },
                    items: [{
                        xtype: 'label',
                        html: '暂无隐藏列，您可以通过点击<span class="fa fa-minus-circle"></span>将不需要显示的表格列隐藏起来。'
                    }]
                }]
            }, {
                xtype: 'toolbar',
                width: '100%',
                items: ['->', {
                    xtype: 'button',
                    text: '保存为系统预设',
                    ui: 'primary',
                    hidden: !me.systemControl,
                    handler: Ext.bind(me.doSaveGlobal, me)
                }, {
                    xtype: 'button',
                    text: '保存',
                    ui: 'primary',
                    handler: Ext.bind(me.doSave, me)
                }, {
                    xtype: 'button',
                    text: '恢复默认设置',
                    ui: 'link',
                    handler: Ext.bind(me.resetDefault, me)
                }, {
                    xtype: 'button',
                    text: '取消',
                    ui: 'link',
                    handler: Ext.bind(me.doCancel, me)
                }]
            }]
        }
    },

    afterLayout: function (layout) {
        var me = this;
        me.callParent(arguments);
        if (me.needInitDD === true) {
            me.initDD();
        }
    },

    onHide: function () {
        var me = this;
        me.callParent(arguments);
        //还原成默认的false
        Ext.dd.DragDropManager.notifyOccluded = false;
    },

    getColumns: function () {
        var me = this;
        return Ext.Array.merge(me.value.locked, me.value.unlocked, me.value.hidden)
    },

    setColumns: function (columns) {
        var me = this,
            map = {};
        me.columns = [];
        Ext.Array.each(columns, function (column) {
            var list = me.columns;
            if (column.ownerCt instanceof Ext.grid.column.Column) {
                var merge = map[column.ownerCt.id];
                if (!merge) {
                    merge = {
                        fieldName: column.ownerCt.fieldName,
                        width: column.ownerCt.width,
                        minWidth: column.ownerCt.minWidth,
                        text: column.ownerCt.text,
                        locked: column.ownerCt.locked,
                        hidden: column.ownerCt.hidden,
                        hideable: column.ownerCt.hideable,
                        columns: []
                    };
                    me.columns.push(merge);
                    map[column.ownerCt.id] = merge;
                }
                list = merge.columns;
            }
            list.push({
                dataIndex: column.dataIndex,
                fieldName: column.fieldName,
                width: column.width,
                minWidth: column.minWidth,
                text: column.text,
                locked: column.locked,
                hidden: column.hidden,
                hideable: column.hideable
            })
        });

        me.value.locked = Ext.Array.filter(me.columns, function (column) {
            return (!Ext.isEmpty(column.dataIndex) || column.fieldName) && column.locked && !column.hidden;
        });
        me.updateColumns(me.down('#lockedContainer'), me.value.locked);

        me.value.unlocked = Ext.Array.filter(me.columns, function (column) {
            return (!Ext.isEmpty(column.dataIndex) || column.fieldName) && !column.locked && !column.hidden;
        });
        me.updateColumns(me.down('#unlockedContainer'), me.value.unlocked);

        me.value.hidden = Ext.Array.filter(me.columns, function (column) {
            return (!Ext.isEmpty(column.dataIndex) || column.fieldName) && column.hidden;
        });
        me.updateColumns(me.down('#hiddenContainer'), me.value.hidden);
        me.down('#hideTip').setHidden(me.value.hidden.length > 0);
        me.refreshItemAble();

        delete me.ddinitialized;
        me.initDD();
    },

    refreshItemAble: function () {
        var me = this;
        me.down('#lockedContainer').items.each(function (item, index, length) {
            item.setLockable(length > 1);
            item.setHideable(length > 1);
            item.dragable = length > 1;
            if (item.ddproxy) {
                item.ddproxy[item.dragable === false ? 'lock' : 'unlock']();
            }
        });
        me.down('#unlockedContainer').items.each(function (item, index, length) {
            item.setLockable(length > 1);
            item.setHideable(length > 1);
            item.dragable = length > 1;
            if (item.ddproxy) {
                item.ddproxy[item.dragable === false ? 'lock' : 'unlock']();
            }
        });
    },

    updateColumns: function (container, columns) {
        var me = this,
            items = [];

        container.columns = columns;
        container.removeAll();
        if (Ext.isEmpty(columns))return;

        Ext.Array.each(columns, function (column) {
            column.hidden = !!column.hidden;
            column.locked = !!column.locked;
            items.push({
                xtype: 'columnconfigtag',
                itemId: column.dataIndex ? column.dataIndex : column.fieldName,
                column: column,
                listeners: {
                    columnchange: function (tag, column) {
                        me.columnChange(column);
                    },
                    mouseenter: {
                        element: 'el',
                        fn: function () {
                            if (me.dragging && me.dragging.dragable !== false) {
                                me.dragTarget = this.component;
                                this.addCls('drag-enter');
                            }
                        }
                    },
                    mouseleave: {
                        element: 'el',
                        fn: function () {
                            if (me.dragging && this.hasCls('drag-enter')) {
                                this.removeCls('drag-enter');
                            }
                        }
                    }
                }
            })
        });
        container.add(items);
    },

    doSaveGlobal: function () {
        var me = this;

        Ext.Ajax.request({
            url: 'commons/search/columnConfig/save.hd?globe=true&filterGroupId=' + me.filterGroupId,
            failureToast: true,
            waitMsg: '正在保存...',
            waitMsgTarget: me,
            jsonData: me.getColumns(),
            success: function () {
                Cxt.util.Toast.success('成功保存列显示设置为系统预设', true);
            }
        });
    },

    doSave: function () {
        var me = this;

        Ext.Ajax.request({
            url: 'commons/search/columnConfig/save.hd?filterGroupId=' + me.filterGroupId,
            failureToast: true,
            waitMsg: '正在保存...',
            waitMsgTarget: me,
            jsonData: me.getColumns(),
            success: function () {
                Cxt.util.Toast.success('成功保存列显示设置', true);
                me.fireEvent('complete', me, me.getColumns());
                me.hide();
            }
        });
    },

    resetDefault: function () {
        var me = this;
        me.setColumns(me.defaultColumns);
    },

    doCancel: function () {
        var me = this;
        me.hide();
    },

    columnChange: function (column) {
        var me = this,
            value = me.value,
            columnTag = me.down('#' + (column.dataIndex ? column.dataIndex : column.fieldName));

        Ext.Array.remove(value.locked, column);
        Ext.Array.remove(value.unlocked, column);
        Ext.Array.remove(value.hidden, column);

        columnTag.up().remove(columnTag, false);
        if (column.hidden) {
            Ext.Array.push(value.hidden, column);
            me.down('#hiddenContainer').add(columnTag);
        } else if (column.locked) {
            Ext.Array.push(value.locked, column);
            me.down('#lockedContainer').add(columnTag);
        } else {
            Ext.Array.push(value.unlocked, column);
            me.down('#unlockedContainer').add(columnTag);
        }
        me.down('#hideTip').setHidden(value.hidden.length > 0);
        me.refreshItemAble();
    },

    initDD: function () {
        var me = this;
        if (!me.layoutCounter || !me.rendered || me.ddinitialized) {
            me.needInitDD = true;
            return;
        }
        me.needInitDD = false;
        Ext.destroy(
            me.ddList
        );

        me.ddList = [];

        me.initFieldSetDD(me.down('#lockedContainer'));
        me.initFieldSetDD(me.down('#unlockedContainer'));
        me.initFieldSetDD(me.down('#hiddenContainer'));

        Ext.dd.DragDropManager.notifyOccluded = true;
        me.ddinitialized = true;
    },

    //------------------------------------------------------------
    // Drag and Drop
    //------------------------------------------------------------
    initFieldSetDD: function (fieldset) {
        var me = this;

        fieldset.on({
            mouseenter: {
                element: 'el',
                fn: function () {
                    if (me.dragging && me.dragging.dragable !== false) {
                        me.dragTargetCt = this.component;
                        this.addCls('drag-enter');
                    }
                }
            },
            mouseleave: {
                element: 'el',
                fn: function () {
                    if (me.dragging && this.hasCls('drag-enter')) {
                        this.removeCls('drag-enter');
                    }
                }
            }
        });

        fieldset.items.each(function (item) {
            var ddproxy = new Ext.dd.DDProxy(item.id, 'fieldset', {});
            me.ddList.push(ddproxy);
            item.ddproxy = ddproxy;

            Ext.apply(ddproxy, {
                ddp: item,
                column: item.column,

                b4Drag: function (e) {
                    var xy = e.getXY();
                    this.deltaSetXY = false;
                    this.setDragElPos(xy[0], xy[1]);
                },
                startDrag: function () {
                    this.originalInnerHTML = this.getDragEl().innerHTML;
                    me.dragging = this.ddp;

                    this.getDragEl().innerHTML = this.column.text;
                    this.fieldset = this.ddp.up();
                    this.fieldset.remove(this.ddp, false);
                },
                endDrag: function () {
                    this.getDragEl().innerHTML = this.originalInnerHTML;
                    if (!me.dragTargetCt) {
                        me.dragTargetCt = this.fieldset;
                    }

                    me.dragTargetCt.removeCls('drag-enter');
                    if (me.dragTarget && me.dragTarget.hasCls('drag-enter')) {
                        me.dragTarget.removeCls('drag-enter');
                        if (me.dragTarget.getId() != me.dragging.getId()) {
                            me.dragTargetCt.moveBefore(me.dragging, me.dragTarget);
                        }
                    } else {
                        me.dragTargetCt.add(me.dragging);
                    }

                    Ext.Array.remove(this.fieldset.columns, this.column);
                    Ext.Array.insert(me.dragTargetCt.columns, me.dragTargetCt.items.indexOf(me.dragging), [this.column]);

                    Ext.apply(this.column, me.dragTargetCt.columnConfig);
                    this.ddp.setColumn(this.column);
                    me.down('#hideTip').setHidden(me.down('#hiddenContainer').items.items.length > 0);
                    me.refreshItemAble();

                    me.dragging = undefined;
                    me.dragTarget = undefined;
                    me.dragTargetCt = undefined;
                }
            });
            if (item.dragable === false) {
                ddproxy.lock();
            }
            ddproxy.constrainTo(me.id);
        });
    },

    /**
     * @private
     * @inheritdoc
     */
    beforeDestroy: function () {
        var me = this;

        Ext.destroy(
            me.ddList
        );
        me.callParent(arguments);
    }
});