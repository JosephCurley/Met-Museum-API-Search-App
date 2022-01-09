import React from 'react';
import PropTypes from 'prop-types';

const CollectionItem = ({
	collectionName,
	collectionLength,
	setActiveObjectsToCollection,
	removeCollection,
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
		<button
			type="button"
			className="collection-item__button-remove"
			onClick={() => removeCollection(collectionName)}
			onKeyDown={e => e.key === 'Enter' && removeCollection(collectionName)}>
			✖️
		</button>
	</li>
);

CollectionItem.propTypes = {
	removeCollection: PropTypes.func,
	setActiveObjectsToCollection: PropTypes.func,
	collectionLength: PropTypes.number,
	collectionName: PropTypes.string,
};

export default CollectionItem;
