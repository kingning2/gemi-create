import { View, Text, Input, Button, Textarea, Picker } from '@tarojs/components'
import Taro, { useRouter, showLoading, hideLoading, showToast, navigateBack, navigateTo, showModal } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss' // Ensure this file exists

// Interfaces (can be shared in a types file later)
interface Character {
  id: string;
  name: string;
  description: string;
}

interface Novel {
  id: string;
  title: string;
  description: string; // Short description from list page, might not be directly editable here
  content: string; // Full novel content (plot outline might be part of this or separate)
  creationDate: string; // Not editable
  lastUpdatedDate: string;
  status: 'Draft' | 'Completed' | 'Generating'; // Potentially editable
  genre?: string;
  tags?: string[]; // Represented as comma-separated string in keywords input
  characters?: Character[]; // For editing characters
  plotOutline?: string; // Separate from main content for structured editing
  lengthPref?: string;
  writingStyle?: string;
}

// Mock Detailed Novel Data (Assume this is accessible, e.g. from a shared mock file or fetched)
// For simplicity, we'll redefine a small set here. In a real app, this would be from a store/API.
const MOCK_NOVELS_STORAGE: Novel[] = Array.from({ length: 5 }, (_, i) => ({
  id: `novel-${i + 1}`,
  title: `Editable Epic ${i + 1}`,
  description: 'A tale of daring edits and courageous refactors.',
  content: `This is the main story content for Editable Epic ${i + 1}. It is quite extensive and full of rich narrative that users might want to tweak or expand upon. The current editing interface might focus on metadata or plot points rather than direct rich text editing of this block, depending on complexity.`.repeat(2),
  creationDate: new Date(Date.now() - (i + 10) * 24 * 60 * 60 * 1000).toLocaleDateString(),
  lastUpdatedDate: new Date().toLocaleDateString(),
  status: 'Draft',
  genre: i % 2 === 0 ? 'Sci-Fi' : 'Fantasy',
  tags: [`editable`, `epic${i + 1}`],
  characters: [{ id: 'char1', name: 'Captain Edit', description: 'A fearless leader of words.' }],
  plotOutline: `Chapter 1: The Beginning of Edits. Chapter 2: The Great Refactor. Chapter 3: The Final Commit for novel ${i+1}.`,
  lengthPref: 'Novella (15k-40k words)',
  writingStyle: 'Descriptive',
}));


const GENRE_OPTIONS = ['Fantasy', 'Sci-Fi', 'Romance', 'Mystery', 'Thriller', 'Historical', 'Other'];
const LENGTH_OPTIONS = ['Short Story (1k-5k words)', 'Novelette (5k-15k words)', 'Novella (15k-40k words)', 'Novel (40k+ words)'];
const STYLE_OPTIONS = ['Descriptive', 'Concise', 'Dialogue-heavy', 'Action-oriented', 'Humorous'];


export default function EditNovel() {
  const router = useRouter();
  const novelId = router.params.id;

  const [originalNovel, setOriginalNovel] = useState<Novel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Form Data States
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState(GENRE_OPTIONS[0]);
  const [keywords, setKeywords] = useState(''); // Comma-separated string from novel.tags
  const [characters, setCharacters] = useState<Character[]>([]);
  const [tempCharName, setTempCharName] = useState('');
  const [tempCharDesc, setTempCharDesc] = useState('');
  const [plotOutline, setPlotOutline] = useState(''); // This is the primary editable "content" for now
  const [lengthPref, setLengthPref] = useState(LENGTH_OPTIONS[0]);
  const [writingStyle, setWritingStyle] = useState(STYLE_OPTIONS[0]);
  const [status, setStatus] = useState<'Draft' | 'Completed' | 'Generating'>('Draft');


  useEffect(() => {
    if (novelId) {
      // Simulate fetching novel by ID
      const foundNovel = MOCK_NOVELS_STORAGE.find(n => n.id === novelId);
      if (foundNovel) {
        setOriginalNovel(foundNovel);
        setTitle(foundNovel.title);
        setGenre(foundNovel.genre || GENRE_OPTIONS[0]);
        setKeywords((foundNovel.tags || []).join(', '));
        setCharacters(foundNovel.characters || []);
        setPlotOutline(foundNovel.plotOutline || foundNovel.content); // Prefer dedicated plot outline
        setLengthPref(foundNovel.lengthPref || LENGTH_OPTIONS[0]);
        setWritingStyle(foundNovel.writingStyle || STYLE_OPTIONS[0]);
        setStatus(foundNovel.status);
      } else {
        showToast({ title: 'Novel not found for editing', icon: 'none', duration: 2000 });
        setTimeout(() => navigateBack(), 2000);
      }
      setIsLoading(false);
    } else {
      showToast({ title: 'No Novel ID provided', icon: 'none', duration: 2000 });
      setTimeout(() => navigateBack(), 2000);
      setIsLoading(false);
    }
  }, [novelId]);

  // Track changes
  useEffect(() => {
    if (!originalNovel || isLoading) return;
    const currentData = {
      title,
      genre,
      keywords: (originalNovel.tags || []).join(', '), // Compare with original tags string
      characters: JSON.stringify(characters), // Simple comparison for demo
      plotOutline,
      lengthPref,
      writingStyle,
      status
    };
    const originalData = {
      title: originalNovel.title,
      genre: originalNovel.genre || GENRE_OPTIONS[0],
      keywords: (originalNovel.tags || []).join(', '),
      characters: JSON.stringify(originalNovel.characters || []),
      plotOutline: originalNovel.plotOutline || originalNovel.content,
      lengthPref: originalNovel.lengthPref || LENGTH_OPTIONS[0],
      writingStyle: originalNovel.writingStyle || STYLE_OPTIONS[0],
      status: originalNovel.status
    };
    if (JSON.stringify(currentData) !== JSON.stringify(originalData)) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [title, genre, keywords, characters, plotOutline, lengthPref, writingStyle, status, originalNovel, isLoading]);


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

  const handleSaveChanges = async () => {
    if (!originalNovel) return;
    if (!title.trim()) {
        showToast({title: 'Title cannot be empty', icon: 'none'});
        return;
    }

    showLoading({ title: 'Saving Changes...' });
    // Simulate API call to update the novel
    console.log('Saving changes for novel:', originalNovel.id, { title, genre, keywords, characters, plotOutline, lengthPref, writingStyle, status });
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update mock data store (simulation)
    const novelIndex = MOCK_NOVELS_STORAGE.findIndex(n => n.id === originalNovel.id);
    if (novelIndex > -1) {
      MOCK_NOVELS_STORAGE[novelIndex] = {
        ...MOCK_NOVELS_STORAGE[novelIndex],
        title,
        genre,
        tags: keywords.split(',').map(k => k.trim()).filter(k => k),
        characters,
        plotOutline, // Assuming plotOutline is the primary editable content here
        content: plotOutline, // Or update main content based on plotOutline if structured differently
        lengthPref,
        writingStyle,
        status,
        lastUpdatedDate: new Date().toLocaleDateString(),
      };
    }

    hideLoading();
    setHasChanges(false);
    showToast({ title: 'Changes Saved! (Simulated)', icon: 'success', duration: 2000 });
    // Navigate back to detail page, which should ideally refetch or receive updated data
    navigateTo({ url: `/pages/detail/index?id=${originalNovel.id}&edited=true` }); // Add param to hint refetch
  };

  const handleCancel = async () => {
    if (hasChanges) {
        const res = await showModal({
            title: 'Unsaved Changes',
            content: 'You have unsaved changes. Are you sure you want to cancel?',
            confirmText: 'Discard',
            cancelText: 'Keep Editing'
        });
        if (!res.confirm) {
            return;
        }
    }
    navigateBack();
  };

  if (isLoading) {
    return <View className="p-4 text-center"><Text>Loading novel for editing...</Text></View>;
  }
  if (!originalNovel) {
    return <View className="p-4 text-center"><Text>Could not load novel data.</Text></View>;
  }

  return (
    <View className="p-4 h-screen flex flex-col">
      <ScrollView scrollY className="flex-grow mb-4">
        <Text className="text-2xl font-bold mb-4 block">Edit: {originalNovel.title}</Text>

        {/* Basic Info */}
        <View className="mb-4">
          <Text className="text-lg font-semibold mb-1 block">Basic Information</Text>
          <Input value={title} onInput={(e) => setTitle(e.detail.value)} placeholder="Novel Title (Required)" className="mb-3 p-2 border rounded bg-white" />
          <Picker mode="selector" range={GENRE_OPTIONS} value={GENRE_OPTIONS.indexOf(genre)} onChange={(e) => setGenre(GENRE_OPTIONS[e.detail.value as number])}>
            <View className="mb-3 p-2 border rounded bg-white">Genre: {genre}</View>
          </Picker>
          <Input value={keywords} onInput={(e) => setKeywords(e.detail.value)} placeholder="Keywords/Tags (comma-separated)" className="mb-3 p-2 border rounded bg-white" />
           <Picker mode="selector" range={['Draft', 'Completed']} value={status === 'Draft' ? 0 : 1} onChange={(e) => setStatus(e.detail.value == 0 ? 'Draft' : 'Completed')}>
            <View className="mb-3 p-2 border rounded bg-white">Status: {status}</View>
          </Picker>
        </View>

        {/* Character Definition */}
        <View className="mb-4">
          <Text className="text-lg font-semibold mb-1 block">Characters</Text>
          {characters.map(char => (
            <View key={char.id} className="mb-2 p-2 border rounded bg-gray-50">
              <Text className="font-bold">{char.name}</Text>
              <Text className="text-sm block text-gray-600">{char.description || 'No description'}</Text>
              <Button onClick={() => handleRemoveCharacter(char.id)} size="mini" type="warn" className="mt-1 text-xs !bg-red-400 !text-white">Remove</Button>
            </View>
          ))}
          <Input value={tempCharName} onInput={(e) => setTempCharName(e.detail.value)} placeholder="New Character Name" className="mb-2 p-2 border rounded bg-white" />
          <Textarea value={tempCharDesc} onInput={(e) => setTempCharDesc(e.detail.value)} placeholder="New Character Description" className="mb-2 p-2 border rounded h-20 bg-white w-full" />
          <Button onClick={handleAddCharacter} className="bg-green-500 text-white">Add Character</Button>
        </View>

        {/* Plot Outline / Main Content */}
        <View className="mb-4">
          <Text className="text-lg font-semibold mb-1 block">Plot Outline / Content</Text>
          <Textarea value={plotOutline} onInput={(e) => setPlotOutline(e.detail.value)} placeholder="Enter plot summary or main content..." className="w-full p-2 border rounded h-60 bg-white" />
        </View>

        {/* Generation Parameters (as metadata) */}
        <View className="mb-4">
          <Text className="text-lg font-semibold mb-1 block">Additional Parameters</Text>
          <Picker mode="selector" range={LENGTH_OPTIONS} value={LENGTH_OPTIONS.indexOf(lengthPref)} onChange={(e) => setLengthPref(LENGTH_OPTIONS[e.detail.value as number])}>
            <View className="mb-3 p-2 border rounded bg-white">Length: {lengthPref}</View>
          </Picker>
          <Picker mode="selector" range={STYLE_OPTIONS} value={STYLE_OPTIONS.indexOf(writingStyle)} onChange={(e) => setWritingStyle(STYLE_OPTIONS[e.detail.value as number])}>
            <View className="mb-3 p-2 border rounded bg-white">Style: {writingStyle}</View>
          </Picker>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="mt-auto pt-4 border-t border-gray-200">
        <View className="flex justify-between">
          <Button onClick={handleCancel} className="bg-gray-300 w-[48%]">Cancel</Button>
          <Button onClick={handleSaveChanges} disabled={!hasChanges} className={`w-[48%] ${hasChanges ? 'bg-green-600 text-white' : 'bg-gray-400 text-gray-700'}`}>
            Save Changes
          </Button>
        </View>
      </View>
    </View>
  )
}
