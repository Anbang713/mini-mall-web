/**
 * Created by cRazy on 2017/3/15.
 */
Ext.define('overrides.fx.Anim', {
    override: 'Ext.fx.Anim',

    requires: [
        'Ext.dom.Element'
    ],

    onExpand: function (parent) {
        var me = this,
            queue = me.animQueue,
            id = parent.getId(),
            node = me.getNode(parent),
            index = node ? me.indexOf(node) : -1,
            animWrap, animateEl, targetEl;
        if (me.singleExpand) {
            me.ensureSingleExpand(parent);
        }
        // The item is not visible yet
        if (index === -1) {
            return;
        }
        animWrap = me.getAnimWrap(parent, false);
        if (!animWrap) {
            parent.isExpandingOrCollapsing = false;
            me.fireEvent('afteritemexpand', parent, index, node);
            return;
        }
        animateEl = animWrap.animateEl;
        targetEl = animWrap.targetEl;
        animateEl.stopAnimation();
        queue[id] = true;
        // Must set element height before this event finishes because animation does not set
        // initial condition until first tick has elapsed.
        // Which is good because the upcoming layout resumption must read the content height BEFORE it gets squished.
        Ext.on('idle', function () {
            animateEl.dom.style.height = '0px';
        }, null, {
            single: true
        });
        animateEl.animate({
            from: {
                height: 0
            },
            to: {
                height: targetEl.dom.scrollHeight
            },
            duration: me.expandDuration,
            listeners: {
                afteranimate: function () {
                    if (targetEl.destroyed) {
                        return;// 被销毁了直接返回吧。
                    }
                    // Move all the nodes out of the anim wrap to their proper location
                    // Must do this in afteranimate because lastframe does not fire if the
                    // animation is stopped.
                    var items = targetEl.dom.childNodes,
                        activeEl = Ext.Element.getActiveElement();
                    if (items.length) {
                        if (!targetEl.contains(activeEl)) {
                            activeEl = null;
                        }
                        animWrap.el.insertSibling(items, 'before', true);
                        if (activeEl) {
                            activeEl.focus();
                        }
                    }
                    animWrap.el.destroy();
                    me.animWraps[animWrap.record.internalId] = queue[id] = null;
                }
            },
            callback: function () {
                parent.isExpandingOrCollapsing = false;
                if (!me.destroyed) {
                    me.refreshSize(true);
                }
                me.fireEvent('afteritemexpand', parent, index, node);
            }
        });
    }
});