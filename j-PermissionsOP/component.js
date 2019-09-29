COMPONENT('permissionsop', 'placeholder:Search;types:CRUD;default:R;labelrole:Role;labelgroup:Group;pk:id', function(self, config) {

	var cls = 'ui-' + self.name;
	var cls2 = '.' + cls;
	var tbody;
	var skip = false;
	var items = [];
	var types = config.types.split('').trim();

	self.configure = function(key, value) {
		switch (key) {
			case 'disabled':
				self.tclass(cls + '-disabled', value);
				break;
		}
	};

	self.make = function() {
		self.aclass(cls);
		config.disabled && self.aclass(cls + '-disabled');

		var builder = ['<tr data-index="{{ index }}"><td class="{0}-text"><i class="fa fa-times red"></i>{{ text | raw }}</td>'];

		for (var i = 0; i < types.length; i++)
			builder.push('<td class="{0}-type{{ if value.indexOf(\'{1}\') !== -1 }} {0}-checked{{ fi }}" data-type="{1}"><i class="far"></i>{1}</td>'.format(cls, types[i]));

		builder.push('</tr>');
		self.template = Tangular.compile(builder.join('').format(cls));
		self.html('<div class="{0}-header"><i class="fa fa-plus-circle green"></i><span>{1}</span></div><div class="{0}-container"><table><tbody></tbody></table></div>'.format(cls, self.html()));
		tbody = self.find('tbody');

		self.event('click', cls2 + '-header', function() {

			if (config.disabled)
				return;

			if (config.limit && items.length >= config.limit) {
				if (W.OP)
					OP.message(config.limitmessage, 'warning');
				else
					SETTER('message', 'warning', config.limitmessage);
				return;
			}

			var opt = {};
			opt.raw = true;
			opt.element = $(this);
			opt.placeholder = config.placeholder;
			opt.items = function(search, next) {
				AJAX('GET ' + config.find, { q: search }, function(response) {
					next(self.preparedata(response));
				});
			};

			opt.key = config.dirkey || 'name';
			opt.callback = function(value) {
				if (items.findItem(config.pk, value[config.pk]))
					return;
				if (!items.length)
					tbody.empty();
				value.value = config.default;
				tbody.append(self.binditem(items.length, value));
				items.push(value);
				self.serialize();
			};
			SETTER('directory', 'show', opt);
		});

		self.event('click', cls2 + '-type', function() {
			if (config.disabled)
				return;
			var el = $(this);
			var tr = el.closest('tr');
			el.tclass(cls + '-checked');
			skip = true;
			var index = +tr.attrd('index');
			var type = el.attrd('type');
			if (el.hclass(cls + '-checked'))
				items[index].value += type;
			else
				items[index].value = items[index].value.replace(type, '');
			self.serialize();
		});

		self.event('click', '.fa-times', function() {
			if (config.disabled)
				return;
			var el = $(this);
			var tr = el.closest('tr');
			var index = +tr.attrd('index');
			skip = true;
			items.splice(index, 1);
			self.serialize();
			tr.remove();
			self.find('tr').each(function(index) {
				$(this).attrd('index', index);
			});
			if (!items.length)
				self.empty();
		});
	};

	self.preparedata = function(data) {
		var arr = self.get();
		for (var i = 0; i < data.length; i++) {
			var item = data[i];
			if (item.prepared)
				continue;

			item.prepared = true;
			item.value = '';

			if (arr) {
				for (var j = 0; j < arr.length; j++) {
					if (arr[j].substring(1) === item[config.pk])
						item.value += arr[j].charAt(0);
				}
			}

			switch (item[config.pk].charAt(0)) {
				case '@':
					item.name = '<b>' + config.labelrole + '</b> ' + item.name;
					break;
				case '#':
					item.name = '<b>' + config.labelgroup + '</b> ' + item.name;
					break;
				default:
					item.name = Thelpers.encode(item.name);
					break;
			}
		}
		return data;
	};

	self.serialize = function() {
		var data = [];
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			var types = item.value.split('');
			for (var j = 0; j < types.length; j++)
				data.push(types[j] + item[config.pk]);
		}
		skip = true;
		self.change();
		self.set(data);
	};

	self.binditem = function(index, item) {
		return self.template({ index: index, text: item.text || item.name, value: item.value || types[0] || 'R' });
	};

	self.bindhtml = function(value) {
		items = self.preparedata(value);
		var builder = [];
		for (var i = 0; i < value.length; i++) {
			var item = value[i];
			builder.push(self.binditem(i, item));
		}
		tbody.html(builder.join(''));
	};

	self.empty = function() {
		config.empty && tbody.html('<tr><td class="{0}-empty"><i class="fa fa-database"></i>{1}</td></tr>'.format(cls, config.empty));
	};

	self.setter = function(value) {

		if (!skip && (!value || !value.length)) {
			items = [];
			skip = false;
			self.empty();
			return;
		}

		if (skip) {
			skip = false;
			return;
		}

		items = [];

		if (value) {
			var filter = {};

			for (var i = 0; i < value.length; i++) {
				var id = value[i].substring(1);
				filter[id] = 1;
			}

			AJAX('GET ' + config.read, { id: Object.keys(filter).join(',') }, self.bindhtml);
		}
	};

});