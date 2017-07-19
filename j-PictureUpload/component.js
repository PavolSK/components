COMPONENT('pictureupload', function(self) {

	var width = +self.attrd('width');
	var height = +self.attrd('height');
	var url = self.attrd('url') || location.pathname;
	var empty;
	var img;

	self.readonly();

	self.make = function() {

		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;

		var bg = self.attrd('background');
		if (bg) {
			var ctx = canvas.getContext('2d');
			ctx.fillStyle = bg;
			ctx.fillRect(0, 0, width, height);
		}

		empty = canvas.toDataURL('image/png');
		canvas = null;

		var html = self.html();
		var icon = self.attrd('icon');
		self.toggle('ui-pictureupload');
		self.html((html ? '<div class="ui-pictureupload-label">{0}{1}:</div>'.format(icon ? '<i class="fa {0}"></i>'.format(icon) : '', html) : '') + '<input type="file" accept="image/*" class="hidden" /><img src="{0}" class="img-responsive" alt="" />'.format(empty, width, height));

		img = self.find('img');

		img.on('click', function() {
			self.find('input').trigger('click');
		});

		self.event('change', 'input', function(evt) {
			self.upload(evt.target.files);
		});

		self.event('dragenter dragover dragexit drop dragleave', function (e) {

			e.stopPropagation();
			e.preventDefault();

			switch (e.type) {
				case 'drop':
					break;
				case 'dragenter':
				case 'dragover':
					return;
				case 'dragexit':
				case 'dragleave':
				default:
					return;
			}

			self.upload(e.originalEvent.dataTransfer.files);
		});
	};

	self.upload = function(files) {

		if (!files.length)
			return;

		var el = this;
		var data = new FormData();
		data.append('file', files[0]);
		data.append('width', width);
		data.append('height', height);

		UPLOAD(url, data, function(response, err) {

			SETTER('loading', 'hide', 100);

			if (err) {
				SETTER('message', 'warning', self.attrd('error-large'));
				return;
			}

			self.change();
			el.value = '';
			self.set(response);
		});
	};

	self.setter = function(value) {
		if (value)
			img.attr('src', (self.attrd('path') || '{0}').format(value));
		else
			img.attr('src', empty);
	};
});