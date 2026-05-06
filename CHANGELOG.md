## Changelog

All notable changes to this project will be documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning follows [Semantic Versioning](https://semver.org/)

## [v2.4.0] - 2026-05-06
### Added
- New feature: `mkgroup` plugin in `plugins/Kelas/` for randomizing class groups based on `dbmhs.json`.
- Course lookup integration with `dbjadwal.json` for the `mkgroup` plugin.
- Group ID generation and persistent storage in `dbkelompok.json` for recalling groups later using `mkg get <id>`.
### Fixed
- Fixed command argument parsing in `plugins/Kelas/mkgroup.js` where `args` was incorrectly accessed.
### Changed
- Added new student "Maela Nur Faida" (NIM: 2023050037) to `database/class/dbmhs.json` at ID 7 and re-sequenced subsequent IDs.

## [v2.3.1] - 2026-05-06
### Fixed
- Re-sequenced student IDs in `database/class/dbmhs.json` after ID 5.
- Fixed JSON syntax errors and formatting in `database/class/dbmhs.json`.
