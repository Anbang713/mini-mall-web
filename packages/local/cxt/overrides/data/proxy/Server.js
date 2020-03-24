Ext.define('overrides.data.proxy.Server', {
    override: 'Ext.data.proxy.Server',

    config: {
        /**
         * @cfg {String} url
         * The URL from which to request the data object.
         */
        url: '',

        /**
         * @cfg {String} [pageParam="page"]
         * The name of the 'page' parameter to send in a request. Defaults to 'page'. Set this to `''` if you don't
         * want to send a page parameter.
         */
        pageParam: 'page',

        /**
         * @cfg {String} [startParam="start"]
         * The name of the 'start' parameter to send in a request. Defaults to 'start'. Set this to `''` if you don't
         * want to send a start parameter.
         */
        startParam: 'start',

        /**
         * @cfg {String} [limitParam="limit"]
         * The name of the 'limit' parameter to send in a request. Defaults to 'limit'. Set this to `''` if you don't
         * want to send a limit parameter.
         */
        limitParam: 'limit',

        /**
         * @cfg {String} [groupParam="group"]
         * The name of the 'group' parameter to send in a request. Defaults to 'group'. Set this to `''` if you don't
         * want to send a group parameter.
         */
        groupParam: 'group',

        /**
         * @cfg {String} [groupDirectionParam="groupDir"]
         * The name of the direction parameter to send in a request. **This is only used when simpleGroupMode is set to
         * true.**
         */
        groupDirectionParam: 'groupDir',

        /**
         * @cfg {String} [sortParam="sort"]
         * The name of the 'sort' parameter to send in a request. Defaults to 'sort'. Set this to `''` if you don't
         * want to send a sort parameter.
         */
        sortParam: 'sort',

        /**
         * @cfg {String} [filterParam="filter"]
         * The name of the 'filter' parameter to send in a request. Defaults to 'filter'. Set this to `''` if you don't
         * want to send a filter parameter.
         */
        filterParam: 'filter',

        /**
         * @cfg {String} [directionParam="dir"]
         * The name of the direction parameter to send in a request. **This is only used when simpleSortMode is set to
         * true.**
         */
        directionParam: 'dir',

        /**
         * @cfg {String} [idParam="id"]
         * The name of the parameter which carries the id of the entity being operated upon.
         */
        idParam: 'id',

        /**
         * @cfg {Boolean} [simpleSortMode=false]
         * Enabling simpleSortMode in conjunction with remoteSort will only send one sort property and a direction when a
         * remote sort is requested. The {@link #directionParam} and {@link #sortParam} will be sent with the property name
         * and either 'ASC' or 'DESC'.
         */
        simpleSortMode: false,

        /**
         * @cfg {Boolean} [simpleGroupMode=false]
         * Enabling simpleGroupMode in conjunction with remoteGroup will only send one group property and a direction when a
         * remote group is requested. The {@link #groupDirectionParam} and {@link #groupParam} will be sent with the property name and either 'ASC'
         * or 'DESC'.
         */
        simpleGroupMode: false,

        /**
         * @cfg {Boolean} [noCache=true]
         * Disable caching by adding a unique parameter name to the request. Set to false to allow caching. Defaults to true.
         */
        noCache: true,

        /**
         * @cfg {String} [cacheString="_dc"]
         * The name of the cache param added to the url when using noCache. Defaults to "_dc".
         */
        cacheString: "_dc",

        /**
         * @cfg {Number} timeout
         * The number of milliseconds to wait for a response. Defaults to 30000 milliseconds (30 seconds).
         */
        timeout: 300000,

        /**
         * @cfg {Object} api
         * Specific urls to call on CRUD action methods "create", "read", "update" and "destroy". Defaults to:
         *
         *     api: {
         *         create  : undefined,
         *         read    : undefined,
         *         update  : undefined,
         *         destroy : undefined
         *     }
         *
         * The url is built based upon the action being executed [create|read|update|destroy] using the commensurate
         * {@link #api} property, or if undefined default to the configured
         * {@link Ext.data.Store}.{@link Ext.data.proxy.Server#url url}.
         *
         * For example:
         *
         *     api: {
         *         create  : '/controller/new',
         *         read    : '/controller/load',
         *         update  : '/controller/update',
         *         destroy : '/controller/destroy_action'
         *     }
         *
         * If the specific URL for a given CRUD action is undefined, the CRUD action request will be directed to the
         * configured {@link Ext.data.proxy.Server#url url}.
         */
        api: {
            create: undefined,
            read: undefined,
            update: undefined,
            destroy: undefined
        },

        /**
         * @cfg {Object} extraParams
         * Extra parameters that will be included on every request. Individual requests with params of the same name
         * will override these params when they are in conflict.
         */
        extraParams: {}
    }
});