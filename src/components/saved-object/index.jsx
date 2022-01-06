import React from 'react';
import PropTypes from 'prop-types';
import './saved-object.css';

const SavedObject = ({ objectNumber, objectName, primaryImageSmall, fetchObjects }) => (
  <div className="saved-object" onClick={e => fetchObjects(objectNumber)}>
		{primaryImageSmall && <img src={primaryImageSmall} alt={objectName} className="saved-object__image"/>}
		<div class="saved-object__name">{objectName}</div>
	</div>
);

SavedObject.propTypes = {
	objectNumber: PropTypes.number,
  objectName: PropTypes.string,
	primaryImageSmall: PropTypes.string,
	fetchObjects: PropTypes.func
};

export default SavedObject;
