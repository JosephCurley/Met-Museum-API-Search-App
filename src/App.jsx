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
		localStorage.setItem('savedObjects', JSON.stringify({}));
		const newObject = await fetchObjects(objectID);
		const newObjectReduced = (({ title, primaryImageSmall }) => ({
			title,
			primaryImageSmall,
		}))(newObject);
		const objectOfSavedObjects = JSON.parse(
			localStorage.getItem('savedObjects') || {}
		);
		objectOfSavedObjects[newObject.objectID] = newObjectReduced;
		localStorage.setItem('savedObjects', JSON.stringify(objectOfSavedObjects));
		setSavedObjects(JSON.parse(localStorage.getItem('savedObjects')));
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

	const addItemToStorage = () => {
		const newObject = {
			title: activeObject.title,
			primaryImageSmall: activeObject.primaryImageSmall,
		};

		const objectOfSavedObjects =
			JSON.parse(localStorage.getItem('savedObjects')) || {};
		objectOfSavedObjects[activeObject.objectID] = newObject;
		localStorage.setItem('savedObjects', JSON.stringify(objectOfSavedObjects));
		setSavedObjects(JSON.parse(localStorage.getItem('savedObjects')));
	};

	const removeItemFromStorage = () => {
		const objectOfSavedObjects =
			JSON.parse(localStorage.getItem('savedObjects')) || {};
		delete objectOfSavedObjects[activeObject.objectID];
		localStorage.setItem('savedObjects', JSON.stringify(objectOfSavedObjects));
		setSavedObjects(JSON.parse(localStorage.getItem('savedObjects')));
	};

	const clearSavedObjects = () => {
		localStorage.setItem('savedObjects', JSON.stringify({}));
		setSavedObjects(JSON.parse(localStorage.getItem('savedObjects')));
	};

	const updateLocalStorage = () => {
		document.activeElement.blur();
		if (!localStorage.getItem('savedObjects')) {
			localStorage.setItem('savedObjects', JSON.stringify({}));
		}

		if (savedObjects[activeObject.objectID]) {
			removeItemFromStorage();
		} else {
			addItemToStorage();
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
		const newCollections = collections;

		const collectionObjects = objects;
		const newCollection = {
			collectionObjects,
		};
		newCollections[newName] = newCollection;
		// TODO do all of this in useEffect
		if (localStorage.getItem('collections') === null) {
			localStorage.setItem('collections', {});
		}
		localStorage.setItem('collections', JSON.stringify(collections));
		setCollections(JSON.parse(localStorage.getItem('collections')));
	};

	const removeCollection = collectionName => {
		const tempCollectionRef =
			JSON.parse(localStorage.getItem('collections')) || {};
		delete tempCollectionRef[collectionName];
		localStorage.setItem('collections', JSON.stringify(tempCollectionRef));
		setCollections(JSON.parse(localStorage.getItem('collections')));
	};

	const setActiveObjectsToCollection = collectionName => {
		if (localStorage.getItem('savedObjects') === null) {
			localStorage.setItem('savedObjects', {});
		}
		const newSavedObjects = collections[collectionName].collectionObjects;
		localStorage.setItem('savedObjects', JSON.stringify(newSavedObjects));
		setSavedObjects(JSON.parse(localStorage.getItem('savedObjects')));

		if (Object.keys(newSavedObjects)[0]) {
			handleNewActiveObject(Object.keys(newSavedObjects)[0]);
		}
	};

	const handleDataFromURL = objectsFromURL => {
		if (Object.keys(savedObjects).length !== 0) {
			createCollection('Unsaved Collection');
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
		const objectsFromURL = params.get('o');
		if (objectsFromURL) {
			handleDataFromURL(objectsFromURL);
		} else if (Object.keys(savedObjects).length > 0) {
			handleNewActiveObject(Object.keys(savedObjects)[0]);
		}
		window.history.replaceState({}, '', `${url.origin}`);
	}, []);

	useEffect(() => {
		setURL();
		setSharableURLCurrent(false);
	}, [savedObjects]);

	return (
		<div className="object-search-app">
			<section className="object-search__section">
				<h1>The Met Object Look Up</h1>
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
					updateLocalStorage={updateLocalStorage}
				/>
			</section>
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
