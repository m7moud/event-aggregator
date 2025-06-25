import { Aggregator } from '../src/aggregator.js';

jest.useFakeTimers();

describe('Aggregator', () => {
  const intervalMs = 5000;
  let onAggregateMock;
  let aggregator;

  beforeEach(() => {
    onAggregateMock = jest.fn();
    aggregator = new Aggregator(intervalMs, onAggregateMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    expect(aggregator.intervalMs).toBe(intervalMs);
    expect(aggregator.onAggregate).toBe(onAggregateMock);
    expect(aggregator.buckets).toBeInstanceOf(Map);
  });

  it('should aggregate data correctly', () => {
    const event = {
      time: Date.now() - 100,
      data: { serialno: '123', value: 10 },
    };

    aggregator.aggregate(event);

    const bucket = aggregator.buckets.get('123');
    expect(bucket).toBeDefined();
    expect(bucket.data.serialno).toBe('123');
    expect(bucket.data.value).toBe(10);
    expect(bucket.duration).toBeGreaterThan(0);
  });

  it('should ignore invalid events', () => {
    const invalidEvent = {
      time: Date.now(),
      data: { serialno: 123, value: 10 }, // serialno is not a string
    };

    aggregator.aggregate(invalidEvent);

    expect(aggregator.buckets.size).toBe(0);
  });

  it('should trigger onAggregate when buckets are flushed', () => {
    const event1 = { time: Date.now(), data: { serialno: '123', value: 10 } };
    const event2 = { time: Date.now(), data: { serialno: '456', value: 20 } };

    // Simulate two events
    aggregator.aggregate(event1);
    aggregator.aggregate(event2);

    jest.advanceTimersByTime(intervalMs); // trigger flush

    // Ensure onAggregate was called with the correct data
    expect(onAggregateMock).toHaveBeenCalledTimes(2);
    expect(onAggregateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { serialno: '123', value: 10 },
        duration: 5,
      })
    );
    expect(onAggregateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { serialno: '456', value: 20 },
        duration: 5,
      })
    );

    // Check that the buckets are now empty
    expect(aggregator.buckets.size).toBe(0);
  });

  it('should not aggregate when serialno is missing', () => {
    const eventMissingSerial = {
      time: Date.now(),
      data: { value: 10 },
    };

    aggregator.aggregate(eventMissingSerial);

    expect(aggregator.buckets.size).toBe(0);
  });

  it('should handle multiple events for the same serialno', () => {
    const event1 = { time: Date.now() - 200, data: { serialno: '123', value: 10 } };
    const event2 = {
      time: Date.now() - 100,
      data: { serialno: '123', value: 20 },
    };

    aggregator.aggregate(event1);
    aggregator.aggregate(event2);

    const bucket = aggregator.buckets.get('123');
    expect(bucket).toBeDefined();
    expect(bucket.data.value).toBe(20);
    expect(bucket.duration).toBeGreaterThan(0);
  });
});
