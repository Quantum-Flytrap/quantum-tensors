# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.9] - 2020-08-24

Massive performance improvements. On i7-9750H CPU (Coffee Lake):

* 20x20 board, photon propagation: 22-34ms -> 0.02ms
* 100x100 board, photon propagation: 741 ms -> 0.02 ms
* 20x20 board, 6 operations: 80 ms -> 1.5ms

### Added

* Some performance benchmarks and tests
* Hard-coded photon propagation (a single map, instead of an operator)
* Catching photon operations (rather than recalculating them each step)
* Smarter photon operations (only looking at the difference), i.e. 

## [0.4.8] - 2020-06-29

### Added

* This CHANGELOG!
* `Operator.permuteDimsOut` and ``Operator.permuteDimsIn` methods.

### Fixed

* Fixed a problem with a dimension check on permuting non-square tensors.
* Set phase for LR basis (for polarization) and y-spin basis (for spin) so that the singlet state phase stays the same
