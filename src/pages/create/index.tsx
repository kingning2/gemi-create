import { View, Text, Input, Button, Textarea, Picker } from '@tarojs/components'
import Taro, { showLoading, hideLoading, showToast, showModal, navigateTo } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss' // Ensure this file exists

// Interfaces
interface Character {
  id: string; // For React key
  name: string;
  description: string;
}

// Mock User Points (should come from global state/API later)
const MOCK_USER_POINTS = 50; // Set low for testing recharge prompt
const GENERATION_COST = 100; // Cost to generate a novel

const GENRE_OPTIONS = ['Fantasy', 'Sci-Fi', 'Romance', 'Mystery', 'Thriller', 'Historical', 'Other'];
const LENGTH_OPTIONS = ['Short Story (1k-5k words)', 'Novelette (5k-15k words)', 'Novella (15k-40k words)', 'Novel (40k+ words)'];
const STYLE_OPTIONS = ['Descriptive', 'Concise', 'Dialogue-heavy', 'Action-oriented', 'Humorous'];

export default function CreateNovel() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userPoints, setUserPoints] = useState(MOCK_USER_POINTS); // Mock

  // Form Data
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState(GENRE_OPTIONS[0]);
  const [keywords, setKeywords] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [tempCharName, setTempCharName] = useState('');
  const [tempCharDesc, setTempCharDesc] = useState('');
  const [plotOutline, setPlotOutline] = useState('');
  const [lengthPref, setLengthPref] = useState(LENGTH_OPTIONS[0]);
  const [writingStyle, setWritingStyle] = useState(STYLE_OPTIONS[0]);

  useEffect(() => {
    // Simulate fetching user points
    setUserPoints(MOCK_USER_POINTS);
  }, []);

  const handleAddCharacter = () => {
    if (!tempCharName.trim()) {
      showToast({ title: 'Character name is required', icon: 'none' });
      return;
    }
    setCharacters([...characters, { id: Date.now().toString(), name: tempCharName, description: tempCharDesc }]);
    setTempCharName('');
    setTempCharDesc('');
  };

  const handleRemoveCharacter = (id: string) => {
    setCharacters(characters.filter(char => char.id !== id));
  };

  const nextStep = () => {
    if (currentStep === 1 && !title.trim()) {
      showToast({ title: 'Novel title is required', icon: 'none' });
      return;
    }
    setCurrentStep(prev => prev + 1);
  };
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleGenerateNovel = async () => {
    if (userPoints < GENERATION_COST) {
      const res = await showModal({
        title: 'Insufficient Points',
        content: `You need ${GENERATION_COST} points to generate a novel, but you only have ${userPoints}. Would you like to recharge?`,
        confirmText: 'Recharge',
        cancelText: 'Cancel',
      });
      if (res.confirm) {
        navigateTo({ url: '/pages/recharge/index' }); // Ensure this page exists
      }
      return;
    }

    showLoading({ title: 'Generating Novel...' });
    // Simulate API call
    console.log('Generating novel with data:', { title, genre, keywords, characters, plotOutline, lengthPref, writingStyle });
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Simulate point deduction
    setUserPoints(prev => prev - GENERATION_COST);

    hideLoading();
    showToast({ title: 'Novel Generated! (Simulated)', icon: 'success', duration: 2000 });

    // Create a mock novel ID for navigation
    const newNovelId = `novel-${Date.now()}`;
    // In a real app, you'd get the new novel details from the API response
    // and navigate to its detail page or preview page.
    navigateTo({ url: `/pages/detail/index?id=${newNovelId}` });
    // Reset form or navigate away
    setCurrentStep(1);
    setTitle('');
    // ... reset other fields
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Basic Info
        return (
          <View>
            <Text className="text-lg font-semibold mb-2 block">Step 1: Basic Information</Text>
            <Input value={title} onInput={(e) => setTitle(e.detail.value)} placeholder="Novel Title (Required)" className="mb-3 p-2 border rounded bg-white" />
            <Picker mode="selector" range={GENRE_OPTIONS} value={GENRE_OPTIONS.indexOf(genre)} onChange={(e) => setGenre(GENRE_OPTIONS[e.detail.value as number])}>
              <View className="mb-3 p-2 border rounded bg-white">Genre: {genre}</View>
            </Picker>
            <Input value={keywords} onInput={(e) => setKeywords(e.detail.value)} placeholder="Keywords/Tags (comma-separated)" className="mb-3 p-2 border rounded bg-white" />
          </View>
        );
      case 2: // Character Definition
        return (
          <View>
            <Text className="text-lg font-semibold mb-2 block">Step 2: Define Characters (Optional)</Text>
            {characters.map(char => (
              <View key={char.id} className="mb-2 p-2 border rounded bg-gray-50">
                <Text className="font-bold">{char.name}</Text>
                <Text className="text-sm block text-gray-600">{char.description || 'No description'}</Text>
                <Button onClick={() => handleRemoveCharacter(char.id)} size="mini" type="warn" className="mt-1 text-xs !bg-red-400 !text-white">Remove</Button>
              </View>
            ))}
            <Input value={tempCharName} onInput={(e) => setTempCharName(e.detail.value)} placeholder="Character Name" className="mb-2 p-2 border rounded bg-white" />
            <Textarea value={tempCharDesc} onInput={(e) => setTempCharDesc(e.detail.value)} placeholder="Character Description (Optional)" className="mb-2 p-2 border rounded h-20 bg-white w-full" />
            <Button onClick={handleAddCharacter} className="bg-green-500 text-white">Add Character</Button>
          </View>
        );
      case 3: // Plot Outline
        return (
          <View>
            <Text className="text-lg font-semibold mb-2 block">Step 3: Plot Outline (Optional)</Text>
            <Textarea value={plotOutline} onInput={(e) => setPlotOutline(e.detail.value)} placeholder="Enter your plot summary or key points..." className="w-full p-2 border rounded h-40 bg-white" />
          </View>
        );
      case 4: // Generation Parameters & Generate
        return (
          <View>
            <Text className="text-lg font-semibold mb-2 block">Step 4: Generation Parameters</Text>
            <Picker mode="selector" range={LENGTH_OPTIONS} value={LENGTH_OPTIONS.indexOf(lengthPref)} onChange={(e) => setLengthPref(LENGTH_OPTIONS[e.detail.value as number])}>
              <View className="mb-3 p-2 border rounded bg-white">Length: {lengthPref}</View>
            </Picker>
            <Picker mode="selector" range={STYLE_OPTIONS} value={STYLE_OPTIONS.indexOf(writingStyle)} onChange={(e) => setWritingStyle(STYLE_OPTIONS[e.detail.value as number])}>
              <View className="mb-3 p-2 border rounded bg-white">Style: {writingStyle}</View>
            </Picker>
            <View className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded">
              <Text className="text-blue-700">Points Required: {GENERATION_COST}</Text>
              <Text className="text-blue-700 block">Your Points: {userPoints}</Text>
            </View>
          </View>
        );
      default:
        return <Text>Unknown Step</Text>;
    }
  };

  return (
    <View className="p-4 h-screen flex flex-col">
      <View className="flex-grow">
        {/* Progress Indicator (Simple Text for now) */}
        <View className="mb-4 text-center">
          <Text className="text-gray-600">Step {currentStep} of 4</Text>
          {/* Could add a visual progress bar here */}
        </View>
        {renderStepContent()}
      </View>

      {/* Navigation Buttons */}
      <View className="mt-auto pt-4 border-t border-gray-200">
        <View className="flex justify-between">
          {currentStep > 1 && (
            <Button onClick={prevStep} className="bg-gray-300">Previous</Button>
          )}
          {currentStep < 4 && (
            <Button onClick={nextStep} className="bg-blue-500 text-white ml-auto">Next</Button>
          )}
          {currentStep === 4 && (
            <Button onClick={handleGenerateNovel} className="bg-green-600 text-white w-full">
              Generate Novel ({GENERATION_COST} Points)
            </Button>
          )}
        </View>
      </View>
    </View>
  )
}
