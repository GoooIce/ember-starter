App = Ember.Application.create({
  // Basic logging, e.g. "Transitioned into 'post'"
  LOG_TRANSITIONS: true,

  // Extremely detailed logging, highlighting every internal
  // step made while transitioning into a route, including
  // `beforeModel`, `model`, and `afterModel` hooks, and
  // information about redirects and aborted transitions
  LOG_TRANSITIONS_INTERNAL: true,

  LOG_VIEW_LOOKUPS: true,
  LOG_ACTIVE_GENERATION: true,
  LOG_BINDINGS : true,
  LOG_RESOLVER: true
});

// @url http://emberjs.cn/guides/models/customizing-adapters/
// 在Ember Data中，处理与后台数据仓库通信的逻辑是通过Adapter来完成的。
// Ember Data适配器内置了一些关于REST API的假定。
// 如果后台的实现与Ember Data假定的惯例不同，那么通过扩展缺省的适配器可能很容易的实现。
App.ApplicationAdapter = DS.RESTAdapter.extend({
  // namespace属性用来指定一个特定的url前缀。
  namespace: 'ember/api/v0.1'
});

// 仓库是应用存放记录的中心仓库。
// 你可以认为仓库是应用的所有数据的缓存。
// 应用的控制器和路由都可以访问这个共享的仓库；
// 当它们需要显示或者修改一个记录时，首先就需要访问仓库。
App.ApplicationStore = DS.Store.extend({
  // @url https://github.com/emberjs/data/blob/master/CHANGELOG.md
  // Ember Data 1.0.0-beta.7 (February 19, 2014) Add current revision back to build output.
  // Ember Data 1.0.0-beta.1 (September 01, 2013) Remove revision reference.
    revision : 12
});


// 修改主键为_id与mongodb对接
App.ApplicationSerializer = DS.RESTSerializer.extend({
  primaryKey: '_id'
});

// 属性（Attribute）主要由两个作用，
// 其一是用于转换从服务器返回的JSON数据到记录；
// 其二是序列化一个被修改的记录，将其变动保存到服务器端。
// 模型的属性是通过DS.attr来进行声明的。
var attr = DS.attr;

// @url http://emberjs.com/guides/models/
// 模型是一个类，它定义了需要呈现给用户的数据的属性和行为。
// 任何用户期望在其离开应用然后再回到应用时能够看见的数据，都应该通过模型来表示。
// 模型本身没有任何数据；模型只定义了其实例所具有的属性和行为，而这些实例被称为记录。
App.Post = DS.Model.extend({
    title: attr('string'),
    author: attr('string'),
    intro: attr('string'),
    extended: attr('string'),
    publishedAt: attr('date')
});

// @url http://emberjs.com/guides/routing/defining-your-routes/
// 当启动你的应用时，路由器会负责展示模板，载入数据，以及设置应用状态等任务。
// 这些都是通过将当前的URL与你定义的路由进行匹配来实现的。
// 如果路径（path）的名字跟路由（route）的名字是一样的话，你可以不用写上路径。
// 在模板里面，你可以用{{link-to}}来导向路由，这需要用到你在route方法中定义的名字 （对于'/'来说，名字就是index）。
// Ember.js会自动地根据你在this.route设置的名字来找出对应的路由与控制器。
// 你可以为一个资源定义一系列的路由
// 注意：如果你通过this.resource定义了一个资源，但是没有提供一个函数作为参数，
// 那么隐式的resource.index是不会被创建的。
// 在这种情况下，/resource只会用到 ResourceRoute，RescourceController和resource模板。
App.Router.map(function() {
  // put your routes here
  this.resource('about');

  // 注意：你应该使用this.resource来定义一个URL中的名词字段，
  // 而对于用来改变名词字段的形容词或动词字段 ，使用this.route来定义。
  // 例如，当指定posts（名词）的URL时，路由被定义为this.resource('posts')。
  // 然而，当定义new操作（动词）时，那么路由被定义为this.route('new')。
  this.resource('posts', function () {
    this.route('view', {path : ':post_id'});  // 查看
    this.route('new');                          // 新增
  });
});

App.PostsRoute = Ember.Route.extend({
  model: function() {
    // 在定义了一个模型类之后，就可以开始查询或者创建一个属于这个类型的记录。
    // 当与仓库进行交互时，需要使用模型的名称来指定记录的类型。
    // 例如，仓库的find()方法需要一个字符串类型的值作为第一个参数，用于指定需要查询的记录类型：
    return this.store.find('post');
  }
});

App.PostsViewRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.find('post', params.post_id);
  }
});

App.PostsNewRoute = Ember.Route.extend({
  model: function() {
    // @url http://emberjs.com/guides/models/creating-and-deleting-records/
    // 通过调用仓库的createRecord方法，可以创建记录：
    // 仓库对象在控制器和路由中都可以通过this.store来访问。
    return this.store.createRecord('post',{ author : 'GoooIce' });
  },
  //  actions: {
  //    willTransition: function(transition) {
  //      var userHasEnteredData = this.controllerFor('posts.new').get('userHasEnteredData');
  //      if (userHasEnteredData &&
  //        !confirm("Are you sure you want to abandon progress?")) {
  //        transition.abort();
  //      } else {
  //        // Bubble the `willTransition` action so that
  //        // parent routes can decide whether or not to abort.
  //        return true;
  //      }
  //    }
  //  },
  // This hook is executed when the router completely exits this route.
  // It is not executed when the model for the route changes.
  deactivate: function() {
    // If this property is true the record is in the new state.
    // A record will be in the new state when it has been created on
    // the client and the adapter has not yet report that it was successfully saved.
    // 如果在离开这个页面时数据没有被持久化保存则删除。
    var model = this.get('controller.model');
    var isSaved = this.get('controller.isSaved');
    var isNew = model.get('isNew');
    if(isNew && !confirm("主人您创作的内容还没有保存，要不要人家现在保存一下?")){
      // @url http://emberjs.com/guides/models/creating-and-deleting-records/
      // 删除记录与创建记录一样简单。
      // 只需要调用DS.Model实例的deleteRecord()方法即可。
      // 这将会吧记录标记为isDeleted，并且不在store的all()查询中返回。
      // 删除操作之后会通过使用save()来进行持久化。
      // 此外，也可以使用destroyRecord来将删除和持久化一次完成。
      model.destroyRecord();
    } else if (!isSaved) {
      model.save().then(function () {
        //on success
      }, function () {
        //on fail
        console.log('呀，不小心把主人的内容弄丢了，主人看不到我，看不到我。。。' + model.get('errors.length') +  '::' + model.get('errors'));
      });
    }
  }
});

// Ember.ObjectController用于代表单一模型。通过在路由的setupController方法中设置ObjectController的model属性，来指定其代表的模型。
// Use Ember.ObjectController to represent a single model. To tell an ObjectController which model to represent, set its model property in your route's setupController method.
// 当模板向ObjectController请求属性时，控制器将首先检查是否定义有该属性，如果有，则返回其当前值。然而，当控制器没有定义该属性时，就将返回其代表的（同名）模型的该属性的值。
// When a template asks an ObjectController for the value of a property, the controller looks for a property with the same name on itself first before checking the model.
App.PostsNewController = Ember.ObjectController.extend({
  isSaved : false,
  actions: {
    done: function () {
      // From within a controller, you can access the router via this.get('target').
      // By default, the value of the target property is set to the router, and is injected when a controller is instantiated.
      // This injection is defined in Ember.Application#buildContainer, and is applied as part of the applications initialization process.
      // It can also be set after a controller has been instantiated, for instance when using the render helper in a template,
      // or when a controller is used as an itemController.
      // In most cases the target property will automatically be set to the logical consumer of actions for the controller.
      // var router = this.get('target');
      var self = this;
      var model = this.get('model');

      // Ember Data中的记录都基于实例来进行持久化。调用DS.Model实例的save()会触发一个网络请求，来进行记录的持久化。
      // save()会返回一个承诺，这使得可以非常容易的来处理保存成功和失败的场景。
      model.save().then(function (post) {
        //on success
        //router.transitionTo('posts.view', post.id);
        self.isSaved = true;
        self.transitionToRoute('posts.view', post.id);
      }, function () {
        //on fail
        console.log('post save errors num::' + model.get('errors.length') +  '::' + model.get('errors'));
      });
    }
  }
});

App.PostsViewController = Ember.ObjectController.extend({
  isEditing : false,
  actions:{
    doneEditing: function () {
      this.set('isEditing', false);
      this.get('model').save();
    },
    edit : function () {
      this.set('isEditing', true);
    },
    delete : function () {
      this.get('model').destroyRecord();
      this.transitionToRoute('posts.index');
    }
  }
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return ['red', 'yellow', 'blue'];
  }
});

App.AboutRoute = Ember.Route.extend({
});

Ember.Handlebars.helper('date', function(value, options) {
  var escaped = Handlebars.Utils.escapeExpression(value);
  moment.lang('zh_cn');
  var fromNow = moment(escaped).fromNow();
  return new Ember.Handlebars.SafeString(fromNow);
});
