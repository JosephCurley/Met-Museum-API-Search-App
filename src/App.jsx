import React, { useState, useEffect } from 'react';
import { hot } from 'react-hot-loader/root';
import ActiveObject from './components/active-object';
import SavedObject from './components/saved-object';
import './app.scss';

const searchAPI =
	'https://collectionapi.metmuseum.org/public/collection/v1/search?q=';

const objectAPI =
	'https://collectionapi.metmuseum.org/public/collection/v1/objects/';

const objectData = {
	objectID: 37299,
	isHighlight: false,
	accessionNumber: 'JP1059',
	accessionYear: '1915',
	isPublicDomain: true,
	primaryImage:
		'https://images.metmuseum.org/CRDImages/as/original/DP135567.jpg',
	primaryImageSmall:
		'https://images.metmuseum.org/CRDImages/as/web-large/DP135567.jpg',
	additionalImages: [],
	constituents: [
		{
			constituentID: 11410,
			role: 'Artist',
			name: 'Kitagawa Utamaro',
			constituentULAN_URL: 'http://vocab.getty.edu/page/ulan/500054492',
			constituentWikidata_URL: 'https://www.wikidata.org/wiki/Q272045',
			gender: '',
		},
	],
	department: 'Asian Art',
	objectName: 'Print',
	title: 'Shells under Water',
	culture: 'Japan',
	period: 'Edo period (1615–1868)',
	dynasty: '',
	reign: '',
	portfolio: '',
	artistRole: 'Artist',
	artistPrefix: '',
	artistDisplayName: 'Kitagawa Utamaro',
	artistDisplayBio: 'Japanese, ca. 1754–1806',
	artistSuffix: '',
	artistAlphaSort: 'Kitagawa Utamaro',
	artistNationality: 'Japanese',
	artistBeginDate: '1754',
	artistEndDate: '1806',
	artistGender: '',
	artistWikidata_URL: 'https://www.wikidata.org/wiki/Q272045',
	artistULAN_URL: 'http://vocab.getty.edu/page/ulan/500054492',
	objectDate: '1790',
	objectBeginDate: 1790,
	objectEndDate: 1790,
	medium: 'Woodblock print; ink and color on paper',
	dimensions: '9 1/8 x 14 7/8 in. (23.2 x 37.8 cm)',
	measurements: [
		{
			elementName: 'Overall',
			elementDescription: null,
			elementMeasurements: { Height: 23.2, Width: 37.8 },
		},
	],
	creditLine: 'Gift of Estate of Samuel Isham, 1915',
	geographyType: '',
	city: '',
	state: '',
	county: '',
	country: '',
	region: '',
	subregion: '',
	locale: '',
	locus: '',
	excavation: '',
	river: '',
	classification: 'Prints',
	rightsAndReproduction: '',
	linkResource: '',
	metadataDate: '2020-09-16T18:35:19.457Z',
	repository: 'Metropolitan Museum of Art, New York, NY',
	objectURL: 'https://www.metmuseum.org/art/collection/search/37299',
	tags: [
		{
			term: 'Shells',
			AAT_URL: 'http://vocab.getty.edu/page/aat/300011829',
			Wikidata_URL: 'https://www.wikidata.org/wiki/Q213096',
		},
	],
	objectWikidata_URL: '',
	isTimelineWork: false,
	GalleryNumber: '',
};

const App = () => {
	const [object, setObject] = useState(objectData);
	const [savedObjects, setSavedObjects] = useState(
		JSON.parse(localStorage.getItem('savedObjects')) || {}
	);
	const objectsGridRef = React.createRef();
	useEffect(() => {}, []);

	const fetchObjects = async objectID => {
		const request = await fetch(`${objectAPI}${objectID}`);
		const response = await request.json();
		const newObject = response;
		setObject(newObject);
	};

	const searchObjects = async searchQuery => {
		const request = await fetch(`${searchAPI}${searchQuery}`);
		const response = await request.json();
		const newObject = response.objectIDs[0];
		if (newObject) {
			fetchObjects(newObject);
		}
	};

	const addItemToStorage = () => {
		const newObject = {
			title: object.title,
			primaryImageSmall: object.primaryImageSmall,
		};

		const objectOfSavedObjects =
			JSON.parse(localStorage.getItem('savedObjects')) || {};
		objectOfSavedObjects[object.objectID] = newObject;
		localStorage.setItem('savedObjects', JSON.stringify(objectOfSavedObjects));

		setSavedObjects(JSON.parse(localStorage.getItem('savedObjects')));
	};

	const removeItemFromStorage = () => {
		const objectOfSavedObjects =
			JSON.parse(localStorage.getItem('savedObjects')) || {};
		delete objectOfSavedObjects[object.objectID];
		localStorage.setItem('savedObjects', JSON.stringify(objectOfSavedObjects));
		setSavedObjects(JSON.parse(localStorage.getItem('savedObjects')));
	};

	const updateLocalStorage = () => {
		if (!localStorage.getItem('savedObjects')) {
			localStorage.setItem('session', JSON.stringify({}));
		}

		if (savedObjects[object.objectID]) {
			removeItemFromStorage();
		} else {
			addItemToStorage();
		}
	};

	const backToTop = () => {
		objectsGridRef.current.scrollIntoView({
			behavior: 'smooth',
		});
	};

	return (
		<div className="object-search-app">
			<section className="object-search__section">
				<h1>The Met Object Look Up</h1>
				<input
					className="object-search__input"
					key="objectSearchBar"
					placeholder="Search Objects"
					onChange={e => searchObjects(e.target.value)}
				/>
				<ActiveObject
					savedObjects={savedObjects}
					object={object}
					updateLocalStorage={updateLocalStorage}
				/>
			</section>
			<section className="saved-objects">
				<div className="saved-objects__title-bar">
					<h1 className="saved-objects__header">Saved Objects</h1>
					{Object.keys(savedObjects).length > 10 && (
						<a
							tabIndex="0"
							className="saved-objects__top-link"
							onClick={() => backToTop()}
							onKeyDown={() => backToTop()}
							role="button">
							Back To Top
						</a>
					)}
				</div>
				<div className="saved-objects__grid" ref={objectsGridRef}>
					{Object.keys(savedObjects).map(savedObject => {
						return (
							<SavedObject
								key={savedObject}
								objectNumber={savedObject}
								fetchObjects={fetchObjects}
								objectTitle={savedObjects[savedObject].title}
								primaryImageSmall={savedObjects[savedObject].primaryImageSmall}
							/>
						);
					})}
				</div>
			</section>
		</div>
	);
};

export default hot(App);
