Ext.define('overrides.dom.Element', {
    override: 'Ext.dom.Element',

    getValue: function (asNumber) {
        //dom 为空处理
        if (!this.dom) {
            return "";
        }

        var value = this.dom.value;

        return asNumber ? parseInt(value, 10) : value;
    },
    addCls: function (names, prefix, suffix) {
        var me = this, elementData = me.getData();

        //elementData为空处理
        if (!elementData || !names) {
            return me;
        }

        return me.callParent(arguments);
    },
    collect: function () {
        var me = this,
            dom = me.dom,
            shadow = me.shadow,
            shim = me.shim;

        if (!me.isFly) {
            //支持已销毁对象重复内存回收
            if (dom) {
                me.mixins.observable.destroy.call(me);
            }
            delete Ext.cache[me.id];
            me.destroyed = true;
            me.el = null;
        }

        if (dom) {
            dom._extData = me.dom = null;
        }

        // we do not destroy the shadow and shim because they are returned to their
        // OverlayPools for reuse.
        if (shadow) {
            shadow.hide();
            me.shadow = null;
        }

        if (shim) {
            shim.hide();
            me.shim = null;
        }
    },

    /**
     * Sets this Element's page-level x and y coordinates
     * @param {Number[]} xy
     * @return {Ext.dom.Element} this
     */
    setXY: function (xy) {
        var me = this,
            pts = me.translatePoints(xy),
            style = me.dom.style,
            pos;
        if (!me.isVisible())// 隐藏的情况下，不能设置
            return me;

        me.position();

        // right position may have been previously set by rtlSetLocalXY
        // so clear it here just in case.
        style.right = 'auto';
        for (pos in pts) {
            if (!isNaN(pts[pos])) {
                style[pos] = pts[pos] + 'px';
            }
        }

        if (me.shadow || me.shim) {
            me.syncUnderlays();
        }

        return me;
    },

    removeCls: function (names, prefix, suffix) {
        var me = this,
            elementData = me.getData();

        //elementData为空处理
        if (!elementData || !names) {
            return me;
        }

        return me.callParent(arguments);
    }
});