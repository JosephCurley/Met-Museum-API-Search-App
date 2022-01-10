import React from 'react';
import PropTypes from 'prop-types';

const ActiveObject = ({ object, handleSavedObjectChange, savedObjects }) => (
	<div className="active-object">
		<div>
			<div className="active-object__title-box">
				<div className="active-object__titles">
					<h1
						className="active-object__header"
						dangerouslySetInnerHTML={{ __html: object.title }}
					/>
					<h2 className="active-object__artist">{object.artistDisplayName}</h2>
				</div>
				<div className="active-object__buttons">
					{savedObjects[object.objectID] ? (
						<button
							onClick={handleSavedObjectChange}
							onKeyDown={e => e.key === 'Enter' && handleSavedObjectChange}
							className="active-object__button active-object__button--remove button button--ghost"
							type="submit">
							Remove
						</button>
					) : (
						<button
							onClick={handleSavedObjectChange}
							onKeyDown={e => e.key === 'Enter' && handleSavedObjectChange}
							className="active-object__button active-object__button--save button button--primary"
							type="submit">
							Save 🤍
						</button>
					)}
					<a
						href={object.objectURL}
						target="_blank"
						rel="noreferrer"
						className="button button--tertiary">
						View Object Page
					</a>
				</div>
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
					<span
						className="active-object__value"
						dangerouslySetInnerHTML={{ __html: object.objectName }}
					/>
				</div>
				{object.artistDisplayName && (
					<div className="active-object__info">
						<span className="active-object__key">{object.artistRole}: </span>
						<span className="active-object__value">
							{object.artistDisplayName}
						</span>
					</div>
				)}
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
	handleSavedObjectChange: PropTypes.func,
};

export default ActiveObject;
