import { View, Text, Button, Progress, Video } from '@tarojs/components'; // Added Video
import Taro, { useRouter, navigateBack, showToast, setClipboardData, navigateTo, openDocument, downloadFile } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import './index.scss';

type VideoStatus = 'Initializing' | 'Processing' | 'Rendering Scenes' | 'Finalizing' | 'Completed' | 'Failed';

export default function VideoPreviewStatus() {
  const router = useRouter();
  const novelId = router.params.novelId;
  const videoId = router.params.videoId;

  const [status, setStatus] = useState<VideoStatus>('Initializing');
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (videoId) {
      setStatus('Processing');
      setProgress(10);

      const interval = setInterval(() => {
        setProgress(prev => {
          let newProgress = prev + Math.floor(Math.random() * 15) + 5;
          if (newProgress >= 100) {
            clearInterval(interval);
            // Simulate random success or failure for demo
            if (Math.random() > 0.2) { // 80% chance of success
              setStatus('Completed');
              setVideoUrl('https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'); // Mock URL
              showToast({title: 'Video Generation Complete!', icon: 'success'});
            } else {
              setStatus('Failed');
              setErrorMessage('A simulated error occurred during video processing. Please try again.');
              showToast({title: 'Video Generation Failed', icon: 'none'});
            }
            return 100;
          }

          if (newProgress > 75) setStatus('Finalizing');
          else if (newProgress > 40) setStatus('Rendering Scenes');
          else if (newProgress > 10) setStatus('Processing');

          return newProgress;
        });
      }, 2000); // Update every 2 seconds

      return () => clearInterval(interval);
    }
  }, [videoId]);

  const handleCopyUrl = () => {
    if (videoUrl) {
      setClipboardData({
        data: videoUrl,
        success: () => showToast({ title: 'Video URL Copied!' }),
        fail: () => showToast({ title: 'Failed to copy URL', icon: 'none' })
      });
    }
  };

  const handleDownloadVideo = async () => {
    if (!videoUrl) return;
    showToast({title: 'Attempting download (simulated)...', icon: 'loading'});
    try {
        const downloadRes = await downloadFile({ url: videoUrl });
        if (downloadRes.statusCode === 200) {
            showToast({title: 'Downloaded! (Simulated)', icon: 'success'});
            // On some platforms, you might be able to open it:
            // openDocument({ filePath: downloadRes.tempFilePath }).catch(err => {
            //   console.error("Error opening document", err);
            //   showToast({title: 'Could not open file preview.', icon: 'none'});
            // });
            console.log("Simulated download to: ", downloadRes.tempFilePath);
        } else {
            showToast({title: `Download failed: ${downloadRes.statusCode}`, icon: 'none'});
        }
    } catch(e) {
        showToast({title: 'Download error.', icon: 'none'});
        console.error("Download exception", e);
    }
  };

  const handleShareVideo = () => {
    if (!videoUrl) return;
    // Basic share: copy link. Advanced: Taro.showShareMenu with custom path including videoId
    setClipboardData({
        data: `Check out this video generated from my novel! ${videoUrl}`,
        success: () => showToast({ title: 'Shareable link copied!' }),
    });
    // Taro.showShareMenu({ /* ... */ }) // For more integrated sharing
  };

  const handleRetryGeneration = () => {
    // Navigate back to config page, which will use existing novelId
    navigateBack();
  };

  return (
    <View className="p-4 flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <View className="w-full max-w-md bg-white p-6 rounded-xl shadow-xl">
        <Text className="text-2xl font-bold block mb-3 text-center text-gray-700">Video Generation</Text>
        <View className="text-xs text-gray-500 mb-1 text-center">
            <Text className="block">Novel ID: {novelId}</Text>
            <Text className="block">Video ID: {videoId}</Text>
        </View>

        <View className="my-6 text-center">
          <Text className={`text-xl font-semibold mb-3 ${status === 'Completed' ? 'text-green-500' : status === 'Failed' ? 'text-red-500' : 'text-blue-500'}`}>
            Status: {status}
          </Text>
          {status !== 'Completed' && status !== 'Failed' && (
            <Progress percent={progress} strokeWidth={12} activeColor="#3b82f6" active className="rounded-lg"/>
          )}
        </View>

        {status === 'Completed' && videoUrl && (
          <View className="mt-4 text-center">
            <Text className="block mb-3 text-lg text-green-600 font-semibold">Your video is ready!</Text>
            {/* Taro Video Component - works on specific platforms like WeChat MP */}
            {/* Check platform before rendering or provide alternative */}
            {Taro.ENV_TYPE.WEAPP === Taro.getEnv() && (
                 <Video
                    src={videoUrl}
                    controls={true}
                    autoplay={false}
                    className="w-full h-auto max-h-64 rounded-lg shadow-md my-2"
                    // poster="YOUR_POSTER_IMAGE_URL" // Optional poster
                 />
            )}
            <Text className="block text-sm my-2">Video Link:</Text>
            <Text selectable className="text-xs text-blue-600 break-all p-2 bg-gray-100 rounded">{videoUrl}</Text>
            <View className="mt-4 grid grid-cols-2 gap-2">
              <Button size="mini" className="bg-blue-500 text-white" onClick={handleCopyUrl}>Copy Link</Button>
              <Button size="mini" className="bg-green-500 text-white" onClick={handleDownloadVideo}>Download</Button>
              {/* <Button size="mini" className="bg-indigo-500 text-white col-span-2" onClick={handleShareVideo}>Share Video</Button> */}
            </View>
          </View>
        )}

        {status === 'Failed' && (
          <View className="mt-4 text-center p-3 bg-red-50 rounded-lg">
            <Text className="block mb-2 text-red-600 font-semibold">Generation Failed</Text>
            <Text className="text-sm text-red-500">{errorMessage || 'An unknown error occurred.'}</Text>
            <Button onClick={handleRetryGeneration} className="mt-4 bg-orange-500 text-white">
              Retry Configuration
            </Button>
          </View>
        )}

        <View className="mt-8 flex flex-col space-y-2">
          {status !== 'Completed' && status !== 'Failed' && (
            <Button onClick={() => Taro.reLaunch({url: '/pages/list/index'})} className="bg-gray-200 text-gray-700">
                Go to My Novels (Background Task)
            </Button>
          )}
           {(status === 'Completed' || status === 'Failed') && (
            <Button onClick={() => Taro.reLaunch({url: '/pages/list/index'})} className="bg-blue-500 text-white">
                Back to My Novels
            </Button>
           )}
        </View>
      </View>
    </View>
  );
}
