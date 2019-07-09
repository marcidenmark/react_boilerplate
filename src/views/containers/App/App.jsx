import React, { useState } from 'react';
import { hot } from 'react-hot-loader';
import Loadable from 'react-loadable';

// Utilities
import { isDev } from 'utilities/development';

// Components
import Header from 'views/components/Header';
import Loading from 'views/components/Loading';

const Footer = Loadable({
  loader: () => import('views/components/Footer'),
  loading: Loading,
});

const App = () => {
  const [value, setValue] = useState('1');

  return (
    <div className="app">
      <Header />

      <main>
        <h1>Home {value}</h1>

        <button type="button" onClick={() => setValue('1')}>
          1
        </button>
        <button type="button" onClick={() => setValue('2')}>
          2
        </button>
        <button type="button" onClick={() => setValue('3')}>
          3
        </button>
      </main>

      <Footer />
    </div>
  );
};

// export default App;
export default (isDev() ? hot(module)(App) : App);