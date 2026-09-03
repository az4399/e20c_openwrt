# DAE packages

This directory contains the DAE core package and the custom LuCI application used by the `dae` firmware branch.

The LuCI application combines the service status and restart controls from the newer Pacalini interface with the CodeMirror YAML editor from the archived sbwml interface.

GeoIP and GeoSite data are provided by the `v2ray-geodata` feed:

- `v2ray-geoip` installs `geoip.dat`.
- `v2ray-geosite` installs `geosite.dat`.
- `dae-geoip` and `dae-geosite` link those files into `/usr/share/dae/`.

No special LuCI checkbox is needed for GeoIP or GeoSite. The firmware configuration enables `dae-geoip` and `dae-geosite`, while the DAE eBPF requirements are enabled separately in the workflow.
