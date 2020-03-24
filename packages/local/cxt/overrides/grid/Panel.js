/**
 * 对表格进行了扩展，增加tip显示与错误验证
 * Created by cRazy on 2016/8/26.
 */
Ext.define('overrides.grid.Panel', {
    override: 'Ext.grid.Panel',

    requires: [
        'Ext.grid.column.RowNumberer',
        'Ext.grid.plugin.CellEditing',
        'Ext.tip.ToolTip'
    ],

    /**表格的错误消息需要加前缀*/
    errorPrefixing: true,

    // 默认显示竖线
    columnLines: true,

    /**
     * @cfg {boolean} scrollTopOnLoad
     */
    scrollTopOnLoad: true,


    /**
     * @cfg {boolean} showTip
     */
    showTip: true,

    /**
     * @cfg {boolean} allowBlank
     * 表格数据是否必须。
     */
    allowBlank: true,

    /**
     * @cfg {String} blankText
     * The error text to display if the **{@link #allowBlank}** validation fails
     */
    blankText: '该输入项为必输项',

    /**
     * @cfg {String} blankText
     * The error text to display if the **{@link #allowBlank}** validation fails
     */
    gridBlankText: '该列表为必输项',

    /**
     * @cfg {boolean} autoAppend
     *  适用于可编辑时，最后一个单元格回车后，自动添加新行
     */
    autoAppend: true,

    initComponent: function () {
        var me = this;
        me.viewConfig = Ext.apply({
            loadingHeight: 70
        }, me.viewConfig);

        me.callParent(arguments);
    },

    afterRender: function () {
        var me = this;
        me.callParent(arguments);

        if (!me.tip && me.showTip) {
            me.tip = Ext.create('Ext.tip.ToolTip', {
                target: me.getView().el, // 所有的目标元素
                delegate: me.getView().cellSelector, // 每个网格格导致其自己单独的显示和隐藏。
                trackMouse: true,// 在行上移动不能隐藏提示框
                renderTo: Ext.getBody(),// 立即呈现，tip.body可参照首秀前。
                listeners: {
                    beforeshow: function updateTipBody(tip) {// 当元素被显示时动态改变内容.
                        if (me.isDestroyed) {// 当前表格已经别销毁时，不冒泡
                            return false;
                        }
                        if (me.actionableMode || me.view.actionableMode) {// 表格处于编辑状态时，不冒泡
                            return false;
                        }
                        if (!tip.triggerElement || !tip.triggerElement.outerText.trim()) {
                            return false;
                        }
                        if (tip.triggerElement.attributes.getNamedItem('data-qtip')) {
                            return false;
                        }
                        var customQtip = tip.triggerElement.attributes.getNamedItem('data-custom-qtip');
                        //如果使用data-qtip，那么鼠标经过单元格报错的提示图标，仍然会显示单元格的tip提示，
                        //这就导致有可能提示图标的tip提示长度小于单元格的tip提示长度，界面会出现两个tip框。
                        //那么此时应该使用data-custom-qtip，通常情况下若需要自定义tip，直接使用data-qtip即可。
                        if (customQtip) {
                            if (customQtip['textContent']) {
                                tip.update(customQtip['textContent']);
                            } else if (customQtip['value']) {
                                tip.update(customQtip['value']);
                            } else {
                                tip.update(tip.triggerElement.outerText);//获取节点上内容更新提示
                            }
                        } else {
                            tip.update(tip.triggerElement.outerText);//获取节点上内容更新提示
                        }
                    }
                }
            });
        }
    },

    focusOnNext: function () {
        return false;
    },

    /**
     * 设置表格是否自动追加行。
     * 在可编辑时，表格最后一行最后一列的单元格进行回车操作的时候，如果autoAppend为true时，会自动追加一行。属于表格按键操作的功能范围内
     * @param autoAppend
     */
    setAutoAppend: function (autoAppend) {
        this.autoAppend = autoAppend;
    },

    /**
     * 设置表格是否允许空，主要针对于可编辑时使用
     * @param allowBlank
     */
    setAllowBlank: function (allowBlank) {
        this.allowBlank = allowBlank;
    },

    /**
     * 根据dataIndex找到第一个column
     * @param dataIndex
     */
    getColumnByName: function (dataIndex) {
        var me = this;
        return Ext.Array.findBy(me.getColumns(), function (column) {
            return column.dataIndex == dataIndex;
        });
    },

    /**
     * 验证表格
     * @param skipBlank
     * 跳过必填的验证
     * @returns {boolean}
     */
    isValid: function (skipBlank) {
        var me = this;

        if (me.collapsed && !me.validOnCollapsed) {
            return true;
        }
        me.skipBlank = skipBlank;
        var valid = me.getErrors().length == 0;
        me.skipBlank = false;
        return valid;
    },

    /**
     * 返回表格是否存在有效数据。
     * 当表格行树大于等于1，且存在某一行非空行，返回false
     * @returns {boolean}
     */
    isBlank: function () {
        var me = this,
            columns = me.getVisibleColumns(),
            store = me.getStore(),
            empty = true;
        if (me.collapsed && !me.validOnCollapsed) {
            return true;
        }

        for (var rowIndex = 0; rowIndex < store.getCount(); rowIndex++) {
            var record = store.getAt(rowIndex),//遍历每一行
                emptyRecord = true;

            Ext.Array.each(columns, function (column) {
                if (column instanceof Ext.grid.column.RowNumberer)return;// 行号列不需要验证
                if ((!Ext.isFunction(column.getEditor) || !column.getEditor()) && !column.validEmpty) return;
                if (Ext.isFunction(column.isEmptyRecord)) {
                    return emptyRecord = column.isEmptyRecord(record, column);
                }
                var defaultValue = column.defaultValue,
                    recordValue = record.get(column.dataIndex);
                if (column.contentPath && column.contentPath != '.') {
                    var path = column.contentPath.split('.');
                    recordValue = record.get(path[0]);
                    for (var i = 1; i < path.length; i++) {
                        if (recordValue)
                            recordValue = recordValue[path[i]];
                    }
                }
                if (Ext.isEmpty(defaultValue) && !Ext.isEmpty(recordValue)) {// 未设置默认值时，若record中有对应值，则该行不为空。
                    emptyRecord = false;
                } else if (recordValue && recordValue != defaultValue) {
                    emptyRecord = false;// 设置默认值时，若record中的值不为空且与默认值不等，则该行不为空
                }
                return emptyRecord
            });
            if (emptyRecord) {// 整行为空的时候，该行不验证
                continue;
            }

            return empty = false;
        }

        if (!me.editingPlugin) {
            empty = me.store.getCount() == 0;
        }
        return empty;
    },

    /**
     * 返回表格的验证结果
     * @return {String[]} Array of any validation errors
     */
    getErrors: function () {
        var me = this,
            columns = me.getVisibleColumns(),
            store = me.getStore(),
            errors = [], empty = true;
        if (me.collapsed && !me.validOnCollapsed) {
            return [];
        }

        if (Ext.isFunction(me.validator)) {
            var msg = me.validator.call(me);
            if (msg !== true) {
                Ext.Array.each(msg, function (error) {
                    var message = {
                        text: error,
                        source: me
                    };
                    if (!Ext.isEmpty(me.title)) {
                        message.text = me.title + "：" + error;
                    } else if (!Ext.isEmpty(me.fieldCaption)) {
                        message.text = me.fieldCaption + "：" + error;
                    }
                    errors.push(message);
                });
            }
        }

        for (var rowIndex = 0; rowIndex < store.getCount(); rowIndex++) {
            var record = store.getAt(rowIndex),//遍历每一行
                emptyRecord = true;

            Ext.Array.each(columns, function (column) {
                if (column instanceof Ext.grid.column.RowNumberer)return;// 行号列不需要验证
                if ((!Ext.isFunction(column.getEditor) || !column.getEditor()) && !column.validEmpty) return;
                if (Ext.isFunction(column.isEmptyRecord)) {
                    return emptyRecord = column.isEmptyRecord(record, column);
                }
                var defaultValue = column.defaultValue,
                    recordValue = record.get(column.dataIndex);
                if (column.contentPath && column.contentPath != '.') {
                    var path = column.contentPath.split('.');
                    recordValue = record.get(path[0]);
                    for (var i = 1; i < path.length; i++) {
                        if (recordValue)
                            recordValue = recordValue[path[i]];
                    }
                }
                if (Ext.isEmpty(defaultValue) && !Ext.isEmpty(recordValue)) {// 未设置默认值时，若record中有对应值，则该行不为空。
                    emptyRecord = false;
                } else if (!Ext.isEmpty(recordValue) && recordValue != defaultValue) {
                    emptyRecord = false;// 设置默认值时，若record中的值不为空且与默认值不等，则该行不为空
                }
                return emptyRecord
            });
            if (emptyRecord) {// 整行为空的时候，该行不验证
                continue;
            }

            empty = false;
            Ext.Array.each(columns, function (column) {
                if (column instanceof Ext.grid.column.RowNumberer)return;// 行号列不需要验证

                if (column.xtype === 'checkcolumn')return;//复选框不需要验证

                if (Ext.isFunction(column.isEmptyRecord) && column.isEmptyRecord(record, column)) {
                    if (column.allowBlank === false && !me.skipBlank) {
                        errors.push(me.createMessage(me.blankText, rowIndex, column));
                        return;
                    }
                }

                var val = record.get(column.dataIndex),
                    msg;
                if (column.contentPath && column.contentPath != '.') {
                    var path = column.contentPath.split('.');
                    val = record.get(path[0]);
                    for (var i = 1; i < path.length; i++) {
                        if (val)
                            val = val[path[i]];
                    }
                }
                if (Ext.isEmpty(val)) {
                    if (!me.skipBlank) {
                        if (column.allowBlank === false) {
                            errors.push(me.createMessage(me.blankText, rowIndex, column));
                        } else if (Ext.isFunction(column.allowBlank)) {
                            var allowBlank = column.allowBlank.call(column, val, rowIndex, record, me);
                            if (allowBlank === true) {
                            } else if (allowBlank === false) {
                                errors.push(me.createMessage(me.blankText, rowIndex, column));
                            } else {
                                errors.push(me.createMessage(allowBlank, rowIndex, column));
                            }
                        }
                    }
                } else {
                    if (Ext.isFunction(column.validator)) {
                        msg = column.validator.call(column, val, rowIndex, record, me);
                        if (msg !== true) {
                            Ext.Array.each(msg, function (error) {
                                errors.push(me.createMessage(error, rowIndex, column));
                            });
                        }
                    }
                }
            });
        }

        if (!me.editingPlugin) {
            empty = me.store.getCount() == 0;
        }
        if (!me.allowBlank && empty && !me.skipBlank) {
            errors.push(me.createMessage(me.gridBlankText));
        }
        return errors;
    },

    /**
     * 创建一个错误消息
     * @param error
     * 错误内容
     * @param rowIndex
     * 错误所在行
     * @param column
     * 错误对应列，若该列为可编辑，则
     */
    createMessage: function (error, rowIndex, column) {
        var me = this,
            message = {
                text: error,
                source: {
                    cellError: true,
                    grid: me,
                    rowIndex: rowIndex ? rowIndex : 0,
                    column: column,
                    focus: function () {
                        var me = this;
                        if (Ext.isEmpty(me.grid) || me.grid.getStore().getData().length == 0) {
                            return;
                        }

                        var record = me.grid.getStore().getAt(me.rowIndex);
                        if (Ext.isEmpty(me.column)) {
                            Ext.Array.each(me.grid.getVisibleColumns(), function (column) {
                                if (!Ext.isEmpty(column.getEditor(record))) {
                                    me.column = column;
                                    return false;
                                }
                            });
                        }
                        if (Ext.isEmpty(me.column)) {
                            me.grid.focus();
                        }
                        var plugins = Ext.Array.filter(me.grid.plugins, function (plugin) {
                            return plugin instanceof Ext.grid.plugin.CellEditing
                        });
                        if (!Ext.isEmpty(plugins)) {
                            plugins[0].startEdit(record, me.column);
                        }
                    }
                }
            };

        if (!Ext.isEmpty(column) && !Ext.isEmpty(column.text)) {
            message.text = '第' + (rowIndex + 1) + '行/' + column.text + "：" + error;
            if (me.errorPrefixing && !Ext.isEmpty(me.title)) {
                message.text = me.title + "/" + message.text;
            }
        } else if (me.errorPrefixing && !Ext.isEmpty(me.title)) {
            message.text = me.title + "：" + error;
        }
        return message;
    },

    setGridBlankText: function (gridBlankText) {
        var me = this;
        me.gridBlankText = gridBlankText;
    },

    onHide: function (animateTarget, cb, scope) {
        var me = this;
        me.callParent(arguments);
        if (me.tip) {
            me.tip.hide();
        }
    },

    /**
     * @private
     * @inheritdoc
     */
    beforeDestroy: function () {
        var me = this;

        if (me.rendered) {
            Ext.destroy(
                me.tip
            );
        }
        me.callParent(arguments);
    }
});