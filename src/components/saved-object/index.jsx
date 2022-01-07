import React from 'react';
import PropTypes from 'prop-types';

const SavedObject = ({ objectNumber, objectTitle, primaryImageSmall, fetchObjects }) => (
  <div className="saved-object" onClick={e => fetchObjects(objectNumber)}>
		{primaryImageSmall && <img src={primaryImageSmall} alt={objectTitle} className="saved-object__image"/>}
		<div class="saved-object__name">{objectTitle}</div>
	</div>
);

SavedObject.propTypes = {
	objectNumber: PropTypes.number,
  objectTitle: PropTypes.string,
	primaryImageSmall: PropTypes.string,
	fetchObjects: PropTypes.func
};

export default SavedObject;
