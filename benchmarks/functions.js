import Benchmark from 'benchmark'

/**
 * @param {Benchmark.Event} e
 */
export function cycleCallback(e) {
  // @ts-expect-error
  console.log(`${e.currentTarget.name}: ${e.target}`)
}
