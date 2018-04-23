COMPONENT('linechart', 'paddingaxis:0;paddingbars:5;limit:0;fill:true;point:5;fillopacity:0.1;paddinggroup:0;offsetX:10;offsetY:10;templateY:{{ value | format(0) }};templateX:{{ value }};height:0;width:0', function(self, config) {

	var svg, g, axis, selected, points, fills, selectedold;
	var templateX, templateY;
	var W = $(window);

	self.readonly();
	self.make = function() {
		self.aclass('ui-linechart');
		self.empty().append('<svg></svg>');
		svg = self.find('svg');
		axis = svg.asvg('g').attr('class', 'axisy');
		fills = svg.asvg('g').attr('class', 'fills');
		g = svg.asvg('g').attr('class', 'lines');
		points = svg.asvg('g').attr('class', 'points');
		selected = svg.asvg('text').attr('class', 'selected').attr('text-anchor', 'end');
		W.on('resize', self.resize);

		self.event('click mouseenter', 'circle', function(e) {

			var circle = $(this);
			var index = circle.attrd('index');

			if (index === self.$selectedindex && e.type === 'mouseenter')
				return;

			self.$selectedindex = index;

			var arr = index.split(',');
			var item = self.get()[+arr[0]];
			var value = item.values[+arr[1]];

			selectedold && selectedold.animate({ r: config.point }, 100);

			selected.text(templateY({ value: value.y }));
			selectedold = circle.animate({ r: config.point + 3 }, 100);

			if (e.type === 'mouseenter') {
				setTimeout2(self.id, function() {
					selectedold && selectedold.animate({ r: config.point }, 100);
					selectedold = null;
					selected.text('');
				}, 2000);
			} else
				clearTimeout2(self.id);
		});

	};

	self.destroy = function() {
		W.off('resize', self.resize);
	};

	self.resize = function() {
		setTimeout2('resize.' + self.id, function() {
			self.refresh();
		}, 500);
	};

	self.configure = function(key, value, init) {
		switch (key) {
			case 'templateX':
				templateX = Tangular.compile(value);
				break;
			case 'templateY':
				templateY = Tangular.compile(value);
				break;
			default:
				!init && self.resize();
				break;
		}
	};

	self.released = function(is) {
		!is && setTimeout(self.refresh, 1000);
	};

	self.setter = function(value) {

		if (!self.element.get(0).offsetParent) {
			setTimeout(function() {
				self.refresh();
			}, 1000);
			return;
		}

		if (!value) {
			g.empty();
			return;
		}

		var maxX = 0;
		var maxY = 0;
		var labels = [];
		var paddingbars = config.paddingbars;
		var paddinggroup = config.paddinggroup;
		var len = value.length;
		var size = value[0].values.length;
		var width = config.width ? config.width : self.element.width();
		var height = config.height ? config.height : (width / 100) * 60;
		var barwidth = ((width - paddingbars - paddinggroup - config.paddingaxis) / (size * len));
		var offsetY = 30;

		barwidth -= paddingbars + (paddinggroup / len);

		for (var i = 0; i < len; i++) {
			var item = value[i];
			labels.push(item.name);
			for (var j = 0, length = item.values.length; j < length; j++) {
				var val = item.values[j];
				maxX = Math.max(maxX, val.x);
				maxY = Math.max(maxY, val.y);
			}
		}

		if (config.limit)
			maxY = config.limit;

		svg.attr('width', width);
		svg.attr('height', height);
		selected.attr('transform', 'translate({0},30)'.format(width - 20));

		g.empty();
		axis.empty();
		points.empty();
		fills.empty();

		height = height - offsetY;

		var T = { value: null };

		for (var i = 4; i > 0; i--) {
			var val = i * 20;
			var y = ((height / 100) * val) + 25;
			axis.asvg('line').attr('x1', 0).attr('x2', width).attr('y1', y).attr('y2', y).attr('class', 'axis');
			T.value = (maxY / 100) * (100 - val);
			axis.asvg('text').aclass('ylabel').attr('transform', 'translate({0},{1})'.format(config.offsetX, y - config.offsetY)).text(templateY(T));
		}

		var offsetX = config.paddingaxis + paddingbars + paddinggroup;
		var posX = 0;
		var offsetL = (len - 1) === 0 ? 0.5 : len - 1;
		var data = [];
		var fill = [];

		for (var j = 0; j < len; j++) {
			data.push([]);
			fill.push([]);
		}

		for (var i = 0, length = size; i < length; i++) {
			for (var j = 0; j < len; j++) {
				var item = value[j];
				var val = item.values[i];
				var y = ((val.y / maxY) * 100) >> 0;
				var x = posX;
				var h = height.inc('{0}%'.format(y));

				x += offsetX;
				T.value = val.y;

				var mx = x + config.paddingaxis + (barwidth / 2);
				var my = (height - h) + (offsetY / 2);

				data[j].push((i ? 'L' : 'M') + '{0} {1}'.format(mx, my));

				if (config.fill) {
					!i && fill[j].push('M' + mx + ' ' + height);
					fill[j].push('L{0} {1}'.format(mx, my));
					if (i === length - 1)
						fill[j].push('L' + mx + ' ' + height);
				}
				points.asvg('circle').attr('cx', mx).attr('cy', my).attr('r', config.point).aclass('point' + (j + 1)).attrd('index', j + ',' + i);
			}

			T.value = val.x;
			var text = templateX(T);
			g.asvg('text').aclass('xlabel').text(text).attr('text-anchor', 'middle').attr('transform', 'translate({0},{1})'.format(posX + offsetX + (barwidth * offsetL), height + offsetY - 6));
			posX += (len * barwidth) + paddinggroup;
			offsetX += len * paddingbars;
		}

		for (var j = 0; j < len; j++)
			g.asvg('path').attr('d', data[j].join(' ')).aclass('line' + (j + 1));

		if (config.fill) {
			for (var j = 0; j < len; j++)
				fills.asvg('path').attr('d', fill[j].join(' ') + ' Z').aclass('line' + (j + 1) + 'fill').attr('opacity', config.fillopacity);
		}
	};
});