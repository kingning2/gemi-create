import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro, { usePullDownRefresh, useReachBottom, showLoading, hideLoading, stopPullDownRefresh } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss' // Ensure this file exists, even if empty, for Tailwind

// Interfaces
interface NovelItem {
  id: string;
  title: string;
  description: string;
  creationDate: string;
  status: 'Draft' | 'Completed' | 'Generating';
}

// Mock User Points
const MOCK_USER_POINTS = 1200;

// Mock Novels Data
const createMockNovel = (id: number): NovelItem => ({
  id: `novel-${id}`,
  title: `Chronicles of Aethelgard - Chapter ${id}`,
  description: 'In a realm where magic weaves through the very fabric of existence, a young scribe uncovers a prophecy that could change the world...',
  creationDate: new Date(Date.now() - id * 24 * 60 * 60 * 1000).toLocaleDateString(),
  status: id % 3 === 0 ? 'Completed' : (id % 3 === 1 ? 'Draft' : 'Generating'),
});

const INITIAL_NOVELS: NovelItem[] = Array.from({ length: 10 }, (_, i) => createMockNovel(i + 1));
const MORE_NOVELS: NovelItem[] = Array.from({ length: 5 }, (_, i) => createMockNovel(i + 11));

export default function NovelList() {
  const [userPoints, setUserPoints] = useState<number>(MOCK_USER_POINTS);
  const [novels, setNovels] = useState<NovelItem[]>(INITIAL_NOVELS);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [allNovels, setAllNovels] = useState<NovelItem[]>(INITIAL_NOVELS); // Store all novels for filtering

  useEffect(() => {
    // Simulate fetching initial user points
    setUserPoints(MOCK_USER_POINTS);
  }, []);

  // Filter novels based on search term
  const filteredNovels = novels.filter(novel =>
    novel.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (event) => {
    setSearchTerm(event.detail.value);
  };

  const navigateToDetail = (novelId: string) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${novelId}`, // Ensure detail page is in app.config.ts
    });
  };

  // Pull Down to Refresh
  usePullDownRefresh(async () => {
    console.log('onPullDownRefresh triggered');
    showLoading({ title: 'Refreshing...' });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    const refreshedNovels = Array.from({ length: 10 }, (_, i) => createMockNovel(i + 1 + Math.floor(Math.random()*10) ));
    setAllNovels(refreshedNovels); // Update the source of truth
    setNovels(refreshedNovels);   // Update displayed novels
    setSearchTerm(''); // Reset search
    hideLoading();
    stopPullDownRefresh(); // Important to stop the refresh animation
    Taro.showToast({ title: 'List Refreshed', icon: 'none' });
  });

  // Reach Bottom to Load More
  useReachBottom(async () => {
    if (isLoadingMore || novels.length >= 20) { // Example limit
        if (novels.length >=20) Taro.showToast({title: 'No more novels', icon: 'none'});
        return;
    }
    console.log('onReachBottom triggered');
    setIsLoadingMore(true);
    showLoading({ title: 'Loading more...' });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newNovels = Array.from({ length: 5 }, (_, i) => createMockNovel(novels.length + i + 1));
    setAllNovels(prev => [...prev, ...newNovels]);
    setNovels(prev => [...prev, ...newNovels]);
    setIsLoadingMore(false);
    hideLoading();
  });

  return (
    <ScrollView scrollY className="h-screen flex flex-col">
      {/* User Points Display */}
      <View className="bg-blue-600 p-3 text-white shadow-md sticky top-0 z-10">
        <Text className="text-lg font-semibold">My Points: {userPoints}</Text>
      </View>

      {/* Search Bar */}
      <View className="p-4 bg-gray-100 sticky top-[56px] z-10"> {/* Adjust top value if points bar height changes */}
        <Input
          type="text"
          placeholder="Search novels by title..."
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white"
          onInput={handleSearch}
          value={searchTerm}
        />
      </View>

      {/* Novel List */}
      <View className="flex-grow p-4">
        {filteredNovels.length === 0 && searchTerm && (
          <View className="text-center text-gray-500 mt-10">
            <Text>No novels found for "{searchTerm}".</Text>
          </View>
        )}
        {filteredNovels.length === 0 && !searchTerm && (
          <View className="text-center text-gray-500 mt-10">
            <Text>You haven't created any novels yet.</Text>
          </View>
        )}
        {filteredNovels.map((novel) => (
          <View
            key={novel.id}
            className="mb-4 p-4 bg-white rounded-lg shadow-lg cursor-pointer transition-all hover:shadow-xl active:bg-gray-50"
            onClick={() => navigateToDetail(novel.id)}
          >
            <Text className="text-xl font-bold text-blue-700 block mb-1">{novel.title}</Text>
            <Text className="text-sm text-gray-600 block mb-2 truncate">{novel.description}</Text>
            <View className="flex justify-between items-center text-xs text-gray-500">
              <Text>Created: {novel.creationDate}</Text>
              <Text
                className={`px-2 py-1 rounded-full text-white ${
                  novel.status === 'Completed' ? 'bg-green-500' :
                  novel.status === 'Draft' ? 'bg-yellow-500' :
                  'bg-purple-500' // Generating
                }`}
              >
                {novel.status}
              </Text>
            </View>
          </View>
        ))}
        {isLoadingMore && (
          <View className="text-center py-4">
            <Text className="text-gray-500">Loading more novels...</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}
