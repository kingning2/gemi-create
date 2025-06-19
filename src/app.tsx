import { PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'
import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  // useEffect(() => {
  //   // Example of initial login check or app load logic
  //   Taro.checkSession({
  //     success: () => console.log('Session valid'),
  //     fail: () => {
  //       console.log('Session invalid, attempting login');
  //       // Optionally trigger login here if session is invalid
  //       // Taro.login().then(res => console.log('Logged in with code:', res.code));
  //     }
  //   });
  // }, [])

  return children
}

export default App
