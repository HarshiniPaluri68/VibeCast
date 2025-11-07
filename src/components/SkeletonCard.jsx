/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton-image"></div>
    <div className="skeleton-body">
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton-tags">
        <div className="skeleton skeleton-tag"></div>
        <div className="skeleton skeleton-tag"></div>
      </div>
    </div>
  </div>
);

export default SkeletonCard;
