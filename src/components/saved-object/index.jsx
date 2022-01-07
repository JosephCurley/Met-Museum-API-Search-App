import React from 'react';
import PropTypes from 'prop-types';

const SavedObject = ({
	objectNumber,
	objectTitle,
	primaryImageSmall,
	fetchObjects,
}) => (
	<div
		className="saved-object"
		role="button"
		tabIndex={0}
		onClick={() => fetchObjects(objectNumber)}
		onKeyDown={() => fetchObjects(objectNumber)}>
		{primaryImageSmall && (
			<img
				src={primaryImageSmall}
				alt={objectTitle}
				className="saved-object__image"
			/>
		)}
		<div className="saved-object__name">{objectTitle}</div>
	</div>
);

SavedObject.propTypes = {
	objectNumber: PropTypes.number,
	objectTitle: PropTypes.string,
	primaryImageSmall: PropTypes.string,
	fetchObjects: PropTypes.func,
};

export default SavedObject;
