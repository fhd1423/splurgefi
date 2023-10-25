const QUEUE_SIZE = 1000;

export default class PriceQueue {
  private queue: number[] = [];
  private total = 0;
  private count = 0;

  addPrice(price: number): void {
    if (this.queue.length === QUEUE_SIZE) {
      console.log("works");
      const oldPrice = this.queue.shift()!;
      this.total -= oldPrice;
      this.count -= 1;
    }
    this.queue.push(price);
    this.total += Number(price);
    this.count += 1;
  }

  mean(): number | null {
    if (this.count === 0) return null;
    return this.total / this.count;
  }
}
