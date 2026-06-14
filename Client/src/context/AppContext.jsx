import { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [sideBar, setSideBar] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [userRole, setUserRole] = useState(() => {
    const storedRole = localStorage.getItem('userRole');
    return storedRole ? storedRole : null;
  });

  const checkDevice = () => {
    if (window.innerWidth < 768) {
      setSideBar(false);
    }
  };

  useEffect(() => {
    checkDevice();
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      setUserRole(user.role);
    } else {
      localStorage.removeItem('user');
      setUserRole(null);
    }
  }, [user]);

  useEffect(() => {
    if (userRole) {
      localStorage.setItem('userRole', userRole);
    } else {
      localStorage.removeItem('userRole');
    }
  }, [userRole]);

  const refreshData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleRoleSelect = (role) => {
    setUserRole(role);
  };

  const handleLogin = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    setUserRole(authUser.role);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setUserRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  };

  const value = {
    token,
    user,
    userRole,
    setUserRole,
    isAuthenticated: !!token,
    handleLogin,
    handleRoleSelect,
    handleLogout,
    sideBar, 
    setSideBar,
    refreshTrigger,
    refreshData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext; 