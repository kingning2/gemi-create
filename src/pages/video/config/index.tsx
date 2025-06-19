import { View, Text, Button, Picker, RadioGroup, Radio, Label, Textarea } from '@tarojs/components'
import Taro, { useRouter, showLoading, hideLoading, showToast, showModal, navigateTo } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss' // Ensure this file exists

// Mock data & interfaces
interface NovelInfo { // Basic info for context
  id: string;
  title: string;
}
// From MOCK_NOVELS_DETAIL in detail page for consistency
const MOCK_NOVELS_FOR_VIDEO: NovelInfo[] = Array.from({ length: 20 }, (_, i) => ({
  id: `novel-${i + 1}`,
  title: `The Grand Tale of Sir Reginald ${i + 1}`,
}));


const MOCK_USER_POINTS_VIDEO_CONFIG = 1250; // From profile page context
const VIDEO_GENERATION_COST = 300;

const VISUAL_STYLES = ['Anime', 'Realistic CGI', '2D Cartoon', 'Pixel Art', 'Watercolor', 'None (Text Only)'];
const VOICEOVER_VOICES = ['Male - Deep', 'Male - Standard', 'Female - Standard', 'Female - Gentle', 'None'];
const VOICEOVER_SPEEDS = ['0.75x', '1.0x (Normal)', '1.25x', '1.5x'];
const BACKGROUND_MUSIC_OPTIONS = ['Epic Adventure', 'Calm Piano', 'Mysterious Ambience', 'Upbeat Pop', 'None'];

export default function VideoConfig() {
  const router = useRouter();
  const novelId = router.params.id;

  const [novelInfo, setNovelInfo] = useState<NovelInfo | null>(null);
  const [userPoints, setUserPoints] = useState(MOCK_USER_POINTS_VIDEO_CONFIG); // Mock
  const [isLoading, setIsLoading] = useState(true);

  // Config States
  const [sceneSelectionMode, setSceneSelectionMode] = useState<'automatic' | 'manual'>('automatic');
  const [manualSceneDescriptions, setManualSceneDescriptions] = useState('');
  const [visualStyle, setVisualStyle] = useState(VISUAL_STYLES[0]);
  const [voiceoverVoice, setVoiceoverVoice] = useState(VOICEOVER_VOICES[0]);
  const [voiceoverSpeed, setVoiceoverSpeed] = useState(VOICEOVER_SPEEDS[1]); // Normal speed
  const [backgroundMusic, setBackgroundMusic] = useState(BACKGROUND_MUSIC_OPTIONS[0]);

  useEffect(() => {
    if (novelId) {
      const foundNovel = MOCK_NOVELS_FOR_VIDEO.find(n => n.id === novelId);
      if (foundNovel) {
        setNovelInfo(foundNovel);
      } else {
        showToast({ title: 'Novel not found for video config', icon: 'none' });
        setTimeout(() => Taro.navigateBack(), 1500);
      }
      setUserPoints(MOCK_USER_POINTS_VIDEO_CONFIG); // Simulate fetching points
      setIsLoading(false);
    } else {
      showToast({ title: 'No Novel ID for video config', icon: 'none' });
      setTimeout(() => Taro.navigateBack(), 1500);
      setIsLoading(false);
    }
  }, [novelId]);

  const handleStartGeneration = async () => {
    if (!novelInfo) return;
    if (userPoints < VIDEO_GENERATION_COST) {
      const res = await showModal({
        title: 'Insufficient Points',
        content: `You need ${VIDEO_GENERATION_COST} points for video generation, but you only have ${userPoints}. Recharge?`,
        confirmText: 'Recharge',
        cancelText: 'Cancel',
      });
      if (res.confirm) {
        navigateTo({ url: '/pages/recharge/index' });
      }
      return;
    }

    showLoading({ title: 'Initiating Video Generation...' });
    const generationParams = {
      novelId: novelInfo.id,
      sceneSelectionMode,
      manualSceneDescriptions: sceneSelectionMode === 'manual' ? manualSceneDescriptions : undefined,
      visualStyle,
      voiceoverVoice,
      voiceoverSpeed,
      backgroundMusic,
    };
    console.log('Starting video generation with params:', generationParams);

    // Simulate API call to backend
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate point deduction
    setUserPoints(prev => prev - VIDEO_GENERATION_COST);

    hideLoading();
    showToast({ title: 'Video generation started!', icon: 'success', duration: 2500 });

    // Navigate to video status/preview page
    // A unique videoId would typically be returned by the backend
    const mockVideoId = `video-${novelInfo.id}-${Date.now()}`;
    navigateTo({ url: `/pages/video/preview/index?novelId=${novelInfo.id}&videoId=${mockVideoId}` });
  };

  if (isLoading) {
    return <View className="p-4 text-center"><Text>Loading video configuration...</Text></View>
  }
  if (!novelInfo) {
     return <View className="p-4 text-center"><Text>Novel information not available.</Text></View>
  }

  return (
    <View className="p-4 pb-20"> {/* Added padding-bottom for scroll */}
      <Text className="text-2xl font-bold mb-1 block">Configure Video</Text>
      <Text className="text-md text-gray-600 mb-6 block">For Novel: "{novelInfo.title}"</Text>

      {/* Scene Selection */}
      <View className="mb-4 p-3 bg-white rounded-lg shadow">
        <Text className="text-lg font-semibold mb-2 block">Scene Selection</Text>
        <RadioGroup onChange={(e) => setSceneSelectionMode(e.detail.value as any)}>
          <Label className="flex items-center mb-1 cursor-pointer">
            <Radio value="automatic" checked={sceneSelectionMode === 'automatic'} className="mr-2" />Automatic Detection
          </Label>
          <Label className="flex items-center cursor-pointer">
            <Radio value="manual" checked={sceneSelectionMode === 'manual'} className="mr-2" />Manual Specification
          </Label>
        </RadioGroup>
        {sceneSelectionMode === 'manual' && (
          <Textarea
            value={manualSceneDescriptions}
            onInput={(e) => setManualSceneDescriptions(e.detail.value)}
            placeholder="Describe key scenes or paste text snippets, one per line..."
            className="mt-2 w-full p-2 border rounded h-32 bg-gray-50"
          />
        )}
      </View>

      {/* Visual Style */}
      <View className="mb-4 p-3 bg-white rounded-lg shadow">
        <Text className="text-lg font-semibold mb-1 block">Visual Style</Text>
        <Picker mode="selector" range={VISUAL_STYLES} value={VISUAL_STYLES.indexOf(visualStyle)} onChange={(e) => setVisualStyle(VISUAL_STYLES[e.detail.value as number])}>
          <View className="p-2 border rounded bg-gray-50">Selected: {visualStyle}</View>
        </Picker>
      </View>

      {/* Voiceover Options */}
      <View className="mb-4 p-3 bg-white rounded-lg shadow">
        <Text className="text-lg font-semibold mb-1 block">Voiceover</Text>
        <Picker mode="selector" range={VOICEOVER_VOICES} value={VOICEOVER_VOICES.indexOf(voiceoverVoice)} onChange={(e) => setVoiceoverVoice(VOICEOVER_VOICES[e.detail.value as number])}>
          <View className="p-2 border rounded mb-2 bg-gray-50">Voice: {voiceoverVoice}</View>
        </Picker>
        <Picker mode="selector" range={VOICEOVER_SPEEDS} value={VOICEOVER_SPEEDS.indexOf(voiceoverSpeed)} onChange={(e) => setVoiceoverSpeed(VOICEOVER_SPEEDS[e.detail.value as number])}>
          <View className="p-2 border rounded bg-gray-50">Speed: {voiceoverSpeed}</View>
        </Picker>
      </View>

      {/* Background Music */}
      <View className="mb-6 p-3 bg-white rounded-lg shadow">
        <Text className="text-lg font-semibold mb-1 block">Background Music</Text>
        <Picker mode="selector" range={BACKGROUND_MUSIC_OPTIONS} value={BACKGROUND_MUSIC_OPTIONS.indexOf(backgroundMusic)} onChange={(e) => setBackgroundMusic(BACKGROUND_MUSIC_OPTIONS[e.detail.value as number])}>
          <View className="p-2 border rounded bg-gray-50">Music: {backgroundMusic}</View>
        </Picker>
      </View>

      {/* Points Info & Action */}
      <View className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg shadow sticky bottom-4">
        <Text className="text-md font-semibold text-blue-700">Points Required: {VIDEO_GENERATION_COST}</Text>
        <Text className="text-md text-blue-700 block mb-3">Your Points: {userPoints}</Text>
        <Button
          onClick={handleStartGeneration}
          className="bg-green-600 text-white w-full py-3 rounded-md text-lg"
          disabled={isLoading}
        >
          Start Video Generation
        </Button>
      </View>
    </View>
  )
}
