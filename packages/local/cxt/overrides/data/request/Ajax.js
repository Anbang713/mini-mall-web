/**
 * 允许提交中断
 * Created by cRazy on 2016-8-9-0009.
 */
Ext.define('overrides.data.request.Ajax', {
    override: 'Ext.data.request.Ajax',

    requires: [
        'Cxt.util.LoadMask',
        'Cxt.util.Toast',
        'Ext.data.identifier.Uuid'
    ],

    start: function (data) {
        var me = this,
            options = me.options,
            requestOptions = me.requestOptions,
            isXdr = me.isXdr,
            xhr, headers;

        xhr = me.xhr = me.openRequest(options, requestOptions, me.async, me.username, me.password);

        // XDR doesn't support setting any headers
        if (!isXdr) {
            headers = me.setupHeaders(xhr, options, requestOptions.data, requestOptions.params);
        }

        if (me.async) {
            if (!isXdr) {
                xhr.onreadystatechange = Ext.Function.bind(me.onStateChange, me);
            }
        }

        if (isXdr) {
            me.processXdrRequest(me, xhr);
        }

        // Parent will set the timeout if needed
        // 直接调用父类的方法
        if (me.getTimeout() && me.async) {
            me.timer = Ext.defer(me.onTimeout, me.getTimeout(), me);
        }

        // start the request!
        xhr.send(data);

        options.startTime = new Date();// 记录发起时间

        if (options && options.waitMsg) {
            if (options.waitMsgTarget) {
                me.loadMask = new Ext.LoadMask({
                    msg: options.waitMsg,
                    target: options.waitMsgTarget
                });
                if (!Cxt.util.LoadMask.isDisabled())
                    me.loadMask.show();
            } else {
                Cxt.util.LoadMask.show(options.waitMsg);
            }
        }

        if (!me.async) {
            return me.onComplete();
        }

        return me;
    },

    /**
     * Setup all the headers for the request
     * @private
     * @param {Object} xhr The xhr object
     * @param {Object} options The options for the request
     * @param {Object} data The data for the request
     * @param {Object} params The params for the request
     */
    setupHeaders: function (xhr, options, data, params) {
        var me = this,
            headers = Ext.apply({}, options.headers || {}, me.defaultHeaders),
            contentType = me.defaultPostHeader,
            jsonData = options.jsonData,
            xmlData = options.xmlData,
            type = 'Content-Type',
            useHeader = me.useDefaultXhrHeader,
            key, header;

        if (!headers.hasOwnProperty(type) && (data || params)) {
            if (data) {
                if (options.rawData) {
                    contentType = 'text/plain';
                } else {
                    if (xmlData && Ext.isDefined(xmlData)) {
                        contentType = 'text/xml';
                    } else if (jsonData && Ext.isDefined(jsonData)) {
                        contentType = 'application/json';
                    }
                }
            }

            headers[type] = contentType;
        }

        if (useHeader && !headers['X-Requested-With']) {
            headers['X-Requested-With'] = me.defaultXhrHeader;
        }

        if (useHeader && !headers['trace_id']) {
            var uuidGenerator = Ext.create('Ext.data.identifier.Uuid', {id: 'uuidGenerator'}),
                array = uuidGenerator.generate().split('-'),
                uuid = '';
            Ext.Array.each(array, function (item) {
                uuid += item;
            });
            headers['trace_id'] = uuid;//“-”在url中可能会造成乱码
        }

        // If undefined/null, remove it and don't set the header.
        // Allow the browser to do so.
        if (headers[type] === undefined || headers[type] === null) {
            delete headers[type];
        }

        // set up all the request headers on the xhr object
        try {
            for (key in headers) {
                if (headers.hasOwnProperty(key)) {
                    header = headers[key];
                    xhr.setRequestHeader(key, header);
                }
            }
        } catch (e) {
            // TODO Request shouldn't fire events from its owner
            me.owner.fireEvent('exception', key, header);
        }

        return headers;
    },


    /**
     * To be called when the request has come back from the server
     * @param {Object} request
     * @return {Object} The response
     * @private
     */
    onComplete: function (xdrResult) {
        var me = this,
            owner = me.owner,
            options = me.options,
            xhr = me.xhr,
            failure = {
                success: false,
                isException: false
            },
            result, success, response;

        if (options && options.waitMsg) {
            var current = new Date(),
                fn = function () {
                    if (me.loadMask) {
                        me.loadMask.destroy();
                    } else {
                        Cxt.util.LoadMask.hide();
                    }
                };
            if (options.startTime && (current.getTime() - options.startTime.getTime() < 500)) {
                Ext.defer(fn, 500);// 当有waitMsg 时，应该保证至少显示0.5s。否则闪的太快会造成界面闪烁感
            } else {
                fn();
            }
        }

        if (!xhr || me.destroyed) {
            return me.result = failure;
        }
        try {
            result = me.parseStatus(xhr.status);
            if (result.success) {
                // This is quite difficult to reproduce, however if we abort a request
                // just before it returns from the server, occasionally the status will be
                // returned correctly but the request is still yet to be complete.
                result.success = xhr.readyState === 4;
            }
        } catch (e) {
            // In some browsers we can't access the status if the readyState is not 4,
            // so the request has failed
            result = failure;
        }
        success = me.success = me.isXdr ? xdrResult : result.success;
        if (success) {
            response = me.createResponse(xhr);
            var responseResult = Ext.JSON.decode(response.responseText, true);
            response.responseText = Ext.isString(responseResult.data) ? responseResult.data : Ext.JSON.encode(responseResult.data);
            if (responseResult.success) {
                owner.fireEvent('requestcomplete', owner, response, options);
                Ext.callback(options.success, options.scope, [
                    response,
                    options
                ]);
            } else {
                success = me.success = responseResult.success;
                response.responseText = responseResult.message;

                owner.fireEvent('requestexception', owner, response, options);
                if (options.failureToast === true && !response.aborted) {
                    Cxt.util.Toast.failure(responseResult.message);
                }
                Ext.callback(options.failure, options.scope, [
                    response,
                    options
                ]);
            }
        } else {
            if (result.isException || me.aborted || me.timedout) {
                response = me.createException(xhr);
            } else {
                response = me.createResponse(xhr);
            }
            if (response.status != 0) {
                owner.fireEvent('requestexception', owner, response, options);
                if (options.failureToast === true && !response.aborted) {
                    Cxt.util.Toast.failure(response.responseText);
                }
                Ext.callback(options.failure, options.scope, [
                    response,
                    options
                ]);
            }
        }
        me.result = response;
        Ext.callback(options.callback, options.scope, [
            options,
            success,
            response
        ]);
        owner.onRequestComplete(me);

        me.clearTimer();
        if (me.deferred) {
            if (me.success) {
                me.deferred.resolve(me.result);
            } else {
                me.deferred.reject(me.result);
            }
        }
        return response;
    }
});