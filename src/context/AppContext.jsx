import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const initialUsers = [
  {
    name: "Alex Chen",
    email: "admin@assetflow.com",
    role: "Admin",
    level: "Admin Level 4",
    status: "Active",
    avatarBg: "bg-blue-100 text-blue-700",
    initials: "AC",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDVcYJhqsZNEQxCrb5gnButF_ZH9EYvtsY-nIMDyrmgBop5CQ1AGcJkU3Qo6hQPztocCC4MXN2w7eBvW9pPeLlxFBxWreZPZXTX0WMJh5el6TAIFCXnjeXSRR6kU5H-t5qqR9yk_RN5cFq5w5jD5uvUeOm_TSVDSBqKMS7OHkyFhnLuWkiF55htV9pzJ1M6BNwVpcb8l4u7Mg6LWUP917WavGePBqAHMwrGY5MFAQ3LM7VbUcbX3Dmwniw2GOA9WuvWsJGwvYdYClC"
  },
  {
    name: "Sarah Jenkins",
    email: "manager@assetflow.com",
    role: "Asset Manager",
    level: "Manager Level 3",
    status: "Active",
    avatarBg: "bg-purple-100 text-purple-700",
    initials: "SJ",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQCEJZ_t_uWP7pTvdWsDXTxu5coFrnNC0NOoyyV40Pv24D-HML9_JJAQVdudsfcBbqhbpagRElC4FO8z5Z2y-PBL-wtWYsUGEjmFRYGujoAZYrp70dr6-K8IGzJPelNNzxWU9pJnyeDR9so7j6IGZVrW-iygliCtknMFdfveLkiSuABAyGlZpqi4uAItsfm171F9i1uWUu8fo8Aj-_1-9LeWQ69vlkxSefgN6FX-3pKiJaeXZjQD9uGb1Z3cZ7POodIaF2uW7GuHeu"
  },
  {
    name: "David Miller",
    email: "head@assetflow.com",
    role: "Department Head",
    level: "Dept Head Level 3",
    status: "Active",
    avatarBg: "bg-green-100 text-green-700",
    initials: "DM",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDpSMRQpmFl8CMwb0DmB5UoRkUSgqZrQFR__FXJCep5YKKxTb9UWrGwYS0pYvSwcpxS_Sek_M3S0DToclejPgIAGqyv7sYS3E3yQH7wj45HZCH8ZTzUyiZwWc1qNSR-IxzLHZdiDNOnrVvsXL8UrVHKZfsAjkcDHUxTsucRgI_HbMncHJmmd0t3orcUTE_rXZJbwep_LL-CPKYHQxG7zoqMTpvEIJe3H7ItD_5zGpS0lgXGfGjI7awzwiITS0dJ6F2jIy-3P8gSJJz"
  },
  {
    name: "John Doe",
    email: "employee@assetflow.com",
    role: "Employee",
    level: "Employee Level 1",
    status: "Active",
    avatarBg: "bg-orange-100 text-orange-700",
    initials: "JD",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCAb3JSNRiEJXx4US2QdyP_t6zJ1IHL-M2I52CZ-a6sQX_XxRl-OlAQJznE_VNZ-Zf6nUCJUJ2R4yx3g1naGO0UAAJF6HTFekb2H6qPzYhcc9blXxsUI1zuaCRJ0jpzz8NzCRJ1LZAsGSX2ex6x3qcBpfID0i-wLkA8XbyNBTDDJJXlzhD16Wthm_m0UNcpIEEiyhiCr-9zXRjKLItZkpIqnYwpmzlNxTIHOzq0hzxekvOdFlDYDqCuac_XZU4z2uDYUjQDxCJh2Ayq"
  },
  {
    name: "Marcus Aurelius",
    email: "auditor@assetflow.com",
    role: "Auditor",
    level: "Auditor Level 2",
    status: "Active",
    avatarBg: "bg-indigo-100 text-indigo-700",
    initials: "MA",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCcHri9CVf91h3BK_jWa5P7tg0tfZ2fow-YUWa1wuCAsJ0xZOgsfogfTISk6rKWfGiVI4sRIfh4mZlhsSjKetjdHW50ZcqAHX_8rYn9oVrcbRJPMfpFJFnRJEW6QQaMYt7Jbz_dWpAUyLmAw3XGsiZK86SUZA5su71siWAQuKEa6BYLps0PQfgmnnlMRajOD-d0rNCPKi-EhXvm-NRflzrKJ2e_JvgPsyxswSLRTzN_gLNCJLhTe_1eMQ21ZkJNFXSf0Exljd7YkC2K"
  },
  {
    name: "Maria Garcia",
    email: "viewer@assetflow.com",
    role: "Viewer",
    level: "Viewer Level 1",
    status: "Active",
    avatarBg: "bg-gray-100 text-gray-700",
    initials: "MG",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsRBkQCGaGSTbbFSn_XaIt26fMidzPF-vEwqv7E_GuYPZEcpZ93VTOwDv6GQociVph6KfXBy81N0RO8p4ivvNJKwBa-1ctjUuwFYPZnhpZ96so6QlxBDTgO1U1KGILqjTW8yl87MsCoSrZLO-2PkAO6vSZYKFvg1-MjFx6UkDqY17MPl7coEn8ICAw3VkxOnYr0pPz7N6LSq7xxpgbr-KVDU48Bd7LgvOs_O_p40nHT7-uw4n9UaD_2zkbDtc990GZ9z596FADewsK"
  }
];

const initialAssets = [
  {
    id: "ASSET-8291",
    name: "MacBook Pro M3 Max - 16\"",
    category: "IT Equipment",
    status: "Active",
    assignedTo: "Sarah Jenkins",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQCEJZ_t_uWP7pTvdWsDXTxu5coFrnNC0NOoyyV40Pv24D-HML9_JJAQVdudsfcBbqhbpagRElC4FO8z5Z2y-PBL-wtWYsUGEjmFRYGujoAZYrp70dr6-K8IGzJPelNNzxWU9pJnyeDR9so7j6IGZVrW-iygliCtknMFdfveLkiSuABAyGlZpqi4uAItsfm171F9i1uWUu8fo8Aj-_1-9LeWQ69vlkxSefgN6FX-3pKiJaeXZjQD9uGb1Z3cZ7POodIaF2uW7GuHeu",
    lastAudit: "Oct 12, 2023",
    serialNumber: "SN82910382",
    barcode: "BAR-8291",
    qrCode: "QR-8291",
    purchaseDate: "2023-01-15",
    purchaseCost: "3499.00",
    vendor: "Apple Business",
    warranty: "2026-01-15",
    location: "San Francisco HQ",
    department: "Software Engineering",
    condition: "Excellent",
    bookable: true,
    customValues: { "RAM (GB)": "64", "Storage": "2TB SSD" }
  },
  {
    id: "ASSET-4412",
    name: "Dell UltraSharp 32\" 4K",
    category: "IT Equipment",
    status: "Maintenance",
    assignedTo: "Main Office - R4",
    avatar: "MT",
    lastAudit: "Nov 05, 2023",
    serialNumber: "SNDEL4412",
    barcode: "BAR-4412",
    qrCode: "QR-4412",
    purchaseDate: "2022-08-10",
    purchaseCost: "899.00",
    vendor: "Dell Direct",
    warranty: "2025-08-10",
    location: "Austin Office",
    department: "IT Infrastructure",
    condition: "Good",
    bookable: true,
    customValues: { "RAM (GB)": "0", "Storage": "N/A" }
  },
  {
    id: "ASSET-9003",
    name: "Tesla Model 3 - Fleet ID 44",
    category: "Vehicles",
    status: "Active",
    assignedTo: "David Miller",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDpSMRQpmFl8CMwb0DmB5UoRkUSgqZrQFR__FXJCep5YKKxTb9UWrGwYS0pYvSwcpxS_Sek_M3S0DToclejPgIAGqyv7sYS3E3yQH7wj45HZCH8ZTzUyiZwWc1qNSR-IxzLHZdiDNOnrVvsXL8UrVHKZfsAjkcDHUxTsucRgI_HbMncHJmmd0t3orcUTE_rXZJbwep_LL-CPKYHQxG7zoqMTpvEIJe3H7ItD_5zGpS0lgXGfGjI7awzwiITS0dJ6F2jIy-3P8gSJJz",
    lastAudit: "Jan 14, 2024",
    serialNumber: "5YJ3E1EA5LF000000",
    barcode: "BAR-9003",
    qrCode: "QR-9003",
    purchaseDate: "2021-04-18",
    purchaseCost: "42000.00",
    vendor: "Tesla Inc.",
    warranty: "2025-04-18",
    location: "Fleet Garage B",
    department: "IT Infrastructure",
    condition: "Good",
    bookable: true,
    customValues: { "License Plate": "CA-9003", "Odometer Reading": "34210" }
  },
  {
    id: "ASSET-1224",
    name: "Ergonomic Task Chair V2",
    category: "Office Furniture",
    status: "Decommissioned",
    assignedTo: "Unassigned",
    avatar: "",
    lastAudit: "Dec 20, 2023",
    serialNumber: "SNCH-1224",
    barcode: "BAR-1224",
    qrCode: "QR-1224",
    purchaseDate: "2020-03-11",
    purchaseCost: "450.00",
    vendor: "Steelcase Office",
    warranty: "2025-03-11",
    location: "San Francisco HQ",
    department: "Human Resources",
    condition: "Fair",
    bookable: false,
    customValues: { "Material": "Mesh" }
  },
  {
    id: "ASSET-5561",
    name: "Network Switch Cisco 48p",
    category: "IT Equipment",
    status: "Active",
    assignedTo: "Server Room 2",
    avatar: "IT",
    lastAudit: "Jan 02, 2024",
    serialNumber: "SNCS-5561",
    barcode: "BAR-5561",
    qrCode: "QR-5561",
    purchaseDate: "2023-05-22",
    purchaseCost: "1850.00",
    vendor: "CDW Gov",
    warranty: "2028-05-22",
    location: "Server Room 2",
    department: "IT Infrastructure",
    condition: "Excellent",
    bookable: false,
    customValues: { "RAM (GB)": "16", "Storage": "N/A" }
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
    comments: [],
    laborHours: 2,
    estimatedCost: 120,
    actualCost: 0,
    attachments: [],
    resolutionNotes: ""
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
    comments: [],
    laborHours: 4,
    estimatedCost: 250,
    actualCost: 0,
    attachments: [],
    resolutionNotes: ""
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
    comments: [
      { author: "Alex Rivera", text: "Ordered replacement power supply module.", date: "Today, 9:30 AM" },
      { author: "Sarah Jenkins", text: "Please expedite, this is critical.", date: "Today, 10:15 AM" }
    ],
    laborHours: 1.5,
    estimatedCost: 300,
    actualCost: 0,
    attachments: [],
    resolutionNotes: ""
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
    comments: [],
    laborHours: 5,
    estimatedCost: 500,
    actualCost: 0,
    attachments: [],
    resolutionNotes: ""
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
    comments: [],
    laborHours: 1,
    estimatedCost: 50,
    actualCost: 45,
    attachments: [],
    resolutionNotes: "All bulbs tested and operational."
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
    comments: [{ author: "Sam Chen", text: "Completed testing, normal outputs.", date: "Last week" }],
    laborHours: 1,
    estimatedCost: 100,
    actualCost: 100,
    attachments: [],
    resolutionNotes: "Normal weekly test complete."
  }
];

const initialDepartments = [
  { id: "DEP-1", name: "IT Infrastructure", code: "IT-INF", parentDepartment: "None", manager: "Alex Chen", status: "Active" },
  { id: "DEP-2", name: "Software Engineering", code: "SWE", parentDepartment: "IT Infrastructure", manager: "Sarah Jenkins", status: "Active" },
  { id: "DEP-3", name: "Human Resources", code: "HR", parentDepartment: "None", manager: "Maria Garcia", status: "Active" },
  { id: "DEP-4", name: "Finance", code: "FIN", parentDepartment: "None", manager: "Sarah Jenkins", status: "Inactive" }
];

const initialCategories = [
  { id: "CAT-1", name: "IT Equipment", code: "ITE", customFields: [{ name: "RAM (GB)", type: "number", required: true }, { name: "Storage", type: "text", required: false }] },
  { id: "CAT-2", name: "Vehicles", code: "VEH", customFields: [{ name: "License Plate", type: "text", required: true }, { name: "Odometer Reading", type: "number", required: true }] },
  { id: "CAT-3", name: "Office Furniture", code: "OFN", customFields: [{ name: "Material", type: "text", required: false }] }
];

const initialAllocations = [
  { id: "ALC-1", assetId: "ASSET-8291", assetName: "MacBook Pro M3 Max - 16\"", employeeId: "manager@assetflow.com", employeeName: "Sarah Jenkins", department: "Software Engineering", checkoutDate: "2026-06-01", expectedReturn: "2026-12-01", actualReturn: null, checkoutCondition: "New", checkinCondition: null, checkoutNotes: "Assigned for development work", status: "Active", rejectReason: "" },
  { id: "ALC-2", assetId: "ASSET-9003", assetName: "Tesla Model 3 - Fleet ID 44", employeeId: "head@assetflow.com", employeeName: "David Miller", department: "IT Infrastructure", checkoutDate: "2026-05-10", expectedReturn: "2026-07-10", actualReturn: null, checkoutCondition: "Good", checkinCondition: null, checkoutNotes: "Business trip assignment", status: "Overdue", rejectReason: "" }
];

const initialBookings = [
  { id: "BKG-1", resourceName: "Conference Room Alpha", resourceId: "CONF-A", employeeId: "admin@assetflow.com", employeeName: "Alex Chen", startDate: "2026-07-13T10:00:00", endDate: "2026-07-13T11:00:00", recurrence: "None", reminderMinutes: 15, status: "Upcoming" },
  { id: "BKG-2", resourceName: "Tesla Model 3 - Fleet ID 44", resourceId: "ASSET-9003", employeeId: "manager@assetflow.com", employeeName: "Sarah Jenkins", startDate: "2026-07-14T09:00:00", endDate: "2026-07-14T17:00:00", recurrence: "None", reminderMinutes: 30, status: "Upcoming" }
];

const initialAudits = [
  {
    id: "AUD-1",
    cycleName: "Mid-Year H1 2026 IT Audit",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    status: "Completed",
    department: "IT Infrastructure",
    items: [
      { assetId: "ASSET-8291", assetName: "MacBook Pro M3 Max - 16\"", verified: true, condition: "Excellent", remarks: "Verified physically" },
      { assetId: "ASSET-4412", assetName: "Dell UltraSharp 32\" 4K", verified: true, condition: "Good", remarks: "In office R4" }
    ],
    timeline: [
      { date: "2026-06-01", event: "Audit Cycle Initiated" },
      { date: "2026-06-25", event: "All Assets Verified" },
      { date: "2026-06-30", event: "Audit Completed & Signed Off" }
    ]
  },
  {
    id: "AUD-2",
    cycleName: "Q3 Equipment Verification",
    startDate: "2026-07-01",
    endDate: "2026-07-31",
    status: "In Progress",
    department: "Software Engineering",
    items: [
      { assetId: "ASSET-1224", assetName: "Ergonomic Task Chair V2", verified: false, condition: "Needs Replacement", remarks: "Found broken armrest" }
    ],
    timeline: [
      { date: "2026-07-01", event: "Audit Cycle Initiated" }
    ]
  }
];

const initialNotifications = [
  { id: "N-1", title: "Audit Required", message: "Mid-Year H1 2026 IT Audit cycle is ending soon. Please complete all verifications.", type: "warning", timestamp: "10 mins ago", read: false },
  { id: "N-2", title: "New Asset Allocation", message: "Tesla Model 3 - Fleet ID 44 has been allocated to Sarah Jenkins.", type: "success", timestamp: "1 hour ago", read: false },
  { id: "N-3", title: "Maintenance Alert", message: "Conveyor Belt Lubrication maintenance task is due today.", type: "info", timestamp: "2 hours ago", read: true }
];

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('assetflow_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('assetflow_users');
    return savedUsers ? JSON.parse(savedUsers) : initialUsers;
  });

  const [assets, setAssets] = useState(() => {
    const savedAssets = localStorage.getItem('assetflow_assets');
    return savedAssets ? JSON.parse(savedAssets) : initialAssets;
  });

  const [tickets, setTickets] = useState(() => {
    const savedTickets = localStorage.getItem('assetflow_tickets');
    return savedTickets ? JSON.parse(savedTickets) : initialTickets;
  });

  const [departments, setDepartments] = useState(() => {
    const savedDepts = localStorage.getItem('assetflow_departments');
    return savedDepts ? JSON.parse(savedDepts) : initialDepartments;
  });

  const [categories, setCategories] = useState(() => {
    const savedCats = localStorage.getItem('assetflow_categories');
    return savedCats ? JSON.parse(savedCats) : initialCategories;
  });

  const [allocations, setAllocations] = useState(() => {
    const savedAllocations = localStorage.getItem('assetflow_allocations');
    return savedAllocations ? JSON.parse(savedAllocations) : initialAllocations;
  });

  const [bookings, setBookings] = useState(() => {
    const savedBookings = localStorage.getItem('assetflow_bookings');
    return savedBookings ? JSON.parse(savedBookings) : initialBookings;
  });

  const [audits, setAudits] = useState(() => {
    const savedAudits = localStorage.getItem('assetflow_audits');
    return savedAudits ? JSON.parse(savedAudits) : initialAudits;
  });

  const [notifications, setNotifications] = useState(() => {
    const savedNotifs = localStorage.getItem('assetflow_notifications');
    return savedNotifs ? JSON.parse(savedNotifs) : initialNotifications;
  });

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

  useEffect(() => {
    if (user) {
      localStorage.setItem('assetflow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('assetflow_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('assetflow_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('assetflow_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('assetflow_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('assetflow_departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('assetflow_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('assetflow_allocations', JSON.stringify(allocations));
  }, [allocations]);

  useEffect(() => {
    localStorage.setItem('assetflow_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('assetflow_audits', JSON.stringify(audits));
  }, [audits]);

  useEffect(() => {
    localStorage.setItem('assetflow_notifications', JSON.stringify(notifications));
  }, [notifications]);

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

  // Auth Operations
  const login = (email, password) => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    // Fallback automatic login for simple testing using any role email
    const rolesMap = {
      'admin@assetflow.com': 'Admin',
      'manager@assetflow.com': 'Asset Manager',
      'head@assetflow.com': 'Department Head',
      'employee@assetflow.com': 'Employee',
      'auditor@assetflow.com': 'Auditor',
      'viewer@assetflow.com': 'Viewer'
    };
    const mappedRole = rolesMap[email.toLowerCase()];
    if (mappedRole) {
      const newUserObj = {
        name: email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
        email: email,
        role: mappedRole,
        level: `${mappedRole} Level ${mappedRole === 'Admin' ? '4' : '2'}`,
        status: "Active",
        avatarBg: "bg-blue-100 text-blue-700",
        initials: email.charAt(0).toUpperCase(),
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDVcYJhqsZNEQxCrb5gnButF_ZH9EYvtsY-nIMDyrmgBop5CQ1AGcJkU3Qo6hQPztocCC4MXN2w7eBvW9pPeLlxFBxWreZPZXTX0WMJh5el6TAIFCXnjeXSRR6kU5H-t5qqR9yk_RN5cFq5w5jD5uvUeOm_TSVDSBqKMS7OHkyFhnLuWkiF55htV9pzJ1M6BNwVpcb8l4u7Mg6LWUP917WavGePBqAHMwrGY5MFAQ3LM7VbUcbX3Dmwniw2GOA9WuvWsJGwvYdYClC"
      };
      setUsers(prev => [...prev, newUserObj]);
      setUser(newUserObj);
      return true;
    }
    // If not found and not a special test email, return false
    return false;
  };

  const signup = (userData) => {
    const exists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) return false;
    const initials = userData.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
    const newUser = {
      id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "Active",
      avatarBg: "bg-blue-100 text-blue-700",
      initials: initials,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCAb3JSNRiEJXx4US2QdyP_t6zJ1IHL-M2I52CZ-a6sQX_XxRl-OlAQJznE_VNZ-Zf6nUCJUJ2R4yx3g1naGO0UAAJF6HTFekb2H6qPzYhcc9blXxsUI1zuaCRJ0jpzz8NzCRJ1LZAsGSX2ex6x3qcBpfID0i-wLkA8XbyNBTDDJJXlzhD16Wthm_m0UNcpIEEiyhiCr-9zXRjKLItZkpIqnYwpmzlNxTIHOzq0hzxekvOdFlDYDqCuac_XZU4z2uDYUjQDxCJh2Ayq",
      level: `${userData.role} Level 1`,
      ...userData
    };
    setUsers(prev => [...prev, newUser]);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  // User Administration Operations
  const deleteUser = (email) => {
    setUsers(prev => prev.filter(u => u.email !== email));
  };

  const updateUser = (email, updatedFields) => {
    setUsers(prev => prev.map(u => u.email === email ? { ...u, ...updatedFields } : u));
    if (user && user.email === email) {
      setUser(prev => ({ ...prev, ...updatedFields }));
    }
  };

  // Asset Operations
  const addAsset = (asset) => {
    const newId = `ASSET-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAsset = {
      id: newId,
      lastAudit: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      serialNumber: asset.serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      barcode: asset.barcode || `BAR-${newId.split('-')[1]}`,
      qrCode: asset.qrCode || `QR-${newId.split('-')[1]}`,
      condition: asset.condition || "New",
      customValues: asset.customValues || {},
      status: asset.status || "Active",
      ...asset
    };
    setAssets(prev => [newAsset, ...prev]);
  };

  const updateAsset = (id, updatedFields) => {
    setAssets(prev => prev.map(asset => asset.id === id ? { ...asset, ...updatedFields } : asset));
  };

  const deleteAsset = (id) => {
    setAssets(prev => prev.filter(asset => asset.id !== id));
  };

  const updateAssetStatus = (id, status) => {
    updateAsset(id, { status });
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
  const addDepartment = (dept) => {
    const newId = `DEP-${Math.floor(100 + Math.random() * 900)}`;
    const newDept = { id: newId, ...dept };
    setDepartments(prev => [...prev, newDept]);
  };

  const updateDepartment = (id, updatedFields) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...updatedFields } : d));
  };

  const deleteDepartment = (id) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  // Category Operations
  const addCategory = (cat) => {
    const newId = `CAT-${Math.floor(100 + Math.random() * 900)}`;
    const newCat = { id: newId, ...cat };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (id, updatedFields) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
  };

  const deleteCategory = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Allocation Operations
  const addAllocation = (alloc) => {
    const newId = `ALC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAlloc = { id: newId, status: "Active", actualReturn: null, rejectReason: "", ...alloc };
    setAllocations(prev => [newAlloc, ...prev]);
  };

  const updateAllocation = (id, updatedFields) => {
    setAllocations(prev => prev.map(a => a.id === id ? { ...a, ...updatedFields } : a));
  };

  // Booking Operations
  const addBooking = (bkg) => {
    const newId = `BKG-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBkg = { id: newId, status: "Upcoming", ...bkg };
    setBookings(prev => [newBkg, ...prev]);
  };

  const updateBooking = (id, updatedFields) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updatedFields } : b));
  };

  // Ticket (Maintenance) Operations
  const addTicket = (ticket) => {
    const newId = `#AX-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket = {
      id: newId,
      progress: 0,
      due: "Due in 3 days",
      comments: [],
      laborHours: 0,
      estimatedCost: 0,
      actualCost: 0,
      attachments: [],
      resolutionNotes: "",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCAb3JSNRiEJXx4US2QdyP_t6zJ1IHL-M2I52CZ-a6sQX_XxRl-OlAQJznE_VNZ-Zf6nUCJUJ2R4yx3g1naGO0UAAJF6HTFekb2H6qPzYhcc9blXxsUI1zuaCRJ0jpzz8NzCRJ1LZAsGSX2ex6x3qcBpfID0i-wLkA8XbyNBTDDJJXlzhD16Wthm_m0UNcpIEEiyhiCr-9zXRjKLItZkpIqnYwpmzlNxTIHOzq0hzxekvOdFlDYDqCuac_XZU4z2uDYUjQDxCJh2Ayq",
      ...ticket
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const updateTicket = (id, updatedFields) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updatedFields } : t));
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

  // Audit Operations
  const addAuditCycle = (audit) => {
    const newId = `AUD-${Math.floor(100 + Math.random() * 900)}`;
    const newAudit = {
      id: newId,
      status: "Draft",
      items: audit.items || [],
      timeline: [{ date: new Date().toISOString().split('T')[0], event: "Audit Cycle Created" }],
      ...audit
    };
    setAudits(prev => [newAudit, ...prev]);
  };

  const updateAuditCycle = (id, updatedFields) => {
    setAudits(prev => prev.map(a => a.id === id ? { ...a, ...updatedFields } : a));
  };

  // Notification Operations
  const addNotification = (notif) => {
    const newId = `N-${Math.floor(1000 + Math.random() * 9000)}`;
    const newNotif = {
      id: newId,
      timestamp: "Just now",
      read: false,
      ...notif
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
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
      setThemeColor
    }}>
      {children}
    </AppContext.Provider>
  );
};
