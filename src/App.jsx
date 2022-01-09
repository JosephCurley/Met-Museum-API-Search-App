import React, { useState, useEffect } from 'react';
import { hot } from 'react-hot-loader/root';
import { DebounceInput } from 'react-debounce-input';
import ActiveObject from './components/active-object';
import SavedObject from './components/saved-object';
import CollectionItem from './components/collection-item';
import defaultObject from './helpers/defaultObjectModel';
import './app.scss';

const url = new URL(`${window.location}`);
const params = new URLSearchParams(url.search.slice(1));

const searchAPI =
	'https://collectionapi.metmuseum.org/public/collection/v1/search?q=';

const objectAPI =
	'https://collectionapi.metmuseum.org/public/collection/v1/objects/';

const App = () => {
	const objectsGridRef = React.createRef();
	const collectionsRef = React.createRef();
	const objectSearchRef = React.createRef();
	const [sharableURL, setSharableURL] = useState();
	const [sharableURLCurrent, setSharableURLCurrent] = useState(false);
	const [newCollectionName, setNewCollectionName] = useState('');
	const [collections, setCollections] = useState(
		JSON.parse(localStorage.getItem('collections')) || {}
	);
	const [savedObjects, setSavedObjects] = useState(
		JSON.parse(localStorage.getItem('savedObjects')) || {}
	);
	const [activeObject, setActiveObject] = useState(
		Object.keys(savedObjects).length === 0 && defaultObject
	);

	const setURL = () => {
		if (Object.keys(savedObjects).length > 0) {
			const savedObjectsParam = encodeURIComponent(
				JSON.stringify(Object.keys(savedObjects))
			);
			params.set('o', savedObjectsParam);
			setSharableURL(`${url.origin}?${params}`);
		} else {
			setSharableURL(null);
		}
	};

	const fetchObjects = async objectID => {
		const request = await fetch(`${objectAPI}${objectID}`);
		const response = request.json();
		return response;
		// TODO Error handling
	};

	const fetchAndSave = async objectID => {
		const newObject = await fetchObjects(objectID);
		const newObjectReduced = (({ title, primaryImageSmall }) => ({
			title,
			primaryImageSmall,
		}))(newObject);

		const storedSavedObjects = JSON.parse(localStorage.getItem('savedObjects'));

		storedSavedObjects[newObject.objectID] = newObjectReduced;
		setSavedObjects(storedSavedObjects);
	};

	const handleNewActiveObject = async objectID => {
		document.querySelector('body').scrollIntoView({
			alignToTop: true,
			behavior: 'smooth',
		});
		const newActiveObject = await fetchObjects(objectID);
		setActiveObject(newActiveObject);
	};

	const searchObjects = async query => {
		const searchQuery = query;
		const request = await fetch(`${searchAPI}${searchQuery}`);
		const response = await request.json();
		if (response.objectIDs) {
			const newObject = response.objectIDs[0];
			handleNewActiveObject(newObject);
		}
	};

	const handleSaveObject = () => {
		const newObject = {
			title: activeObject.title,
			primaryImageSmall: activeObject.primaryImageSmall,
		};

		const objectOfSavedObjects =
			JSON.parse(localStorage.getItem('savedObjects')) || {};
		objectOfSavedObjects[activeObject.objectID] = newObject;
		setSavedObjects(objectOfSavedObjects);
	};

	const handleRemoveObject = () => {
		const objectOfSavedObjects =
			JSON.parse(localStorage.getItem('savedObjects')) || {};
		delete objectOfSavedObjects[activeObject.objectID];
		setSavedObjects(objectOfSavedObjects);
	};

	const clearSavedObjects = () => {
		setSavedObjects({});
	};

	const handleSavedObjectChange = () => {
		document.activeElement.blur();

		if (savedObjects[activeObject.objectID]) {
			handleRemoveObject();
		} else {
			handleSaveObject();
		}
	};

	const scrollToRef = ref => {
		ref.current.scrollIntoView({
			behavior: 'smooth',
		});
	};

	const copyURLtoClipboard = () => {
		navigator.clipboard.writeText(sharableURL);
		setSharableURLCurrent(true);
	};

	const createCollection = (
		newName = newCollectionName,
		objects = savedObjects
	) => {
		const tempCollectionRef = JSON.parse(localStorage.getItem('collections'));
		const collectionObjects = objects;
		const newCollection = {
			collectionObjects,
		};

		tempCollectionRef[newName] = newCollection;
		setCollections(tempCollectionRef);
	};

	const removeCollection = collectionName => {
		const tempCollectionRef = JSON.parse(localStorage.getItem('collections'));
		delete tempCollectionRef[collectionName];
		setCollections(tempCollectionRef);
	};

	const setActiveObjectsToCollection = collectionName => {
		const newSavedObjects = collections[collectionName].collectionObjects;
		setSavedObjects(newSavedObjects);

		if (Object.keys(newSavedObjects)[0]) {
			handleNewActiveObject(Object.keys(newSavedObjects)[0]);
		}
	};

	const handleDataFromURL = objectsFromURL => {
		if (Object.keys(savedObjects).length !== 0) {
			createCollection('Unsaved Collection');
			clearSavedObjects();
		}
		const arrayOfSavedObjectsFromURL = JSON.parse(
			decodeURIComponent(objectsFromURL)
		);
		arrayOfSavedObjectsFromURL.forEach(objectID => {
			fetchAndSave(objectID);
		});
		handleNewActiveObject(arrayOfSavedObjectsFromURL[0]);
	};

	useEffect(() => {
		// If savedObjects doesn't exist in localStorage, create it.
		if (localStorage.getItem('savedObjects') === null) {
			localStorage.setItem('savedObjects', {});
		}
		// Also Set Collections
		if (localStorage.getItem('collections') === null) {
			localStorage.setItem('collections', {});
		}
		// If there are obects in the URL, set SavedObjects to match.
		const objectsFromURL = params.get('o');
		if (objectsFromURL) {
			handleDataFromURL(objectsFromURL);
			window.history.replaceState({}, '', `${url.origin}`);
		} else if (Object.keys(savedObjects).length > 0) {
			// Set Initial Object to one from the user's saved objects.
			handleNewActiveObject(Object.keys(savedObjects)[0]);
		}
	}, []);

	useEffect(() => {
		localStorage.setItem('savedObjects', JSON.stringify(savedObjects));
		setURL();
		setSharableURLCurrent(false);
	}, [savedObjects]);

	useEffect(() => {
		localStorage.setItem('collections', JSON.stringify(collections));
	}, [collections]);

	return (
		<div className="object-search-app">
			<main className="main__section" ref={objectSearchRef}>
				<div className="main__title-bar">
					<a
						tabIndex="0"
						className="main__title-link"
						onClick={() => scrollToRef(objectSearchRef)}
						onKeyDown={e => e.key === 'Enter' && scrollToRef(objectSearchRef)}
						role="button">
						<h1 className="main-title">Object Look Up</h1>
					</a>
				</div>
				<div className="object-search__section">
					<DebounceInput
						className="object-search__input"
						key="objectSearchBar"
						placeholder="Search Objects"
						debounceTimeout={500}
						onChange={event => searchObjects(event.target.value)}
					/>
					<ActiveObject
						savedObjects={savedObjects}
						object={activeObject}
						handleSavedObjectChange={handleSavedObjectChange}
					/>
				</div>
			</main>
			<section className="sidebar">
				<div className="sidebar__title">
					<h1 className="saved-objects__header">
						<a
							tabIndex="0"
							className="sidebar__title-link"
							onClick={() => scrollToRef(objectsGridRef)}
							onKeyDown={e => e.key === 'Enter' && scrollToRef(objectsGridRef)}
							role="button">
							Saved Objects
						</a>
					</h1>
					{Object.keys(savedObjects).length !== 0 && (
						<button
							type="button"
							className="saved-objects__copy-link"
							onKeyDown={e => e.key === 'Enter' && clearSavedObjects}
							onClick={clearSavedObjects}>
							Clear Objects
						</button>
					)}
				</div>
				<div className="sidebar__section">
					<div className="saved-objects__grid" ref={objectsGridRef}>
						{Object.keys(savedObjects).map(savedObject => {
							return (
								<SavedObject
									key={savedObject}
									objectNumber={savedObject}
									handleNewActiveObject={handleNewActiveObject}
									objectTitle={savedObjects[savedObject].title}
									primaryImageSmall={
										savedObjects[savedObject].primaryImageSmall
									}
								/>
							);
						})}
					</div>
				</div>
				<div className="sidebar__title sidebar__title--collections">
					<h1 className="saved-objects__header">
						<a
							tabIndex="0"
							className="sidebar__title-link"
							onClick={() => scrollToRef(collectionsRef)}
							onKeyDown={e => e.key === 'Enter' && scrollToRef(collectionsRef)}
							role="button">
							Collections
						</a>
					</h1>
					{sharableURL && (
						<button
							type="button"
							className="saved-objects__copy-link"
							onKeyDown={e => e.key === 'Enter' && copyURLtoClipboard}
							onClick={copyURLtoClipboard}>
							{sharableURLCurrent ? 'Copied!' : 'Copy Collection Link'}
						</button>
					)}
				</div>
				<div className="sidebar__section">
					<div ref={collectionsRef}>
						<div className="collections__save-bar">
							<input
								className="collection-input"
								key="newCollectionNameBar"
								placeholder="Collection Name"
								value={newCollectionName}
								onKeyDown={e => e.key === 'Enter' && createCollection()}
								onChange={event => setNewCollectionName(event.target.value)}
							/>
							<button
								type="button"
								className="collection__save-button"
								onClick={() => createCollection()}
								onKeyDown={e => e.key === 'Enter' && createCollection()}>
								Save Collection
							</button>
						</div>
						<div>
							<ul className="collection-items">
								{Object.keys(collections).map(collection => {
									return (
										<CollectionItem
											key={collection}
											removeCollection={removeCollection}
											setActiveObjectsToCollection={
												setActiveObjectsToCollection
											}
											collectionLength={
												Object.keys(collections[collection].collectionObjects)
													.length
											}
											collectionName={collection}
										/>
									);
								})}
							</ul>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default hot(App);
