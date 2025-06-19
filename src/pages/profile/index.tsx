import { View, Text, Button, Image } from '@tarojs/components'
import Taro, { navigateTo, showToast, showModal } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss' // Ensure this file exists

// Interfaces
interface UserProfileData {
  nickName: string;
  avatarUrl: string;
}

interface PointTransaction {
  id: string;
  date: string;
  description: string;
  amount: number; // Positive for credit, negative for debit
  type: 'credit' | 'debit';
}

// Mock Data
const MOCK_USER_POINTS_PROFILE = 1250; // Can be different from create page's initial for demo
const MOCK_TRANSACTIONS: PointTransaction[] = [
  { id: 'txn1', date: new Date(Date.now() - 1 * 24*60*60*1000).toLocaleDateString(), description: 'Novel Generation: "Space Opera"', amount: -100, type: 'debit' },
  { id: 'txn2', date: new Date(Date.now() - 2 * 24*60*60*1000).toLocaleDateString(), description: 'Recharge Points Package A', amount: 500, type: 'credit' },
  { id: 'txn3', date: new Date(Date.now() - 3 * 24*60*60*1000).toLocaleDateString(), description: 'Video Generation: "My First Movie"', amount: -250, type: 'debit' },
  { id: 'txn4', date: new Date(Date.now() - 5 * 24*60*60*1000).toLocaleDateString(), description: 'Initial Bonus Points', amount: 1000, type: 'credit' },
];

export default function UserProfile() {
  const [userInfo, setUserInfo] = useState<UserProfileData | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0); // Initialize with 0 or fetch
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // Manage login state

  useEffect(() => {
    // Try to load cached login state and user info
    const cachedUserInfo = Taro.getStorageSync('userInfo');
    const cachedLoginState = Taro.getStorageSync('isLoggedIn');
    if (cachedUserInfo && cachedLoginState) {
      setUserInfo(cachedUserInfo);
      setIsLoggedIn(cachedLoginState);
      // Simulate fetching points and transactions for a logged-in user
      setUserPoints(MOCK_USER_POINTS_PROFILE); // Replace with actual API call
      setTransactions(MOCK_TRANSACTIONS);     // Replace with actual API call
    }
  }, []);

  const handleLogin = async () => {
    try {
      // For WeChat Mini Program, use Taro.getUserProfile (new API)
      const profileRes = await Taro.getUserProfile({ desc: 'For displaying user profile information' });
      console.log('User Profile Response:', profileRes);
      setUserInfo(profileRes.userInfo);
      setIsLoggedIn(true);
      Taro.setStorageSync('userInfo', profileRes.userInfo);
      Taro.setStorageSync('isLoggedIn', true);

      // Simulate fetching points and transactions after login
      setUserPoints(MOCK_USER_POINTS_PROFILE);
      setTransactions(MOCK_TRANSACTIONS);
      showToast({ title: 'Login Successful!', icon: 'success' });

      // In a real app, you would also send loginRes.code from Taro.login() to your backend
      // const loginRes = await Taro.login();
      // console.log('Login code for backend:', loginRes.code);
      // Your backend would verify code, create/fetch user, return session token & user data
    } catch (error) {
      console.error('Login or getUserProfile error:', error);
      showToast({ title: 'Login failed. Please try again.', icon: 'none' });
    }
  };

  const handleLogout = async () => {
    const res = await showModal({
        title: 'Confirm Logout',
        content: 'Are you sure you want to log out?',
    });
    if (res.confirm) {
        setUserInfo(null);
        setIsLoggedIn(false);
        setUserPoints(0);
        setTransactions([]);
        Taro.removeStorageSync('userInfo');
        Taro.removeStorageSync('isLoggedIn');
        // Clear other relevant session data
        showToast({ title: 'Logged Out', icon: 'none' });
    }
  };

  const navigateToRecharge = () => {
    navigateTo({ url: '/pages/recharge/index' });
  };

  if (!isLoggedIn) {
    return (
      <View className="p-8 flex flex-col items-center justify-center h-screen">
        <Text className="text-xl font-semibold mb-6">Welcome!</Text>
        <Button onClick={handleLogin} className="bg-blue-500 text-white py-2 px-6 rounded-lg">
          Login with WeChat
        </Button>
        <Text className="text-xs text-gray-500 mt-4">Login to manage your novels and points.</Text>
      </View>
    );
  }

  return (
    <View className="p-4 pb-16"> {/* Added padding-bottom for scroll */}
      {/* User Info Section */}
      <View className="flex items-center mb-6 p-4 bg-white rounded-lg shadow">
        {userInfo?.avatarUrl && (
          <Image src={userInfo.avatarUrl} className="w-16 h-16 rounded-full mr-4" />
        )}
        <View>
          <Text className="text-xl font-bold">{userInfo?.nickName || 'User'}</Text>
          <Text className="text-sm text-gray-500">Welcome back!</Text>
        </View>
      </View>

      {/* Points Section */}
      <View className="mb-6 p-4 bg-white rounded-lg shadow">
        <Text className="text-lg font-semibold mb-2">My Points</Text>
        <Text className="text-3xl font-bold text-blue-600 mb-3">{userPoints} Points</Text>
        <Button onClick={navigateToRecharge} className="bg-green-500 text-white w-full py-2 rounded-md">
          Recharge Points
        </Button>
      </View>

      {/* Transaction History Section */}
      <View className="mb-6 p-4 bg-white rounded-lg shadow">
        <Text className="text-lg font-semibold mb-3">Transaction History</Text>
        {transactions.length > 0 ? (
          <View className="space-y-3">
            {transactions.map(txn => (
              <View key={txn.id} className="flex justify-between items-center p-2 border-b border-gray-100">
                <View>
                  <Text className="block text-sm font-medium">{txn.description}</Text>
                  <Text className="block text-xs text-gray-500">{txn.date}</Text>
                </View>
                <Text className={`text-sm font-semibold ${txn.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                  {txn.type === 'credit' ? '+' : ''}{txn.amount}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-sm text-gray-500">No transactions yet.</Text>
        )}
      </View>

      {/* App Settings Placeholder */}
      <View className="mb-6 p-4 bg-white rounded-lg shadow">
        <Text className="text-lg font-semibold mb-2">App Settings</Text>
        <Text className="text-sm text-gray-500">Future home for app preferences, AI model choices, etc.</Text>
        {/* Example: <View className="mt-2"><Button size="mini">Notification Preferences</Button></View> */}
      </View>

      {/* Logout Button */}
      <View className="mt-6">
        <Button onClick={handleLogout} className="bg-red-500 text-white w-full py-2 rounded-md">
          Logout
        </Button>
      </View>
    </View>
  )
}
