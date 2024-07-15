COMPONENT('monacoeditor', 'theme:vs-light;language:javascript;margin:0', function(self, config, cls) {

	self.make = function() {

		self.aclass(cls);
		self.resizeforce();
		self.editor = monaco.editor.create(self.dom, {
			language: config.language,
			theme: config.theme
		});

		var timeout = null;
		var updatevalue = function() {
			timeout = null;
			self.bind('@modified @touched', self.editor.getValue());
		};

		self.editor.onDidChangeModelContent(function(event) {
			timeout && clearTimeout(timeout);
			timeout = setTimeout(updatevalue, 100);
		});

		self.on('resize + resize2', self.resize);
	};

	self.destroy = function() {
		self.editor.dispose();
		self.editor = null;
	};

	self.resize = function() {
		setTimeout2(self.ID, self.resizeforce, 300);
	};

	self.resizeforce = function() {

		var height = config.height || 200;

		if (config.parent) {
			var parent = self.parent(config.parent);
			var tmp = parent.height();
			if (tmp > height)
				height = tmp;
		}

		self.element.css({ height: height - config.margin });
		self.editor && self.editor.layout();
	};

	self.configure = function(key, value, init) {

		if (init)
			return;

		switch (key) {
			case 'language':
				self.editor.setModelLanguage(editor.getModel(), value);
				break;
			case 'theme':
				self.editor.setTheme(theme);
				break;
		}
	};

	self.setter = function(value) {
		self.editor.setValue(value || '');
	};

}, ['https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/min/vs/editor/editor.main.min.css', 'https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/min/vs/loader.js', function(next) {
	require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/min/vs' } });
	require(['vs/editor/editor.main'], next);
}]);