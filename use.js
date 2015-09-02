$(function () {

    $('.qzAjaxCustomConfirm').qzAjax({
      confirmAttributeName: 'custom-confirm',
      confirmAction: function($elem, options, confirmPromise) {
        // create here your awesome confirm dialog
        if (confirm("Sure?")) {
          confirmPromise.resolve();
        } else {
          confirmPromise.reject();
        }
      }
    });

  	$('.qzAjaxConfirm').qzAjax();

    $('.qzAjax').qzAjax({
        preventDoubleAjax: false
    });
    $('.qzAjax').qzAjax({
        preventDoubleAjax: false
    });
    $('.qzAjax').qzAjax({
        preventDoubleAjax: false
    });

    $.fn.qzAjaxLive('.qzAjax');

    $('body').append('<a href="/test.php" class="qzAjax">LIVE LINK</a>');

    $.fn.qzAjax('setCallbacks', {
        setContent: function (json, $this) {
			if (!json.selector) {
				json.selector = $this;
			}
			if (json.html) {
				$(json.selector).html(json.html);
			} else if (json.text) {
				$(json.selector).text(json.text);
			}
			return true;
		},
		debug: function (json, $this) {
			console.log(json.log);
			return true;
		}
    });

    $('a.qzAjax').trigger('click');

    setTimeout(function () {
        $('a.qzAjax').trigger('click');
        $('form.qzAjax').trigger('submit');
    }, 1000);
});
