import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const API_BASE = 'http://localhost:5050/api';

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('assetflow_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('assetflow_token') || null);

  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [audits, setAudits] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [favorites, setFavorites] = useState(() => {
    const savedFavs = localStorage.getItem('assetflow_favorites');
    return savedFavs ? JSON.parse(savedFavs) : [];
  });

  const [pinnedCards, setPinnedCards] = useState(() => {
    const savedPins = localStorage.getItem('assetflow_pinned_cards');
    return savedPins ? JSON.parse(savedPins) : [];
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem('themeColor') || 'blue';
  });

  const [searchQuery, setSearchQuery] = useState("");

  // Save token and user to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('assetflow_token', token);
    } else {
      localStorage.removeItem('assetflow_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('assetflow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('assetflow_user');
    }
  }, [user]);

  // Save UI local preferences to localStorage
  useEffect(() => {
    localStorage.setItem('assetflow_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('assetflow_pinned_cards', JSON.stringify(pinnedCards));
  }, [pinnedCards]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('themeColor', themeColor);
  }, [themeColor]);

  // Reusable API Fetch Helper
  const apiCall = async (url, options = {}) => {
    const currentToken = localStorage.getItem('assetflow_token') || token;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    try {
      let response = await fetch(`${API_BASE}${url}`, { ...options, headers });
      
      // Token Refresh Rotation & Retry logic
      if (response.status === 401 && url !== '/auth/login' && url !== '/auth/refresh') {
        const currentRefreshToken = localStorage.getItem('assetflow_refresh_token');
        if (currentRefreshToken) {
          try {
            const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken: currentRefreshToken })
            });
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              localStorage.setItem('assetflow_token', refreshData.token);
              localStorage.setItem('assetflow_refresh_token', refreshData.refreshToken);
              setToken(refreshData.token);
              
              // Retry original API request with the new access token
              headers['Authorization'] = `Bearer ${refreshData.token}`;
              response = await fetch(`${API_BASE}${url}`, { ...options, headers });
            } else {
              logout();
            }
          } catch (refreshErr) {
            console.error('Refresh token exchange failed:', refreshErr);
            logout();
          }
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (err) {
      console.error(`API Call failed: ${url}`, err);
      throw err;
    }
  };

  // Load all initial data from backend if authenticated
  const loadBackendData = async () => {
    try {
      const [assetsData, ticketsData, deptsData, catsData, allocsData, bookingsData, auditsData, notifsData, empsData] = await Promise.all([
        apiCall('/assets'),
        apiCall('/maintenance'),
        apiCall('/departments'),
        apiCall('/categories'),
        apiCall('/allocations'),
        apiCall('/bookings'),
        apiCall('/audits'),
        apiCall('/notifications'),
        apiCall('/employees')
      ]);

      setAssets(assetsData);
      setTickets(ticketsData);
      setDepartments(deptsData);
      setCategories(catsData);
      setAllocations(allocsData);
      setBookings(bookingsData);
      setAudits(auditsData);
      setNotifications(notifsData);
      setUsers(empsData);
    } catch (err) {
      console.error('Failed to pre-load DB registries:', err);
    }
  };

  useEffect(() => {
    if (token) {
      loadBackendData();
    }
  }, [token]);

  // Auth Operations
  const login = async (email, password) => {
    try {
      const result = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (result.token) {
        setToken(result.token);
        localStorage.setItem('assetflow_refresh_token', result.refreshToken);
        setUser({
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          level: `${result.user.role} Level 1`,
          status: result.user.status === 'ACTIVE' ? 'Active' : 'Inactive',
          avatarBg: "bg-blue-100 text-blue-700",
          initials: result.user.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (userData) => {
    try {
      await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      // Reload employees list
      const empsData = await apiCall('/employees');
      setUsers(empsData);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('assetflow_token');
    localStorage.removeItem('assetflow_refresh_token');
    localStorage.removeItem('assetflow_user');
  };

  // User/Employee Administration Operations
  const deleteUser = async (email) => {
    try {
      await apiCall(`/employees/${email}`, { method: 'DELETE' });
      const empsData = await apiCall('/employees');
      setUsers(empsData);
    } catch (error) {
      console.error('Delete employee error:', error);
    }
  };

  const updateUser = async (email, updatedFields) => {
    try {
      await apiCall(`/employees/${email}`, {
        method: 'PUT',
        body: JSON.stringify(updatedFields)
      });
      const empsData = await apiCall('/employees');
      setUsers(empsData);
    } catch (error) {
      console.error('Update employee error:', error);
      throw error;
    }
  };

  // Asset Operations
  const addAsset = async (asset) => {
    try {
      const result = await apiCall('/assets', {
        method: 'POST',
        body: JSON.stringify(asset)
      });
      const assetsData = await apiCall('/assets');
      setAssets(assetsData);
      return result;
    } catch (error) {
      console.error('Add asset error:', error);
      throw error;
    }
  };

  const updateAsset = async (id, updatedFields) => {
    try {
      const result = await apiCall(`/assets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedFields)
      });
      const assetsData = await apiCall('/assets');
      setAssets(assetsData);
      return result;
    } catch (error) {
      console.error('Update asset error:', error);
      throw error;
    }
  };

  const deleteAsset = async (id) => {
    try {
      await apiCall(`/assets/${id}`, { method: 'DELETE' });
      const assetsData = await apiCall('/assets');
      setAssets(assetsData);
    } catch (error) {
      console.error('Delete asset error:', error);
    }
  };

  const updateAssetStatus = async (id, status) => {
    await updateAsset(id, { status });
  };

  const toggleFavoriteAsset = (assetId) => {
    setFavorites(prev =>
      prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]
    );
  };

  const togglePinCard = (cardId) => {
    setPinnedCards(prev =>
      prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
    );
  };

  // Department Operations
  const addDepartment = async (dept) => {
    try {
      await apiCall('/departments', {
        method: 'POST',
        body: JSON.stringify(dept)
      });
      const deptsData = await apiCall('/departments');
      setDepartments(deptsData);
    } catch (error) {
      console.error('Add department error:', error);
    }
  };

  const updateDepartment = async (id, updatedFields) => {
    try {
      await apiCall(`/departments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedFields)
      });
      const deptsData = await apiCall('/departments');
      setDepartments(deptsData);
    } catch (error) {
      console.error('Update department error:', error);
    }
  };

  const deleteDepartment = async (id) => {
    try {
      await apiCall(`/departments/${id}`, { method: 'DELETE' });
      const deptsData = await apiCall('/departments');
      setDepartments(deptsData);
    } catch (error) {
      console.error('Delete department error:', error);
    }
  };

  // Category Operations
  const addCategory = async (cat) => {
    try {
      await apiCall('/categories', {
        method: 'POST',
        body: JSON.stringify(cat)
      });
      const catsData = await apiCall('/categories');
      setCategories(catsData);
    } catch (error) {
      console.error('Add category error:', error);
    }
  };

  const updateCategory = async (id, updatedFields) => {
    try {
      await apiCall(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedFields)
      });
      const catsData = await apiCall('/categories');
      setCategories(catsData);
    } catch (error) {
      console.error('Update category error:', error);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await apiCall(`/categories/${id}`, { method: 'DELETE' });
      const catsData = await apiCall('/categories');
      setCategories(catsData);
    } catch (error) {
      console.error('Delete category error:', error);
    }
  };

  // Allocation Operations
  const addAllocation = async (alloc) => {
    try {
      await apiCall('/allocations', {
        method: 'POST',
        body: JSON.stringify(alloc)
      });
      const [allocsData, assetsData] = await Promise.all([
        apiCall('/allocations'),
        apiCall('/assets')
      ]);
      setAllocations(allocsData);
      setAssets(assetsData);
    } catch (error) {
      console.error('Add allocation error:', error);
    }
  };

  const updateAllocation = async (id, updatedFields) => {
    try {
      if (updatedFields.status === 'Returned' || updatedFields.actualReturn) {
        await apiCall(`/allocations/${id}/return`, {
          method: 'POST',
          body: JSON.stringify({
            actualReturn: updatedFields.actualReturn,
            checkinCondition: updatedFields.checkinCondition,
            checkinNotes: updatedFields.checkinNotes
          })
        });
      }
      const [allocsData, assetsData] = await Promise.all([
        apiCall('/allocations'),
        apiCall('/assets')
      ]);
      setAllocations(allocsData);
      setAssets(assetsData);
    } catch (error) {
      console.error('Update allocation error:', error);
    }
  };

  // Booking Operations
  const addBooking = async (bkg) => {
    try {
      await apiCall('/bookings', {
        method: 'POST',
        body: JSON.stringify(bkg)
      });
      const bookingsData = await apiCall('/bookings');
      setBookings(bookingsData);
    } catch (error) {
      console.error('Add booking error:', error);
    }
  };

  const updateBooking = async (id, updatedFields) => {
    try {
      if (updatedFields.status === 'Cancelled') {
        await apiCall(`/bookings/${id}/cancel`, { method: 'POST' });
      }
      const bookingsData = await apiCall('/bookings');
      setBookings(bookingsData);
    } catch (error) {
      console.error('Update booking error:', error);
    }
  };

  // Ticket (Maintenance) Operations
  const addTicket = async (ticket) => {
    try {
      await apiCall('/maintenance', {
        method: 'POST',
        body: JSON.stringify(ticket)
      });
      const [ticketsData, assetsData] = await Promise.all([
        apiCall('/maintenance'),
        apiCall('/assets')
      ]);
      setTickets(ticketsData);
      setAssets(assetsData);
    } catch (error) {
      console.error('Add maintenance ticket error:', error);
    }
  };

  const updateTicket = async (id, updatedFields) => {
    try {
      await apiCall(`/maintenance/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedFields)
      });
      const ticketsData = await apiCall('/maintenance');
      setTickets(ticketsData);
    } catch (error) {
      console.error('Update ticket error:', error);
    }
  };

  const moveTicketColumn = async (ticketId, targetColumn) => {
    try {
      await apiCall(`/maintenance/${ticketId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: targetColumn })
      });
      const [ticketsData, assetsData] = await Promise.all([
        apiCall('/maintenance'),
        apiCall('/assets')
      ]);
      setTickets(ticketsData);
      setAssets(assetsData);
    } catch (error) {
      console.error('Move ticket column error:', error);
    }
  };

  // Audit Operations
  const addAuditCycle = async (audit) => {
    try {
      await apiCall('/audits', {
        method: 'POST',
        body: JSON.stringify(audit)
      });
      const auditsData = await apiCall('/audits');
      setAudits(auditsData);
    } catch (error) {
      console.error('Add audit cycle error:', error);
    }
  };

  const updateAuditCycle = async (id, updatedFields) => {
    try {
      if (updatedFields.items) {
        await apiCall(`/audits/${id}/checklist`, {
          method: 'PUT',
          body: JSON.stringify({ items: updatedFields.items })
        });
      }
      const auditsData = await apiCall('/audits');
      setAudits(auditsData);
    } catch (error) {
      console.error('Update audit cycle error:', error);
    }
  };

  // Notification Operations
  const addNotification = async (notif) => {
    try {
      // Create is handled by server background logic, but refresh for local triggers
      const notifsData = await apiCall('/notifications');
      setNotifications(notifsData);
    } catch (error) {
      console.error('Add notification error:', error);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await apiCall(`/notifications/${id}/read`, { method: 'PUT' });
      const notifsData = await apiCall('/notifications');
      setNotifications(notifsData);
    } catch (error) {
      console.error('Mark notification read error:', error);
    }
  };

  const clearNotifications = async () => {
    try {
      await apiCall('/notifications', { method: 'DELETE' });
      setNotifications([]);
    } catch (error) {
      console.error('Clear notifications error:', error);
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      users,
      assets,
      tickets,
      departments,
      categories,
      allocations,
      bookings,
      audits,
      notifications,
      favorites,
      pinnedCards,
      theme,
      themeColor,
      searchQuery,
      setSearchQuery,
      login,
      signup,
      logout,
      deleteUser,
      updateUser,
      addAsset,
      updateAsset,
      deleteAsset,
      updateAssetStatus,
      toggleFavoriteAsset,
      togglePinCard,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      addCategory,
      updateCategory,
      deleteCategory,
      addAllocation,
      updateAllocation,
      addBooking,
      updateBooking,
      addTicket,
      updateTicket,
      moveTicketColumn,
      addAuditCycle,
      updateAuditCycle,
      addNotification,
      markNotificationRead,
      clearNotifications,
      setTheme,
      setThemeColor,
      apiCall,
      loadBackendData
    }}>
      {children}
    </AppContext.Provider>
  );
};
