import React, { useState, useEffect } from 'react';
import { hot } from 'react-hot-loader/root';
import SavedObject from './components/saved-object';
import "./app.scss";

const apiUrl =
  'https://collectionapi.metmuseum.org/public/collection/v1/objects/';

const objectData = {
  objectID: 909,
  isHighlight: false,
  accessionNumber: '10.125.4',
  accessionYear: '1910',
  isPublicDomain: true,
  primaryImage:
    'https://images.metmuseum.org/CRDImages/ad/original/85H_ACF3077R5.jpg',
  primaryImageSmall:
    'https://images.metmuseum.org/CRDImages/ad/web-large/85H_ACF3077R5.jpg',
  additionalImages: [
    'https://images.metmuseum.org/CRDImages/ad/original/12073.jpg',
  ],
  constituents: null,
  department: 'The American Wing',
  objectName: 'Box',
  title: 'Box',
  culture: 'American',
  period: '',
  dynasty: '',
  reign: '',
  portfolio: '',
  artistRole: '',
  artistPrefix: '',
  artistDisplayName: '',
  artistDisplayBio: '',
  artistSuffix: '',
  artistAlphaSort: '',
  artistNationality: '',
  artistBeginDate: '',
  artistEndDate: '',
  artistGender: '',
  artistWikidata_URL: '',
  artistULAN_URL: '',
  objectDate: 'ca. 1700',
  objectBeginDate: 1697,
  objectEndDate: 1700,
  medium: 'Pine',
  dimensions: '9 x 26 1/2 x 16 in. (22.9 x 67.3 x 40.6 cm)',
  measurements: [
    {
      elementName: 'Overall',
      elementDescription: null,
      elementMeasurements: { Depth: 40.6401, Height: 22.9, Width: 67.3 },
    },
  ],
  creditLine: 'Gift of Mrs. Russell Sage, 1909',
  geographyType: 'Made in',
  city: '',
  state: '',
  county: '',
  country: 'United States',
  region: '',
  subregion: '',
  locale: '',
  locus: '',
  excavation: '',
  river: '',
  classification: '',
  rightsAndReproduction: '',
  linkResource: '',
  metadataDate: '2021-04-06T04:41:04.967Z',
  repository: 'Metropolitan Museum of Art, New York, NY',
  objectURL: 'https://www.metmuseum.org/art/collection/search/909',
  tags: null,
  objectWikidata_URL: '',
  isTimelineWork: false,
  GalleryNumber: '774',
};

const App = () => {
  const [object, setObject] = useState(objectData);
  const [savedObjects, setSavedObjects] = useState(JSON.parse(localStorage.getItem('savedObjects')) || {});
  useEffect(() => {}, []);

  const fetchObjects = async objectID => {
    const request = await fetch(`${apiUrl}${objectID}`);
    const response = await request.json();
    const newObject = response;
    setObject(newObject);
  };

  const saveItemToLocalStorage = () => {
    !localStorage.getItem('savedObjects') && localStorage.setItem('session', JSON.stringify({}));

    const newObject = {
      objectName: object.objectName,
      primaryImageSmall: object.primaryImageSmall
    };

    let objectOfSavedObjects = objectOfSavedObjects = JSON.parse(localStorage.getItem('savedObjects')) || {};
    objectOfSavedObjects[object.objectID] = newObject;
    localStorage.setItem('savedObjects', JSON.stringify(objectOfSavedObjects));

    setSavedObjects(JSON.parse(localStorage.getItem('savedObjects')));
    console.log(localStorage.getItem('savedObjects'));
  };

  return (
    <div class="object-search-app">
      <section className="object-search">
        <input
          key="random1"
          placeholder="Search Objects"
          onChange={e => fetchObjects(e.target.value)}
        />
        <div className="object-result">
          <div>
            <h1>{object.objectName}</h1>
            <img src={object.primaryImageSmall} alt={object.objectName} />
          </div>
          <button
            onClick={saveItemToLocalStorage}
            className="object-result__save-button"
            type="submit">
            Save ♥️
          </button>
        </div>
      </section>
      <section className="saved-objects">
        <h1>Saved Objects</h1>
        <div class="saved-objects__grid">
          {Object.keys(savedObjects).map((object, i)=> {
            return <SavedObject key={i} objectName={savedObjects[object].objectName} primaryImageSmall={savedObjects[object].primaryImageSmall} />
          })}
        </div>
      </section>
    </div>
  );
};

export default hot(App);
