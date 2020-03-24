/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('product.Application', {
    extend: 'Cpnt.Application',

    requires: [
        'product.view.main.Main'
    ],

    defaultToken: 'catalog',

    name: 'product',

    /** 写这个只是为了自动加载*/
    neverused: function () {
        console.log(product.view.main.Main);
    }
});
