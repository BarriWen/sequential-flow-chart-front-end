/* global location, document */

function isTestEnv() {
	const hostname = location.hostname.toLowerCase();
	return hostname === 'localhost' ||
		hostname.startsWith('192.168.');
}

function embedScript(url) {
	document.write(`<script src="${url}"></script>`);
}

function embedStylesheet(url) {
	document.write(`<link href="${url}" rel="stylesheet">`);
}

const baseUrl = isTestEnv()
	? '..'
	: '//cdn.jsdelivr.net/npm/sequential-workflow-designer@0.2.0';

embedScript(`../src/designer.js`);
embedStylesheet(`../css/designer.css`);
embedStylesheet(`../css/designer-light.css`);
embedStylesheet(`../css/designer-dark.css`);
