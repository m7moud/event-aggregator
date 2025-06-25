export class Aggregator {
  /**
   * @param {number} intervalMs - aggregation interval
   * @param {(message: object) => void} onAggregate - callback to push aggregated data
   */
  constructor(intervalMs = 5000, onAggregate) {
    this.intervalMs = intervalMs;
    this.onAggregate = onAggregate;
    this.buckets = new Map();

    setInterval(() => this.flushBuckets(), this.intervalMs);
  }

  aggregate(event) {
    const { time, data } = event;
    if (!data || typeof data.serialno !== 'string') return;

    const serialno = data.serialno;
    const timestamp = new Date(time).getTime();

    let bucket = this.buckets.get(serialno);
    if (!bucket) {
      bucket = {
        startTime: timestamp,
        data: { serialno },
        duration: 0,
      };
      this.buckets.set(serialno, bucket);
    }

    for (const key in data) {
      if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
      if (key === 'serialno') continue;

      bucket.data[key] = data[key];
    }

    bucket.duration = (Date.now() - bucket.startTime) / 1000;
  }

  flushBuckets() {
    const now = Date.now();

    for (const [serialno, bucket] of this.buckets.entries()) {
      if (now - bucket.startTime >= this.intervalMs) {
        const aggregatedEvent = {
          time: new Date(bucket.startTime).toISOString(),
          duration: this.intervalMs / 1000,
          data: bucket.data,
        };

        this.onAggregate(aggregatedEvent);
        this.buckets.delete(serialno);
      }
    }
  }
}
