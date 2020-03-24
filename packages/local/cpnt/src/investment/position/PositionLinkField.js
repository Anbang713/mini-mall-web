/**
 * Created by renjingzhan on 2017/4/6.
 */
Ext.define('Cpnt.investment.position.PositionLinkField', {
    extend: 'Ext.form.field.Display',
    xtype: 'cpnt.investment.position.link',

    requires: [
        'Cxt.util.LoadMask',
        'Cxt.util.Window'
    ],

    /**
     * 铺位类型。若不设置会进行查询
     */
    positionType: undefined,

    linkable: false,

    /**
     * 显示铺位类型
     */
    showPositionType: false,

    rendererTpl: '{name}[{code}]',

    renderer: function (value) {
        var me = this,
            positionType = me.positionType,
            positionSubType = me.positionSubType,
            list = [],
            display = '';

        if (!value)
            return;
        if (value.uuid)
            value = [value];

        if (!me.rendererTpl.isTemplate) {
            me.rendererTpl = me.getTpl('rendererTpl');
        }

        if (me.showPositionType) {
            if (positionType == 'shoppe') {
                display = '铺位';
            } else if (positionType == 'adPlace') {
                display = '广告位';
            } else if (positionType == 'booth') {
                display = '场地';
            } else if (positionType == 'office') {
                display = '单元';
            }
        }
        if (positionSubType) display = me.showPositionType ? (display + '-' + positionSubType) : positionSubType;
        Ext.Array.each(value, function (position) {
            list.push('<a positionId="' + position.uuid + '" class="' + Ext.baseCSSPrefix + 'display-field-link' + '">' + me.rendererTpl.apply(position) + '</a>');
        });
        return display + ' ' + list.join(';');
    },

    setValue: function (value) {
        var me = this;
        if (value && value.uuid)
            value = [value];

        me.callParent([value]);

        if (value && !me.positionType) {
            me.queryPositions(value);
        }
    },

    setPositionType: function (positionType) {
        var me = this;
        me.positionType = positionType;
        me.setValue(me.getValue());
    },

    setPositionSubType: function (positionSubType) {
        var me = this;
        me.positionSubType = positionSubType;
        me.setValue(me.getValue());
    },

    queryPositions: function (value) {
        if (!value)
            return;
        if (value.uuid)
            value = [value];

        var me = this,
            uuids = [];
        me.dataLoading = true;

        Ext.Array.each(value, function (position) {
            uuids.push(position.uuid);
        });

        Ext.Ajax.request({
            url: 'investment/position/query.hd',
            jsonData: {
                filter: {
                    uuids: uuids
                }
            }
        }).then(function (response) {
            me.dataLoading = false;

            me.positions = {};
            Ext.Array.each(Ext.decode(response.responseText, true).records, function (record) {
                me.positions[record.uuid] = record;
            });
            if (me.shallLink) {
                Cxt.util.LoadMask.hide();
                me.linkToPosition(me.shallLink);
                delete me.shallLink;
            }
        });
    },

    /**
     * @private
     * Called when the field's value changes. Performs validation if the {@link #validateOnChange}
     * config is enabled, and invokes the dirty check.
     */
    onChange: function (newVal) {
        var me = this;
        me.callParent(arguments);

        if (newVal && me.showTip) {
            Ext.tip.QuickTipManager.register({
                target: me.getId(),
                text: Ext.util.Format.list(me.getValue(), ';', me.rendererTpl)
            });
        } else {
            Ext.tip.QuickTipManager.unregister(me.getId());
        }
        me.refreshCompare();
    },

    onClick: function (e) {
        var me = this,
            positionId = e.target.getAttribute('positionId');
        if (!positionId)
            return;

        if (me.dataLoading) {
            me.shallLink = positionId;
            Cxt.util.LoadMask.show('正在加载...');
            return
        }
        me.linkToPosition(positionId);

    },

    linkToPosition: function (positionId) {
        var me = this,
            positionType = me.positionType,
            node;
        if (!positionType && me.positions) {
            positionType = me.positions[positionId] ? me.positions[positionId].positionType : undefined;
        }

        if (positionType == 'shoppe') {
            node = 'positionView';
        } else {
            node = positionType + 'View';
        }
        if (node) {
            Cxt.util.Window.open('../invest/index.html#invest.largeproperty', {
                node: node,
                uuid: positionId
            });
        }
    }
});