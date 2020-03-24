/**
 * <pre>
 *  标签选择器。
 *
 *  该控件提供一组待用户选择的标签，支持单选和多选两种模式，单选模式下自动触发数据查询，多选模式下需要用户手动触发数据查询，
 *  多选模式下各标签会带有一个复选框，标签展示分为精简模式和全部模式两种，精简模式只会展示主要标签数据，全部模式则会展示所有标签数据，
 *  标签数据过多的情况下会折行显示。
 *
 *  存在一个特殊标签&quot;不限制&quot;，该标签是一定会存在的，该标签由控件默认提供，在多选模式下，如果用户选择了不限制的标签数据，则其它标签都变成未选中状态，
 *  如果用户选择了其它标签，则&quot;不限制&quot;标签变成未选中状态。
 *
 *  外部需要传入用户可选择的标签数据，并标识出哪些是主要标签，主要标签会展示在精简模式中，标签数据内容：
 *  [
 *     {
 *         tag: 'initial', //tag名称
 *         tagCaption: '未审核', //tag标题
 *         minor: true //是否主要
 *     }
 *  ]
 *
 *  单选模式下点击标签会触发tagChange事件，外部需监听此事件并执行查询操作，可调用该控件的getValue方法得到已选择的标签，如果是单选模式返回的是
 *  当前选中的标签，如果是多选模式则返回的是当前选中的标签数组。
 *
 *  该控件会用于搜索面板的状态条件，做为状态条件的数据展示，使用时需要配置用户可选择的标签数据。
 *  @example
 *  Ext.create({
 *     xtype: 'tagselector',
 *     width: 500,
 *     tags: [], // 标签数据
 *     value: [] // 用户已选择的标签列表
 *  });
 * </pre>
 */
Ext.define('Cxt.form.field.TagSelector', {
    extend: 'Ext.form.FieldContainer',
    requires: [
        'Ext.button.Button',
        'Ext.container.Container',
        'Ext.form.CheckboxGroup',
        'Ext.layout.container.Column',
        'Ext.layout.container.HBox',
        'Ext.toolbar.Toolbar'
    ],
    alias: 'widget.tagselector',

    layout: {
        type: 'hbox'
    },

    allSelectable: true,
    allText: '全部',

    /**
     * @cfg {boolean} showAll
     * 默认为false，minor=false的tag将不显示
     */
    showAll: false,

    /**
     * @cfg {boolean} showTagExtras
     * 默认为true，显示tag的补充说明文字
     */
    showTagExtras: true,

    /**
     * <pre>
     * @cfg {Object[]} tags
     *  可选择的标签
     * - tag 标签名称
     * - tagCaption 标签标题
     * - minor 标记了minor的标签在单选时允许显示全部
     * </pre>
     */
    tags: [],

    /**
     * <pre>
     * @cfg {Object}  tagExtras
     * 可选值的标签补充说明文字，目前使用蓝色字体
     *     @example
     *     tagExtras: {
     *            ineffect: '56',
     *            effect: '66',
     *        },
     */
    tagExtras: {},

    /**
     * @cfg {"DEFAULT"/"SINGLE"/"MULTI"} mode
     * Modes of selection.
     * Valid values are `"DEFAULT"`, `"SINGLE"`, and `"MULTI"`.
     * - DEFAULT - 默认，都提供
     * - SINGLE - 仅提供单选功能
     * - MULTI - 仅提供多选功能
     */
    mode: 'DEFAULT',

    /**
     * @cfg {String[]/String}选中的状态
     *
     */
    value: null,

    // <editor-fold desc="Events">
    // ***********************************************************************************
    // Begin Events
    // ***********************************************************************************

    /**
     * @event tagChange 单选模式下，点击标签时发出事件
     *
     * @param {Ext.Component}
     *          this
     * @param {String[]}
     *          tags
     */

    // ***********************************************************************************
    // End Events
    // ***********************************************************************************
    // </editor-fold>
    initComponent: function () {
        var me = this;
        me.selectMode = 'single';
        Ext.apply(me, me.setupConfig());
        me.callParent();

        if (!Ext.isEmpty(me.tags)) {
            Ext.suspendLayouts();
            me.buildSingleItems();
            me.buildMultipleItems();
            Ext.resumeLayouts();

            me.setValue(me.value);
        }
    },

    setupConfig: function () {
        var me = this;
        return {
            items: [{
                xtype: 'container',
                itemId: 'single',
                ui: 'link',
                width: me.tagWidth,
                hidden: me.mode == 'MULTI' || me.selectMode == 'multiple',
                layout: {
                    type: 'column'
                },
                defaults: {
                    xtype: 'button',
                    ui: 'tag',
                    margin: '0 10 0 10'
                }
            }, {
                xtype: 'checkboxgroup',
                itemId: 'multiple',
                width: me.tagWidth,
                style: 'background-color: #FFFFFF',
                hideLabel: true,
                hidden: me.mode == 'SINGLE' || me.selectMode == 'single',
                layout: {
                    type: 'column'
                },
                defaults: {
                    margin: '0 20 0 10'
                },
                listeners: {
                    change: function (box, newValue, oldValue) {
                        var newTags = Ext.Array.from(newValue.tags);
                        if (!oldValue.tags) {
                            Ext.Array.remove(newTags, null);
                            if (Ext.isEmpty(newTags)) {
                                newTags.push(null);
                            }
                            box.setValue({
                                tags: newTags
                            });
                        } else if (Ext.Array.contains(newTags, null)) {
                            box.setValue({
                                tags: [null]
                            });
                        }

                        var oldTags = Ext.Array.from(oldValue.tags);
                        Ext.Array.remove(newTags, null);
                        Ext.Array.remove(oldTags, null);
                        if (!me.destroyed && !box.isEqual(newTags, oldTags)) {
                            me.fireEvent('tagChange', me, me.getValue());
                        }
                    }
                }
            }, {
                xtype: 'toolbar',
                ui: 'embed',
                items: [{
                    xtype: 'button',
                    itemId: 'showAll',
                    text: me.showAll ? '<精简显示' : '全部显示>',
                    ui: 'link',
                    listeners: {
                        click: me.switchShow,
                        scope: me
                    }
                }, {
                    xtype: 'button',
                    itemId: 'switch',
                    text: '多选',
                    margin: '0 10 0 10',
                    hidden: me.mode != 'DEFAULT' || me.tags.length <= 2,
                    listeners: {
                        click: me.switchMode,
                        scope: me
                    }
                }]
            }]
        };
    },

    switchShow: function () {
        var me = this,
            singlePanel = me.down('#single');

        if (me.showAll) {
            me.showAll = false;
            me.down('#showAll').setText('全部显示>');
            Ext.Array.forEach(singlePanel.items.items, function (item) {
                if (!item.isMain)
                    item.hide();
            });
        } else {
            me.down('#showAll').setText('<精简显示');
            Ext.Array.forEach(singlePanel.items.items, function (item) {
                item.show();
            });
        }
    },

    switchMode: function () {
        var me = this,
            value = me.getValue();

        if (me.selectMode == 'multiple') {// 当前是多选，则切换到单选
            me.selectMode = 'single';

            me.down('#switch').setText('多选');
            me.down('#single').show();
            me.down('#multiple').hide();
            me.down('#showAll').setHidden(!me.needShowAll);

            if (Ext.isEmpty(value) || value.length > 1) {
                me.currentTag = value[0];// 为了能够发出事件，给currentTag取个值
                me.selectTag(null, true);
            } else {
                me.selectTag(value[0]);
            }
        } else {
            me.selectMode = 'multiple';
            me.down('#switch').setText('单选');
            me.down('#multiple').show();
            me.down('#single').hide();
            me.down('#showAll').hide();

            if (Ext.isEmpty(value)) {
                value.push(null);
            }
            me.down('#multiple').setValue({
                tags: value
            });
        }
    },

    buildSingleItems: function () {
        var me = this;
        if (me.mode == 'MULTI') {
            return;
        }
        var items = [];
        me.down('#single').removeAll();

        me.needShowAll = false;
        Ext.Array.forEach(me.tags, function (tag) {
            me.needShowAll |= tag.minor;

            items.push({
                text: tag.tagCaption,
                hidden: !me.showAll && tag.minor,
                itemId: 't' + tag.tag,
                tag: tag.tag,
                tagCaption: tag.tagCaption,
                isMain: tag.minor,
                listeners: {
                    click: function (btn) {
                        me.selectTag(btn.tag, true);
                    }
                }
            });
        });
        me.down('#single').add({
            text: me.allText,
            hidden: !me.allSelectable,
            isMain: true,
            itemId: 'singleUnlimited',
            tag: null,
            listeners: {
                click: function () {
                    me.selectTag(null, true);
                }
            }
        });
        me.down('#single').add(items);

        me.down('#showAll').setHidden(!me.needShowAll);
    },

    selectTag: function (tag, fireEvent) {
        var me = this,
            singlePanel = me.down('#single');

        if (Ext.Object.equals(me.currentTag, tag)) {
            return;
        }

        Ext.Array.forEach(singlePanel.items.items, function (item) {
            item.setDisabled(item.tag == tag);
        });
        me.refreshTagExtra();

        me.currentTag = tag;
        if (!!fireEvent) {
            me.fireEvent('tagChange', me, me.getValue());
        }
    },

    buildMultipleItems: function () {
        var me = this;
        if (me.mode == 'SINGLE') {
            return;
        }

        me.down('#multiple').removeAll();
        var items = [];

        Ext.Array.forEach(me.tags, function (tag) {
            var item = {
                boxLabel: tag.tagCaption,
                name: 'tags',
                inputValue: tag.tag
            };
            items.push(item);
        });
        if (me.allSelectable) {
            me.down('#multiple').add({
                boxLabel: me.allText,
                name: 'tags',
                inputValue: null
            });
        }
        me.down('#multiple').add(items);
    },

    /**
     * 设置用户可选的标签数据。
     *
     * @param {Object[]} tags
     *          tags 标签数组。
     */
    setTags: function (tags) {
        var me = this,
            value = me.getValue();

        me.tags = tags;

        Ext.suspendLayouts();
        me.buildSingleItems();
        me.buildMultipleItems();
        me.down('#switch').setHidden(me.mode != 'DEFAULT' || me.tags.length <= 2);
        Ext.resumeLayouts(true);

        me.setValue(value);
    },

    setTagExtras: function (tagExtras) {
        var me = this;
        me.tagExtras = tagExtras = Ext.valueFrom(tagExtras, {});
        Ext.Array.forEach(me.tags, function (tag) {
            if (!tagExtras[tag.tag]) {
                tagExtras[tag.tag] = 0;
            }
        });
        me.refreshTagExtra();
    },

    refreshTagExtra: function () {
        var me = this,
            singlePanel = me.down('#single');
        if (!me.tagExtras || !me.showTagExtras)
            return;

        Ext.Array.forEach(singlePanel.items.items, function (item) {
            if (item.itemId == 'singleUnlimited') {
                if (me.tagExtras.hasOwnProperty('all')) {
                    if (item.isDisabled()) {
                        item.setText(me.allText + " " + me.tagExtras['all']);
                    } else {
                        item.setText(me.allText + " <span style='color: #5FA2DD;'>" + me.tagExtras['all'] + "</span>");
                    }
                }
            } else if (me.tagExtras.hasOwnProperty(item.tag)) {
                if (item.isDisabled()) {
                    item.setText(item.tagCaption + " " + me.tagExtras[item.tag]);
                } else {
                    item.setText(item.tagCaption + " <span style='color: #5FA2DD;'>" + me.tagExtras[item.tag] + "</span>");
                }
            }
        })
    },

    /**
     * 设置标签选择器的值。
     *
     * @param {String[]/String} value
     *          value 用户已选择的标签，调用此方法后，如果是传入参数为String,或者数组只有一个元素 则是单选模式，否则为多选模式
     *
     * Ext.isEmpty(value) 表示不限
     *
     */
    setValue: function (value) {
        var me = this,
            tags = [];// 去除无效的
        Ext.Array.forEach(me.tags, function (tag) {
            tags.push(tag.tag);
        });
        value = Ext.Array.intersect(Ext.Array.from(value), tags);

        if (value.length > 1 && me.selectMode == 'single') {// 当结果个数大于1且当前处于单选情况下，需要切换到多选。
            me.switchMode();
        }

        if (me.selectMode == 'multiple') {// 如果是多选，直接设置
            if (Ext.isEmpty(value)) {
                value.push(null);
            }
            me.down('#multiple').setValue({
                tags: value
            });
        } else if (value.length == 0) {
            me.selectTag(null);
        } else {
            me.selectTag(value[0]);
        }
    },

    /**
     * 取得已选择的标签数据
     *
     * @return {String[]} 返回用户已选择的标签列表。
     */
    getValue: function () {
        var me = this, value = null;
        if (me.selectMode == 'single') {
            value = me.currentTag;
        } else {
            value = me.down('#multiple').getValue().tags;
        }
        return Ext.Array.from(value);
    }
});
