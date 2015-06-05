define(['jquery', 'underscore', 'backbone', 'jquerymobile'], function($, _, Backbone){
	$.widget("up.campusmenu", {
		options: {
			onChange: function(name) {},
			store: "campusmenu.default"
		},

		_create: function() {
			var url = Backbone.history.fragment.split('/');
			url = url[0]+'/'+url[1];
			// create html code
			this.element.append(
				"<div class=\"ui-navbar\" data-role='navbar'> \
                    <ul class=\"ui-grid-b\"> \
                        <li class=\"ui-block-a\"><a rel='norout' href='#"+url+"/griebnitzsee' class='location-menu location-menu-default'>Griebnitzsee</a></li> \
                        <li class=\"ui-block-b\"><a rel='norout' href='#"+url+"/neuespalais' class='location-menu'>Neues Palais</a></li> \
                        <li class=\"ui-block-c\"><a rel='norout' href='#"+url+"/golm' class='location-menu'>Golm</a></li> \
                    </ul> \
                </div>");
			this.element.trigger("create");

			// read local storage
			this.options.store = this.element.attr("data-store");

			// bind to click events
			var widgetParent = this;
			$(".location-menu", this.element).bind("click", function (event) {
				var source = $(this);
				var target = widgetParent._retrieveSelection(source);

				// call onChange callback
				widgetParent._setDefaultSelection(target);
				widgetParent.options.onChange({ campusName: target });

				// For some unknown reason the usual tab selection code doesn't provide visual feedback, so we have to use a custom fix
				widgetParent._fixActiveTab(source, event);
			});
		},

		_destroy: function() {
			this.element.children().last().remove();
		},

		pageshow: function() {
			var selection = this._activateDefaultSelection();
			this.options.onChange({ campusName: selection });
		},

		_setOption: function(key, value) {
			this._super(key, value);
		},

		_setDefaultSelection: function(selection) {
			localStorage.setItem(this.options.store, selection);
		},

		_getDefaultSelection: function() {
			return localStorage.getItem(this.options.store);
		},

		_retrieveSelection: function(selectionSource) {
			var s = selectionSource.attr("href").slice(1);
			s = s.substr(s.lastIndexOf('/') + 1);
			return s;
		},

		_activateDefaultSelection: function() {
			var defaultSelection = this._getDefaultSelection();

			if (!defaultSelection) {
				var source = $(".location-menu-default");
				defaultSelection = this._retrieveSelection(source);
				this._setDefaultSelection(defaultSelection);
			}

			$(".location-menu", this.element).removeClass("ui-btn-active");
			var searchExpression = "a[href*='" + defaultSelection + "']";
			$(searchExpression).addClass("ui-btn-active");

			return defaultSelection;
		},

		_fixActiveTab: function(target, event) {
			event.preventDefault();
			$(".location-menu", this.element).removeClass("ui-btn-active");
			target.addClass("ui-btn-active");
		},

		getActive: function() {
			return this._retrieveSelection($(".ui-btn-active"));
		},

		changeTo: function(campusName, meta) {
			var target = campusName;

			$(".location-menu", this.element).removeClass("ui-btn-active");
			var searchExpression = "a[href*='/" + target + "']";
			$(searchExpression).addClass("ui-btn-active");

			// prepare call options
			var callOptions = { campusName: target };
			if (meta !== undefined) {
				callOptions.meta = meta;
			}

			// call onChange callback
			this._setDefaultSelection(target);
			this.options.onChange(callOptions);
		}
	});
});