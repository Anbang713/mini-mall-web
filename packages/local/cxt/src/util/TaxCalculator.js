/**
 * Created by lzy on 2016/7/25.
 */
Ext.define('Cxt.util.TaxCalculator', function () {
    var me; // holds our singleton instance

    return {
        singleton: true,

        constructor: function () {
            me = this; // we are a singleton, so cache our this pointer in scope
        },

        /**
         * 根据含税金额计算税额
         *
         * @param total
         *          含税金额
         * @param taxRate
         *          税率
         * @param scale
         *          小数位数
         * @param roundingMode
         *          舍入处理
         * return result
         *          税额
         */
        tax: function (total, taxRate, scale, roundingMode) {
            if (total == undefined || total == null || taxRate == undefined || taxRate == null)
                return null;

            total = parseFloat(total);
            var rate = parseFloat(taxRate.rate),
                tax;

            if ('excludePrice' == taxRate.taxType) {
                tax = total * rate / (1 + rate);
            } else {
                tax = total * rate;
            }

            if (scale == undefined || scale == null) {
                scale = 2;
            }
            if (roundingMode == undefined || roundingMode == null) {
                roundingMode = Ext.ROUND_HALF_UP;
            }
            return tax.scale(scale, roundingMode);
        },

        /**
         * 根据含税金额计算去税金额
         *
         * @param total
         *          含税金额
         * @param taxRate
         *          税率
         * @param scale
         *          小数位数
         * @param roundingMode
         *          舍入处理
         * return 去税金额
         */
        amount: function (total, taxRate, scale, roundingMode) {
            if (total == undefined || total == null || taxRate == undefined || taxRate == null)
                return null;

            if (scale == undefined || scale == null) {
                scale = 2;
            }
            if (roundingMode == undefined || roundingMode == null) {
                roundingMode = Ext.ROUND_HALF_UP;
            }

            return (parseFloat(total) - me.tax(total, taxRate, scale, roundingMode)).scale(scale, roundingMode);
        },

        /**
         * 根据去税金额计算含税金额
         *
         * @param amount
         *          去税金额
         * @param taxRate
         *          税率
         * @param scale
         *          小数位数
         * @param roundingMode
         *          舍入处理
         * return 含税金额
         */
        total: function (amount, taxRate, scale, roundingMode) {
            if (amount == undefined || amount == null || taxRate == undefined || taxRate == null)
                return null;

            amount = parseFloat(amount);
            var rate = parseFloat(taxRate.rate),
                total;

            if ('excludePrice' == taxRate.taxType) {
                total = amount * (1 + rate);
            } else {
                total = amount / (1 - rate);
            }

            if (scale == undefined || scale == null) {
                scale = 2;
            }
            if (roundingMode == undefined || roundingMode == null) {
                roundingMode = Ext.ROUND_HALF_UP;
            }
            return total.scale(scale, roundingMode);
        },

        /**
         * 根据税额计算含税金额
         *
         * @param tax
         *          税额
         * @param taxRate
         *          税率
         * @param scale
         *          小数位数
         * @param roundingMode
         *          舍入处理
         * return 含税金额
         */
        totalFromTax: function (tax, taxRate, scale, roundingMode) {
            if (tax == undefined || tax == null || taxRate == undefined || taxRate == null)
                return null;

            tax = parseFloat(tax);
            var rate = parseFloat(taxRate.rate),
                total;

            if ('excludePrice' == taxRate.taxType) {
                total = tax * (1 + rate) / rate;
            } else {
                total = tax / rate;
            }

            if (scale == undefined || scale == null) {
                scale = 2;
            }
            if (roundingMode == undefined || roundingMode == null) {
                roundingMode = Ext.ROUND_HALF_UP;
            }
            return total.scale(scale, roundingMode);
        }
    }
});