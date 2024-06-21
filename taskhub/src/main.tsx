import React from 'react'
import ReactDOM from 'react-dom/client'
import './css/index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { SocketContextProvider } from './SocketConnection'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <BrowserRouter>
    {/* <Provider store={store}> */}
      <SocketContextProvider>
          <App/>      
      </SocketContextProvider>
    {/* </Provider> */}
    </BrowserRouter>
  </React.StrictMode>,
)
