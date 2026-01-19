import { useEffect, useState } from 'react';
import { CheckSquare, Target, BarChart3, LogOut, Menu, X } from 'lucide-react';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { TaskList } from './components/TaskList';
import { HabitTracker } from './components/HabitTracker';
import type { User } from '@supabase/supabase-js';

type View = 'tasks' | 'habits' | 'analytics';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('tasks');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const navigation = [
    { id: 'tasks' as View, name: 'Tasks', icon: CheckSquare },
    { id: 'habits' as View, name: 'Habits', icon: Target },
    { id: 'analytics' as View, name: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">Life Manager</h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-600 hover:text-gray-900"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex h-screen">
        <aside
          className={`
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
            fixed lg:static inset-y-0 left-0 z-20
            w-64 bg-white border-r border-gray-200
            transition-transform duration-200 ease-in-out
            flex flex-col
          `}
        >
          <div className="p-6 border-b border-gray-200 hidden lg:block">
            <h1 className="text-2xl font-bold text-gray-900">Life Manager</h1>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors text-left
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </aside>

        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 lg:p-8">
            {currentView === 'tasks' && <TaskList />}
            {currentView === 'habits' && <HabitTracker />}
            {currentView === 'analytics' && (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Analytics Coming Soon
                </h2>
                <p className="text-gray-500">
                  Track your productivity trends and insights here
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
