export class PurchaseCompletedEvent {
  constructor(
    public readonly studentId: string,
    public readonly courseId: string,
    public readonly amount: string,
  ) {}
}
