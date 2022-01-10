import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { createWorker } from 'tesseract.js';

const ImageInput = ({ searchObjects }) => {
	const [isProcessing, setIsprocessing] = useState(false);
	const accessionRegex = /^[a-z]{0,4}?(.\d+(\.\d+)*$)/i;

	const setAccessionNumber = accessionNumber => {
		searchObjects(accessionNumber);
	};

	const readImage = file => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			const worker = createWorker();

			(async () => {
				setIsprocessing(true);
				await worker.load();
				await worker.loadLanguage('eng');
				await worker.initialize('eng');
				const { data } = await worker.recognize(reader.result);
				await worker.terminate();
				await setIsprocessing(false);
				data.lines.forEach(line => {
					const firstChunkOfText = line.text.split(' ')[0].replace(/\n/g, '');
					if (firstChunkOfText.match(accessionRegex)) {
						setAccessionNumber(firstChunkOfText);
					}
				});
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
				{isProcessing ? 'Reading Image' : 'Scan Accession #'}
			</label>
			<div className="image-input__image"></div>
		</div>
	);
};

ImageInput.propTypes = {
	searchObjects: PropTypes.func,
};
export default ImageInput;
