COMPONENT('splashscreen', function(self) {
	self.readonly();
	self.make = function() {
		self.aclass('ui-splashscreen');
		self.html('<div><div class="ui-splashscreen-body">{0}</div></div>'.format(self.find('script').html()));
		setTimeout(function() {
			self.aclass('ui-splashscreen-animate');
		}, 100);
		setTimeout(function() {
			self.aclass('ui-splashscreen-removing');
			setTimeout(function() {
				self.remove();
			}, 500);
		}, (+self.attrd('timeout')) || 2500);
	};
});