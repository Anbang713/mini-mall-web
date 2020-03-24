/**
 * itemId生成器，提供通过：前缀+时间戳+随机数+后缀生成itemId以保证唯一性。
 * Created by chenganbang on 2019/4/3.
 */
Ext.define('Cxt.util.ItemIdGenerator', function () {
    var me;

    return {
        singleton: true,

        constructor: function () {
            me = this; // we are a singleton, so cache our this pointer in scope
        },

        /**
         * @param prefix 指定itemId的前缀，为空时默认为pre_，建议使用：模块标识+下划线，长度尽可能不要超过16位。
         * @param postfix 指定itemId的后缀，默认为空。允许为空，长度尽可能不要超过16位。
         * @returns {string} itemId
         */
        generate: function (prefix, postfix) {
            if (Ext.isEmpty(prefix)) {
                prefix = 'pre_';
            }
            if (Ext.isEmpty(postfix)) {
                postfix = '';
            }
            return prefix + Ext.util.Format.date(new Date(), 'YmdHisu') + '_' + Ext.Number.randomInt(0, 100000) + postfix;
        },

        /**
         * 批量生成num个itemId
         * @param num
         * @param prefix
         * @param postfix
         */
        batchGenerate: function (num, prefix, postfix) {
            var me = this,
                itemIds = [];
            if (Ext.isEmpty(num)) {
                num = 0;
            }
            for (var i = 0; i < num; i++) {
                Ext.Array.push(itemIds, me.generate(prefix, postfix));
            }
            return itemIds;
        }
    }
});