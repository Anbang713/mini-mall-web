/**
 * 为Container 提供额外的方法。
 * clearValue：清除容器中所有控件的取值
 * isValid：判断容器中所有控件的验证情况
 * getErrors：取的容器中所有控件的错误消息
 * clearInvalid：清除容器中所有控件的验证信息。
 * focusOnFirst：将光标定位在容器重的第一个可聚焦的控件上。
 *
 * Created by cRazy on 2016-8-9-0009.
 */
Ext.define('overrides.container.Container', {
    override: 'Ext.container.Container',

    requires: [
        'Ext.button.Button',
        'Ext.container.Container',
        'Ext.form.CheckboxGroup',
        'Ext.form.field.Base',
        'Ext.form.field.Picker',
        'Ext.grid.Panel'
    ],

    /**
     * 用于表示当前的Container依附在哪个视图上，当视图destory的时候，该Container会随视图一块destory掉
     */
    belongTo: undefined,

    /**
     * @cfg {boolean} enterTab
     * 表单回车处理
     */
    enterTab: true,

    /**
     * @cfg {Function} validator
     * A custom validation function to be called during field validation ({@link #getErrors}).
     * If specified, this function will be called first, allowing the developer to override the default validation
     * process.
     *
     *     Ext.create('Ext.form.field.Text', {
     *         renderTo: document.body,
     *         name: 'phone',
     *         fieldLabel: 'Phone Number',
     *         validator: function (val) {
     *             // remove non-numeric characters
     *             var tn = val.replace(/[^0-9]/g,''),
     *                 errMsg = "Must be a 10 digit telephone number";
     *             // if the numeric value is not 10 digits return an error message
     *             return (tn.length === 10) ? true : errMsg;
     *         }
     *     });
     *
     * @param {Object} validator.value The current field value
     * @return {Boolean/String} response
     *
     *  - True if the value is valid
     *  - An error message if the value is invalid
     */

    /**
     * @cfg {boolean} errorPrefixing
     * 错误消息是否加前缀。
     */
    errorPrefixing: false,

    /**
     * @cfg {Boolean} domFill
     * 当针对于某些比较复杂的界面，难以判断其高度。
     * 当设置为true时，会自动计算同级其他部件高度来设置该部件高度，以达到最大填充效果
     * 注意：fillHeight请谨慎设置。
     */
    heightFill: false,
    heightFillPadding: 20,

    afterRender: function () {
        var me = this;
        me.callParent(arguments);

        if (me.belongTo) {
            me.belongTo.outsideItems = Ext.valueFrom(me.belongTo.outsideItems, []);
            me.belongTo.outsideItems.push(me);
        }
    },

    afterLayout: function () {
        var me = this;
        me.callParent(arguments);
        me.resetHeightFill();
    },

    onResize: function () {
        var me = this;
        me.callParent(arguments);
        me.resetHeightFill();
    },

    resetHeightFill: function () {
        var me = this;
        if (me.heightFill && me.rendered) {
            me.setHeight(document.body.clientHeight - me.getPosition()[1] - me.heightFillPadding);
        }
    },

    onAdd: function (component, position) {
        var me = this;
        me.callParent(arguments);

        if (component instanceof Ext.form.field.Base && me.enterTab) {
            component.on('specialkey', me.onKeydownX, me);
        }
    },

    /**
     * 清除容器中所有控件的取值。
     */
    clearValue: function () {
        var me = this;
        if (Ext.isEmpty(me.items))
            return;

        Ext.Array.each(me.items.items, function (item) {
            if (Ext.isFunction(item.setValue)) {
                item.setValue();
                if (Ext.isFunction(item.setRawValue))
                    item.setRawValue();
                return;
            }
            if (item instanceof Ext.grid.Panel) {// 表格特殊处理
                item.getStore().loadData([]);
            } else if (item instanceof Ext.container.Container) {
                item.clearValue(item)
            }
        });
    },

    /**
     * 验证容器中的所有字段正确性
     * @return {Boolean} True if it is valid, else false
     */
    isValid: function (skipBlank) {
        var me = this,
            validator = me.validator,
            valid = true;

        if (Ext.isFunction(validator)) {
            if (validator.call(me) !== true) {
                return false;
            }
        }

        Ext.Array.each(me.items.items, function (item) {
            if (!item.isVisible()) {// 隐藏的不验证
                return;
            }
            if (Ext.isFunction(item.isValid)) {// 有isValid方法的，先调用，正确则返回
                valid = item.isValid(skipBlank) && valid;
            }
        });

        return valid;
    },

    /**
     * 验证容器中的所有字段正确性
     * @return {String[]} Array of any validation errors
     */
    getErrors: function () {
        var me = this,
            validator = me.validator,
            msg,
            errors = [];

        if (Ext.isFunction(validator)) {
            msg = validator.call(me);
            if (msg !== true) {
                Ext.Array.each(msg, function (error) {
                    var message = {
                        text: error,
                        source: me
                    };
                    if (!Ext.isEmpty(me.fieldCaption)) {
                        message.text = me.fieldCaption + "：" + error;
                    } else if (!Ext.isEmpty(me.title)) {
                        message.text = me.title + "：" + error;
                    }
                    errors.push(message);
                });
            }
        }


        Ext.Array.each(me.items.items, function (item) {
            if (!item.isVisible()) {// 隐藏的不验证
                return;
            }

            var list = [];
            if (Ext.isFunction(item.getErrors)) {// 提供了getErrors方法的直接取。
                list = item.getErrors();
            }

            Ext.Array.each(list, function (message) {
                if ((item instanceof Ext.form.field.Base || item instanceof Ext.form.CheckboxGroup || item.entiretyField === true ) && Ext.isString(message)) {
                    message = {
                        text: message,
                        source: item
                    };
                    if (!Ext.isEmpty(item.fieldCaption)) {
                        message.text = item.fieldCaption + "：" + message.text;
                    }
                    errors.push(message);
                } else {
                    if (me.errorPrefixing && item.fieldCaption) {
                        message.text = item.fieldCaption + '/' + message.text
                    } else if (me.errorPrefixing && item.title) {
                        message.text = item.title + '/' + message.text
                    }
                    errors.push(message);
                }
            });
        });
        return errors;
    },

    /**
     * Clear any invalid styles/messages for this container.
     */
    clearInvalid: function () {
        var me = this;
        if (Ext.isEmpty(me.items))
            return;

        Ext.Array.each(me.items.items, function (item) {
            if (Ext.isFunction(item.clearInvalid)) {
                item.clearInvalid();
            }
        });
    },

    /**
     * 定位在容器中的第一个可聚焦的控件上
     */
    focusOnFirst: function () {
        var me = this;
        return me.focusOnNext();
    },

    focusOnNext: function (field, focusUp, event) {
        var me = this,
            index = -1,
            item;
        if (me.destroyed)
            return false;

        if (me.layout && me.layout.config && me.layout.config.type == 'card') {
            item = me.layout.getActiveItem();
            if (Ext.isFunction(item.focusOnNext)) {
                if (item.focusOnNext(undefined, false))
                    return true;
            }
        } else {
            if (field) {
                index = me.items.findIndex('id', field.getId());
            }
            for (var i = index + 1; i < me.items.getCount(); i++) {
                item = me.items.getAt(i);
                if (Ext.isEmpty(item.getItemId()) || item instanceof Ext.button.Button)
                    continue;

                if (Ext.isFunction(item.focusOnNext)) {
                    if (item.focusOnNext(undefined, false))
                        return true;
                } else if (item.focusable && item.canFocus() && item.readOnly != true) {
                    if (item.getFocusEl()) {
                        item.focus();
                        return true;
                    }
                }
            }
        }

        var up = me.up();
        if (!!up && up instanceof Ext.container.Container && focusUp === true) {
            return up.focusOnNext(me);
        }
        return false;
    },

    focusOnPrev: function (field, event) {
        var me = this,
            index = me.items.getCount();

        if (field) {
            index = me.items.findIndex('id', field.getId());
        }
        for (var i = index - 1; i >= 0; i--) {
            var item = me.items.getAt(i);
            if (Ext.isEmpty(item.getItemId()) || item instanceof Ext.button.Button)
                continue;

            if (item instanceof Ext.grid.Panel) {    // 表格的处理
                return false;// 表格应该不坐自动定焦
                // var position = new Ext.grid.CellContext(item.getView());
                // position.setPosition(0, 0);
                // while (item.getStore().getData().length > 0) {
                //     position = item.getView().walkCells(position, 'left');
                //     if (Ext.isEmpty(position) || Ext.isEmpty(position.column) || position.column.getEditor()) {
                //         item.getNavigationModel().setPosition(position, null, event);
                //         if (item.editingPlugin && !item.editingPlugin.startEditByPosition(position) === false) {
                //             return true;
                //         }
                //     }
                // }
            } else if (item.focusable && item.canFocus() && item.readOnly != true) {
                if (item.getFocusEl()) {
                    item.focus();
                    return true;
                }
            } else if (item instanceof Ext.container.Container) {
                if (item.focusOnPrev())
                    return true;
            }
        }

        var up = me.up();
        if (!!up && up instanceof Ext.container.Container) {
            return up.focusOnPrev(me);
        }
        return false;
    },

    //按键事件
    /**
     * @private
     * @param field
     * @param e
     * @returns {boolean}
     */
    onKeydownX: function (field, e) {
        var me = this,
            shift = e.shiftKey;
        if (e.getKey() == e.ENTER || e.getKey() == e.TAB) {
            if (field instanceof Ext.form.field.Picker && field.isExpanded) {
                return false;// 下拉框的话，展开时不回车到下一个控件
            }
            e.stopEvent();
            if (shift) {
                me.focusOnPrev(field, false, e);
            } else {
                me.focusOnNext(field, false, e);
            }
            return false;
        }
    },

    beforeDestroy: function () {
        var me = this;
        if (me.outsideItems) {
            Ext.destroy(me.outsideItems);
        }
        me.callParent(arguments);
    }
});

