/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CreateRoomPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [roomType, setRoomType] = useState('public');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required.';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long.';
    } else if (title.trim().length > 50) {
      newErrors.title = 'Title cannot exceed 50 characters.';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required.';
    } else if (description.trim().length > 200) {
      newErrors.description = 'Description cannot exceed 200 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const roomSlug = title.trim().replace(/\s+/g, '-').toLowerCase();
      console.log('Creating room with:', { title, description, roomType });
      setTitle('');
      setDescription('');
      setErrors({});
      navigate(`/room/${roomSlug}`, { state: { roomTitle: title, roomType: roomType } });
    }
  };

  return (
    <main className="page-content">
      <div className="form-container" aria-labelledby="create-room-title">
        <h1 id="create-room-title">Create a New Watch Room</h1>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="room-title">Room Title</label>
            <input
              id="room-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Sci-Fi Movie Marathon"
              className={errors.title ? 'has-error' : ''}
              required
              aria-required="true"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && <p id="title-error" className="error-message">{errors.title}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="room-description">Room Description</label>
            <textarea
              id="room-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are we watching today?"
              rows={4}
              className={errors.description ? 'has-error' : ''}
              required
              aria-required="true"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "description-error" : undefined}
            ></textarea>
            {errors.description && <p id="description-error" className="error-message">{errors.description}</p>}
          </div>
          <div className="form-group">
            <label>Room Type</label>
            <div className="room-type-selector">
              <button
                type="button"
                className={`room-type-btn ${roomType === 'public' ? 'active' : ''}`}
                onClick={() => setRoomType('public')}
                aria-pressed={roomType === 'public'}
              >
                Public
              </button>
              <button
                type="button"
                className={`room-type-btn ${roomType === 'private' ? 'active' : ''}`}
                onClick={() => setRoomType('private')}
                aria-pressed={roomType === 'private'}
              >
                Private
              </button>
            </div>
            <p className="form-help-text">
              {roomType === 'public'
                ? 'Public rooms are discoverable by everyone on the Explore page.'
                : 'Private rooms can only be joined with a direct link or Room ID.'}
            </p>
          </div>
          <div className="form-actions">
            <Link to="/" className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary">Create Room</button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default CreateRoomPage;