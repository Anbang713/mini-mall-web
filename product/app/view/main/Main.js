/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('product.view.main.Main', {
    extend: 'Ext.container.Viewport',

    requires: [
        'Ext.layout.container.Fit',
        'product.view.main.MainController'
    ],

    controller: 'main',
    layout: 'fit'
});
