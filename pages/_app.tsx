import type { AppProps } from 'next/app';
import { ReactElement, ReactNode, Suspense, useEffect, useState } from 'react';
import DefaultLayout from '../components/Layouts/DefaultLayout';
import { Provider } from 'react-redux';
import store from '../store/index';
import Head from 'next/head';

// Perfect Scrollbar
import 'react-perfect-scrollbar/dist/css/styles.css';

import '../styles/tailwind.css';
import { NextPage } from 'next';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

import { SessionProvider } from "next-auth/react"

import { ContextProvider } from '@/context';

const App = ({ Component, pageProps: { session, ...pageProps } }: AppPropsWithLayout) => {
    const [ready, setReady] = useState(false);
    useEffect(() => {
        setReady(true);
      }, []);

    const getLayout = Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

    return (
      <>
        {ready ? (
          <ContextProvider>
            <SessionProvider session={session} refetchInterval={0}>
                <Provider store={store}>
                  <Head>
                    <title>x</title>
                    <meta charSet="UTF-8" />
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <meta name="description" content="" />
                    <link rel="icon" href="/logo.png" />
                  </Head>
                  {getLayout(<Component {...pageProps} />)}
                </Provider>
            </SessionProvider>
          </ContextProvider>
        ) : null}
      </>
    );
};
export default App;
