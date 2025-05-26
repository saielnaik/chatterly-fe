'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getPost, replyToPost, reactToPost, fetchReplies } from '@/api/post';
import { useRouter } from 'next/navigation';

const badgeColors = {
  recommend: 'success',
  help: 'danger',
  update: 'info',
  event: 'warning',
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

export default function Home() {
  const router = useRouter();
  const [postReplies, setPostReplies] = useState({});
  const [posts, setPosts] = useState([]);
  const [filters, setFilters] = useState({
    locationName: '',
    lat: '',
    lng: '',
    radius: 5000,
    postType: '',
  });

  const fetchCoordinates = async () => {
    if (!filters.locationName.trim()) return;

    try {
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json`,
        {
          params: {
            q: filters.locationName,
            key: '87e40b9381c74fc2b53b3eea0fda48f5',
          },
        }
      );

      const result = response.data.results[0];
      if (result) {
        const { lat, lng } = result.geometry;
        setFilters((prev) => {
          const updatedFilters = { ...prev, lat, lng };
          fetchPosts(updatedFilters);
          return updatedFilters;
        });
      } else {
        alert('No coordinates found for that location');
      }
    } catch (err) {
      console.error('Error fetching coordinates:', err);
      alert('Error fetching coordinates');
    }
  };

  const [replyTexts, setReplyTexts] = useState({});

  const fetchPosts = async (overrideFilters = filters) => {
    try {
      const params = {};

      if (overrideFilters.lat && overrideFilters.lng) {
        params.lat = overrideFilters.lat;
        params.lng = overrideFilters.lng;
        params.radius = overrideFilters.radius;
      }

      if (overrideFilters.postType) {
        params.postType = overrideFilters.postType;
      }

      const res = await getPost(params, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setPosts(res.data.posts || []);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    }
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReplyChange = (postId, text) => {
    setReplyTexts({ ...replyTexts, [postId]: text });
  };

  const handleReplySubmit = async (postId) => {
    const text = replyTexts[postId];
    if (!text) return;

    try {
      await replyToPost(
        postId,
        { text },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setReplyTexts({ ...replyTexts, [postId]: '' });
      fetchPosts();

      const res = await fetchReplies(postId, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setPostReplies((prev) => ({ ...prev, [postId]: res.data.replies }));
    } catch (err) {
      console.error('Failed to submit reply', err);
    }
  };

  const handleReact = async (postId, action) => {
    try {
      await reactToPost(
        postId,
        { action },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchPosts();
    } catch (err) {
      console.error(`Failed to ${action} post`, err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
    fetchPosts();
  }, []);

  useEffect(() => {
    posts.forEach(async (post) => {
      try {
        const res = await fetchReplies(post._id, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setPostReplies((prev) => ({
          ...prev,
          [post._id]: res.data.replies,
        }));
      } catch (err) {
        console.error(`Failed to fetch replies for post ${post._id}`, err);
      }
    });
  }, [posts]);

  return (
    <div className="container py-4" style={{ maxWidth: '700px' }}>
      <header className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
        <h1 className="fw-bold mb-0 text-primary">Chatterly</h1>

        <div>
          <button
            className="btn btn-outline-primary me-2"
            onClick={() => router.push('/user')}
          >
            Profile
          </button>
          <button
            className="btn btn-primary"
            onClick={() => router.push('/create-post')}
          >
            + New Post
          </button>
        </div>
      </header>

      <form
        className="row g-3 mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          fetchPosts();
        }}
      >
        <div className="col-12 col-md-6">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Enter location (e.g., Mumbai)"
            name="locationName"
            value={filters.locationName}
            onChange={handleChange}
          />
        </div>

        <div className="col-6 col-md-3 d-grid">
          <button
            type="button"
            className="btn btn-outline-secondary btn-lg"
            style={{ fontSize: '1rem' }}
            onClick={fetchCoordinates}
          >
            Get Coordinates
          </button>
        </div>

        <div className="col-6 col-md-3">
          <select
            className="form-select form-select-lg"
            name="postType"
            value={filters.postType}
            onChange={handleChange}
          >
            <option value="">All Types</option>
            <option value="recommend">Recommend</option>
            <option value="help">Help</option>
            <option value="update">Update</option>
            <option value="event">Event</option>
          </select>
        </div>

        <div className="col-12 d-grid">
          <button type="submit" className="btn btn-primary btn-lg">
            Filter Posts
          </button>
        </div>
      </form>

      {posts.length === 0 ? (
        <p className="text-center text-muted fs-5">No posts found.</p>
      ) : (
        posts.map((post) => (
          <article
            key={post._id}
            className="card mb-4 shadow-sm post-card"
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                {post.author?.avatarUrl ? (
                  <img
                    src={post.author.avatarUrl}
                    alt="avatar"
                    className="rounded-circle me-3 post-avatar"
                  />
                ) : (
                  <div className="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center me-3 post-avatar">
                    {getInitials(post.author?.username || 'U')}
                  </div>
                )}

                <div className="flex-grow-1">
                  <h5 className="mb-0">{post.author?.username || 'Unknown User'}</h5>
                  <small className="text-muted">
                    {new Date(post.createdAt).toLocaleString()}
                  </small>
                </div>

                <span
                  className={`badge bg-${badgeColors[post.postType]} ms-2 text-capitalize`}
                  style={{ fontSize: '0.85rem', padding: '0.35em 0.6em' }}
                >
                  {post.postType}
                </span>
              </div>

              <p className="card-text mb-3 post-text">{post.text}</p>

              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post image"
                  className="img-fluid rounded mb-3 post-image"
                />
              )}

              <div className="d-flex align-items-center mb-3 reactions">
                <button
                  className="btn btn-outline-success btn-sm me-3 d-flex align-items-center"
                  onClick={() => handleReact(post._id, 'like')}
                >
                  <span className="me-1" role="img" aria-label="like">
                    👍
                  </span>
                  <small>{post.likes?.length || 0}</small>
                </button>
                <button
                  className="btn btn-outline-danger btn-sm d-flex align-items-center"
                  onClick={() => handleReact(post._id, 'dislike')}
                >
                  <span className="me-1" role="img" aria-label="dislike">
                    👎
                  </span>
                  <small>{post.dislikes?.length || 0}</small>
                </button>
              </div>

              <section className="mb-3 replies-section">
                <strong className="mb-2 d-block">Replies</strong>
                {postReplies[post._id] && postReplies[post._id].length > 0 ? (
                  postReplies[post._id].map((reply) => (
                    <div
                      key={reply._id}
                      className="d-flex align-items-start border rounded p-2 my-2 reply"
                    >
                      {reply.author?.avatarUrl ? (
                        <img
                          src={reply.author.avatarUrl}
                          alt="reply avatar"
                          className="rounded-circle reply-avatar"
                        />
                      ) : (
                        <div className="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center reply-avatar">
                          {getInitials(reply.author?.username || 'U')}
                        </div>
                      )}
                      <div className="ms-2">
                        <small>
                          <b>{reply.author?.username || 'Unknown User'}</b>: {reply.text}
                        </small>
                        <br />
                        <small className="text-muted">
                          {new Date(reply.createdAt).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="small text-muted my-2">No replies yet.</p>
                )}
              </section>

              <div className="input-group reply-input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Write a reply..."
                  value={replyTexts[post._id] || ''}
                  onChange={(e) => handleReplyChange(post._id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleReplySubmit(post._id);
                    }
                  }}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => handleReplySubmit(post._id)}
                >
                  Reply
                </button>
              </div>
            </div>
          </article>
        ))
      )}
    </div>
  );
}