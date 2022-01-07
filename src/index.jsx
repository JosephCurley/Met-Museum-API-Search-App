import React from 'react';
import ReactDOM from 'react-dom';
import { createWorker } from 'tesseract.js';
import App from './App.jsx';

import objectLabel from '../example/object_label_cropped.png';

const worker = createWorker({
	logger: m => console.log(m),
});

(async () => {
	await worker.load();
	await worker.loadLanguage('eng');
	await worker.initialize('eng');
	const { data } = await worker.recognize(objectLabel);
	console.log(data);
	await worker.terminate();
})();

ReactDOM.render(<App />, document.getElementById('app'));
