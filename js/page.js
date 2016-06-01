(function($) {

    function ViewModel() {
        var self = this;
        self.title = ko.observable();
        self.messages = ko.observableArray([]);
    }

    // using KnockoutJS pub/sub
    var postbox = new ko.subscribable();

    var uid = getCookie("uid");
    // generate unique identifier
    if (!uid) {
        uid = Math.ceil(Math.random() * 100000);
        // set a cookie for 7 days
        setCookie("uid", uid, 7);
    }

    // we use Sammy for client-side routing
    var app = $.sammy('#app');

    var deferreds = {
        chatRoutes: $.Deferred()
    };

    // create view model
    var vm = new ViewModel();
    $.extend($, {
        vm: vm,
        uid: uid,
        isPushEnabled: false,
        postbox: postbox,
        app: app,
        channel: null,
        deferreds: deferreds
    });

    // delay the creation of the root route until other routes are registered
    $.deferreds.chatRoutes.then(function() {
        // register the root url
        app.get('/?', function(context) {
            var self = this;
            var $element = context.$element();

            // retrieve the list of channels from the API and render the HTML
            context.render('./main.html').then(function(response) {
                context.app.swap(response);
            });
        });
    });

    $(function() {
        FastClick.attach(document.body);
        ko.applyBindings(vm);
        app.run();
    });

    // register the service worker if available
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').then(function(reg) {
            console.log('Successfully registered service worker', reg);
        }).catch(function(err) {
            console.warn('Error whilst registering service worker', err);
        });
    }

})(jQuery);
