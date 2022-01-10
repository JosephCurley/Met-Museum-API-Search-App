import React from 'react';
import ReactDOM from 'react-dom';
import { createWorker } from 'tesseract.js';
import App from './App.jsx';

ReactDOM.render(<App />, document.getElementById('app'));

const textarea = document.getElementById('textarea');
const canvas = document.getElementById('canvas');
const progress = document.getElementById('progress');
// const accessionRegex = /\(\d+\.\d+.\d+.+\)/i;
const accessionRegex = /^[a-z]{0,4}?(.\d+(\.\d+)*$)/i;

const setAccessionNumber = accessionNumber => {
	console.log(accessionNumber);
};

function drawImage(url) {
	const ctx = canvas.getContext('2d');
	const image = new Image();
	image.src = url;
	image.crossOrigin = 'Anonymous';
	image.onload = () => {
		canvas.width = image.width;
		canvas.height = image.height;
		ctx.drawImage(image, 0, 0);

		const worker = createWorker({
			logger: m => {
				console.log(m);
				const num = m.progress * 100;
				progress.innerText = `Status: ${m.status}. Percent: ${num}`;
				console.log(num);
			},
		});

		(async () => {
			await worker.load();
			await worker.loadLanguage('eng');
			await worker.initialize('eng');
			// const { data } = await worker.recognize(src);
			const { data } = await worker.recognize(canvas.toDataURL('image/png'));
			await worker.terminate();
			console.log(data);
			data.lines.forEach(line => {
				const firstChunkOfText = line.text.split(' ')[0].replace(/\n/g, '');
				if (firstChunkOfText.match(accessionRegex)) {
					setAccessionNumber(firstChunkOfText);
				}
			});
		})();
	};
}

document.querySelector('input[type="file"]').onchange = function () {
	if (this.files) {
		const img = this.files[0];
		const reader = new FileReader();
		reader.readAsDataURL(img);

		reader.onload = () => {
			drawImage(reader.result);
		};
	}
};
