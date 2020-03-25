/**
 * Created by Administrator on 2020/3/25.
 */
Ext.define('account.view.statement.Statement', {
    alias: 'account.statement',

    singleton: true,
    alternateClassName: 'Statement',

    moduleId: 'account.statement',
    moduleCaption: '账单',

    servicePath: 'api/account/statement/',
    moduleKeyPrefix: "mall:account:statement:"
});