import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

export default function RechargePage() {
  const handleRecharge = () => {
    Taro.showToast({ title: 'Recharge successful (simulated)!', icon: 'success'});
    // In a real app, integrate with payment SDK and update points
    // Then navigate back or to profile
    setTimeout(() => Taro.navigateBack(), 1500);
  }

  return (
    <View className="p-4">
      <Text className="text-xl font-bold block mb-4">Recharge Points</Text>
      <Text className="block mb-2">Select a package:</Text>
      <View className="mb-4 p-3 border rounded-md bg-white">
        <Text className="block font-semibold">100 Points</Text>
        <Text className="block text-sm text-gray-600">Price: $1.00 (Simulated)</Text>
        <Button onClick={handleRecharge} className="mt-2 bg-green-500 text-white w-full">Buy Now</Button>
      </View>
      <View className="mb-4 p-3 border rounded-md bg-white">
        <Text className="block font-semibold">500 Points</Text>
        <Text className="block text-sm text-gray-600">Price: $4.50 (Simulated)</Text>
        <Button onClick={handleRecharge} className="mt-2 bg-green-500 text-white w-full">Buy Now</Button>
      </View>
      <Text className="text-xs text-gray-500">This is a placeholder page. Payment integration is required.</Text>
    </View>
  );
}
