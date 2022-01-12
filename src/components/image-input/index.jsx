import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { createWorker } from 'tesseract.js';

const ImageInput = ({ searchObjects }) => {
	const [imageInputText, setImageInputText] = useState('Scan Accession #');
	const accessionRegex = /^[a-z]{0,4}?(.\d+(\.\d+)*$)/i;

	const readImage = file => {
		let success = false;
		setImageInputText('Processing');
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			const worker = createWorker();

			(async () => {
				await worker.load();
				await worker.loadLanguage('eng');
				await worker.initialize('eng');
				const { data } = await worker.recognize(reader.result);
				await worker.terminate();
				data.lines.forEach(line => {
					const firstChunkOfText = line.text.split(' ')[0].replace(/\n/g, '');
					if (firstChunkOfText.match(accessionRegex)) {
						searchObjects(firstChunkOfText);
						success = true;
					}
				});
				if (!success) {
					setImageInputText('Error Reading Image');
				} else {
					setImageInputText('Scan Accession #');
				}
			})();
		};
	};

	const dataURLToBlob = dataURL => {
		const BASE64_MARKER = ';base64,';
		if (dataURL.indexOf(BASE64_MARKER) === -1) {
			const parts = dataURL.split(',');
			const contentType = parts[0].split(':')[1];
			const raw = parts[1];

			return new Blob([raw], { type: contentType });
		}

		const parts = dataURL.split(BASE64_MARKER);
		const contentType = parts[0].split(':')[1];
		const raw = window.atob(parts[1]);
		const rawLength = raw.length;

		const uInt8Array = new Uint8Array(rawLength);

		for (let i = 0; i < rawLength; i += 1) {
			uInt8Array[i] = raw.charCodeAt(i);
		}

		return new Blob([uInt8Array], { type: contentType });
	};

	const resizeImage = file => {
		const reader = new FileReader();
		reader.onload = readerEvent => {
			const image = new Image();
			image.onload = () => {
				// Resize the image
				const canvas = document.createElement('canvas');
				const maxSize = 544;
				let { width, height } = image;
				if (width > height) {
					if (width > maxSize) {
						height *= maxSize / width;
						width = maxSize;
					}
				} else if (height > maxSize) {
					width *= maxSize / height;
					height = maxSize;
				}
				canvas.width = width;
				canvas.height = height;
				canvas.getContext('2d').drawImage(image, 0, 0, width, height);
				const dataUrl = canvas.toDataURL('image/jpeg');
				const resizedImage = dataURLToBlob(dataUrl);
				console.log(resizedImage);
				// $.event.trigger({
				// 	type: 'imageResized',
				// 	blob: resizedImage,
				// 	url: dataUrl,
				// });
			};
			image.src = readerEvent.target.result;
		};
		readImage(file);
	};

	const handleOnChange = file => {
		if (file && file.type.includes('image')) {
			console.log(file);
			resizeImage(file);
			//	readImage(file);
		}
	};

	return (
		<div className="image-input__container">
			<label
				htmlFor="image-input"
				className="image-input__label button button--secondary">
				<input
					onChange={e => handleOnChange(e.target.files[0])}
					id="image-input"
					type="file"
					accept="image/jpeg,image/png"
					className="image-input__input"
				/>
				{imageInputText}
			</label>
		</div>
	);
};

ImageInput.propTypes = {
	searchObjects: PropTypes.func,
};
export default ImageInput;
