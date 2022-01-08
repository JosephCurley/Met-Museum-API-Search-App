import React from 'react';
import PropTypes from 'prop-types';

const ActiveObject = ({ object, updateLocalStorage, savedObjects }) => (
	<div className="active-object">
		<div>
			<div className="active-object__title-box">
				<div>
					<h1
						className="active-object__header"
						dangerouslySetInnerHTML={{ __html: object.title }}
					/>
					<h2 className="active-object__artist">{object.artistDisplayName}</h2>
				</div>
				{savedObjects[object.objectID] ? (
					<button
						onClick={updateLocalStorage}
						onKeyDown={e => e.key === 'Enter' && updateLocalStorage}
						className="active-object__button active-object__button--remove"
						type="submit">
						Remove
					</button>
				) : (
					<button
						onClick={updateLocalStorage}
						onKeyDown={e => e.key === 'Enter' && updateLocalStorage}
						className="active-object__button active-object__button--save"
						type="submit">
						Save 🤍
					</button>
				)}
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

				<div className="active-object__info">
					<span className="active-object__value">
						<a
							href={object.objectURL}
							target="_blank"
							rel="noreferrer"
							className="active-object__link">
							View Object Page
						</a>
					</span>
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
