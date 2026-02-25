/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Route, Switch } from 'wouter';
import Layout from './components/Layout';
import Home from './pages/Home';
import Glossary from './pages/Glossary';
import Flashcards from './pages/Flashcards';
import Quiz from './pages/Quiz';
import Admin from './pages/Admin';
import CategoryView from './pages/CategoryView';

export default function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/glossary" component={Glossary} />
        <Route path="/study" component={Flashcards} />
        <Route path="/quiz" component={Quiz} />
        <Route path="/admin" component={Admin} />
        <Route path="/category/:id" component={CategoryView} />
        <Route>
          <div className="p-8 text-center text-slate-500">Page not found</div>
        </Route>
      </Switch>
    </Layout>
  );
}
