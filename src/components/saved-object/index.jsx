import React from 'react';
import PropTypes from 'prop-types';
import './saved-object.css';

const SavedObject = ({ objectName, primaryImageSmall }) => (
  <div className="saved-object">
		{primaryImageSmall && <img src={primaryImageSmall} alt={objectName} className="saved-object__image"/>}
		<h4>{objectName}</h4>
	</div>
);

SavedObject.propTypes = {
  objectName: PropTypes.string,
	primaryImageSmall: PropTypes.string,
};

export default SavedObject;
