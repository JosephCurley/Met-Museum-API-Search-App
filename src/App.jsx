import React, { useState, useEffect } from 'react';
import { hot } from 'react-hot-loader/root';
import { DebounceInput } from 'react-debounce-input';
import ActiveObject from './components/active-object';
import SavedObject from './components/saved-object';
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
	const [collectionName, setCollectionName] = useState('');
	const [collections, setCollections] = useState({});
	const [sharableURLCurrent, setSharableURLCurrent] = useState(false);
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

	const createCollection = () => {
		const newCollections = collections;

		const collectionObjects = savedObjects;
		const newCollection = {
			collectionObjects,
		};
		newCollections[collectionName] = newCollection;
		setCollections(newCollections);

		// TODO do all of this in useEffect
		if (localStorage.getItem('collections') === null) {
			localStorage.setItem('collections', {});
		}
		localStorage.setItem('collections', JSON.stringify(collections));
	};

	useEffect(() => {
		const objectsFromURL = params.get('o');
		if (objectsFromURL) {
			const arrayOfSavedObjectsFromURL = JSON.parse(
				decodeURIComponent(objectsFromURL)
			);
			arrayOfSavedObjectsFromURL.forEach(objectID => {
				fetchAndSave(objectID);
			});
			handleNewActiveObject(arrayOfSavedObjectsFromURL[0]);
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
					{sharableURL && (
						<button
							type="button"
							className="saved-objects__copy-link"
							onKeyDown={e => e.key === 'Enter' && copyURLtoClipboard}
							onClick={copyURLtoClipboard}>
							{sharableURLCurrent ? 'Copied!' : 'Copy Sharable URL'}
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
				</div>
				<div className="sidebar__section">
					<div ref={collectionsRef}>
						<input
							className="collection-input"
							key="collectionNameBar"
							placeholder="Enter Bundle Name"
							value={collectionName}
							onChange={event => setCollectionName(event.target.value)}
						/>
						<button
							type="button"
							className="saved-objects__create-bundle"
							onClick={() => createCollection()}
							onKeyDown={e => e.key === 'Enter' && createCollection()}>
							Save Bundle
						</button>
					</div>
				</div>
			</section>
		</div>
	);
};

export default hot(App);
