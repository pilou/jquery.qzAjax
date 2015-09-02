/*global jQuery, window, location, confirm */
/*jslint unparam: true, node: true */
(function ($) {
    'use strict';
    var callbacks = {},
        currentRequests = {},
        call = function (name, $this, options) {
            if (typeof callbacks[name] !== 'undefined') {
                callbacks[name](options, $this);
            } else {
                //@Todo callback undefined
                console.log('callback undefined: ', name);
            }
        },
        success = function (jsonRet, textStatus, jqXHR, $this) {
            if (typeof jsonRet.callbacks !== 'undefined') {
                //@Todo: callbacks.type: parallel/series
                $.each(jsonRet.callbacks.childCallbacks, function (i, currCallback) {
                    call(currCallback.callback, $this, currCallback.options || {});
                });

            } else if (typeof jsonRet.callback !== 'undefined') {
                call(jsonRet.callback, $this, jsonRet.options || {});
            }
            //@Todo: else error
        },
        serializeFormToObject = function ($this) {
            var obj = {},
                ary = $this.serializeArray();

            $.each(ary, function () {
                if (obj[this.name] !== undefined) {
                    if (!obj[this.name].push) {
                        obj[this.name] = [obj[this.name]];
                    }
                    obj[this.name].push(this.value || '');
                } else {
                    obj[this.name] = this.value || '';
                }
            });
            return obj;
        },
        getPostData = function (e, $this) {
            var data = {},
                url = '';

            //@TODO set to optional
            data.qData     = $this.data();
            //@TODO set to optional
            data.qzAjax     = true;
            //@TODO set to optional
            data.qzAjaxHash = location.hash;

            if ($this.is('form')) {
                data = $.extend({}, data, serializeFormToObject($this));
                url = $this.attr('action');
            } else if ($this.is('a')) {
                url = $this.attr('href');
            } else {
                url = data.qData.url;
            }

            return {data: data, url: url};
        },
        confirmNeeded = function ($elem,options) {
          return $elem.data(options.confirmAttributeName) !== undefined;
        },
        doPost = function ($this, url, data, options) {
            //@TODO crossDomain support with preFlight CORS
            data = data || {};
            if (!url) {
                url = window.location;
            }

            //@TODO set to optional
            if ($.type(data) === 'object') {
                data.qzAjaxHash = location.hash;
            }

            return $.ajax({
                url: url,
                data: data,
                type: "POST",
                dataType: "json",
                username: options.username,
                password: options.password,
                timeout: options.timeout,
                beforeSend: function (jqXHR, settings) {
                    if (options.preventDoubleAjax) {
            	            if (typeof currentRequests[settings.url] !== "undefined" && currentRequests[settings.url] === settings.data) {
            	                jqXHR.abort();
            	            } else {
            	                jqXHR.url = settings.url;
            	                currentRequests[settings.url] = settings.data;
				
            	                if ($this instanceof jQuery) {
            	                    options.loadingBefore($this, options);
            	                }
            	            }
            	        } else {
            	            if ($this instanceof jQuery) {
            	                options.loadingBefore($this, options);
            	            }
            	        }
            	    }
            	})
                .done(function (jsonRet, textStatus, jqXHR) {
                    success(jsonRet, textStatus, jqXHR, $this);
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    options.loadingError(jqXHR, textStatus, errorThrown);
                })
                .always(function (jsonRet, textStatus, jqXHR) {
                    options.loadingAfter($this, options);
                    if (currentRequests[jqXHR.url]) {
                        delete currentRequests[jqXHR.url];
                    }
                });
        },
        methods  = {
            setCallbacks: function (setCallbacks) {
                $.extend(callbacks, setCallbacks);
                return;
            },
            post: function ($elem, e, options) {
                e.preventDefault();

                options = $.extend(true, {}, $.fn.qzAjax.defaults, options || {});

                var confirmPromise = $.Deferred();
                confirmPromise.done(function(){
                  var params = getPostData(e, $elem);
                  doPost($elem, params.url, params.data, options || {});
                });

                if(confirmNeeded($elem,options)){
                  options.confirmAction($elem,options,confirmPromise);
                } else {
                  confirmPromise.resolve();
                }
            }
        },
        init = function (options) {
            return this.each(function () {
                var $this = $(this),
                    bindFlag = 'qzAjaxBinded';

                $.each(options.bind, function () {
                    if ($this.is(this.selector)) {
                        if (!$this.data(bindFlag)) {
                            $this.data(bindFlag, true);
                            $this.on(this.event, function (e) {
                                methods.post($this, e, options);
                            });
                        }
                    }
                });
            });
        };

    $.fn.qzAjax = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            var opts = $.extend(true, {}, $.fn.qzAjax.defaults, method);

            return init.apply(this, [opts]);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.qzAjax');
            return null;
        }
    };

    $.fn.qzAjaxLive = function (selector, options) {
        $(document).on('click submit', selector, function (e) {
            options = options || {};

            var $elem = $(e.target),
                bind = options.bind || $.fn.qzAjax.defaults.bind;

            $.each(bind, function () {
                if ($elem.is(this.selector) && e.type === this.event) {
                    methods.post($elem, e, options);
                }
            });
        });
    };

    $.fn.qzAjax.defaults = {
        preventDoubleAjax: true,
        timeout: 0,
        bind: [
            {
                selector: 'form',
                event: 'submit'
            },
            {
                selector: 'a',
                event: 'click'
            }
        ],
        confirmAttributeName: 'confirm',
        confirmAction: function($elem,options,confirmPromise){
            var confirmText = $elem.data(options.confirmAttributeName);
            if(confirm(confirmText)){
              confirmPromise.resolve();
            } else {
              confirmPromise.reject();
            }
        },
        loadingClass: 'qzAjaxLoading',
        loadingBefore: function ($elem, options) {
            $elem.addClass(options.loadingClass);
        },
        loadingError: function (jqXHR, textStatus, errorThrown) {},
        loadingAfter: function ($elem, options) {
            $elem.removeClass(options.loadingClass);
        }
    };
})(jQuery);
