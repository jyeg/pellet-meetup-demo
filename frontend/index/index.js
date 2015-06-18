var React = require("react")
  , indexJade = require('./index.jade')
  , pellet = require("pellet");

function getData(_this, page, search, next) {
  var api = _this.coordinator('DAL', 'DAL', next?'serialize':void 0);

  if(page < 0) {
    page = 0;
  }

  var limit = 5;
  var offset = limit * page;
  var sql = search ?
      'SELECT title, out(hasGenera).description as genera FROM Movies WHERE title LIKE :search OFFSET :offset' :
      'SELECT title, out(hasGenera).description as genera FROM Movies WHERE OFFSET :offset';

  api.select(sql, {offset:offset, search: '%' + search + '%'}, limit, function(err, movies) {
    if(err) {
      return next(err);
    }

    _this.setState({movies:movies, limit:limit, offset:offset, page:page});
    if(next) {
      next();
    }
  });
}

module.exports = indexPage = pellet.createClass({
  /*
  getInitialState: function() {
    return {};
  },
  componentWillMount: function() {
  },
  componentDidMount: function(nextProps) {
  },
  componentWillReceiveProps: function(nextProps) {
  },
  shouldComponentUpdate: function(nextProps, nextState) {
  },
  componentWillUpdate: function(nextProps, nextState) {
  },
  componentDidUpdate: function(prevProps, prevState) {
  },
  componentWillUnmount: function(nextProps, nextState) {
  },
  */

// layoutTemplate: "{name_of_your_layout_in_the_manifest}",
  
  routes: ["/", "/index", "/movie/:id"],

  componentConstruction: function(options, next) {
    this.setCanonical('http://pellet.io/demo');
    this.addToHead('meta', {name: 'description', content:'movie database demo'});
    this.addToHead('link', {rel: 'alternate', media:'only screen and (max-width: 640px)', href: 'http://m.pellet.io/demo'});
    this.addToHead('meta', {property: 'og:description', content:'movie database demo'});

    /* Example of redirect and UA logic
    var userAgent = this.getUA();
    if(userAgent && userAgent.device && userAgent.device.type !== "web") {
      this.redirect('http://pellet.io/demo');
    }
    */

    getData(this, 0, this.props.query && this.props.query.search, next);
  },

  componentDidMount: function(nextProps) {
    var _this = this;
    var el = this.refs['search'].getDOMNode();
    pellet.observables.fromEvent(el, "keyup")
      .debounce(300)
      .onValue(function(evt) {
        if(evt.key === 13 || evt.keyCode === 13 || evt.which === 13) {
          el.blur();
        }

        window.history.replaceState(null, null, '/?search=' + encodeURIComponent(el.value));
        getData(_this, 0, (el.value.trim().length > 1) ? el.value : null);
      });
  },

  prev: function() {
    getData(this, this.state.page-1, null);
  },

  next: function() {
    getData(this, this.state.page+1, null);
  },

  render: function() {
    return indexJade(this);
  }
});
