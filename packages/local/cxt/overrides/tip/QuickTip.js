Ext.define('overrides.tip.QuickTip', {
    override: 'Ext.tip.QuickTip',
    /**
     * @private
     */
    doTargetOver: function (target, xy, event) {
        var me = this,
            hasShowDelay, hideAction, delay, elTarget, cfg, ns, tipConfig, autoHide, targets, targetEl, value, key;
        if (me.disabled) {
            return;
        }
        if (typeof target === 'string') {
            target = Ext.getDom(target);
        }
        me.targetXY = xy || (event ? event.getXY() : Ext.fly(target).getXY());
        // If the over target was filtered out by the delegate selector, or is not an HTMLElement, or is the <html> or the <body>, then return
        if (!target || target.nodeType !== 1 || target === document.documentElement || target === document.body) {
            return;
        }
        if (me.activeTarget && ((target === me.activeTarget.el) || Ext.fly(me.activeTarget.el).contains(target))) {
            // We may have started a delayed show where we have an active target.
            // If the timer is yet to be fired, but the mouse moves, it will try to
            // show it immediately. If the attribute has been removed from the element,
            // we want to cancel the show.
            if (me.targetTextEmpty()) {
                me.onShowVeto();
                delete me.activeTarget;
            } else {
                me.clearTimer('hide');
                me.show();
            }
            return;
        }
        if (target) {
            targets = me.targets;
            for (key in targets) {
                if (targets.hasOwnProperty(key)) {
                    value = targets[key];
                    targetEl = Ext.fly(value.target);
                    if (targetEl && (targetEl.dom === target || targetEl.contains(target))) {
                        elTarget = targetEl.dom;
                        break;
                    }
                }
            }
            if (elTarget) {
                me.activeTarget = me.targets[elTarget.id];
                if (!me.activeTarget)// 不知道什么情况。这边可能出现空指针
                    return;
                me.activeTarget.el = target;
                me.anchor = me.activeTarget.anchor;
                if (me.anchor) {
                    me.anchorTarget = target;
                }
                hasShowDelay = parseInt(me.activeTarget.showDelay, 10);
                if (hasShowDelay) {
                    delay = me.showDelay;
                    me.showDelay = hasShowDelay;
                }
                me.delayShow();
                if (hasShowDelay) {
                    me.showDelay = delay;
                }
                if (!(hideAction = me.activeTarget.hideAction)) {
                    delete me.hideAction;
                } else {
                    me.hideAction = hideAction;
                }
                return;
            }
        }
        // Should be a fly.
        elTarget = Ext.fly(target, '_quicktip-target');
        cfg = me.tagConfig;
        ns = cfg.namespace;
        tipConfig = me.getTipCfg(target, event);
        if (tipConfig) {
            // getTipCfg may look up the parentNode axis for a tip text attribute and will return the new target node.
            // Change our target element to match that from which the tip text attribute was read.
            if (tipConfig.target) {
                target = tipConfig.target;
                elTarget = Ext.fly(target, '_quicktip-target');
            }
            autoHide = elTarget.getAttribute(ns + cfg.hide);
            me.activeTarget = {
                el: target,
                text: tipConfig.text,
                width: +elTarget.getAttribute(ns + cfg.width) || null,
                autoHide: autoHide !== "user" && autoHide !== 'false',
                title: elTarget.getAttribute(ns + cfg.title),
                cls: elTarget.getAttribute(ns + cfg.cls),
                align: elTarget.getAttribute(ns + cfg.align),
                showDelay: parseInt(elTarget.getAttribute(ns + cfg.showDelay) || 0, 10),
                hideAction: elTarget.getAttribute(ns + cfg.hideAction),
                anchorTarget: elTarget.getAttribute(ns + cfg.anchorTarget)
            };
            // If we were not configured with an anchor, allow it to be set by the target's properties
            if (!me.initialConfig.hasOwnProperty('anchor')) {
                me.anchor = elTarget.getAttribute(ns + cfg.anchor);
            }
            // If we are anchored, and not configured with an anchorTarget, anchor to the target element, or whatever its 'data-anchortarget' points to
            if (me.anchor && !me.initialConfig.hasOwnProperty('anchorTarget')) {
                me.anchorTarget = me.activeTarget.anchorTarget || target;
            }
            hasShowDelay = parseInt(me.activeTarget.showDelay, 10);
            if (hasShowDelay) {
                delay = me.showDelay;
                me.showDelay = hasShowDelay;
            }
            me.delayShow();
            if (hasShowDelay) {
                me.showDelay = delay;
            }
        }
    }
});