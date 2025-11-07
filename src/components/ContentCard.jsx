/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const ContentCard = ({ item }) => (
  <Link to={`/room/${item.id}`} className="content-card">
    <div className="card-image-container">
      {item.image === 'special_placeholder' ? (
        <div className="card-image-placeholder">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="rgba(255,255,255,0.08)"/>
            <path d="M10 16.5V7.5L16 12L10 16.5Z" fill="rgba(255,255,255,0.15)"/>
          </svg>
          <p>Bollywood Dance Party</p>
        </div>
      ) : (
        <img src={item.image} alt={item.title} className="card-image" />
      )}
    </div>
    <div className="card-body">
      <h3 className="card-title">{item.title}</h3>
      <p className="card-creator">by {item.creator}</p>
      <div className="card-tags">
        {item.tags.map(tag => <span key={tag} className="card-tag">{tag}</span>)}
      </div>
    </div>
    <div className="card-footer">
      <span className={`card-category card-category-${item.category.toLowerCase()}`}>{item.category}</span>
      <span className="card-watching">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
        </svg>
        {item.watching.toLocaleString()}
      </span>
    </div>
  </Link>
);

ContentCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    creator: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    watching: PropTypes.number.isRequired,
  }).isRequired,
};

export default ContentCard;
