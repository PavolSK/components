COMPONENT('filebrowser', function(self) {

	var input;

	self.singleton();
	self.readonly();
	self.nocompile();

	self.show = self.browse = function(opt, callback) {

		// opt.callback {Function(files, event)}
		// opt.multiple {Boolean}
		// opt.accept {String}

		if (!opt.callback && callback)
			opt.callback = callback;

		self.opt = opt;
		self.find('input').attr('accept', opt.accept || '*/*').prop('multiple', !!opt.multiple);
		input[0].value = '';
		input.click();
	};

	self.make = function() {
		self.aclass('hidden');
		self.append('<input type="file" multiple />');
		input = self.find('input');
		self.event('change', 'input', function(e) {
			self.opt.callback(e.target.files, e);
			this.value = '';
		});
	};

});