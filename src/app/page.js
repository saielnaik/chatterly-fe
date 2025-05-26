'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getPost, replyToPost, reactToPost, fetchReplies } from '@/api/post';
import { useRouter } from 'next/navigation';

const badgeColors = {
  recommend: 'bg-[#CF0F47]',
  help: 'bg-[#FF0B55]',
  update: 'bg-[#FFDEDE] text-black',
  event: 'bg-black text-white',
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
  const [replyTexts, setReplyTexts] = useState({});
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
      const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
        params: {
          q: filters.locationName,
          key: '87e40b9381c74fc2b53b3eea0fda48f5',
        },
      });
      const result = response.data.results[0];
      if (result) {
        const { lat, lng } = result.geometry;
        setFilters((prev) => {
          const updated = { ...prev, lat, lng };
          fetchPosts(updated);
          return updated;
        });
      } else {
        alert('No coordinates found');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching coordinates');
    }
  };

  const fetchPosts = async (overrideFilters = filters) => {
    try {
      const params = {};
      if (overrideFilters.lat && overrideFilters.lng) {
        params.lat = overrideFilters.lat;
        params.lng = overrideFilters.lng;
        params.radius = overrideFilters.radius;
      }
      if (overrideFilters.postType) params.postType = overrideFilters.postType;

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
      await replyToPost(postId, { text }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setReplyTexts({ ...replyTexts, [postId]: '' });
      fetchPosts();
      const res = await fetchReplies(postId, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setPostReplies((prev) => ({ ...prev, [postId]: res.data.replies }));
    } catch (err) {
      console.error('Failed to reply', err);
    }
  };

  const handleReact = async (postId, action) => {
    try {
      await reactToPost(postId, { action }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchPosts();
    } catch (err) {
      console.error(`Failed to ${action} post`, err);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) router.push('/login');
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
        setPostReplies((prev) => ({ ...prev, [post._id]: res.data.replies }));
      } catch (err) {
        console.error(`Failed replies for post ${post._id}`, err);
      }
    });
  }, [posts]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 min-h-screen text-white">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-[#CF0F47]">Chatterly</h1>
        <div className="flex space-x-2">
          <button onClick={() => router.push('/user')} className="text-sm px-4 py-2 rounded-full border border-[#CF0F47] text-[#CF0F47] hover:bg-[#CF0F47] hover:text-white transition">
            Profile
          </button>
          <button
            onClick={() => router.push('/create-post')}
            className="group relative bg-[#CF0F47] text-white text-sm px-3 py-2 rounded-full hover:bg-[#FF0B55] transition flex items-center justify-center w-10"
          >
            <span className="pointer-events-none">+</span>
            <span className="absolute left-full ml-2 opacity-0 group-hover:opacity-100 whitespace-nowrap bg-[#CF0F47] text-white text-xs rounded px-2 py-1 transition-opacity">
              New Post
            </span>
          </button>
        </div>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); fetchPosts(); }} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <input type="text" name="locationName" value={filters.locationName} onChange={handleChange} placeholder="Enter location (e.g., Mumbai)" className="input input-bordered bg-[#1F1F1F] p-5 text-white border-gray-600 rounded-full col-span-2 h-10" />
        <button type="button" onClick={fetchCoordinates} className="btn rounded-full border border-gray-500 text-white hover:bg-white hover:text-black">
          Get Coordinates
        </button>
        <select name="postType" value={filters.postType} onChange={handleChange} className="select p-2 bg-[#1F1F1F] text-white border-gray-600 rounded-full col-span-2 h-10">
          <option value="">All Types</option>
          <option value="recommend">Recommend</option>
          <option value="help">Help</option>
          <option value="update">Update</option>
          <option value="event">Event</option>
        </select>
        <button type="submit" className="btn bg-[#CF0F47] text-white rounded-full hover:bg-[#FF0B55] col-span-1">Filter Posts</button>
      </form>

      {posts.length === 0 ? (
        <p className="text-center text-gray-400">No posts found.</p>
      ) : (
        posts.map((post) => (
          <div key={post._id} className="bg-[#1A1A1A] rounded-2xl shadow p-4 mb-6 border border-gray-700">
            <div className="flex items-center mb-4">
              {post.author?.avatarUrl ? (
                <img src={post.author.avatarUrl} className="w-10 h-10 rounded-full mr-3" />
              ) : (
                <div className="w-10 h-10 bg-gray-800 text-white flex items-center justify-center rounded-full mr-3">
                  {getInitials(post.author?.username || 'U')}
                </div>
              )}
              <div className="flex-grow">
                <p className="font-semibold text-sm">{post.author?.username || 'Unknown User'}</p>
                <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${badgeColors[post.postType]} bg-opacity-30`}>
                {post.postType}
              </span>
            </div>

            <p className="text-sm text-gray-300 mb-3">{post.text}</p>
            {post.imageUrl && <img src={post.imageUrl} className="w-full rounded-lg mb-3" />}

            <div className="flex space-x-3 text-sm mb-4">
              <button onClick={() => handleReact(post._id, 'like')} className="flex items-center space-x-1 bg-[#CF0F47] p-2 rounded-xl hover:text-[#FF0B55]">
                👍 <span>{post.likes?.length || 0}</span>
              </button>
              <button onClick={() => handleReact(post._id, 'dislike')} className="flex items-center space-x-1 text-gray-400 hover:text-gray-200">
                👎 <span>{post.dislikes?.length || 0}</span>
              </button>
            </div>

            <div className="mb-3">
              <p className="font-semibold text-sm text-white mb-2">Replies</p>
              {postReplies[post._id]?.length > 0 ? (
                postReplies[post._id].map((reply) => (
                  <div key={reply._id} className="flex items-start space-x-2 bg-[#2B2B2B] p-2 rounded-lg mb-2">
                    {reply.author?.avatarUrl ? (
                      <img src={reply.author.avatarUrl} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-800 text-white flex items-center justify-center rounded-full">
                        {getInitials(reply.author?.username || 'U')}
                      </div>
                    )}
                    <div>
                      <p className="text-sm"><b>{reply.author?.username || 'Unknown'}:</b> {reply.text}</p>
                      <p className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No replies yet.</p>
              )}
            </div>

            <div className="flex gap-2 mt-2">
              <input
                type="text"
                className="input bg-[#1F1F1F] text-white border-gray-600 p-2 rounded-full flex-grow"
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
              <button onClick={() => handleReplySubmit(post._id)} className="btn bg-[#CF0F47] text-white p-2 rounded-full hover:bg-[#FF0B55]">
                Reply
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}