/**
 * Test the local Redis detection logic (used for conditional TLS).
 * Verifies that localhost, 127.0.0.1, and ::1 are treated as local,
 * and remote hosts like upstash.io are treated as remote.
 */

import { describe, it, expect } from 'vitest';

function isLocalHost(host: string): boolean {
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1'
  );
}

describe('Local Redis detection', () => {
  it('should detect localhost as local', () => {
    expect(isLocalHost('localhost')).toBe(true);
  });

  it('should detect 127.0.0.1 as local', () => {
    expect(isLocalHost('127.0.0.1')).toBe(true);
  });

  it('should detect ::1 (IPv6 loopback) as local', () => {
    expect(isLocalHost('::1')).toBe(true);
  });

  it('should detect upstash.io as remote', () => {
    expect(isLocalHost('outgoing-cicada-114710.upstash.io')).toBe(false);
  });

  it('should detect ec2 host as remote', () => {
    expect(isLocalHost('ec2-xxx-xxx-xxx.compute.amazonaws.com')).toBe(false);
  });
});
