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
					console.log('lol');
					setImageInputText('Scan Accession #');
				}
			})();
		};
	};

	const handleOnChange = file => {
		if (file && file.type.includes('image')) {
			readImage(file);
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
