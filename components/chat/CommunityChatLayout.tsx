'use client';

import React, { useState, useEffect } from 'react';
import CommunityChatRoom from './CommunityChatRoom';

export default function CommunityChatLayout({ currentUser }: { currentUser: any }) {
    const [topics, setTopics] = useState<any[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            const res = await fetch('/api/community/topics');
            const data = await res.json();
            if (data.success) {
                setTopics(data.data);
                if (data.data.length > 0 && !selectedTopic) {
                    setSelectedTopic(data.data[0]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch topics', error);
        }
    };

    const handleCreateTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTopicTitle.trim()) return;

        try {
            const res = await fetch('/api/community/topics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTopicTitle })
            });
            const data = await res.json();
            if (data.success) {
                setTopics([data.data, ...topics]);
                setSelectedTopic(data.data);
                setNewTopicTitle('');
                setIsCreating(false);
            } else {
                alert(data.message || 'Failed to create topic');
            }
        } catch (error) {
            console.error('Error creating topic', error);
            alert('An error occurred while creating the topic.');
        }
    };

    return (
        <div className="flex h-[80vh] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Sidebar */}
            <div className="w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-white shadow-sm z-10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#0B2C4A]">Community Topics</h2>
                    {currentUser.role === 'Admin' && (
                        <button 
                            onClick={() => setIsCreating(!isCreating)}
                            className="bg-[#0B2C4A] text-white p-2 rounded-full hover:bg-blue-800 transition"
                            title="New Topic"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                    )}
                </div>

                {isCreating && currentUser.role === 'Admin' && (
                    <div className="p-4 bg-gray-100 border-b border-gray-200">
                        <form onSubmit={handleCreateTopic} className="flex gap-2">
                            <input 
                                type="text"
                                className="flex-1 px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Topic Title..."
                                value={newTopicTitle}
                                onChange={(e) => setNewTopicTitle(e.target.value)}
                            />
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700">Add</button>
                        </form>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    {topics.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No topics available yet.</div>
                    ) : (
                        topics.map(topic => (
                            <div 
                                key={topic._id} 
                                onClick={() => setSelectedTopic(topic)}
                                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${selectedTopic?._id === topic._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-100'}`}
                            >
                                <h3 className={`font-semibold ${selectedTopic?._id === topic._id ? 'text-blue-800' : 'text-gray-800'}`}>{topic.title}</h3>
                                <p className="text-xs text-gray-400 mt-1">Active: {new Date(topic.lastMessageAt).toLocaleDateString()}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50">
                {selectedTopic ? (
                    <CommunityChatRoom topic={selectedTopic} currentUser={currentUser} />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                        <p className="text-lg">Select a topic to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
