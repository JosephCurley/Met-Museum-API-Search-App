import React from 'react';
import PropTypes from 'prop-types';

const ActiveObject = ({ object, updateLocalStorage, savedObjects }) => (
	<div className="active-object">
		<div>
			<div className="active-object__title-box">
				<h1>{object.title}</h1>
				<button
					onClick={updateLocalStorage}
					onKeyDown={updateLocalStorage}
					className="active-object__save-button"
					type="submit">
					{savedObjects[object.objectID] ? 'Remove' : 'Save ♥️'}
				</button>
			</div>
			{object.primaryImageSmall && (
				<img
					src={object.primaryImageSmall}
					className="active-object__image"
					alt={object.objectName}
				/>
			)}
			<div>
				<div className="active-object__info">
					<span className="active-object__key">Name: </span>
					<span className="active-object__value">{object.objectName}</span>
				</div>

				<div className="active-object__info">
					<span className="active-object__key">Accession Number: </span>
					<span className="active-object__value">{object.accessionNumber}</span>
				</div>

				<div className="active-object__info">
					<span className="active-object__key">Accession Year: </span>
					<span className="active-object__value">{object.accessionYear}</span>
				</div>

				<div className="active-object__info">
					<span className="active-object__key">Department: </span>
					<span className="active-object__value">{object.department}</span>
				</div>
			</div>
		</div>
	</div>
);

ActiveObject.propTypes = {
	savedObjects: PropTypes.object,
	object: PropTypes.object,
	updateLocalStorage: PropTypes.func,
};

export default ActiveObject;
