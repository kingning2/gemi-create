import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro, { useRouter, showLoading, hideLoading, showToast, navigateBack, navigateTo } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss' // Ensure this file exists

// Interface for Novel (can be shared)
interface Novel {
  id: string;
  title: string;
  content: string;
  // Other fields like genre, etc., if needed for context, but primarily title and content
}

// Mock Detailed Novel Data (Assume this is accessible, similar to detail/edit pages)
const MOCK_NOVELS_PREVIEW: Novel[] = Array.from({ length: 5 }, (_, i) => ({
  id: `novel-${i + 1}`, // Match IDs from other mock data if cross-referencing
  title: `Preview of: The Grand Tale of Sir Reginald ${i + 1}`,
  content: `This is the full, glorious, and unabridged text of "The Grand Tale of Sir Reginald ${i + 1}". Our story begins on a crisp autumn morning, with leaves dancing like fiery sprites in the wind. Sir Reginald, a knight renowned more for his impeccable grooming than his battlefield prowess, was meticulously polishing his favorite teacup. Suddenly, a raven, black as a starless night, tapped urgently at his window. It bore a message, sealed with the royal crest of King Theodore the Temporarily Misplaced. "My dearest Reginald," the note began, "I seem to have misplaced my crown, my scepter, and possibly my kingdom. It's all a bit of a blur. Last I remember, I was attempting to teach the royal goldfish to yodel. Any chance you could pop over and sort things out?" Reginald sighed, his perfectly coiffed hair deflating slightly. Adventure, it seemed, had a way of finding him, usually when he was least prepared and most comfortable. He packed his travel essentials: a silk cravat, an emergency cucumber sandwich, and a small, leather-bound book of etiquette for uncouth dragons. Thus began another chapter in the unexpectedly exciting life of Sir Reginald. The content here is designed to be long enough to require scrolling and to test the readability of the preview format. It will repeat a few times to ensure sufficient length. `.repeat(4),
}));

// Add a specific novel that might be generated from Create flow
MOCK_NOVELS_PREVIEW.push({
    id: `novel-${Date.now()}`, // Simulating a new novel ID
    title: 'Freshly Generated Masterpiece',
    content: 'This is a brand new story, just beamed from the AI! It tells of a brave toaster who dreamed of becoming a lighthouse. Every morning, it would try to shine its crumb tray light out the kitchen window, hoping to guide lost ships (or at least the family cat). One day, a particularly foggy morning, its chance came... This is a shorter piece, for now.'
});


export default function PreviewNovelText() {
  const router = useRouter();
  const novelId = router.params.id;
  // const isNew = router.params.isNew === 'true'; // If coming from creation flow

  const [novel, setNovel] = useState<Novel | null>(null);
  const [currentContent, setCurrentContent] = useState(''); // For re-generation
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (novelId) {
      setIsLoading(true);
      // Simulate fetching novel by ID
      const foundNovel = MOCK_NOVELS_PREVIEW.find(n => n.id === novelId);
      // If not found by direct ID (e.g. a truly new novelId from create flow not yet in MOCK_NOVELS_PREVIEW)
      // create a placeholder or use a default. For this example, we assume it might be found or it's an error.
      if (foundNovel) {
        setNovel(foundNovel);
        setCurrentContent(foundNovel.content);
      } else {
         // Try to find a generic new novel if ID is very recent (simulating coming from create)
        const veryNewNovel = MOCK_NOVELS_PREVIEW.find(n => n.id.startsWith('novel-' + (new Date().getFullYear()))); // very loose check
        if (veryNewNovel && novelId && novelId.startsWith('novel-')) { // Basic check for newly generated ID pattern
            setNovel({...veryNewNovel, id: novelId, title: "Newly Generated Novel Preview"}); // Use the passed ID
            setCurrentContent(veryNewNovel.content);
        } else {
            showToast({ title: 'Novel not found for preview', icon: 'none', duration: 2000 });
            setTimeout(() => navigateBack(), 2000);
        }
      }
      setIsLoading(false);
    } else {
      showToast({ title: 'No Novel ID provided', icon: 'none', duration: 2000 });
      setTimeout(() => navigateBack(), 2000);
      setIsLoading(false);
    }
  }, [novelId]);

  const handleEditNovel = () => {
    if (!novel) return;
    // Navigate to the edit page for this novel
    navigateTo({ url: `/pages/edit/index?id=${novel.id}` });
  };

  const handleReGenerate = async () => {
    if (!novel) return;
    showLoading({ title: 'Re-generating Text...' });
    // Simulate API call for re-generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    const newContent = `The story of "${novel.title}" takes a sudden turn! (Re-generated at ${new Date().toLocaleTimeString()}) Now, instead of a knight, Sir Reginald is a renowned pastry chef, and the Golden Spatula is sought after for its ability to create the fluffiest souffles in the kingdom. The dragon, Snuggles, is now a grumpy food critic with a penchant for burnt toast. The adventure is just as perilous, but far more delicious!

(Previous content was: ${currentContent.substring(0,100)}...)\`;
    setCurrentContent(newContent);
    // In a real app, this new content should be saved back to the novel object
    hideLoading();
    showToast({ title: 'Novel Re-generated! (Simulated)', icon: 'success' });
  };

  const handleClosePreview = () => {
    // If came from detail, navigateBack is fine.
    // If from create, might want to navigate to detail page of the new novel.
    // For now, simple navigateBack.
    navigateBack();
  };

  // const handleSaveToMyNovels = () => {
  //   // This would be relevant if 'isNew' is true
  //   // Simulate saving and navigating to its detail page
  //   if (!novel) return;
  //   showToast({ title: 'Novel Saved! (Simulated)', icon: 'success' });
  //   MOCK_NOVELS_PREVIEW.push({ ...novel, id: novel.id || Date.now().toString() }); // Ensure it has an ID
  //   navigateTo({ url: `/pages/detail/index?id=${novel.id}`});
  // }

  if (isLoading) {
    return <View className="p-4 text-center"><Text>Loading novel for preview...</Text></View>;
  }
  if (!novel) {
    return <View className="p-4 text-center"><Text>Could not load novel data.</Text></View>;
  }

  return (
    <View className="h-screen flex flex-col bg-gray-50">
      <View className="p-4 bg-white shadow-md">
        <Text className="text-2xl font-bold text-gray-800 block text-center">{novel.title}</Text>
      </View>

      <ScrollView scrollY className="flex-grow p-4 md:p-6">
        {/* Using prose for better default text styling, ensure Tailwind typography plugin is installed if used heavily */}
        <View className="prose lg:prose-xl max-w-none bg-white p-4 rounded-lg shadow">
          <Text selectable={true} className="text-gray-700 leading-relaxed whitespace-pre-line">
            {currentContent}
          </Text>
        </View>
      </ScrollView>

      <View className="p-3 border-t border-gray-200 bg-white shadow-up">
        <View className="flex flex-wrap justify-center gap-2">
          {/* {isNew && <Button onClick={handleSaveToMyNovels} className="bg-green-500 text-white">Save to My Novels</Button>} */}
          <Button onClick={handleEditNovel} className="bg-blue-500 text-white flex-grow sm:flex-grow-0">Edit Novel</Button>
          <Button onClick={handleReGenerate} className="bg-purple-500 text-white flex-grow sm:flex-grow-0">Re-generate</Button>
          <Button onClick={handleClosePreview} className="bg-gray-500 text-white flex-grow sm:flex-grow-0">Close Preview</Button>
        </View>
      </View>
    </View>
  )
}
