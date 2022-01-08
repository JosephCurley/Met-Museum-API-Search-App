import React from 'react';
import PropTypes from 'prop-types';

const CollectionItem = ({
	collectionName,
	collectionLength,
	setActiveObjectsToCollection,
}) => (
	<li className="collection-item">
		<button
			type="button"
			className="collection-item__button"
			onClick={() => setActiveObjectsToCollection(collectionName)}
			onKeyDown={e =>
				e.key === 'Enter' && setActiveObjectsToCollection(collectionName)
			}>
			<span className="collection-item__title">{collectionName}</span>
			<span className="collection-item__count">
				({collectionLength} objects)
			</span>
		</button>
	</li>
);

CollectionItem.propTypes = {
	setActiveObjectsToCollection: PropTypes.func,
	collectionLength: PropTypes.number,
	collectionName: PropTypes.string,
};

export default CollectionItem;
