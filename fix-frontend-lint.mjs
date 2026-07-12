import fs from 'fs';
import path from 'path';

// Fix department.api.ts
const deptApiPath = 'frontend/src/features/organization/api/department.api.ts';
let deptApi = fs.readFileSync(deptApiPath, 'utf8');
deptApi = deptApi.replace(/    \/\/ eslint-disable-next-line @typescript-eslint\/no-explicit-any\r?\n    const res = await apiClient\.get/g, '    const res = await apiClient.get');
fs.writeFileSync(deptApiPath, deptApi);

// Fix employee.api.ts
const empApiPath = 'frontend/src/features/organization/api/employee.api.ts';
let empApi = fs.readFileSync(empApiPath, 'utf8');
empApi = empApi.replace(/    \/\/ eslint-disable-next-line @typescript-eslint\/no-explicit-any\r?\n    const res = await apiClient\.get/g, '    const res = await apiClient.get');
fs.writeFileSync(empApiPath, empApi);

// Fix React import in DepartmentList.tsx
const deptListPath = 'frontend/src/features/organization/pages/DepartmentList.tsx';
let deptList = fs.readFileSync(deptListPath, 'utf8');
deptList = deptList.replace(/import React from 'react';\r?\n/g, '');
fs.writeFileSync(deptListPath, deptList);

// Fix React import in EmployeeList.tsx
const empListPath = 'frontend/src/features/organization/pages/EmployeeList.tsx';
let empList = fs.readFileSync(empListPath, 'utf8');
empList = empList.replace(/import React from 'react';\r?\n/g, '');
fs.writeFileSync(empListPath, empList);

console.log('Fixed lint issues in frontend');
