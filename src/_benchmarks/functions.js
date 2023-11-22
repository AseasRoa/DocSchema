import Benchmark from 'benchmark'

/**
 * @param {Benchmark.Event} e
 */
export function cycleCallback(e) {
  // @ts-ignore
  console.log(`${e.currentTarget.name}: ${e.target}`)
}
