/**
 * Created by cRazy on 2017/3/15.
 */
Ext.define('Cxt.form.field.SingleTreePicker', {
    extend: 'Cxt.form.field.SingleTagField',
    xtype: 'singletreepicker',

    requires: [
        'Ext.tree.Panel'
    ],

    /**
     * @cfg {Number} maxPickerHeight
     * The maximum height of the tree dropdown. Defaults to 300.
     */
    maxPickerHeight: 300,

    /**
     * @cfg {Number} minPickerHeight
     * The minimum height of the tree dropdown. Defaults to 100.
     */
    minPickerHeight: 100,

    /**
     * Creates and returns the tree panel to be used as this field's picker.
     */
    createPicker: function () {
        var me = this,
            picker = new Ext.tree.Panel({
                store: me.store,
                floating: true,
                focusOnToFront: false,
                rootVisible: false,//设置不显示根节点
                displayField: me.displayField,
                maxHeight: me.maxPickerHeight,
                autoScroll: true,
                maskElement: 'body',
                shadow: true,
                listeners: {
                    itemclick: Ext.bind(me.onItemClick, me),
                    itemcollapse: function () {
                        if (this.rendered) {
                            this.relocate = 2;//需要2次
                            this.collapseAt = {
                                x: this.getScrollTarget().getScrollX(),
                                y: this.getScrollTarget().getScrollY()
                            };
                        }
                    },
                    itemexpand: function () {
                        if (this.rendered) {
                            this.relocate = 2;//需要2次
                            this.collapseAt = {
                                x: this.getScrollTarget().getScrollX(),
                                y: this.getScrollTarget().getScrollY()
                            };
                        }
                    },
                    afterlayout: function () {
                        var collapseAt = this.collapseAt;
                        if (this.rendered && this.relocate && collapseAt && collapseAt.y > 0) {
                            this.relocate--;
                            this.getScrollTarget().scrollTo(collapseAt.x, collapseAt.y);
                            if (!this.relocate) {
                                delete this.collapseAt;
                            }
                        }
                    }
                },
                refresh: function () {
                },
                viewConfig: {
                    loadingHeight: 100,
                    focusOwner: me
                }
            }),
            view = picker.getView();

        if (Ext.isIE9 && Ext.isStrict) {
            // In IE9 strict mode, the tree view grows by the height of the horizontal scroll bar when the items are highlighted or unhighlighted.
            // Also when items are collapsed or expanded the height of the view is off. Forcing a repaint fixes the problem.
            view.on({
                scope: me,
                highlightitem: me.repaintPickerView,
                unhighlightitem: me.repaintPickerView,
                afteritemexpand: me.repaintPickerView,
                afteritemcollapse: me.repaintPickerView
            });
        }
        return picker;
    },

    afterRender: function () {
        var me = this;

        me.callParent();
        me.on('keydown', this.onKeyDown, this);
        me.getStore().on('load', function () {
            me.doAutoSelect();
        });
    },

    onKeyDown: function (e) {
        var me = this,
            key = e.getKey(),
            table = me.getPicker().getView(),
            navigationModel = table.getNavigationModel(),
            position = navigationModel.getPosition();
        if (!position)
            return me.callParent(arguments);

        if (key === e.UP) {
            position = table.walkCells(position, 'up');
        } else if (key === e.DOWN) {
            position = table.walkCells(position, 'down');
        } else if (key === e.ENTER) {
            me.rowSelect(position.record);
        } else {
            return me.callParent(arguments);
        }

        if (Ext.isEmpty(position) || Ext.isEmpty(position.column)) {
            return
        }
        navigationModel.setPosition(position);
        me.getPicker().getSelectionModel().selectByPosition(navigationModel.getPosition());
    },

    /**
     * repaints the tree view
     */
    repaintPickerView: function () {
        var style = this.picker.getView().getEl().dom.style;

        // can't use Element.repaint because it contains a setTimeout, which results in a flicker effect
        style.display = style.display;
    },

    /**
     * Handles a click even on a tree node
     * @private
     * @param {Ext.tree.View} view
     * @param {Ext.data.Model} record
     * @param {HTMLElement} node
     * @param {Number} rowIndex
     * @param {Ext.event.Event} e
     */
    onItemClick: function (view, record, node, rowIndex, e) {
        this.selectItem(record);
    },

    onItemCollapse: function () {
        console.log('onItemCollapse', arguments);
    },

    onItemExpand: function () {
        console.log('onItemExpand', arguments);
    },

    /**
     * Handles a keypress event on the picker element
     * @private
     * @param {Ext.event.Event} e
     * @param {HTMLElement} el
     */
    onPickerKeypress: function (e, el) {
        var key = e.getKey();

        if (key === e.ENTER || (key === e.TAB && this.selectOnTab)) {
            this.selectItem(this.picker.getSelectionModel().getSelection()[0]);
        }
    },

    onExpand: function () {
        var me = this;
        me.callParent(arguments);
        me.focus();
    },

    /**
     * Changes the selection to a given record and closes the picker
     * @private
     * @param {Ext.data.Model} record
     */
    selectItem: function (record) {
        var me = this;
        me.select(record, true);
        me.collapse();
        me.validate();
        me.fireEvent('select', me, record);// 发出选中事件
    }
});