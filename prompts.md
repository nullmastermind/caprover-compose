```text
Based on the configuration file and examples, supplement the default value of the variable (if missing), adjust the variable label to be more appropriate (if needed), and add validation (if necessary)
```

```text
Based on the configuration file and examples, check and fill in all default values for databases and Redis.
Remember in Caprover, services connect with each other through the host `srv-captain--SERVICE_NAME`, for example, `srv-captain--$$cap_appname-sqlserver`. This value can only be set in the `environment` within the service config and cannot be set in `caproverOneClickApp.variables`. If `caproverOneClickApp.variables` contains a value, delete it at `caproverOneClickApp.variables` and replace in the service `environment` value to `srv-captain--SERVICE_NAME`.
```