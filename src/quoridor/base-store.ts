export class Store {
  private subscribers = new Set<() => void>();

  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  emit() {
    this.subscribers.forEach((callback) => callback());
  }
}
