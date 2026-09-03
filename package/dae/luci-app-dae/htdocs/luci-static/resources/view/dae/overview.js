'use strict';
'require view';
'require form';
'require rpc';
'require fs';
"require dae.status as status";
"require dae.log as log";

const NAME = "dae";
const CONF="/etc/dae/config.dae"

const setInitAction = rpc.declare({
	object: "luci." + NAME,
	method: "setInitAction",
	params: ["name", "action"],
	expect: { result: false },
});

function writeConfig(section_id, value) {
	return fs.write(CONF, (value || '').trim().replace(/\r\n/g, '\n') + '\n')
		.then(function(res) {
			return setInitAction(NAME, "reload_config");
		})
		.then(function() {
			location.reload();
		});
}

function loadScript(src) {
	return new Promise(function(resolve, reject) {
		var script = document.createElement('script');
		script.src = src;
		script.onload = resolve;
		script.onerror = reject;
		document.head.appendChild(script);
	});
}

function setupEditor(root) {
	var textarea = root.querySelector('textarea');
	if (!textarea)
		return Promise.resolve();

	['/luci-static/resources/dae/lib/codemirror.css',
	 '/luci-static/resources/dae/theme/dracula.css',
	 '/luci-static/resources/dae/addon/fold/foldgutter.css'].forEach(function(href) {
		var link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = href;
		document.head.appendChild(link);
	});

	return loadScript('/luci-static/resources/dae/lib/codemirror.js')
		.then(function() { return loadScript('/luci-static/resources/dae/addon/fold/foldcode.js'); })
		.then(function() { return loadScript('/luci-static/resources/dae/addon/fold/foldgutter.js'); })
		.then(function() { return loadScript('/luci-static/resources/dae/addon/fold/indent-fold.js'); })
		.then(function() { return loadScript('/luci-static/resources/dae/mode/yaml/yaml.js'); })
		.then(function() {
			var editor = CodeMirror.fromTextArea(textarea, {
				mode: 'text/yaml',
				lineNumbers: true,
				lineWrapping: true,
				matchBrackets: true,
				foldGutter: true,
				gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
				theme: 'dracula'
			});
			editor.on('change', function() {
				editor.save();
			});
		});
}

return view.extend({
	render: function() {
		var title, stat, m, s, o;

		title = new form.Map('dae', 'dae',
			_('eBPF-based Linux high-performance transparent proxy solution.'));

		stat = new status.getStatus();

		m = new form.Map('dae');

		s = m.section(form.NamedSection, 'config', 'dae');

		s.tab('config', _('Config'));

		o = s.taboption('config', form.TextValue, '_config');
		o.rows = 32;
		o.load = function(section_id) {
			return fs.trimmed('/etc/dae/config.dae');
		};
		o.write = writeConfig;
		o.remove = writeConfig;

		s.tab('log', _('Log'));

		o = s.taboption('log', form.Value, 'logfile_maxsize', _('Log File Max Size (MB)'));
		o.datatype = 'uinteger';
		o.placeholder= '4';

		o = s.taboption('log', form.DummyValue, '_dae_logview');
		o.render = L.bind(log.getRuntimeLog, this);

		return Promise.all([title.render(), stat.render(), m.render()]).then(function(nodes) {
			var root = E('div', {}, nodes);
			return setupEditor(root).then(function() { return root; });
		});
	},
});
