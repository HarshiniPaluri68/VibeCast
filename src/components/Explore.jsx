/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { mockContent } from '../data/mockContent';
import ContentCard from './ContentCard';
import SkeletonCard from './SkeletonCard';

const Explore = () => {
    const categories = ['All', 'Bollywood', 'Movies', 'Music', 'Sports', 'Food', 'Festival'];
    const [activeCategory, setActiveCategory] = useState('All');
    const [filteredContent, setFilteredContent] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true); // Show loader when category changes

        const timer = setTimeout(() => {
            let content;
            if (activeCategory === 'All') {
                content = mockContent;
            } else if (activeCategory === 'Bollywood') {
                content = mockContent.filter(item => item.tags.includes('Bollywood'));
            } else {
                content = mockContent.filter(item => item.category === activeCategory);
            }
            setFilteredContent(content);
            setIsLoading(false);
        }, 1500); // Simulate a 1.5-second network delay

        return () => clearTimeout(timer); // Cleanup timer on component unmount or category change
    }, [activeCategory]);

    return (
        <main className="explore-page">
            <div className="filter-chips">
                {categories.map(category => (
                    <button
                        key={category}
                        className={`filter-chip ${activeCategory === category ? 'active' : ''}`}
                        onClick={() => setActiveCategory(category)}
                        disabled={isLoading}
                    >
                        {category}
                    </button>
                ))}
            </div>
            <div className="explore-header">
                <h2 className="explore-title">Popular Right Now</h2>
                <div className="explore-nav-arrows">
                    <button aria-label="Previous"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                    <button aria-label="Next"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
                </div>
            </div>
            <div className="content-grid">
                {isLoading
                    ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
                    : filteredContent.map(item => <ContentCard key={item.id} item={item} />)
                }
            </div>
        </main>
    );
};

export default Explore;
