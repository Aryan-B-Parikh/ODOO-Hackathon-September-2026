export class DepartmentEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly code: string,
    public readonly isActive: boolean,
    public readonly managerId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
