COMPONENT('click', function(self) {

	var config = self.config;
	self.readonly();

	self.click = function() {
		if (config.value)
			self.set(self.parser(config.value));
		else
			self.get(self.attrd('jc-path'))(self);
	};

	self.make = function() {
		self.event('click', self.click);
		config.enter && $(config.enter === '?' ? self.scope : config.enter).on('keydown', 'input', function(e) {
			e.which === 13 && setTimeout(function() {
				!self.element.get(0).disabled && self.click();
			}, 100);
		});
	};
});