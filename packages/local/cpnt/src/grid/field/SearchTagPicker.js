/**
 * Created by cRazy on 2016/8/1.
 */
Ext.define('Cpnt.grid.field.SearchTagPicker', {
    extend: 'Ext.form.field.Picker',
    alias: 'widget.searchtagpicker',

    requires: [
        'Ext.util.Format',
        'Ext.button.Button',
        'Ext.toolbar.Toolbar'
    ],

    ui: 'searchtag',
    editable: false,
    clearable: true,

    matchFieldWidth: false,

    triggers: {
        picker: {
            hidden: true
        },
        close: {
            itemId: 'close',
            handler: function (btn) {
                btn.fireEvent('close', btn);
            }
        }
    },

    fieldStyle: {
        'textOverflow': 'ellipsis',
        'overflow': 'hidden',
        'whiteSpace': 'nowrap',
        'padding': '3px'
    },

    fieldSubTpl: [
        '<div id="{id}" data-ref="inputEl" tabindex="-1" role="textbox" aria-readonly="true"',
        ' aria-labelledby="{cmpId}-labelEl" {inputAttrTpl}',
        '<tpl if="fieldStyle"> style="{fieldStyle}"</tpl>',
        ' class="{fieldCls} {fieldCls}-{ui}">{value}</div>',
        {
            compiled: true,
            disableFormats: true
        }
    ],

    /**
     * @cfg {Object/Object} tagSelector
     * tag选择方案
     *     @example
     *     tagSelector: {
     *          selector:'bizState',// 选择的查询字段
     *          caption:'状态'// 字段标题
     *          mode:'DEFAULT',// 选择方案。
     *          tags:[{
     *              tag: 'ineffect',
     *              tagCaption: '未生效',
     *              main: true
     *          }, {
     *              tag: 'effect',
     *              tagCaption: '已生效',
     *              main: true
     *          }],
     *     }
     */
    tagSelector: undefined,

    /**
     * @cfg {String} [pickerCls='x-searchtag-picker']
     * 选择器的样式
     */
    pickerCls: Ext.baseCSSPrefix + 'searchtag-picker',

    /**
     * @cfg {String} [pickerCls='x-searchtag-picker']
     * 选择器的样式
     */
    pickerSelectCls: Ext.baseCSSPrefix + 'searchtag-picker-select',

    initComponent: function () {
        var me = this;
        me.callParent(arguments);
        me.setSelection(me.getSelection());
    },

    select: function (selection) {
        var me = this;
        me.setSelection(selection);
    },

    setSelection: function (selection) {
        var me = this,
            list = [];
        me.selection = Ext.Array.from(selection);
        Ext.Array.each(me.tagSelector.tags, function (tag) {
            if (Ext.Array.contains(me.selection, tag.tag)) {
                list.push(tag.tagCaption);
            }
        });
        if (list.length == 0) {
            list.push('不限');
        }
        if (Ext.isEmpty(me.fieldLabel)) {
            me.setValue(me.tagSelector.caption + '：' + Ext.util.Format.list(list));
        } else {
            me.setValue(Ext.util.Format.list(list));
        }
        if (me.picker) {
            Ext.Array.each(me.picker.items.items, function (item) {
                item.removeCls(me.pickerSelectCls);
                if (Ext.isEmpty(me.selection) && Ext.isEmpty(item.tag)) {
                    item.addCls(me.pickerSelectCls);
                } else if (Ext.Array.contains(me.selection, item.tag)) {
                    item.addCls(me.pickerSelectCls);
                }
            });
        }
    },

    getSelection: function () {
        var me = this;
        if (Ext.isEmpty(me.selection)) {
            return;
        }
        return Ext.Array.from(me.selection);
    },

    setValue: function (value) {
        var me = this;
        me.callParent(arguments);
        if (me.inputEl) {
            me.inputEl.setHtml(value);
        }
    },

    afterRender: function () {
        var me = this;
        me.callParent(arguments);

        if (!me.clearable) {
            me.getTrigger('close').setHidden(!me.clearable);
        }
        if (me.inputEl) {
            me.inputEl.setWidth(me.getWidth() - (me.clearable ? 25 : 5));
        }

        me.el.on('mouseenter', function () {
            me.expand();
        });
        me.el.on('mouseleave', function (e) {
            var x = e.getX() - me.el.getX(),
                y = e.getY() - me.el.getY();
            if (x <= 0 || x >= me.getWidth() || y <= 0) {
                me.collapsing = true;
                me.collapse();
            }
        });
    },

    createPicker: function () {
        var me = this,
            picker,
            pickerCfg = {
                xtype: 'toolbar',
                id: me.pickerId,
                floating: true,
                border: true,
                cls: me.pickerCls,
                items: []
            };
        if (me.allowBlank) {
            pickerCfg.items.push({
                xtype: 'button',
                ui: 'link',
                tag: null,
                text: '不限',
                listeners: {
                    click: function () {
                        me.select(null);
                        me.fireEvent('select', me, me.getSelection());
                    }
                }
            })
        }
        Ext.Array.each(me.tagSelector.tags, function (tag) {
            if (pickerCfg.items.length > 0) {
                pickerCfg.items.push('-');
            }
            pickerCfg.items.push({
                xtype: 'button',
                ui: 'link',
                tag: tag.tag,
                text: tag.tagCaption,
                listeners: {
                    click: function () {
                        me.select(tag.tag);
                        me.fireEvent('select', me, me.getSelection());
                    }
                }
            })
        });

        picker = me.picker = Ext.widget(pickerCfg);
        // We limit the height of the picker to fit in the space above
        // or below this field unless the picker has its own ideas about that.
        if (!picker.initialConfig.maxHeight) {
            picker.on({
                beforeshow: me.onBeforePickerShow,
                afterrender: me.onAfterPickerRender,
                scope: me
            });
        }

        Ext.Array.each(me.picker.items.items, function (item) {
            item.removeCls(me.pickerSelectCls);
            if (Ext.isEmpty(me.selection) && Ext.isEmpty(item.tag)) {
                item.addCls(me.pickerSelectCls);
            } else if (Ext.Array.contains(me.selection, item.tag)) {
                item.addCls(me.pickerSelectCls);
            }
        });

        return picker;
    },

    onBeforePickerShow: function (picker) {
        // Just before we show the picker, set its maxHeight so it fits
        // either above or below, it will flip to the side where it fits
        var me = this,
            heightAbove = me.getPosition()[1] - Ext.getBody().getScroll().top,
            heightBelow = Ext.Element.getViewportHeight() - heightAbove - me.getHeight();

        // Then ensure that vertically, the dropdown will fit into the space either above or below the inputEl.
        picker.maxHeight = Math.max(heightAbove, heightBelow) - 5; // have some leeway so we aren't flush against the window edge
    },

    onAfterPickerRender: function (picker) {
        var me = this;
        picker.el.on('mouseleave', function (e) {
            me.collapsing = true;
            me.collapse();
        });
    },

    /**
     * Expands this field's picker dropdown.
     */
    expand: function () {
        var me = this,
            bodyEl, picker, doc;

        if (me.rendered && !me.isExpanded && !me.destroyed) {
            bodyEl = me.bodyEl;
            picker = me.getPicker();
            doc = Ext.getDoc();
            picker.setMaxHeight(picker.initialConfig.maxHeight);

            if (me.matchFieldWidth) {
                picker.setWidth(me.bodyEl.getWidth());
            }

            // Show the picker and set isExpanded flag. alignPicker only works if isExpanded.
            picker.show();
            me.isExpanded = true;
            me.alignPicker();
            bodyEl.addCls(me.openCls);

            // monitor touch and mousewheel
            me.hideListeners = doc.on({
                mousewheel: me.collapseIf,
                touchstart: me.collapseIf,
                scope: me,
                delegated: false,
                destroyable: true
            });

            // Buffer is used to allow any layouts to complete before we align
            Ext.on('resize', me.alignPicker, me, {buffer: 1});
            me.fireEvent('expand', me);
            me.onExpand();
        }
    },

    /**
     * Performs the alignment on the picker using the class defaults
     * @private
     */
    doAlign: function () {
        var me = this,
            picker = me.picker,
            isAbove;

        me.callParent(arguments);
        isAbove = picker.el.getY() < me.inputEl.getY();
        if (!isAbove) {
            picker.setY(picker.getY() - 1);
        }
    },

    /**
     * Collapses this field's picker dropdown.
     */
    collapse: function () {
        var me = this;

        if (me.collapsing && me.isExpanded && !me.destroyed && !me.destroying) {
            var openCls = me.openCls,
                picker = me.picker,
                aboveSfx = '-above';

            // hide the picker and set isExpanded flag
            picker.hide();
            me.isExpanded = false;
            me.collapsing = false;

            // remove the openCls
            me.bodyEl.removeCls([openCls, openCls + aboveSfx]);

            if (me.ariaRole) {
                me.ariaEl.dom.setAttribute('aria-expanded', false);
            }

            // remove event listeners
            me.hideListeners.destroy();
            Ext.un('resize', me.alignPicker, me);
            me.fireEvent('collapse', me);
            me.onCollapse();
        }
    }
});