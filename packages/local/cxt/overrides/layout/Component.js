/**
 * Created by Leo on 2016-8-9-0009.
 */
Ext.define('overrides.layout.Component', {
    override: 'Ext.Component',

    initComponent: function () {
        var me = this;
        me.callParent(arguments);
        //销毁时必须移除绑定
        me.removeBindings = function () {
            var me = this,
                bindings, key, binding;
            if (!me.bindApplied)
                return;
            bindings = me.getBind();
            if (bindings && typeof bindings !== 'string') {
                for (key in bindings) {
                    binding = bindings[key];
                    if (binding) {
                        binding.destroy();
                        binding._config = binding.getTemplateScope = null;
                    }
                }
            }
            me.setBind(null);
        };

        me.applyBind = function (binds, currentBindings) {
            if (!binds) {
                return binds;
            }
            var me = this,
                viewModel = me.lookupViewModel(),
                twoWayable = me.getTwoWayBindable(),
                getBindTemplateScope = me._getBindTemplateScope,
                b, property, descriptor;
            if (!currentBindings || typeof currentBindings === 'string') {
                currentBindings = {};
            }
            if (!viewModel) {
                return;
            }
            if (Ext.isString(binds)) {
                if (!me.defaultBindProperty) {
                    Ext.raise(me.$className + ' has no defaultBindProperty - ' + 'Please specify a bind object');
                }
                b = binds;
                binds = {};
                binds[me.defaultBindProperty] = b;
            }
            for (property in binds) {
                descriptor = binds[property];
                b = currentBindings[property];
                if (b && typeof b !== 'string') {
                    b.destroy();
                    b = null;
                }
                if (descriptor) {
                    b = viewModel.bind(descriptor, me.onBindNotify, me);
                    b._config = Ext.Config.get(property);
                    b.getTemplateScope = getBindTemplateScope;
                    if (!me[b._config.names.set]) {
                        Ext.raise('Cannot bind ' + property + ' on ' + me.$className + ' - missing a ' + b._config.names.set + ' method.');
                    }
                }
                currentBindings[property] = b;
                if (twoWayable && twoWayable[property] && !b.isReadOnly()) {
                    me.addBindableUpdater(property);
                }
            }
            me.bindApplied = true;
            return currentBindings;
        };
    }
});