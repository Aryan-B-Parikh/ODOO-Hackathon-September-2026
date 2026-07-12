import prisma from './db.js';
import bcrypt from 'bcryptjs';

const hashPassword = (password) => bcrypt.hashSync(password, 10);

async function main() {
  console.log('Seeding database...');

  // 1. Create Organization
  let org = await prisma.organization.findUnique({ where: { code: 'AF-ORG' } });
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'AssetFlow Enterprise',
        code: 'AF-ORG',
      },
    });
    console.log('Organization created:', org.name);
  }

  // 2. Create Roles
  const roleNames = ['Admin', 'Asset Manager', 'Department Head', 'Employee', 'Auditor', 'Viewer'];
  const roles = {};
  for (const name of roleNames) {
    let r = await prisma.role.findUnique({ where: { name } });
    if (!r) {
      r = await prisma.role.create({
        data: { name, description: `${name} role` },
      });
      console.log(`Role '${name}' created.`);
    }
    roles[name] = r;
  }

  // 3. Create Locations
  const locationData = [
    { name: 'San Francisco HQ', code: 'SF-HQ' },
    { name: 'Austin Office', code: 'AUS-OFF' },
    { name: 'Fleet Garage B', code: 'GAR-B' },
    { name: 'Server Room 2', code: 'SRV-2' },
  ];
  const locations = {};
  for (const loc of locationData) {
    let l = await prisma.location.findUnique({ where: { code: loc.code } });
    if (!l) {
      l = await prisma.location.create({
        data: {
          name: loc.name,
          code: loc.code,
          organizationId: org.id,
        },
      });
      console.log(`Location '${loc.name}' created.`);
    }
    locations[loc.name] = l;
  }

  // 4. Create Categories
  const categoryData = [
    {
      name: 'IT Equipment',
      customFieldSchema: [
        { name: 'RAM (GB)', type: 'number', required: true },
        { name: 'Storage', type: 'text', required: false },
      ],
    },
    {
      name: 'Vehicles',
      customFieldSchema: [
        { name: 'License Plate', type: 'text', required: true },
        { name: 'Odometer Reading', type: 'number', required: true },
      ],
    },
    {
      name: 'Office Furniture',
      customFieldSchema: [{ name: 'Material', type: 'text', required: false }],
    },
  ];
  const categories = {};
  for (const cat of categoryData) {
    let c = await prisma.assetCategory.findUnique({ where: { name: cat.name } });
    if (!c) {
      c = await prisma.assetCategory.create({
        data: {
          name: cat.name,
          customFieldSchema: cat.customFieldSchema,
          organizationId: org.id,
        },
      });
      console.log(`Category '${cat.name}' created.`);
    }
    categories[cat.name] = c;
  }

  // 5. Create Departments
  const departmentData = [
    { name: 'IT Infrastructure', code: 'IT-INF' },
    { name: 'Software Engineering', code: 'SWE' },
    { name: 'Human Resources', code: 'HR' },
    { name: 'Finance', code: 'FIN' },
  ];
  const departments = {};
  for (const dept of departmentData) {
    let d = await prisma.department.findUnique({ where: { code: dept.code } });
    if (!d) {
      d = await prisma.department.create({
        data: {
          name: dept.name,
          code: dept.code,
          organizationId: org.id,
        },
      });
      console.log(`Department '${dept.name}' created.`);
    }
    departments[dept.name] = d;
  }

  // 6. Create Employees and Users
  const staffData = [
    { name: 'Alex Chen', email: 'admin@assetflow.com', role: 'Admin', dep: 'IT Infrastructure' },
    { name: 'Sarah Jenkins', email: 'manager@assetflow.com', role: 'Asset Manager', dep: 'Software Engineering' },
    { name: 'David Miller', email: 'head@assetflow.com', role: 'Department Head', dep: 'IT Infrastructure' },
    { name: 'John Doe', email: 'employee@assetflow.com', role: 'Employee', dep: 'Human Resources' },
    { name: 'Marcus Aurelius', email: 'auditor@assetflow.com', role: 'Auditor', dep: 'IT Infrastructure' },
    { name: 'Maria Garcia', email: 'viewer@assetflow.com', role: 'Viewer', dep: 'Human Resources' },
  ];

  const employees = {};
  const users = {};
  for (const staff of staffData) {
    let emp = await prisma.employee.findUnique({ where: { email: staff.email } });
    if (!emp) {
      emp = await prisma.employee.create({
        data: {
          name: staff.name,
          email: staff.email,
          phone: '123-456-7890',
          organizationId: org.id,
          departmentId: departments[staff.dep]?.id || null,
        },
      });
      console.log(`Employee '${staff.name}' created.`);
    }
    employees[staff.email] = emp;

    let user = await prisma.user.findUnique({ where: { email: staff.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: staff.email,
          passwordHash: hashPassword('password123'),
          organizationId: org.id,
          employeeId: emp.id,
        },
      });

      // Link Role
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: roles[staff.role].id,
        },
      });

      console.log(`User '${staff.email}' created with role '${staff.role}'.`);
    }
    users[staff.email] = user;
  }

  // 7. Update Department Managers
  const managersMapping = {
    'IT Infrastructure': 'admin@assetflow.com',
    'Software Engineering': 'manager@assetflow.com',
    'Human Resources': 'viewer@assetflow.com',
  };
  for (const [deptName, email] of Object.entries(managersMapping)) {
    const d = departments[deptName];
    const emp = employees[email];
    if (d && emp) {
      await prisma.department.update({
        where: { id: d.id },
        data: { headId: emp.id },
      });
    }
  }

  // 8. Create Assets
  const assetData = [
    {
      name: 'MacBook Pro M3 Max - 16"',
      category: 'IT Equipment',
      location: 'San Francisco HQ',
      department: 'Software Engineering',
      cost: 3499.00,
      serial: 'SN82910382',
      tag: 'AF-8291',
      condition: 'EXCELLENT',
      bookable: true,
      status: 'ALLOCATED',
      customFields: { 'RAM (GB)': 64, Storage: '2TB SSD' },
    },
    {
      name: 'Dell UltraSharp 32" 4K',
      category: 'IT Equipment',
      location: 'Austin Office',
      department: 'IT Infrastructure',
      cost: 899.00,
      serial: 'SNDEL4412',
      tag: 'AF-4412',
      condition: 'GOOD',
      bookable: true,
      status: 'UNDER_MAINTENANCE',
      customFields: { 'RAM (GB)': 0, Storage: 'N/A' },
    },
    {
      name: 'Tesla Model 3 - Fleet ID 44',
      category: 'Vehicles',
      location: 'Fleet Garage B',
      department: 'IT Infrastructure',
      cost: 42000.00,
      serial: '5YJ3E1EA5LF000000',
      tag: 'AF-9003',
      condition: 'GOOD',
      bookable: true,
      status: 'ALLOCATED',
      customFields: { 'License Plate': 'CA-9003', 'Odometer Reading': 34210 },
    },
  ];

  for (const as of assetData) {
    let a = await prisma.asset.findUnique({ where: { assetTag: as.tag } });
    if (!a) {
      a = await prisma.asset.create({
        data: {
          name: as.name,
          categoryId: categories[as.category].id,
          assetTag: as.tag,
          serialNumber: as.serial,
          barcode: `BAR-${as.tag.split('-')[1]}`,
          qrCode: `QR-${as.tag.split('-')[1]}`,
          acquisitionCost: as.cost,
          condition: as.condition,
          sharedBookable: as.bookable,
          status: as.status,
          locationId: locations[as.location].id,
          departmentId: departments[as.department]?.id || null,
          organizationId: org.id,
          customFieldValues: as.customFields,
        },
      });
      console.log(`Asset '${as.name}' created.`);
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
