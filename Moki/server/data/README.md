# Dev data

This directory contains the data used to emulate the build configuration for
development purposes.

All of the data and settings used in this directory are defined in `config.js`
located in the server directory.

The json files in this directory contains the default configuration settings. In
addition, there are two random image files needed by `monitor-layout.json`.

## PCAPS

The `pcaps` directory contains the PCAP files, please make sure to build and
install `decap` to enable to diagram functionalities on the monitor.

## Diagram HTML

For `CI`, a default `diagram.html` is provided. For local development,
`npm run build` must be run on the client to access the bundled
`build-diagram/diagram.html`.

## Binaries

Following binaries must be built and installed in bin folder.

- decap (see Decap repo in gitlab)
