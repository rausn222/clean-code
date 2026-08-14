import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Shell } from './components/layout/Shell';
import SearchPage from './pages/SearchPage';
import GlobalSearchPage from './pages/GlobalSearchPage';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Home from './pages/Home';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    }
  }
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search">
        <Shell>
          <SearchPage />
        </Shell>
      </Route>
      <Route path="/global-search">
        <Shell>
          <GlobalSearchPage />
        </Shell>
      </Route>
      <Route path="/my-products">
        <Shell>
          <Catalog />
        </Shell>
      </Route>
      <Route path="/products/:id">
        <Shell>
          <ProductDetail />
        </Shell>
      </Route>
      <Route>
        <Shell>
          <NotFound />
        </Shell>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
