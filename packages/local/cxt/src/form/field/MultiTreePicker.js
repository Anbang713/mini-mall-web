/**
 * Created by chenganbang on 2018/3/5.
 */
Ext.define('Cxt.form.field.MultiTreePicker', {
    extend: 'Cxt.form.field.MultiTagField',
    xtype: 'multitreepicker',

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
                rootVisible: false,
                displayField: me.displayField,
                maxHeight: me.maxPickerHeight,
                autoScroll: true,
                maskElement: 'body',
                shadow: true,
                viewConfig: {
                    loadingHeight: 100,
                    focusOwner: me
                },
                listeners: {
                    checkchange: function (node, checked, eOpts) {
                        me.doCheckchange();
                        var treePanel = this,
                            loadMark = new Ext.LoadMask({
                                msg: '正在选择...',
                                target: picker.getView()
                            });
                        loadMark.show();
                        var task = new Ext.util.DelayedTask(function () {
                            node.expand();
                            me.travelParentChecked(node, checked, eOpts);
                            me.travelChildrenChecked(node, checked, eOpts);
                            me.selectItems(treePanel.getChecked());
                            loadMark.hide();
                            Ext.destroy(loadMark);
                        });
                        task.delay(300);
                    },
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
                onItemSelect: function (valueRecord) {
                    if (Ext.isEmpty(valueRecord) == false && valueRecord instanceof Object) {
                        valueRecord.set('checked', true);
                    }
                },
                getNodeByRecord: function (lastSelected) {
                    return lastSelected;
                },
                highlightItem: function (item) {
                }
            });

        return picker;
    },

    afterRender: function () {
        var me = this;
        me.callParent(arguments);

        me.getStore().on('load', function () {
            me.doAutoSelect();
        });

        me.on('select', function (tagField, nodes, removedNode) {
            if (me.fireEvent('removeNode', tagField, nodes, removedNode, me.picker.getChecked()) == false) {
                return;
            }
            if (Ext.isEmpty(removedNode) == false) {
                removedNode.set('checked', false);
                //如果父节点存在，那此时父节点一定处于非选中状态
                var upNode = removedNode.parentNode;
                if (upNode != null) {
                    upNode.set('checked', false);
                }
            }
        });
    },

    onExpand: function () {
        var me = this;
        me.callParent(arguments);
        me.focus();
    },

    selectItems: function (items) {
        var me = this;
        me.select(items, true);
        me.validate();
        me.fireEvent('selectItems', me, items);
    },

    travelParentChecked: function (node, checkStatus, opts) {
        var me = this;
        var upNode = node.parentNode;

        //存在父节点
        if (upNode != null) {
            var opts = {};
            opts["isPassive"] = true;
            //选中状态，遍历父节点，判断有父节点下的子节点是否都全选
            if (checkStatus) {
                var allChecked = true;
                //此时父节点不可能是选中状态
                //如果有一个节点未选中，可以判断，当前父节点肯定是未选中状态，所以此时不必向上遍历
                upNode.eachChild(function (child) {
                    if (!child.get('checked')) {
                        allChecked = false;
                        return false;
                    }
                });
                upNode.set('checked', allChecked);
                if (allChecked) {
                    me.travelParentChecked(upNode, allChecked, opts);
                } else {//如果后台传递数据时，选择状态正确的话，此处不需要执行
                    //me.travelParentChecked(upNode, allChecked, opts);
                }
            } else {//未选中，让父节点全都不选
                if (upNode.get('checked')) {
                    upNode.set('checked', checkStatus);
                    me.travelParentChecked(upNode, checkStatus, opts);
                } else {
                    //me.travelParentChecked(upNode, allChecked, opts);
                }
            }
        }
    },

    travelChildrenChecked: function (node, checkStatus, eOpts) {
        var me = this,
            isLeaf = node.data.leaf;
        if (!isLeaf) {
            node.expand(false, function () {
                if (eOpts["isPassive"] == null) {//主动点击
                    node.eachChild(function (child) {
                        child.set('checked', checkStatus);
                        me.travelChildrenChecked(child, checkStatus, eOpts);
                    });
                }
            });
        }
        node.set('checked', checkStatus);
    },

    doCheckchange: function() {
        //什么也不做留给子类重写
    }
});