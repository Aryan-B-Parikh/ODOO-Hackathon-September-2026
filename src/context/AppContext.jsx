import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const initialAssets = [
  {
    id: "ASSET-8291",
    name: "MacBook Pro M3 Max - 16\"",
    category: "IT Equipment",
    status: "Active",
    assignedTo: "Sarah Jenkins",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQCEJZ_t_uWP7pTvdWsDXTxu5coFrnNC0NOoyyV40Pv24D-HML9_JJAQVdudsfcBbqhbpagRElC4FO8z5Z2y-PBL-wtWYsUGEjmFRYGujoAZYrp70dr6-K8IGzJPelNNzxWU9pJnyeDR9so7j6IGZVrW-iygliCtknMFdfveLkiSuABAyGlZpqi4uAItsfm171F9i1uWUu8fo8Aj-_1-9LeWQ69vlkxSefgN6FX-3pKiJaeXZjQD9uGb1Z3cZ7POodIaF2uW7GuHeu",
    lastAudit: "Oct 12, 2023"
  },
  {
    id: "ASSET-4412",
    name: "Dell UltraSharp 32\" 4K",
    category: "IT Equipment",
    status: "Maintenance",
    assignedTo: "Main Office - R4",
    avatar: "MT",
    lastAudit: "Nov 05, 2023"
  },
  {
    id: "ASSET-9003",
    name: "Tesla Model 3 - Fleet ID 44",
    category: "Vehicles",
    status: "Active",
    assignedTo: "David Miller",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDpSMRQpmFl8CMwb0DmB5UoRkUSgqZrQFR__FXJCep5YKKxTb9UWrGwYS0pYvSwcpxS_Sek_M3S0DToclejPgIAGqyv7sYS3E3yQH7wj45HZCH8ZTzUyiZwWc1qNSR-IxzLHZdiDNOnrVvsXL8UrVHKZfsAjkcDHUxTsucRgI_HbMncHJmmd0t3orcUTE_rXZJbwep_LL-CPKYHQxG7zoqMTpvEIJe3H7ItD_5zGpS0lgXGfGjI7awzwiITS0dJ6F2jIy-3P8gSJJz",
    lastAudit: "Jan 14, 2024"
  },
  {
    id: "ASSET-1224",
    name: "Ergonomic Task Chair V2",
    category: "Office Furniture",
    status: "Decommissioned",
    assignedTo: "Unassigned",
    avatar: "",
    lastAudit: "Dec 20, 2023"
  },
  {
    id: "ASSET-5561",
    name: "Network Switch Cisco 48p",
    category: "Manufacturing",
    status: "Active",
    assignedTo: "Server Room 2",
    avatar: "IT",
    lastAudit: "Jan 02, 2024"
  }
];

const initialTickets = [
  {
    id: "#AX-2091",
    title: "HVAC Unit 4 Filter Replacement",
    priority: "High",
    progress: 0,
    status: "Backlog",
    assignedTo: "Unassigned",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCAb3JSNRiEJXx4US2QdyP_t6zJ1IHL-M2I52CZ-a6sQX_XxRl-OlAQJznE_VNZ-Zf6nUCJUJ2R4yx3g1naGO0UAAJF6HTFekb2H6qPzYhcc9blXxsUI1zuaCRJ0jpzz8NzCRJ1LZAsGSX2ex6x3qcBpfID0i-wLkA8XbyNBTDDJJXlzhD16Wthm_m0UNcpIEEiyhiCr-9zXRjKLItZkpIqnYwpmzlNxTIHOzq0hzxekvOdFlDYDqCuac_XZU4z2uDYUjQDxCJh2Ayq",
    due: "Due in 3 days",
    comments: 0
  },
  {
    id: "#AX-2104",
    title: "Conveyor Belt Lubrication Zone B",
    priority: "Medium",
    progress: 10,
    status: "Backlog",
    assignedTo: "Jordan S.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvcxSu8csAbk__qE1BoDdSs2YFHC6AHgmung7MxlwOHQWilTBFc6aDlZd-JgGVMDXJV9fTBQzh90C7P3W3jYGt33BzVlirlwABSCQRYHK9z07Wce2586uTfDuVpw4qhEC1oAZB9gT8uSOys3Xwiu6egSv75jnLkTHyOTUbKwiGLUaQjQbgaLkmXkT9ACgkh1HL-rUByXDeCLJqYxmrwYuwRsmFRk2_knFT2iYWraKnfu6mWh0vEVyA-AcCj2tUvc3OoIhFNKofOKUn",
    due: "Due in 5 days",
    comments: 0
  },
  {
    id: "#AX-1988",
    title: "Server Rack 12 Power Supply Issue",
    priority: "High",
    progress: 65,
    status: "In Progress",
    assignedTo: "Alex Rivera",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBweA6PiS5AXIJ8Et1UyCMN41SnB6bl3OPVNvJt6o0MY16aSSl-4BWoeSnEhQgMJ3f8GINfHKReDt4Gq8LLxhRhdR2_0kGnXML--ecDDPtn36TpIapvSz822d5XGjCj80m2yoFOrabw2lC98QaXRx5dL5icpzW4ezWVoNdJmtiMCJa3bvQS13QSdhHnl7ztDrqvCh3LFNLX6bsJuXVSMZSQyhXU23LBJMuqsdmg9NqTLzxzsa6MKzYANPi0zG-SP_D-lfqkJcrpuu3e",
    due: "Due Today",
    comments: 3
  },
  {
    id: "#AX-2044",
    title: "Hydraulic Leak Detection - Forklift F2",
    priority: "Medium",
    progress: 25,
    status: "In Progress",
    assignedTo: "Sam Chen",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD48KO0D4VAPfLXArC6JB7hwCA2eW1i6iaFcyAFcWX72joMxvJaV6sHaClw2O4RlKlqZn0FLT-9Q2YnmqdFg8rOOwmyVvLcBK-0BJkYO5XiUsdfjaWX2_I18rCLD0T-X05aW1h9fgA2zUo7t-k1pFQXz4mNQwWvErtPIxJywAXofueOfgqlryWzd_2CrKmScobDbLTa6KIal2vAIoQJeGu-8xFLrhL_CgQircS3Sz_xCIXM9_IT4bkSf3IU_oSO1PbQDH5UWNr0QjZp",
    due: "Due in 2 days",
    comments: 0
  },
  {
    id: "#AX-2110",
    title: "Emergency Light Testing - Wing C",
    priority: "Low",
    progress: 100,
    status: "Review",
    assignedTo: "Maria G.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCcHri9CVf91h3BK_jWa5P7tg0tfZ2fow-YUWa1wuCAsJ0xZOgsfogfTISk6rKWfGiVI4sRIfh4mZlhsSjKetjdHW50ZcqAHX_8rYn9oVrcbRJPMfpFJFnRJEW6QQaMYt7Jbz_dWpAUyLmAw3XGsiZK86SUZA5su71siWAQuKEa6BYLps0PQfgmnnlMRajOD-d0rNCPKi-EhXvm-NRflzrKJ2e_JvgPsyxswSLRTzN_gLNCJLhTe_1eMQ21ZkJNFXSf0Exljd7YkC2K",
    due: "Ready",
    comments: 0
  },
  {
    id: "#AX-1822",
    title: "Generator Weekly Test - Standby Power",
    priority: "Done",
    progress: 100,
    status: "Completed",
    assignedTo: "Sam Chen",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsRBkQCGaGSTbbFSn_XaIt26fMidzPF-vEwqv7E_GuYPZEcpZ93VTOwDv6GQociVph6KfXBy81N0RO8p4ivvNJKwBa-1ctjUuwFYPZnhpZ96so6QlxBDTgO1U1KGILqjTW8yl87MsCoSrZLO-2PkAO6vSZYKFvg1-MjFx6UkDqY17MPl7coEn8ICAw3VkxOnYr0pPz7N6LSq7xxpgbr-KVDU48Bd7LgvOs_O_p40nHT7-uw4n9UaD_2zkbDtc990GZ9z596FADewsK",
    due: "Done",
    comments: 1
  }
];

const mockUser = {
  name: "Alex Chen",
  email: "alex.chen@assetflow.com",
  level: "Admin Level 4",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDVcYJhqsZNEQxCrb5gnButF_ZH9EYvtsY-nIMDyrmgBop5CQ1AGcJkU3Qo6hQPztocCC4MXN2w7eBvW9pPeLlxFBxWreZPZXTX0WMJh5el6TAIFCXnjeXSRR6kU5H-t5qqR9yk_RN5cFq5w5jD5uvUeOm_TSVDSBqKMS7OHkyFhnLuWkiF55htV9pzJ1M6BNwVpcb8l4u7Mg6LWUP917WavGePBqAHMwrGY5MFAQ3LM7VbUcbX3Dmwniw2GOA9WuvWsJGwvYdYClC"
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('assetflow_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [assets, setAssets] = useState(() => {
    const savedAssets = localStorage.getItem('assetflow_assets');
    return savedAssets ? JSON.parse(savedAssets) : initialAssets;
  });

  const [tickets, setTickets] = useState(() => {
    const savedTickets = localStorage.getItem('assetflow_tickets');
    return savedTickets ? JSON.parse(savedTickets) : initialTickets;
  });

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      localStorage.setItem('assetflow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('assetflow_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('assetflow_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('assetflow_tickets', JSON.stringify(tickets));
  }, [tickets]);

  const login = (email, password) => {
    // Simple demo validation: accept any password
    if (email && email.includes('@')) {
      setUser({
        ...mockUser,
        email: email
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const addAsset = (asset) => {
    const newId = `ASSET-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAsset = {
      id: newId,
      lastAudit: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      ...asset
    };
    setAssets(prev => [newAsset, ...prev]);
  };

  const updateAssetStatus = (id, status) => {
    setAssets(prev => prev.map(asset => asset.id === id ? { ...asset, status } : asset));
  };

  const addTicket = (ticket) => {
    const newId = `#AX-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket = {
      id: newId,
      progress: 0,
      due: "Due in 3 days",
      comments: 0,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCAb3JSNRiEJXx4US2QdyP_t6zJ1IHL-M2I52CZ-a6sQX_XxRl-OlAQJznE_VNZ-Zf6nUCJUJ2R4yx3g1naGO0UAAJF6HTFekb2H6qPzYhcc9blXxsUI1zuaCRJ0jpzz8NzCRJ1LZAsGSX2ex6x3qcBpfID0i-wLkA8XbyNBTDDJJXlzhD16Wthm_m0UNcpIEEiyhiCr-9zXRjKLItZkpIqnYwpmzlNxTIHOzq0hzxekvOdFlDYDqCuac_XZU4z2uDYUjQDxCJh2Ayq",
      ...ticket
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const moveTicketColumn = (ticketId, targetColumn) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        let updated = { ...t, status: targetColumn };
        if (targetColumn === 'Completed') {
          updated.progress = 100;
          updated.priority = 'Done';
        } else if (targetColumn === 'Review') {
          updated.progress = 100;
          updated.priority = 'Low';
        } else if (targetColumn === 'In Progress' && updated.progress === 0) {
          updated.progress = 10;
        } else if (targetColumn === 'Backlog') {
          updated.progress = 0;
        }
        return updated;
      }
      return t;
    }));
  };

  return (
    <AppContext.Provider value={{
      user,
      assets,
      tickets,
      searchQuery,
      setSearchQuery,
      login,
      logout,
      addAsset,
      updateAssetStatus,
      addTicket,
      moveTicketColumn
    }}>
      {children}
    </AppContext.Provider>
  );
};
