var navigate = require('shared/lib/navigate');

function setFilterOptions(view) {
  var params       = view.options.params,
      categories   = _.compact((params.categories || '').split(',')),
      demographics = _.compact((params.demographics || '').split(',')),
      gender       = params.gender,
      sort         = params.sort,
      hours        = params.hours;

  categories.forEach(function(category) {
    view.$('.categories .btn[data-value="' + category + '"]').button('toggle');
  });

  demographics.forEach(function(demographic) {
    view.$('.filter-demographics .btn[data-value="' + demographic + '"]').button('toggle');
  });

  if (gender) {
    view.$('.filter-gender .btn[data-value="' + gender + '"]').button('toggle');
  }

  if (sort === 'name') {
    view.$('.filter-sort .btn[data-value="name"]').button('toggle');
  }

  if (hours === 'open') {
    view.$('.filter-hours .btn[data-value="open"]').button('toggle');
  }

  var up = 38, left = 37, right = 39, down = 40, tab = 9, space = 32;
  view.$('div[role=radiogroup]').click(function(event) {
    if ($(event.target).attr("role") != 'radio') { return; }
    var radiogroup = $(this),
        oldOpt = radiogroup.find('button[aria-checked="true"]');

    $(oldOpt).attr('aria-checked', false);
    $(event.target).attr('aria-checked', true);
  }).keydown(function(event) {
    var target = $(event.target);
    if (event.which == up || event.which == left) {
      console.log('up or left', event.controlKey);
      // debugger;
      // Up Arrow and Left Arrow moves focus to the previous radio button in the group, and selects that button.
      // If focus is on the first item, then focus wraps to last item.
      // Control+Arrow moves through the options without updating content or selecting the button.
      var firstItem = $(this).find(':first-child[role=radio]')[0] === target;
      var toSelect = firstItem ? $(this).find(':last-child[role=radio]')[0] : target.prev();
      if (!event.controlKey) { toSelect.button('toggle'); }
      toSelect.focus();
    } else if (event.which == down || event.which == right) {
      if (!event.controlKey) { target.next().button('toggle'); }
      target.next().focus();
    } else if (event.which == tab) {
      console.log('tab', event.shiftKey);
    } else if (event.which == space) {
      console.log('space');
    }
    console.log('keydown', event.which, event.shiftKey, event.controlKey);
  // }).focusin(function(event) {
  //   // When Tab or Shift+Tab into a radio group, focus goes to the selected radio button
  //   // debugger;
  //   var selected = $(this).find('[role=radio][aria-checked=true]')[0];
  //   if (selected) {
  //     console.log('focus in selected');
  //     event.preventDefault();
  //     selected.focus();
  //   }
  //   console.log('focusIn', event, event.target, event.which);
  });
  // }).focus(function(event) {
  //   console.log('focus', event, event.target, event.which);
  // });

  // TODO: last!
  // $(document.body).keyup(function(event) {
  //   if (event.which == tab) {
  //     var focused = $(':focus');
  //     if ($(event.target).attr('role') === 'radio' || focused.attr('role') === 'radio') {
  //       console.log('body tab', event.shiftKey, event.originalEvent.srcElement, focused);
  //     }
  //   }
  // });

  view.$('button[role=checkbox]').click(function() {
    var button = $(this);
    button.attr('aria-checked', !button.hasClass('active'));
  });

  view.$('button[role=checkbox], button[role=radio]').each(function() {
    var button = $(this);
    button.attr('aria-checked', button.hasClass('active'));
    button.attr('aria-describedby', button.parent().attr('aria-describedby'));
  });
}

var FilterView = Backbone.View.extend({
  constructor: function (options) {
    Backbone.View.apply(this, arguments);
    this.options = options;
  },

  navButtons: [
    {'class': 'left', id: 'backNav-button', text: '<i class="icon-left-open back"></i> BACK'},
    {'class': 'right', id: 'searchNav-button', text: 'SEARCH', action: 'submitSearch'}
  ],

  template: require('templates/filter'),

  events: {
    "click .search .search-button": "submitSearch",
    'click ul.categories .category': 'toggleCategory'
  },

  toggleCategory: function(event) {
    $(event.target).toggleClass('active');
  },

  render: function() {
    var distanceDisabled = this.options.currentLocation ? false : 'disabled';

    this.$el.html(this.template({
      categories:       require('shared/lib/categories'),
      filter:           true,
      distanceDisabled: distanceDisabled
    }));

    _.defer(setFilterOptions, this);

    return this;
  },

  submitSearch: function() {
    var categories   = [],
        demographics = [],
        gender       = null,
        sort         = null,
        hours        = null;

    categories = this.$('.categories .btn.active').toArray().map(function(el) {
      return $(el).data('value');
    });

    demographics = this.$(".filter-demographics .btn.active").toArray().map(function(el) {
      return $(el).data("value");
    });

    gender = this.$(".filter-gender .btn.active").data("value");

    if(gender === "A") {
      gender = null;
    }

    sort = this.$(".filter-sort .btn.active").data("value");

    hours = this.$(".filter-hours .btn.active").data("value");
    if (hours === "A") { hours = null; }

    navigate({
      categories:   categories,
      demographics: demographics,
      gender:       gender,
      sort:         sort,
      hours:        hours
    });
  }
});

module.exports = FilterView;
