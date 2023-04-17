import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import MainFeedLayout from '@dailydotdev/shared/src/components/MainFeedLayout';
import dynamic from 'next/dynamic';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { getShouldRedirect } from '@dailydotdev/shared/src/components/utilities';
import { getLayout } from './FeedLayout';

const PostsSearch = dynamic(
  () =>
    import(/* webpackChunkName: "routerPostsSearch" */ '../RouterPostsSearch'),
  { ssr: false },
);

export type MainFeedPageProps = {
  children?: ReactNode;
};

const getFeedName = (path: string): string => {
  if (path === '/') {
    return 'default';
  }
  return path.replace(/^\/+/, '');
};

export default function MainFeedPage({
  children,
}: MainFeedPageProps): ReactElement {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [feedName, setFeedName] = useState(getFeedName(router?.pathname));
  const [isSearchOn, setIsSearchOn] = useState(router?.pathname === '/search');

  useEffect(() => {
    const isMyFeed = router?.pathname === '/my-feed';
    if (getShouldRedirect(isMyFeed, !!user)) {
      router.replace('/');
    } else if (router?.pathname === '/search') {
      setIsSearchOn(true);
      if (!feedName) {
        setFeedName('popular');
      }
    } else {
      const newFeed = getFeedName(router?.pathname);
      if (isSearchOn) {
        setIsSearchOn(false);
      }
      if (newFeed) {
        if (feedName !== newFeed) {
          setFeedName(newFeed);
        }
      }
    }
    // this effect uses the anti pattern of setting state in useEffect
    // so additional inspection of all use cases is needed to ensure
    // no bugs are introduced. This then introduces multiple render cycles with
    // mismatched state until all state setter calls are resolved.
    // Some ideas for refactor
    // 1. feedName and isSearchOn can be refactored to useMemo
    // 2. router.replace logic can stay in useEffect with minimal dependencies
    // 3. other if-else path branches need to be reviewd and state setters removed since now we useMemo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);

  if (!feedName) {
    return <></>;
  }

  return (
    <MainFeedLayout
      feedName={feedName}
      isSearchOn={isSearchOn}
      onFeedPageChanged={(page) => router.replace(`/${page}`)}
      searchQuery={router.query?.q?.toString()}
      searchChildren={<PostsSearch placeholder="Search posts" />}
    >
      {children}
    </MainFeedLayout>
  );
}

export function getMainFeedLayout(
  page: ReactNode,
  pageProps: Record<string, unknown>,
  layoutProps: MainLayoutProps & MainFeedPageProps,
): ReactNode {
  return getLayout(
    <MainFeedPage {...layoutProps}>{page}</MainFeedPage>,
    pageProps,
    layoutProps,
  );
}

export const mainFeedLayoutProps: MainLayoutProps = {
  greeting: true,
  mainPage: true,
  screenCentered: false,
};
