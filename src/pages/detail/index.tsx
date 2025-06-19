import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro, { useRouter, showModal, showToast, navigateBack } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss' // Ensure this file exists

// Interfaces
interface Novel {
  id: string;
  title: string;
  description: string; // Short description
  content: string; // Full novel content
  creationDate: string;
  lastUpdatedDate: string;
  status: 'Draft' | 'Completed' | 'Generating';
  genre?: string;
  tags?: string[];
}

// Mock Detailed Novel Data (expand on previous mock data)
const MOCK_NOVELS_DETAIL: Novel[] = Array.from({ length: 20 }, (_, i) => ({
  id: `novel-${i + 1}`,
  title: `The Grand Tale of Sir Reginald ${i + 1}`,
  description: 'A heroic knight, a mischievous dragon, and a quest for the legendary Golden Spatula.',
  content: `Once upon a time, in the whimsical land of Floop, lived Sir Reginald the Brave (Part ${i + 1}). He was known throughout the land for his shiny armor and his uncanny ability to find lost socks. One day, a frantic messenger arrived. "Sir Reginald!" he panted, "The Golden Spatula of Culinary Excellence has been stolen by Snuggles, the notoriously fluffy dragon!" Reginald, never one to shy away from adventure (or a good meal), mounted his trusty steed, Sir Trot-a-Lot, and embarked on his quest. The journey was fraught with peril: fields of suspiciously bouncy mushrooms, rivers of lukewarm tea, and a forest guarded by riddling squirrels. But Reginald, with his wit and a well-packed lunch, overcame each obstacle. Finally, he reached Snuggles' lair, a surprisingly cozy cave filled with half-knitted scarves. Snuggles, it turned out, wasn't evil, just a bit lonely and very fond of pancakes, for which the Golden Spatula was essential. Reginald, being a knight of great understanding (and a secret pancake enthusiast himself), proposed a deal: weekly pancake breakfasts in exchange for the spatula's return. Snuggles agreed with a puff of delighted smoke, and peace (and delicious pancakes) reigned in Floop once more. And Sir Reginald added "Chief Pancake Negotiator" to his already impressive list of titles. This is just a snippet, the full story would be much, much longer, filled with daring escapades and perhaps a recipe or two. This content is meant to be scrollable and demonstrate a longer text body for the novel detail page.`.repeat(3), // Make content longer
  creationDate: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toLocaleDateString(),
  lastUpdatedDate: new Date(Date.now() - (i % 3) * 12 * 60 * 60 * 1000).toLocaleDateString(),
  status: (i + 1) % 3 === 0 ? 'Completed' : ((i + 1) % 3 === 1 ? 'Draft' : 'Generating'),
  genre: (i + 1) % 2 === 0 ? 'Fantasy Comedy' : 'Adventure',
  tags: ['Quest', 'Dragon', `Spatula${i+1}`],
}));


export default function NovelDetail() {
  const router = useRouter();
  const [novel, setNovel] = useState<Novel | null>(null);
  const novelId = router.params.id;

  useEffect(() => {
    if (novelId) {
      // Simulate fetching novel by ID from mock data
      const foundNovel = MOCK_NOVELS_DETAIL.find(n => n.id === novelId);
      setNovel(foundNovel || null);
      if (!foundNovel) {
        showToast({ title: 'Novel not found', icon: 'none' });
      }
    }
  }, [novelId]);

  const handleEdit = () => {
    if (!novel) return;
    Taro.navigateTo({ url: `/pages/edit/index?id=${novel.id}` });
  };

  const handlePreviewText = () => {
    if (!novel) return;
    Taro.navigateTo({ url: `/pages/preview/index?id=${novel.id}` });
  };

  const handleDelete = async () => {
    if (!novel) return;
    const res = await showModal({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete "${novel.title}"?`,
    });
    if (res.confirm) {
      // Simulate deletion (in a real app, call API then update local state/refetch)
      console.log('Deleting novel:', novel.id);
      // Remove from mock data (for demo purposes if list page was using this directly)
      // MOCK_NOVELS_DETAIL = MOCK_NOVELS_DETAIL.filter(n => n.id !== novel.id);
      showToast({ title: 'Novel deleted (simulated)', icon: 'success' });
      navigateBack();
    }
  };

  const handleShareText = () => {
    if (!novel) return;
    // For WeChat, this enables the built-in share menu if the page has onShareAppMessage
    // Or use Taro.setClipboardData for copying text
    Taro.setClipboardData({
      data: `Check out my novel: ${novel.title}

${novel.description}`,
      success: () => showToast({ title: 'Novel info copied!', icon: 'success' })
    });
    // To enable native share:
    // Taro.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] });
    // console.log('Sharing novel:', novel.title);
    // showToast({ title: 'Share action triggered (see console)', icon: 'none' });
  };

  const handleGenerateVideo = () => {
    if (!novel) return;
    Taro.navigateTo({ url: `/pages/video/config/index?id=${novel.id}` });
  };

  if (!novel) {
    return (
      <View className="p-4 text-center text-gray-500">
        <Text>Loading novel details or novel not found...</Text>
      </View>
    );
  }

  return (
    <ScrollView scrollY className="h-screen">
      <View className="p-4">
        {/* Metadata Section */}
        <View className="mb-6 pb-4 border-b border-gray-200">
          <Text className="text-3xl font-bold text-gray-800 block mb-2">{novel.title}</Text>
          <View className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600 mb-2">
            <Text>Genre: {novel.genre || 'N/A'}</Text>
            <Text>Status: {novel.status}</Text>
            <Text>Created: {novel.creationDate}</Text>
            <Text>Updated: {novel.lastUpdatedDate}</Text>
          </View>
          {novel.tags && novel.tags.length > 0 && (
            <View className="mb-3">
              <Text className="font-semibold">Tags: </Text>
              {novel.tags.map(tag => (
                <Text key={tag} className="mr-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{tag}</Text>
              ))}
            </View>
          )}
          <Text className="text-md text-gray-700 italic">{novel.description}</Text>
        </View>

        {/* Content Section */}
        <View className="mb-6">
          <Text className="text-2xl font-semibold text-gray-700 mb-2">Content</Text>
          <View className="prose max-w-none bg-white p-3 rounded-md shadow">
             {/* Using View for content to avoid issues with <Text> max length on some platforms for very long strings */}
            <Text selectable={true}>{novel.content}</Text>
          </View>
        </View>

        {/* Action Buttons Section */}
        <View className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <Button onClick={handleEdit} className="bg-blue-500 text-white hover:bg-blue-600">Edit</Button>
          <Button onClick={handlePreviewText} className="bg-green-500 text-white hover:bg-green-600">Preview Text</Button>
          <Button onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">Delete</Button>
          <Button onClick={handleShareText} className="bg-indigo-500 text-white hover:bg-indigo-600">Share Text</Button>
          <Button onClick={handleGenerateVideo} className="bg-purple-500 text-white hover:bg-purple-600 col-span-2 sm:col-span-1">Generate Video</Button>
        </View>
      </View>
    </ScrollView>
  )
}
